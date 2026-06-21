import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { patterns } from './pattern-manifest.mjs';
import {
  bookChapters,
  bookSections,
  pdfChapters,
  sidebarGroups
} from './book-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, '..', 'docs');
const errors = [];

function duplicateValues(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function reportPathMismatch(label, expectedPaths, actualPaths) {
  const firstDifference = Array.from(
    { length: Math.max(expectedPaths.length, actualPaths.length) },
    (_, index) => index
  ).find(index => expectedPaths[index] !== actualPaths[index]);

  if (firstDifference !== undefined) {
    const expectedPath = expectedPaths[firstDifference] ?? '<missing>';
    const actualPath = actualPaths[firstDifference] ?? '<missing>';
    errors.push(
      `${label} differ at index ${firstDifference}: expected ${expectedPath}, actual ${actualPath}`
    );
  }
}

const sectionIds = new Set(bookSections.map(section => section.id));
const chapterIds = bookChapters.map(chapter => chapter.id);
const chapterPaths = bookChapters.map(chapter => chapter.path);

for (const id of duplicateValues(chapterIds)) errors.push(`duplicate chapter id: ${id}`);
for (const chapterPath of duplicateValues(chapterPaths)) {
  errors.push(`duplicate chapter path: ${chapterPath}`);
}

for (const chapter of bookChapters) {
  if (!sectionIds.has(chapter.sectionId)) {
    errors.push(`unknown section ${chapter.sectionId}: ${chapter.id}`);
  }
  try {
    await fs.access(path.join(docsRoot, chapter.path));
  } catch {
    errors.push(`missing chapter file: ${chapter.path}`);
  }
  if (chapter.sidebar && !chapter.pdf) {
    errors.push(`sidebar chapter excluded from PDF: ${chapter.id}`);
  }
}

const canonicalSidebarPaths = sidebarGroups
  .flatMap(group => group.items.map(item => item.path));
const expectedCanonicalSidebarPaths = bookChapters
  .filter(chapter => chapter.sidebar)
  .map(chapter => chapter.path);
const pdfPaths = pdfChapters.map(chapter => chapter.path);
const expectedPdfPaths = bookChapters
  .filter(chapter => chapter.pdf)
  .map(chapter => chapter.path);

for (const chapterPath of duplicateValues(canonicalSidebarPaths)) {
  errors.push(`duplicate canonical sidebar path: ${chapterPath}`);
}
for (const chapterPath of duplicateValues(pdfPaths)) {
  errors.push(`duplicate PDF path: ${chapterPath}`);
}

reportPathMismatch(
  'canonical sidebar paths and sidebar-enabled book chapters',
  expectedCanonicalSidebarPaths,
  canonicalSidebarPaths
);
reportPathMismatch('PDF paths and PDF-enabled book chapters', expectedPdfPaths, pdfPaths);
reportPathMismatch('canonical sidebar and PDF chapter order', canonicalSidebarPaths, pdfPaths);

const generatedPaths = new Set(
  patterns.map(pattern => pattern.chapterPath)
);
for (const chapter of bookChapters.filter(chapter => chapter.ownership === 'generated')) {
  if (!generatedPaths.has(chapter.path)) {
    errors.push(`generated chapter missing from pattern manifest: ${chapter.path}`);
  }
}

const previouslyMissing = [
  'foundations/what-is-an-agent.md',
  'pattern-selection/architecture-before-autonomy.md',
  'pattern-selection/pattern-evaluation-checklist.md',
  'pattern-selection/from-patterns-to-systems.md',
  'pattern-selection/pattern-composition-playbook.md',
  'foundations/context-budgets-and-working-sets.md',
  'agent-engineering-practice/agent-harnesses.md',
  'agent-engineering-practice/agent-threat-model.md',
  'tools-skills-protocols/tool-capability-design.md',
  'multi-agent-systems/choosing-multi-agent-topology.md',
  'systems-architecture/agents-as-services.md'
];
for (const chapterPath of previouslyMissing) {
  if (!pdfPaths.includes(chapterPath)) {
    errors.push(`previously omitted chapter still missing from PDF: ${chapterPath}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Book manifest OK: ${bookChapters.length} chapters`);
