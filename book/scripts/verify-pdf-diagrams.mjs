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

  if (leakedMermaid) {
    throw new Error('PDF source still contains Mermaid code instead of SVG images.');
  }

  if (svgRefs !== expected) {
    throw new Error(`PDF Mermaid SVG coverage mismatch: expected ${expected}, found ${svgRefs}.`);
  }

  console.log(`PDF Mermaid SVG coverage OK: ${svgRefs} diagram(s).`);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
