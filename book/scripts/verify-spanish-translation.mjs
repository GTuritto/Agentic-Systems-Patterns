import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bookChapters } from './book-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookRoot = path.resolve(__dirname, '..');
const docsRoot = path.join(bookRoot, 'docs');
const spanishRoot = path.join(bookRoot, 'docs-es');

function countMatches(value, pattern) {
  return value.match(pattern)?.length ?? 0;
}

function extractMarkdownTargets(value) {
  return [...value.matchAll(/\[[^\]]+]\(([^)]+)\)|!\[[^\]]*]\(([^)]+)\)/g)]
    .map(match => match[1] ?? match[2])
    .filter(Boolean)
    .map(target => target.split('#')[0])
    .sort();
}

function extractFrontmatterKeys(value) {
  const match = value.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return [];
  return match[1]
    .split('\n')
    .map(line => line.match(/^([A-Za-z0-9_-]+):/)?.[1])
    .filter(Boolean)
    .sort();
}

function diffList(label, source, target) {
  if (JSON.stringify(source) === JSON.stringify(target)) return [];
  return [`${label} changed`];
}

async function verifyChapter(chapter) {
  const sourcePath = path.join(docsRoot, chapter.path);
  const targetPath = path.join(spanishRoot, chapter.path);
  const source = await fs.readFile(sourcePath, 'utf8');
  let target;

  try {
    target = await fs.readFile(targetPath, 'utf8');
  } catch {
    return [`missing Spanish chapter: ${chapter.path}`];
  }

  const failures = [];
  const sourceFenceCount = countMatches(source, /```/g);
  const targetFenceCount = countMatches(target, /```/g);
  if (sourceFenceCount !== targetFenceCount) {
    failures.push(`fenced code marker count changed (${sourceFenceCount} -> ${targetFenceCount})`);
  }

  const sourceTableRows = countMatches(source, /^\|/gm);
  const targetTableRows = countMatches(target, /^\|/gm);
  if (sourceTableRows !== targetTableRows) {
    failures.push(`Markdown table row count changed (${sourceTableRows} -> ${targetTableRows})`);
  }

  failures.push(...diffList('frontmatter keys', extractFrontmatterKeys(source), extractFrontmatterKeys(target)));
  failures.push(...diffList('Markdown link/image targets', extractMarkdownTargets(source), extractMarkdownTargets(target)));

  return failures.map(failure => `${chapter.path}: ${failure}`);
}

async function main() {
  const failures = [];
  for (const chapter of bookChapters) {
    failures.push(...await verifyChapter(chapter));
  }

  if (failures.length > 0) {
    console.error(`Spanish translation verification failed: ${failures.length} issue(s).`);
    for (const failure of failures.slice(0, 100)) console.error(`- ${failure}`);
    if (failures.length > 100) console.error(`...and ${failures.length - 100} more`);
    process.exit(1);
  }

  console.log(`Spanish translation verification OK: ${bookChapters.length} chapter(s).`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
