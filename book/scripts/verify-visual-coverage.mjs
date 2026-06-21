import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bookChapters } from './book-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(bookRoot, '..');
const docsRoot = path.join(bookRoot, 'docs');
const homepagePath = path.join(repoRoot, 'site', 'src', 'pages', 'index.astro');

function removeNonMermaidCodeFences(markdown) {
  return markdown.replace(/```(?!mermaid\b)[\s\S]*?```/g, '');
}

function hasVisual(markdown) {
  const visibleMarkdown = removeNonMermaidCodeFences(markdown);
  return (
    /```mermaid\b/.test(visibleMarkdown) ||
    /!\[[^\]]{8,}]\([^)]+\)/.test(visibleMarkdown) ||
    /<img\b/i.test(visibleMarkdown)
  );
}

async function main() {
  const failures = [];
  let visualChapters = 0;

  for (const chapter of bookChapters) {
    const chapterPath = path.join(docsRoot, chapter.path);
    const markdown = await fs.readFile(chapterPath, 'utf8');
    if (hasVisual(markdown)) {
      visualChapters += 1;
    } else {
      failures.push(`${chapter.path}: missing Mermaid diagram, image, or SVG reference`);
    }
  }

  try {
    const homepage = await fs.readFile(homepagePath, 'utf8');
    if (!/<div class="mermaid"/.test(homepage)) {
      failures.push('site/src/pages/index.astro: missing homepage Mermaid reading model');
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  if (failures.length > 0) {
    console.error(`Visual coverage check failed: ${failures.length} issue(s).`);
    for (const failure of failures.slice(0, 50)) console.error(`- ${failure}`);
    if (failures.length > 50) console.error(`...and ${failures.length - 50} more`);
    process.exit(1);
  }

  console.log(`Visual coverage OK: ${visualChapters}/${bookChapters.length} manifest chapter(s) plus homepage.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
