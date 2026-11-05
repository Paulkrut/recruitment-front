import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { File } from 'node:buffer';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const STORAGE_ROOT = '/home/ubuntu/sofihr-content/drafts';
export const LIMITS = Object.freeze({ body: 20 * 1024 * 1024, markdown: 512 * 1024, image: 5 * 1024 * 1024, images: 8, pixels: 20_000_000, dimension: 8192, outputDimension: 2048, concurrency: 2 });
const digest = (value) => createHash('sha256').update(value).digest();
const sha256 = (value) => digest(value).toString('hex');
class Rejection extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
const reject = (status, code) => { throw new Rejection(status, code); };
const json = (status, value) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });

// Entropy cannot be inferred from a string. Require a randomly generated 32-byte
// hex secret and also reject obvious low-diversity/repeating misconfiguration.
function validSecret(secret) {
  if (typeof secret !== 'string' || !/^[0-9a-f]{64}$/i.test(secret) || new Set(secret.toLowerCase()).size < 12) return false;
  for (const width of [1, 2, 4, 8, 16, 32]) {
    if (secret.toLowerCase() === secret.slice(0, width).toLowerCase().repeat(64 / width)) return false;
  }
  return true;
}

async function boundedBody(request) {
  const declared = request.headers.get('content-length');
  if (declared !== null) {
    if (!/^\d+$/.test(declared)) reject(400, 'invalid_request');
    if (BigInt(declared) > BigInt(LIMITS.body)) reject(413, 'payload_too_large');
  }
  if (!request.body) reject(400, 'invalid_request');
  const reader = request.body.getReader();
  let complete = false;
  try {
    const chunks = [];
    let length = 0;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) { complete = true; break; }
      length += value.byteLength;
      if (length > LIMITS.body) reject(413, 'payload_too_large');
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks, length);
  } finally {
    if (!complete) { try { await reader.cancel(); } catch { /* Preserve the original error. */ } }
    reader.releaseLock();
  }
}

function safeFilename(name) {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(name) && !name.includes('..') && !name.endsWith('.') && !/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(name);
}

// Validate original wire filenames BEFORE formData(): multipart parsers can strip
// directory components, otherwise making a traversal filename look innocuous.
// Deliberately accept only the canonical ASCII multipart subset used by curl and
// browser FormData; no filename*, folded headers, text fields, or extra headers.
function inspectMultipart(bytes, contentType) {
  const match = /^multipart\/form-data;\s*boundary=(?:"([A-Za-z0-9'()+_,.\/:=? -]{1,70})"|([A-Za-z0-9'()+_,.\/:=?-]{1,70}))$/i.exec(contentType);
  if (!match) reject(400, 'invalid_multipart');
  const boundary = Buffer.from(`--${match[1] || match[2]}`);
  const separator = Buffer.from(`\r\n${boundary.toString()}`);
  const records = [];
  const names = new Set();
  let offset = 0;
  let markdownCount = 0;
  let imageCount = 0;
  for (;;) {
    if (!bytes.subarray(offset, offset + boundary.length).equals(boundary)) reject(400, 'invalid_multipart');
    offset += boundary.length;
    if (bytes.subarray(offset, offset + 2).toString() === '--') {
      const end = bytes.subarray(offset + 2);
      if (end.length && !end.equals(Buffer.from('\r\n'))) reject(400, 'invalid_multipart');
      break;
    }
    if (bytes.subarray(offset, offset + 2).toString() !== '\r\n') reject(400, 'invalid_multipart');
    offset += 2;
    const headerEnd = bytes.indexOf('\r\n\r\n', offset);
    if (headerEnd < 0 || headerEnd - offset > 2048) reject(400, 'invalid_multipart');
    const headerBytes = bytes.subarray(offset, headerEnd);
    if (headerBytes.some((c) => c > 126 || (c < 32 && c !== 13 && c !== 10))) reject(400, 'invalid_multipart');
    const headers = new Map();
    for (const line of headerBytes.toString('ascii').split('\r\n')) {
      const h = /^(Content-Disposition|Content-Type):\s*(.+)$/i.exec(line);
      if (!h || headers.has(h[1].toLowerCase())) reject(400, 'invalid_multipart');
      headers.set(h[1].toLowerCase(), h[2]);
    }
    const disposition = /^form-data; name="(markdown|images)"; filename="([^"\r\n]+)"$/.exec(headers.get('content-disposition') || '');
    if (!disposition) reject(400, 'invalid_multipart');
    const [, field, filename] = disposition;
    if (!safeFilename(filename) || names.has(filename.toLowerCase())) reject(400, 'invalid_filename');
    names.add(filename.toLowerCase());
    const mime = (headers.get('content-type') || '').toLowerCase();
    if (field === 'markdown') {
      markdownCount++;
      if (markdownCount > 1 || !/\.md$/i.test(filename) || !['text/markdown', 'text/plain', 'application/octet-stream'].includes(mime)) reject(400, 'invalid_markdown');
    } else {
      imageCount++;
      if (imageCount > LIMITS.images) reject(400, 'too_many_images');
      const extensions = { 'image/png': /\.png$/i, 'image/jpeg': /\.jpe?g$/i, 'image/webp': /\.webp$/i };
      if (!extensions[mime]?.test(filename)) reject(400, 'invalid_image');
    }
    const dataStart = headerEnd + 4;
    const next = bytes.indexOf(separator, dataStart);
    if (next < 0) reject(400, 'invalid_multipart');
    const size = next - dataStart;
    if (!size) reject(400, 'empty_file');
    if (size > (field === 'markdown' ? LIMITS.markdown : LIMITS.image)) reject(413, 'payload_too_large');
    records.push({ field, filename, mime, size });
    offset = next + 2;
  }
  if (markdownCount !== 1) reject(400, 'invalid_markdown');
  return records;
}

function sniffImage(bytes) {
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    // libvips may read just the first APNG frame, so check PNG chunks as well.
    for (let p = 8; p + 12 <= bytes.length;) {
      const length = bytes.readUInt32BE(p);
      const type = bytes.toString('ascii', p + 4, p + 8);
      if (type === 'acTL') reject(400, 'invalid_image');
      if (length > bytes.length - p - 12) reject(400, 'invalid_image');
      p += length + 12;
    }
    return 'image/png';
  }
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
    for (let p = 12; p + 8 <= bytes.length;) {
      const type = bytes.toString('ascii', p, p + 4);
      const length = bytes.readUInt32LE(p + 4);
      if (type === 'ANIM' || type === 'ANMF') reject(400, 'invalid_image');
      if (length > bytes.length - p - 8) reject(400, 'invalid_image');
      p += 8 + length + (length % 2);
    }
    return 'image/webp';
  }
  reject(400, 'invalid_image');
}

async function normalizeImage(bytes, mime) {
  if (sniffImage(bytes) !== mime) reject(400, 'invalid_image');
  try {
    const decoder = sharp(bytes, { failOn: 'warning', limitInputPixels: LIMITS.pixels, sequentialRead: true });
    const metadata = await decoder.metadata();
    const formats = { 'image/png': 'png', 'image/jpeg': 'jpeg', 'image/webp': 'webp' };
    if (metadata.format !== formats[mime] || !metadata.width || !metadata.height || metadata.width > LIMITS.dimension || metadata.height > LIMITS.dimension || (metadata.pages || 1) > 1) reject(400, 'invalid_image');
    // Default sharp behaviour removes EXIF, ICC, XMP, and other input metadata.
    const { data, info } = await decoder.rotate().resize({ width: LIMITS.outputDimension, height: LIMITS.outputDimension, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer({ resolveWithObject: true });
    if (data.length > LIMITS.image) reject(413, 'payload_too_large');
    return { data, width: info.width, height: info.height };
  } catch (error) {
    if (error instanceof Rejection) throw error;
    reject(400, 'invalid_image');
  }
}

async function ensureRoot(root, io) {
  try { await io.mkdir(root, { mode: 0o700 }); } catch (error) { if (error.code !== 'EEXIST') throw error; }
  const stat = await io.lstat(root);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error('Unsafe storage');
  if (process.platform !== 'win32' && ((stat.mode & 0o077) !== 0 || (typeof process.getuid === 'function' && stat.uid !== process.getuid()))) throw new Error('Unsafe storage');
}
async function writePrivate(io, filename, bytes) {
  const file = await io.open(filename, 'wx', 0o600);
  try { await file.writeFile(bytes); await file.sync(); } finally { await file.close(); }
}

function createHandler({ root, getToken, io = fs }) {
  let active = 0;
  return async function handle(request) {
    let acquired = false;
    let stage;
    try {
      const secret = getToken();
      if (!validSecret(secret)) return json(503, { error: 'service_unavailable' });
      const authorization = request.headers.get('authorization') || '';
      const supplied = /^Bearer ([0-9a-f]{64})$/i.exec(authorization)?.[1] || '';
      if (!timingSafeEqual(digest(secret), digest(supplied))) return json(401, { error: 'unauthorized' });
      if (active >= LIMITS.concurrency) return json(503, { error: 'service_unavailable' });
      active++; acquired = true;
      if (request.method !== 'POST') reject(405, 'method_not_allowed');
      const contentType = request.headers.get('content-type') || '';
      const bytes = await boundedBody(request);
      const records = inspectMultipart(bytes, contentType);
      let form;
      try { form = await new Request('http://localhost/', { method: 'POST', headers: { 'content-type': contentType }, body: bytes }).formData(); }
      catch { reject(400, 'invalid_multipart'); }
      const entries = [...form.entries()];
      if (entries.length !== records.length) reject(400, 'invalid_multipart');
      let markdown;
      let markdownName;
      const images = [];
      for (let i = 0; i < entries.length; i++) {
        const [field, file] = entries[i];
        const record = records[i];
        if (!(file instanceof File) || field !== record.field || file.name !== record.filename || file.size !== record.size || file.type !== record.mime) reject(400, 'invalid_multipart');
        const data = Buffer.from(await file.arrayBuffer());
        if (field === 'markdown') {
          try { new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { reject(400, 'invalid_utf8'); }
          markdown = data; markdownName = file.name;
        } else {
          const normalized = await normalizeImage(data, file.type);
          images.push({ original: file.name, ...normalized });
        }
      }
      await ensureRoot(root, io);
      const id = randomUUID();
      const destination = path.join(root, id);
      // A privileged, non-writable parent and a private root are prerequisites:
      // no untrusted local process may swap directories during these operations.
      try { await io.lstat(destination); throw new Error('Destination exists'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      const candidate = path.join(root, `.stage-${randomUUID()}`);
      await io.mkdir(candidate, { mode: 0o700 });
      stage = candidate;
      const imageMap = Object.create(null);
      const imageDetails = [];
      if (images.length) await io.mkdir(path.join(stage, 'images'), { mode: 0o700 });
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const name = `image-${String(i + 1).padStart(2, '0')}.webp`;
        imageMap[image.original] = `images/${name}`;
        imageDetails.push({ path: `images/${name}`, sha256: sha256(image.data), bytes: image.data.length, width: image.width, height: image.height });
        await writePrivate(io, path.join(stage, 'images', name), image.data);
      }
      await writePrivate(io, path.join(stage, 'article.md'), markdown);
      const manifest = { schemaVersion: 1, id, status: 'draft', untrusted: true, createdAt: new Date().toISOString(), content: { path: 'article.md', originalFilename: markdownName, sha256: sha256(markdown), bytes: markdown.length }, imageMap, imageDetails };
      await writePrivate(io, path.join(stage, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
      await io.rename(stage, destination);
      stage = undefined;
      return json(201, { id, status: 'draft' });
    } catch (error) {
      return json(error instanceof Rejection ? error.status : 500, { error: error instanceof Rejection ? error.code : 'internal_error' });
    } finally {
      try {
        if (stage) await io.rm(stage, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      } catch {
        return json(500, { error: 'internal_error' });
      } finally { if (acquired) active--; }
    }
  };
}

// The HTTP export has no caller-controlled storage/configuration override.
export const POST = createHandler({ root: STORAGE_ROOT, getToken: () => process.env.CONTENT_DRAFTS_TOKEN });

// Node tests can inject a temporary directory and filesystem failures; not an API.
export function createDraftHandlerForTests({ storageRoot, token, fileSystem = fs }) {
  if (process.env.NODE_ENV !== 'test') throw new Error('Test factory disabled');
  if (!path.isAbsolute(storageRoot)) throw new Error('Absolute test root required');
  return createHandler({ root: storageRoot, getToken: () => token, io: fileSystem });
}