import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomBytes, createHash } from 'node:crypto';
import sharp from 'sharp';
import { createDraftHandlerForTests, LIMITS, POST } from '../src/server/content-drafts/handler.mjs';

process.env.NODE_ENV = 'test';
const token = randomBytes(32).toString('hex');
const png = await sharp({ create: { width: 12, height: 10, channels: 3, background: '#ff0000' } }).png().toBuffer();
const md = (data = Buffer.from('# Draft\n<script>alert(1)</script>')) => ({ field: 'markdown', name: 'article.md', mime: 'text/markdown', data });
const img = (name = 'photo.png', data = png, mime = 'image/png') => ({ field: 'images', name, mime, data });
function request(parts = [md()], headers = {}) {
  const boundary = 'draft-test-boundary';
  const chunks = [];
  for (const part of parts) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${part.field}"; filename="${part.name}"\r\nContent-Type: ${part.mime}\r\n\r\n`), part.data, Buffer.from('\r\n'));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return new Request('http://localhost/api/content/drafts', { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': `multipart/form-data; boundary=${boundary}`, ...headers }, body: Buffer.concat(chunks) });
}
async function fixture(t, fileSystem = fs) {
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'content-drafts-'));
  const root = path.join(parent, 'drafts');
  t.after(() => fs.rm(parent, { recursive: true, force: true }));
  return { root, parent, handler: createDraftHandlerForTests({ storageRoot: root, token, fileSystem }) };
}
async function assertEmpty(root) {
  assert.deepEqual(await fs.readdir(root).catch((error) => { if (error.code === 'ENOENT') return []; throw error; }), []);
}

test('private atomic draft, hashes, untrusted markdown unchanged, decoder output strips metadata', async (t) => {
  const { root, handler } = await fixture(t);
  const source = await sharp(png).withMetadata({ orientation: 6 }).withExif({ IFD0: { Artist: 'Private Author' } }).png().toBuffer();
  const response = await handler(request([md(), img('Camera.png', source)]));
  assert.equal(response.status, 201);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const { id } = await response.json();
  assert.match(id, /^[0-9a-f-]{36}$/);
  assert.deepEqual(await fs.readdir(root), [id]);
  const manifest = JSON.parse(await fs.readFile(path.join(root, id, 'manifest.json'), 'utf8'));
  assert.equal(manifest.status, 'draft'); assert.equal(manifest.untrusted, true);
  const article = await fs.readFile(path.join(root, id, 'article.md'));
  assert.deepEqual(article, md().data);
  assert.equal(manifest.content.sha256, createHash('sha256').update(article).digest('hex'));
  assert.equal(manifest.imageMap['Camera.png'], 'images/image-01.webp');
  const output = await fs.readFile(path.join(root, id, 'images/image-01.webp'));
  const decoded = await sharp(output).metadata();
  assert.equal(decoded.format, 'webp'); assert.equal(decoded.width, 10); assert.equal(decoded.height, 12);
  for (const key of ['exif', 'icc', 'xmp', 'iptc', 'orientation']) assert.equal(decoded[key], undefined);
  assert.equal(manifest.imageDetails[0].sha256, createHash('sha256').update(output).digest('hex'));
  if (process.platform !== 'win32') {
    assert.equal((await fs.stat(root)).mode & 0o777, 0o700);
    assert.equal((await fs.stat(path.join(root, id, 'article.md'))).mode & 0o777, 0o600);
  }
});

test('auth and weak/missing config fail closed without reading body', async (t) => {
  const { root, handler } = await fixture(t);
  for (const authorization of ['', 'Bearer wrong', `Bearer ${randomBytes(32).toString('hex')}`]) {
    const response = await handler({ headers: new Headers({ authorization }), get body() { throw new Error('must not read'); } });
    assert.equal(response.status, 401);
  }
  for (const weak of [undefined, '', 'a'.repeat(64), '0123456789abcdef'.repeat(4), 'too-short']) {
    const failClosed = createDraftHandlerForTests({ storageRoot: root, token: weak });
    assert.equal((await failClosed({ headers: new Headers(), get body() { throw new Error('must not read'); } })).status, 503);
  }
  await assertEmpty(root);
});

test('body bound enforced on actual chunks even with false or absent length', async (t) => {
  const { root, handler } = await fixture(t);
  for (const length of [undefined, '1']) {
    let cancelled = false;
    const stream = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(1024 * 1024)); }, cancel() { cancelled = true; } });
    const response = await handler(new Request('http://localhost', { method: 'POST', duplex: 'half', headers: { authorization: `Bearer ${token}`, ...(length ? { 'content-length': length } : {}) }, body: stream }));
    assert.equal(response.status, 413); assert.equal(cancelled, true);
  }
  let read = false;
  const early = await handler({ method: 'POST', headers: new Headers({ authorization: `Bearer ${token}`, 'content-length': String(LIMITS.body + 1) }), get body() { read = true; throw new Error(); } });
  assert.equal(early.status, 413); assert.equal(read, false);
  await assertEmpty(root);
});

test('strict files, counts, names, duplicate names, MIME, UTF8, corrupt images', async (t) => {
  const { root, handler } = await fixture(t);
  const cases = [
    [[], 400], [[md(), md()], 400], [[md(), ...Array.from({ length: 9 }, (_, i) => img(`p${i}.png`))], 400],
    [[{ ...md(), field: 'unknown' }], 400], [[md(), img('Photo.png'), img('photo.png')], 400],
    ...['../photo.png', '..\\photo.png', 'folder/photo.png', 'C:\\photo.png', 'CON.png', 'foo..png', 'bad name.png', 'фото.png'].map((name) => [[md(), img(name)], 400]),
    [[md(Buffer.from([0xc3, 0x28]))], 400], [[md(Buffer.alloc(LIMITS.markdown + 1))], 413],
    [[md(), img('photo.png', Buffer.alloc(LIMITS.image + 1))], 413],
    [[md(), img('photo.jpg', png, 'image/jpeg')], 400], [[md(), img('x.svg', Buffer.from('<svg/>'), 'image/svg+xml')], 400],
    [[md(), img('x.gif', Buffer.from('GIF89a'), 'image/gif')], 400], [[md(), img('x.png', png.subarray(0, 25))], 400],
    [[md(), img('x.png', Buffer.from('not image'))], 400],
  ];
  for (const [parts, status] of cases) {
    const result = await handler(request(parts));
    assert.equal(result.status, status, JSON.stringify(parts.map((p) => p.name)));
    assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.doesNotMatch(JSON.stringify(await result.json()), /content-drafts-|node_modules|\\home|\/home/);
    await assertEmpty(root);
  }
});

test('rejects animated WebP and APNG and dimension/pixel bombs; resizes large safe inputs', async (t) => {
  const { root, handler } = await fixture(t);
  const animated = await sharp(Buffer.concat([Buffer.alloc(12, 0), Buffer.alloc(12, 255)]), { raw: { width: 2, height: 4, channels: 3, pageHeight: 2 } }).webp({ loop: 0, delay: [100, 100] }).toBuffer();
  assert.equal((await sharp(animated).metadata()).pages, 2);
  assert.equal((await handler(request([md(), img('a.webp', animated, 'image/webp')]))).status, 400);
  const chunk = Buffer.alloc(20); chunk.writeUInt32BE(8); chunk.write('acTL', 4); chunk.writeUInt32BE(2, 8);
  const apng = Buffer.concat([png.subarray(0, 33), chunk, png.subarray(33)]);
  assert.equal((await handler(request([md(), img('a.png', apng)]))).status, 400);
  for (const [width, height] of [[8193, 1], [5000, 5000]]) {
    const large = await sharp({ create: { width, height, channels: 3, background: '#fff' } }).png().toBuffer();
    assert.equal((await handler(request([md(), img('large.png', large)]))).status, 400);
  }
  const large = await sharp({ create: { width: 3000, height: 1000, channels: 3, background: '#fff' } }).png().toBuffer();
  const response = await handler(request([md(), img('large.png', large)]));
  assert.equal(response.status, 201);
  const { id } = await response.json();
  const output = await sharp(await fs.readFile(path.join(root, id, 'images/image-01.webp'))).metadata();
  assert.equal(output.width, 2048);
});

test('write, fsync and rename errors clean staging and expose only generic errors', async (t) => {
  for (const operation of ['write', 'sync', 'rename']) {
    const io = { ...fs, ...(operation === 'rename' ? { rename: async () => { throw new Error('private path'); } } : {
      open: async (...args) => {
        const handle = await fs.open(...args);
        return { writeFile: operation === 'write' ? async () => { throw new Error('private path'); } : (...values) => handle.writeFile(...values), sync: operation === 'sync' ? async () => { throw new Error('private path'); } : () => handle.sync(), close: () => handle.close() };
      },
    }) };
    const { root, handler } = await fixture(t, io);
    const result = await handler(request([md(), img()]));
    assert.equal(result.status, 500); assert.deepEqual(await result.json(), { error: 'internal_error' });
    await assertEmpty(root);
  }
});

test('root symlink is rejected without writing to target', { skip: process.platform === 'win32' ? 'Windows symlink privilege not assumed' : false }, async (t) => {
  const { root, parent, handler } = await fixture(t);
  const target = path.join(parent, 'target'); await fs.mkdir(target, { mode: 0o700 });
  await fs.symlink(target, root, 'dir');
  assert.equal((await handler(request())).status, 500);
  await assertEmpty(target);
});

test('bounded concurrency returns 503 before body read, releases on failure and keeps writes independent', async (t) => {
  const { root, handler } = await fixture(t);
  const releases = [];
  const stalled = () => new Request('http://localhost', { method: 'POST', duplex: 'half', headers: { authorization: `Bearer ${token}` }, body: new ReadableStream({ start(controller) { releases.push(() => controller.close()); } }) });
  const pending = [handler(stalled()), handler(stalled())];
  const overloaded = await handler({ headers: new Headers({ authorization: `Bearer ${token}` }), get body() { throw new Error('must not read'); } });
  assert.equal(overloaded.status, 503);
  releases.forEach((release) => release());
  assert.deepEqual((await Promise.all(pending)).map((r) => r.status), [400, 400]);
  const completed = await Promise.all([handler(request()), handler(request())]);
  assert.deepEqual(completed.map((r) => r.status), [201, 201]);
  const ids = await Promise.all(completed.map(async (r) => (await r.json()).id));
  assert.notEqual(ids[0], ids[1]);
  assert.deepEqual((await fs.readdir(root)).sort(), ids.sort());
});

test('test injection is unavailable in production; production storage is fixed', () => {
  const old = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try { assert.throws(() => createDraftHandlerForTests({ storageRoot: os.tmpdir(), token }), /disabled/); }
  finally { process.env.NODE_ENV = old; }
  assert.equal(POST.length, 1);
});