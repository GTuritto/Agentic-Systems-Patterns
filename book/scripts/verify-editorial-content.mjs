import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bookChapters } from './book-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, '..', 'docs');
const placeholderPattern = /\b(TODO|TBD|FIXME|lorem ipsum|coming soon|placeholder)\b|\[TODO]|\[TBD]/i;

function frontmatterTitle(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return '';
  return match[1].match(/^title:\s*(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, '') ?? '';
}

function firstH1(markdown) {
  return markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? '';
}

function stripFencedCode(markdown) {
  return markdown.replace(/```[\s\S]*?```/g, '');
}

async function main() {
  const failures = [];

  for (const chapter of bookChapters) {
    const chapterPath = path.join(docsRoot, chapter.path);
    const markdown = await fs.readFile(chapterPath, 'utf8');
    const prose = stripFencedCode(markdown);
    const title = frontmatterTitle(markdown);
    const h1Matches = [...prose.matchAll(/^#\s+(.+)$/gm)];
    const h1 = firstH1(prose);
    const placeholderMatch = prose.match(placeholderPattern);

    if (!title) failures.push(`${chapter.path}: missing frontmatter title`);
    if (h1Matches.length !== 1) failures.push(`${chapter.path}: expected one H1, found ${h1Matches.length}`);
    if (title && h1 && title !== h1) failures.push(`${chapter.path}: title "${title}" does not match H1 "${h1}"`);
    if (placeholderMatch) failures.push(`${chapter.path}: unresolved editorial marker "${placeholderMatch[0]}"`);
  }

  if (failures.length > 0) {
    console.error(`Editorial content check failed: ${failures.length} issue(s).`);
    for (const failure of failures.slice(0, 50)) console.error(`- ${failure}`);
    if (failures.length > 50) console.error(`...and ${failures.length - 50} more`);
    process.exit(1);
  }

  console.log(`Editorial content check OK: ${bookChapters.length} chapter(s).`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
