/*
  download-images.mjs - fetch the fashion photos listed in images.manifest.json into public/images/.

    npm run images             download files that are missing
    npm run images -- --force  re-download everything

  Every download is checked (HTTP status, image content-type, minimum size) and reported,
  so a bad id or a blocked network is visible immediately instead of leaving a broken <img>.
  Uses Unsplash's public download endpoint: https://unsplash.com/photos/<id>/download?force=true
*/
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(here, '..', 'images.manifest.json');
const outDir = path.join(here, '..', 'public', 'images');
const force = process.argv.includes('--force');
const MIN_BYTES = 10 * 1024;

const exists = (p) => access(p).then(() => true, () => false);

async function fetchImage(url) {
  const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = res.headers.get('content-type') || '';
  if (!type.startsWith('image/')) throw new Error(`not an image (content-type: ${type || 'none'})`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < MIN_BYTES) throw new Error(`file too small (${buf.length} bytes)`);
  return buf;
}

async function download(id) {
  // 1) Ask Unsplash where the file lives, then request a web-sized rendition (1400px wide).
  const start = `https://unsplash.com/photos/${encodeURIComponent(id)}/download?force=true`;
  const hop = await fetch(start, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
  const location = hop.headers.get('location');
  if (location) {
    try {
      const u = new URL(location, start);
      u.searchParams.set('w', '1400');
      u.searchParams.set('q', '80');
      u.searchParams.set('fm', 'jpg');
      u.searchParams.set('fit', 'max');
      return await fetchImage(u.toString());
    } catch {
      /* fall through to the original (full-size) file */
    }
    return fetchImage(new URL(location, start).toString());
  }
  return fetchImage(start);
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
await mkdir(outDir, { recursive: true });

const summary = { saved: 0, kept: 0, noSource: 0, failed: 0 };
for (const item of manifest.images) {
  const target = path.join(outDir, item.file);
  if (!force && (await exists(target))) {
    console.log(`=  ${item.file.padEnd(28)} already present`);
    summary.kept += 1;
    continue;
  }
  if (!item.unsplashId) {
    console.log(`-  ${item.file.padEnd(28)} no photo configured yet (${item.usedFor}) - fallback tile will show`);
    summary.noSource += 1;
    continue;
  }
  try {
    const buf = await download(item.unsplashId);
    await writeFile(target, buf);
    console.log(`OK ${item.file.padEnd(28)} ${(buf.length / 1024).toFixed(0)} KB  <- ${item.page || item.unsplashId}`);
    summary.saved += 1;
  } catch (err) {
    console.log(`!! ${item.file.padEnd(28)} FAILED: ${err.message}`);
    summary.failed += 1;
  }
}

console.log(`\nSaved ${summary.saved}, already present ${summary.kept}, no photo configured ${summary.noSource}, failed ${summary.failed}.`);
console.log('Open each downloaded file once and confirm it shows the right product - titles on Unsplash are not a substitute for looking.');
process.exitCode = summary.failed ? 1 : 0;
