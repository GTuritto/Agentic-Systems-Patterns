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

function splitUrl(urlPath) {
  const [withoutHash, rawHash] = urlPath.split('#');
  return {
    path: withoutHash.split('?')[0],
    hash: rawHash ? decodeURIComponent(rawHash) : ''
  };
}

function htmlHasAnchor(htmlFile, hash) {
  if (!hash) return true;
  const html = fs.readFileSync(htmlFile, 'utf8');
  const escaped = hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b(?:id|name)="${escaped}"`).test(html);
}

function targetHtmlFile(urlPath, currentHtmlFile) {
  const { path: withoutHash } = splitUrl(urlPath);
  if (!withoutHash || withoutHash === siteBase || withoutHash === `${siteBase}/`) {
    return path.join(distRoot, 'index.html');
  }

  if (!withoutHash.startsWith(siteBase)) return null;

  const relative = withoutHash.slice(siteBase.length).replace(/^\//, '');
  const target = path.join(distRoot, relative);
  if (fs.existsSync(target) && fs.statSync(target).isFile() && target.endsWith('.html')) return target;
  if (fs.existsSync(path.join(target, 'index.html'))) return path.join(target, 'index.html');
  if (currentHtmlFile && !withoutHash) return currentHtmlFile;
  return null;
}

function targetExists(urlPath, currentHtmlFile) {
  const { path: withoutHash, hash } = splitUrl(urlPath);

  if (!withoutHash && hash) return htmlHasAnchor(currentHtmlFile, hash);

  if (!withoutHash || withoutHash === siteBase || withoutHash === `${siteBase}/`) {
    const htmlFile = path.join(distRoot, 'index.html');
    return fs.existsSync(htmlFile) && htmlHasAnchor(htmlFile, hash);
  }

  if (!withoutHash.startsWith(siteBase)) return false;

  const relative = withoutHash.slice(siteBase.length).replace(/^\//, '');
  const target = path.join(distRoot, relative);
  if (fs.existsSync(target) || fs.existsSync(path.join(target, 'index.html'))) {
    const htmlFile = targetHtmlFile(urlPath, currentHtmlFile);
    return !hash || (htmlFile && htmlHasAnchor(htmlFile, hash));
  }

  return false;
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
      value.includes('${')
    ) {
      continue;
    }

    if (value.startsWith('#')) {
      if (!targetExists(value, htmlFile)) failures.push(`${path.relative(distRoot, htmlFile)} -> ${value}`);
      continue;
    }

    if (value.startsWith('/')) {
      if (!targetExists(value, htmlFile)) failures.push(`${path.relative(distRoot, htmlFile)} -> ${value}`);
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
