import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(siteRoot, 'dist');
const siteBase = '/Agentic-Systems-Patterns';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function targetExists(urlPath) {
  const withoutHash = urlPath.split('#')[0].split('?')[0];
  if (!withoutHash || withoutHash === siteBase || withoutHash === `${siteBase}/`) {
    return fs.existsSync(path.join(distRoot, 'index.html'));
  }

  if (!withoutHash.startsWith(siteBase)) return false;

  const relative = withoutHash.slice(siteBase.length).replace(/^\//, '');
  const target = path.join(distRoot, relative);
  return fs.existsSync(target) || fs.existsSync(path.join(target, 'index.html'));
}

const failures = [];
const htmlFiles = walk(distRoot).filter(file => file.endsWith('.html'));
const attributePattern = /\b(?:href|src)="([^"]+)"/g;

for (const htmlFile of htmlFiles) {
  const html = fs.readFileSync(htmlFile, 'utf8');
  for (const match of html.matchAll(attributePattern)) {
    const value = match[1];
    if (
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('mailto:') ||
      value.startsWith('#') ||
      value.includes('${')
    ) {
      continue;
    }

    if (value.startsWith('/')) {
      if (!targetExists(value)) failures.push(`${path.relative(distRoot, htmlFile)} -> ${value}`);
      continue;
    }

    if (value.startsWith('../public/')) {
      failures.push(`${path.relative(distRoot, htmlFile)} -> ${value}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`Astro link check failed: ${failures.length} broken internal URL(s).`);
  for (const failure of failures.slice(0, 50)) console.error(`- ${failure}`);
  if (failures.length > 50) console.error(`...and ${failures.length - 50} more`);
  process.exit(1);
}

console.log(`Astro link check OK: ${htmlFiles.length} HTML pages scanned.`);
