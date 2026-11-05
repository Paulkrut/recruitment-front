# Content draft intake API

`POST /api/content/drafts` accepts one Markdown file (`markdown`) and zero to eight image files (`images`) as `multipart/form-data`. It returns `201` with a random draft ID. Drafts are not published, rendered, indexed, or served by an app route. The server stores them at `/home/ubuntu/sofihr-content/drafts/<uuid>/` outside the application and public directories. Each directory contains the original, byte-for-byte `article.md`, a `manifest.json`, and normalized `images/image-NN.webp` files.

## Configure the server

Set `CONTENT_DRAFTS_TOKEN` in the Next.js server process environment, not in `NEXT_PUBLIC_*`, source control, the browser, or a command-line argument. Generate 32 random bytes and store the 64-character hexadecimal value in your secret manager or protected service environment file. For example, print a candidate directly into a protected terminal and transfer it to the secret manager without putting it into shell history:

```sh
openssl rand -hex 32
```

Restart the Next.js process after configuring the secret. The API fails closed with `503` if it is missing or weak. The storage root is fixed in server code and cannot be set by a request. On Linux, create `/home/ubuntu/sofihr-content` and its `drafts` child owned by the account running Next.js, with mode `0700`; the API rejects a symlink/non-directory root, unsafe permissions, or a different owner. The privileged parent must not be writable by untrusted local users. Keep storage on a filesystem supporting atomic directory rename.

A reverse proxy should independently cap request bodies at 20 MiB or less and return a generic `413`. Application enforcement also counts streamed bytes and does not rely on `Content-Length`. The API permits at most 512 KiB of Markdown, 8 images of at most 5 MiB each, 2 concurrent in-process requests, 20 megapixels and 8192 pixels per source dimension; outputs are metadata-stripped WebP with a maximum 2048-pixel dimension. Horizontal scaling applies the concurrency bound per Node.js process.

## Example

```sh
curl --fail-with-body -X POST 'https://your-host.example/api/content/drafts' \
  -H "Authorization: Bearer $CONTENT_DRAFTS_TOKEN" \
  -F 'markdown=@article.md;type=text/markdown' \
  -F 'images=@cover.jpg;type=image/jpeg'
```

Keep the token in the calling service's secret store. Never expose this endpoint's token in frontend code. Responses use `Cache-Control: no-store`; errors do not include paths or exception details. The API accepts portable ASCII basenames only and never uses an uploaded filename as a path.

## Untrusted content

Markdown is stored as untrusted bytes, not rendered or sanitized. Do not feed it to an HTML renderer or expose image/content paths publicly. If adding a publishing or preview workflow, implement a separate explicit review/publish boundary, sanitize for the exact output context, restrict URLs and embeds, and retain safe media handling; draft status and this intake handler are not a publication control by themselves.

`sharp` is currently available transitively through Next.js (`0.34.5`). This implementation intentionally does not modify package manifests or lockfiles. If Next.js stops bringing it into production installs, add and lock a direct `sharp` dependency in a separately reviewed change.

Tests: `node --test tests/content-drafts.test.mjs`.