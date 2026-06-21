import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(siteRoot, 'dist');
const siteOrigin = 'https://gturitto.github.io';
const siteBase = '/Agentic-Systems-Patterns';

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  }));
  return nested.flat();
}

function pageUrl(htmlFile) {
  const relative = path.relative(distRoot, htmlFile).split(path.sep).join('/');
  const route = relative === 'index.html'
    ? '/'
    : `/${relative.replace(/\/index\.html$/, '/')}`;
  return new URL(`${siteBase}${route}`, siteOrigin).toString();
}

const htmlFiles = (await walk(distRoot))
  .filter(file => file.endsWith('.html'))
  .sort((a, b) => pageUrl(a).localeCompare(pageUrl(b)));

const urls = htmlFiles.map(file => `  <url><loc>${escapeXml(pageUrl(file))}</loc></url>`);
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  '</urlset>',
  ''
].join('\n');

const robots = [
  'User-agent: *',
  'Allow: /Agentic-Systems-Patterns/',
  `Sitemap: ${new URL(`${siteBase}/sitemap.xml`, siteOrigin).toString()}`,
  ''
].join('\n');

await fs.writeFile(path.join(distRoot, 'sitemap.xml'), sitemap);
await fs.writeFile(path.join(distRoot, 'robots.txt'), robots);

console.log(`Generated sitemap.xml with ${htmlFiles.length} page URL(s).`);
console.log('Generated robots.txt.');
