import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bookChapters } from '../../book/scripts/book-manifest.mjs';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(siteRoot, 'dist');

const missing = bookChapters
  .map(chapter => chapter.path.replace(/\.md$/, '').replace(/\/index$/, ''))
  .filter(slug => !fs.existsSync(path.join(distRoot, 'book', slug, 'index.html')));

if (missing.length > 0) {
  console.error(`Astro parity failed: ${missing.length} missing chapter route(s).`);
  for (const slug of missing) console.error(`- /book/${slug}/`);
  process.exit(1);
}

const generatedChapterPages = fs
  .readdirSync(path.join(distRoot, 'book'), { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name === 'index.html').length;

if (generatedChapterPages !== bookChapters.length) {
  console.error(
    `Astro parity failed: generated ${generatedChapterPages} chapter pages, expected ${bookChapters.length}.`
  );
  process.exit(1);
}

console.log(`Astro parity OK: ${bookChapters.length} chapter routes generated.`);
