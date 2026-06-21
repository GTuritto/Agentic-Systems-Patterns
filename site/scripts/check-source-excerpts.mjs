import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bookChapters } from '../../book/scripts/book-manifest.mjs';
import { patterns } from '../../book/scripts/pattern-manifest.mjs';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(siteRoot, 'src', 'lib', 'book-manifest.ts');
const manifest = fs.readFileSync(manifestPath, 'utf8');
const patternSummaryPaths = new Set(patterns.map(pattern => pattern.chapterPath));
const authoredSummaryPaths = new Set(
  Array.from(manifest.matchAll(/\[\s*'([^']+\.md)'\s*,\s*'[^']+'\s*\]/g)).map(match => match[1])
);
const weakExcerptPattern = /^(Guide|Reference|Concept|Lab|Capstone|Pattern): /;
const errors = [];

for (const chapter of bookChapters) {
  const hasSummary = chapter.ownership === 'generated'
    ? patternSummaryPaths.has(chapter.path)
    : authoredSummaryPaths.has(chapter.path);

  if (!hasSummary) {
    errors.push(`${chapter.title}: missing source excerpt for ${chapter.path}`);
  }
}

for (const pattern of patterns) {
  if (!pattern.summary || weakExcerptPattern.test(pattern.summary)) {
    errors.push(`${pattern.title}: weak pattern summary`);
  }
}

for (const chapterPath of authoredSummaryPaths) {
  if (!bookChapters.some(chapter => chapter.path === chapterPath)) {
    errors.push(`orphan authored summary: ${chapterPath}`);
  }
}

if (errors.length > 0) {
  console.error(`Source excerpt check failed: ${errors.length} issue(s).`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Source excerpt check OK: ${bookChapters.length} chapter excerpt source(s).`);
