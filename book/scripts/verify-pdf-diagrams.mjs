import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pdfChapters } from './book-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookRoot = path.resolve(__dirname, '..');
const docsRoot = path.join(bookRoot, 'docs');
const releaseHtmlPath = path.join(bookRoot, 'releases', 'Agentic-Systems-Patterns.html');
const tocItemsPerColumn = 30;
const tocItemsPerPage = tocItemsPerColumn * 2;

async function sourceMermaidCount() {
  let count = 0;
  for (const chapter of pdfChapters) {
    const markdown = await fs.readFile(path.join(docsRoot, chapter.path), 'utf8');
    count += markdown.match(/```mermaid\n/g)?.length ?? 0;
  }
  return count;
}

async function main() {
  const expected = await sourceMermaidCount();
  const html = await fs.readFile(releaseHtmlPath, 'utf8');
  const leakedMermaid = /```mermaid|language-mermaid|class="mermaid"/.test(html);
  const svgRefs = html.match(/<img src="\.\.\/docs\/public\/diagrams\/(?:generated-mermaid\/[^"]+|intro-architecture-argument|reading-path-decision-flow|logical-group-design-pipeline)[^"]*\.svg"/g)?.length ?? 0;
  const tocSections = [...html.matchAll(/<section class="toc">([\s\S]*?)<\/section>/g)];

  if (leakedMermaid) {
    throw new Error('PDF source still contains Mermaid code instead of SVG images.');
  }

  if (svgRefs !== expected) {
    throw new Error(`PDF Mermaid SVG coverage mismatch: expected ${expected}, found ${svgRefs}.`);
  }

  if (tocSections.length !== Math.ceil(pdfChapters.length / tocItemsPerPage)) {
    throw new Error(`PDF TOC page count mismatch: expected ${Math.ceil(pdfChapters.length / tocItemsPerPage)}, found ${tocSections.length}.`);
  }

  for (const [pageIndex, section] of tocSections.entries()) {
    const starts = [...section[1].matchAll(/<ol start="(\d+)">/g)].map(match => Number(match[1]));
    const expectedStarts = [
      pageIndex * tocItemsPerPage + 1,
      pageIndex * tocItemsPerPage + tocItemsPerColumn + 1
    ];
    if (starts.length !== 2 || starts.some((start, index) => start !== expectedStarts[index])) {
      throw new Error(`PDF TOC column order mismatch on TOC page ${pageIndex + 1}: expected starts ${expectedStarts.join(', ')}, found ${starts.join(', ')}.`);
    }
  }

  console.log(`PDF Mermaid SVG coverage OK: ${svgRefs} diagram(s).`);
  console.log(`PDF TOC column order OK: ${tocSections.length} page(s), ${tocItemsPerColumn} item(s) per column.`);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
