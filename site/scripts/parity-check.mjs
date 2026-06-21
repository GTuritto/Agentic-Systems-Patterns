import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bookChapters } from '../../book/scripts/book-manifest.mjs';
import { patterns } from '../../book/scripts/pattern-manifest.mjs';
import { featuredChapterIds } from '../src/lib/book-manifest.ts';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(siteRoot, 'dist');
const siteOrigin = 'https://gturitto.github.io';
const siteBase = '/Agentic-Systems-Patterns';

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

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function pageUrl(htmlFile) {
  const relative = path.relative(distRoot, htmlFile).split(path.sep).join('/');
  const route = relative === 'index.html'
    ? '/'
    : `/${relative.replace(/\/index\.html$/, '/')}`;
  return new URL(`${siteBase}${route}`, siteOrigin).toString();
}

const sitemapPath = path.join(distRoot, 'sitemap.xml');
const robotsPath = path.join(distRoot, 'robots.txt');

if (!fs.existsSync(sitemapPath)) {
  console.error('Astro parity failed: missing sitemap.xml.');
  process.exit(1);
}

if (!fs.existsSync(robotsPath)) {
  console.error('Astro parity failed: missing robots.txt.');
  process.exit(1);
}

const htmlUrls = walk(distRoot)
  .filter(file => file.endsWith('.html'))
  .map(pageUrl)
  .sort();
const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const sitemapUrls = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g))
  .map(match => match[1])
  .sort();

if (JSON.stringify(sitemapUrls) !== JSON.stringify(htmlUrls)) {
  console.error(
    `Astro parity failed: sitemap has ${sitemapUrls.length} URL(s), expected ${htmlUrls.length}.`
  );
  process.exit(1);
}

const robots = fs.readFileSync(robotsPath, 'utf8');
const expectedSitemapLine = `Sitemap: ${new URL(`${siteBase}/sitemap.xml`, siteOrigin).toString()}`;
if (!robots.includes(expectedSitemapLine)) {
  console.error('Astro parity failed: robots.txt does not reference sitemap.xml.');
  process.exit(1);
}

console.log(`Astro sitemap OK: ${sitemapUrls.length} page URL(s).`);

const indexHtml = fs.readFileSync(path.join(distRoot, 'index.html'), 'utf8');
const fallbackSearchMatch = indexHtml.match(
  /<script id="search-fallback-data" type="application\/json">([\s\S]*?)<\/script>/
);

if (!fallbackSearchMatch) {
  console.error('Astro parity failed: missing fallback search data.');
  process.exit(1);
}

const fallbackSearchItems = JSON.parse(fallbackSearchMatch[1]);
const weakExcerptPattern = /^(Guide|Reference|Concept|Lab|Capstone|Pattern): /;
const weakSearchItems = fallbackSearchItems.filter(item =>
  item.excerpt === 'Open this chapter from the search results.' ||
  weakExcerptPattern.test(item.excerpt)
);

if (weakSearchItems.length > 0) {
  console.error(
    `Astro parity failed: ${weakSearchItems.length} fallback search excerpt(s) are too generic.`
  );
  for (const item of weakSearchItems) console.error(`- ${item.title}: ${item.excerpt}`);
  process.exit(1);
}

console.log(`Astro search fallback OK: ${fallbackSearchItems.length} chapter excerpt(s).`);

const patternCatalogPath = path.join(distRoot, 'patterns', 'index.html');

if (!fs.existsSync(patternCatalogPath)) {
  console.error('Astro parity failed: missing pattern catalog page.');
  process.exit(1);
}

const patternCatalogHtml = fs.readFileSync(patternCatalogPath, 'utf8');
const renderedPatternCards = patternCatalogHtml.match(/class="pattern-card"/g)?.length ?? 0;

if (renderedPatternCards !== patterns.length) {
  console.error(
    `Astro parity failed: pattern catalog renders ${renderedPatternCards} card(s), expected ${patterns.length}.`
  );
  process.exit(1);
}

console.log(`Astro pattern catalog OK: ${renderedPatternCards} pattern card(s).`);

const bookChapterIds = new Set(bookChapters.map(chapter => chapter.id));
const missingFeaturedIds = featuredChapterIds.filter(id => !bookChapterIds.has(id));

if (missingFeaturedIds.length > 0) {
  console.error('Astro parity failed: featured chapter id(s) are missing from the book manifest.');
  for (const id of missingFeaturedIds) console.error(`- ${id}`);
  process.exit(1);
}

const renderedFeaturedCards = indexHtml.match(/class="featured-chapter-card"/g)?.length ?? 0;

if (renderedFeaturedCards !== featuredChapterIds.length) {
  console.error(
    `Astro parity failed: home renders ${renderedFeaturedCards} featured chapter card(s), expected ${featuredChapterIds.length}.`
  );
  process.exit(1);
}

console.log(`Astro featured chapters OK: ${renderedFeaturedCards} card(s).`);
