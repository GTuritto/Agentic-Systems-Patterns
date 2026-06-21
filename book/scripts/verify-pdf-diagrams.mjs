import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pdfChapters } from './book-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookRoot = path.resolve(__dirname, '..');
const docsRoot = path.join(bookRoot, 'docs');
const releaseHtmlPath = path.join(bookRoot, 'releases', 'Agentic-Systems-Patterns.html');

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
  const tocSections = [...html.matchAll(/<section class="toc"[^>]*>([\s\S]*?)<\/section>/g)];

  if (leakedMermaid) {
    throw new Error('PDF source still contains Mermaid code instead of SVG images.');
  }

  if (svgRefs !== expected) {
    throw new Error(`PDF Mermaid SVG coverage mismatch: expected ${expected}, found ${svgRefs}.`);
  }

  if (tocSections.length === 0) {
    throw new Error('PDF TOC is missing.');
  }

  let expectedStart = 1;
  for (const [pageIndex, section] of tocSections.entries()) {
    if (!section[0].includes('data-toc-mode="auto-fit"')) {
      throw new Error(`PDF TOC page ${pageIndex + 1} is not using auto-fit pagination.`);
    }

    const columns = [...section[1].matchAll(/<ol start="(\d+)" data-toc-column="(\d+)" data-toc-items="(\d+)"[^>]*>([\s\S]*?)<\/ol>/g)];
    if (columns.length < 1 || columns.length > 2) {
      throw new Error(`PDF TOC page ${pageIndex + 1} has ${columns.length} column(s); expected 1 or 2.`);
    }

    for (const column of columns) {
      const start = Number(column[1]);
      const itemCount = Number(column[3]);
      const actualItemCount = column[4].match(/<li>/g)?.length ?? 0;
      if (start !== expectedStart) {
        throw new Error(`PDF TOC column order mismatch on TOC page ${pageIndex + 1}: expected start ${expectedStart}, found ${start}.`);
      }
      if (itemCount !== actualItemCount) {
        throw new Error(`PDF TOC item count mismatch on TOC page ${pageIndex + 1}: expected ${itemCount}, found ${actualItemCount}.`);
      }
      expectedStart += itemCount;
    }
  }

  if (expectedStart !== pdfChapters.length + 1) {
    throw new Error(`PDF TOC item coverage mismatch: expected ${pdfChapters.length}, found ${expectedStart - 1}.`);
  }

  console.log(`PDF Mermaid SVG coverage OK: ${svgRefs} diagram(s).`);
  console.log(`PDF TOC column order OK: ${tocSections.length} page(s), auto-fit column pagination.`);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
