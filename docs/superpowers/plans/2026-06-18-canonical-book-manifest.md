# Canonical Book Manifest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make one manifest control the website sidebar and complete PDF chapter order.

**Architecture:** Add a focused ESM manifest containing sections, chapters, ownership, and curated Start Here links. VitePress and the PDF generator consume exported helpers. A structural test validates files, uniqueness, generated-page ownership, parity, and the previously omitted chapters.

**Tech Stack:** Node.js ESM, VitePress, MarkdownIt, Playwright, TypeScript configuration, npm scripts.

---

## File Structure

- Create `book/scripts/book-manifest.mjs`: canonical section, chapter, Start Here, sidebar, and PDF metadata.
- Create `book/scripts/book-manifest.spec.mjs`: structural and parity tests.
- Modify `book/docs/.vitepress/config.ts`: import generated sidebar groups.
- Modify `book/scripts/generate-pdf.mjs`: import ordered PDF chapters.
- Modify `book/package.json`: run manifest validation before builds.
- Modify `package.json`: expose `book:manifest:test`.

### Task 1: Add Failing Manifest Contract Tests

**Files:**
- Create: `book/scripts/book-manifest.spec.mjs`
- Modify: `book/package.json`
- Modify: `package.json`

- [ ] **Step 1: Create the structural test**

Create `book/scripts/book-manifest.spec.mjs`:

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { patterns } from './pattern-manifest.mjs';
import {
  bookChapters,
  bookSections,
  pdfChapters,
  sidebarGroups,
  startHereChapterIds
} from './book-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, '..', 'docs');
const errors = [];

function duplicateValues(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
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
  .filter(group => group.id !== 'start-here')
  .flatMap(group => group.items.map(item => item.path));
const pdfPaths = pdfChapters.map(chapter => chapter.path);

for (const chapterPath of duplicateValues(canonicalSidebarPaths)) {
  errors.push(`duplicate canonical sidebar path: ${chapterPath}`);
}
for (const chapterPath of duplicateValues(pdfPaths)) {
  errors.push(`duplicate PDF path: ${chapterPath}`);
}

if (JSON.stringify(canonicalSidebarPaths) !== JSON.stringify(pdfPaths)) {
  errors.push('canonical sidebar and PDF chapter order differ');
}

const startHerePaths = startHereChapterIds.map(id => {
  const chapter = bookChapters.find(candidate => candidate.id === id);
  if (!chapter) errors.push(`unknown Start Here chapter: ${id}`);
  return chapter?.path;
});
if (duplicateValues(startHerePaths).length > 0) {
  errors.push('Start Here contains duplicate chapter links');
}

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
  'pattern-selection/pattern-classification-mind-map.md',
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
```

- [ ] **Step 2: Add test scripts**

In `book/package.json` add:

```json
"manifest:test": "node scripts/book-manifest.spec.mjs"
```

In the root `package.json` add:

```json
"book:manifest:test": "npm run manifest:test --prefix book"
```

- [ ] **Step 3: Run the test and verify RED**

Run:

```sh
npm run book:manifest:test
```

Expected: failure because `book/scripts/book-manifest.mjs` does not exist.

- [ ] **Step 4: Commit the failing contract test**

```sh
git add book/scripts/book-manifest.spec.mjs book/package.json package.json
git commit -m "test(book): define canonical manifest contract"
```

### Task 2: Implement The Canonical Manifest

**Files:**
- Create: `book/scripts/book-manifest.mjs`
- Test: `book/scripts/book-manifest.spec.mjs`

- [ ] **Step 1: Define manifest helpers**

Create `book/scripts/book-manifest.mjs` with:

```js
export const bookSections = [
  { id: 'front-matter', title: 'Start Here and Pattern Selection' },
  { id: 'foundations', title: 'Foundations' },
  { id: 'agent-engineering-practice', title: 'Agent Engineering Practice' },
  { id: 'control-loops', title: 'Control Loops' },
  { id: 'memory-knowledge', title: 'Memory and Knowledge' },
  { id: 'tools-skills-protocols', title: 'Tools, Skills, and Protocols' },
  { id: 'multi-agent-systems', title: 'Multi-Agent Systems' },
  { id: 'systems-architecture', title: 'Systems Architecture' },
  { id: 'production-runtime', title: 'Production Runtime' },
  { id: 'hands-on-labs', title: 'Hands-On Labs' },
  { id: 'deprecated', title: 'Historical Patterns' },
  { id: 'publishing', title: 'Publishing Appendix' }
];

function chapter(id, title, path, sectionId, ownership = 'authored') {
  return {
    id,
    title,
    path,
    sectionId,
    ownership,
    sidebar: true,
    pdf: true
  };
}
```

- [ ] **Step 2: Add every unique sidebar chapter in canonical order**

Populate `bookChapters` in this exact section order:

```js
export const bookChapters = [
  chapter('introduction', 'Introduction', 'intro.md', 'front-matter'),
  chapter('how-to-read', 'How To Read This Book', 'publishing/how-to-read.md', 'front-matter'),
  chapter('what-is-an-agent', 'What Is An Agent?', 'foundations/what-is-an-agent.md', 'front-matter'),
  chapter('architecture-before-autonomy', 'Architecture Before Autonomy', 'pattern-selection/architecture-before-autonomy.md', 'front-matter'),
  chapter('choosing-the-right-pattern', 'Choosing the Right Pattern', 'pattern-selection/choosing-the-right-pattern.md', 'front-matter'),
  chapter('pattern-evaluation-checklist', 'Pattern Evaluation Checklist', 'pattern-selection/pattern-evaluation-checklist.md', 'front-matter'),
  chapter('pattern-classification-mind-map', 'Linked Pattern Mind Map', 'pattern-selection/pattern-classification-mind-map.md', 'front-matter'),
  chapter('from-patterns-to-systems', 'From Patterns To Systems', 'pattern-selection/from-patterns-to-systems.md', 'front-matter'),
  chapter('pattern-composition-playbook', 'Pattern Composition Playbook', 'pattern-selection/pattern-composition-playbook.md', 'front-matter'),
  chapter('prompt-chaining-and-gates', 'Prompt Chaining and Gates', 'pattern-selection/prompt-chaining-and-gates.md', 'front-matter'),
  chapter('routing-and-handoffs', 'Routing and Handoffs', 'pattern-selection/routing-and-handoffs.md', 'front-matter'),
  chapter('resource-aware-agent-design', 'Resource-Aware Agent Design', 'pattern-selection/resource-aware-agent-design.md', 'front-matter'),
  chapter('circuit-breakers-fallbacks-replay', 'Circuit Breakers, Fallbacks, and Replay', 'pattern-selection/circuit-breakers-fallbacks-replay.md', 'front-matter'),
  chapter('source-map', 'Source Map', 'pattern-selection/source-map.md', 'front-matter'),

  chapter('single-agent', 'Single Agent', 'foundations/single-agent.md', 'foundations', 'generated'),
  chapter('agent-loop', 'Agent Loop', 'foundations/agent-loop.md', 'foundations', 'generated'),
  chapter('goals-and-state', 'Goals and State', 'foundations/goals-and-state.md', 'foundations', 'generated'),
  chapter('tool-use', 'Tool Use', 'foundations/tool-use.md', 'foundations', 'generated'),
  chapter('structured-output', 'Structured Output', 'foundations/structured-output.md', 'foundations', 'generated'),
  chapter('context-budgets-and-working-sets', 'Context Budgets and Working Sets', 'foundations/context-budgets-and-working-sets.md', 'foundations'),
  chapter('context-engineering', 'Context Engineering', 'foundations/context-engineering.md', 'foundations', 'generated'),

  chapter('agent-development-lifecycle', 'Agent Development Lifecycle', 'agent-engineering-practice/agent-development-lifecycle.md', 'agent-engineering-practice'),
  chapter('agent-harnesses', 'Agent Harnesses', 'agent-engineering-practice/agent-harnesses.md', 'agent-engineering-practice'),
  chapter('agent-engineer-toolkit', 'Agent Engineer Toolkit', 'agent-engineering-practice/agent-engineer-toolkit.md', 'agent-engineering-practice'),
  chapter('framework-selection', 'Framework Selection', 'agent-engineering-practice/framework-selection.md', 'agent-engineering-practice'),
  chapter('evaluation-driven-agent-development', 'Evaluation-Driven Agent Development', 'agent-engineering-practice/evaluation-driven-agent-development.md', 'agent-engineering-practice'),
  chapter('agent-threat-model', 'Agent Threat Model', 'agent-engineering-practice/agent-threat-model.md', 'agent-engineering-practice'),
  chapter('agent-security-and-sandboxing', 'Agent Security and Sandboxing', 'agent-engineering-practice/agent-security-and-sandboxing.md', 'agent-engineering-practice'),
  chapter('agent-ux-and-human-trust', 'Agent UX and Human Trust', 'agent-engineering-practice/agent-ux-and-human-trust.md', 'agent-engineering-practice'),

  chapter('planning-and-execution', 'Planning and Execution', 'control-loops/planning-and-execution.md', 'control-loops', 'generated'),
  chapter('react', 'ReAct', 'control-loops/react.md', 'control-loops', 'generated'),
  chapter('reflection', 'Reflection', 'control-loops/reflection.md', 'control-loops', 'generated'),
  chapter('evaluator-optimizer', 'Evaluator-Optimizer', 'control-loops/evaluator-optimizer.md', 'control-loops', 'generated'),
  chapter('self-improvement', 'Self-Improvement', 'control-loops/self-improvement.md', 'control-loops', 'generated'),
  chapter('self-healing-workflows', 'Self-Healing Workflows', 'control-loops/self-healing-workflows.md', 'control-loops', 'generated'),

  chapter('memory-augmented-agent', 'Memory-Augmented Agent', 'memory-knowledge/memory-augmented-agent.md', 'memory-knowledge', 'generated'),
  chapter('long-term-episodic-memory', 'Long-Term Episodic Memory', 'memory-knowledge/long-term-episodic-memory.md', 'memory-knowledge', 'generated'),
  chapter('semantic-recall-rag', 'Semantic Recall and RAG', 'memory-knowledge/semantic-recall-rag.md', 'memory-knowledge', 'generated'),
  chapter('working-memory', 'Working Memory', 'memory-knowledge/working-memory.md', 'memory-knowledge', 'generated'),
  chapter('knowledge-bound-agents', 'Knowledge-Bound Agents', 'memory-knowledge/knowledge-bound-agents.md', 'memory-knowledge', 'generated'),

  chapter('skills', 'Skills', 'tools-skills-protocols/skills.md', 'tools-skills-protocols', 'generated'),
  chapter('tool-capability-design', 'Tool Capability Design', 'tools-skills-protocols/tool-capability-design.md', 'tools-skills-protocols'),
  chapter('mcp-first-tool-use', 'MCP-first Tool Use', 'tools-skills-protocols/mcp-first-tool-use.md', 'tools-skills-protocols', 'generated'),
  chapter('a2a-agent-interoperability', 'A2A Agent Interoperability', 'tools-skills-protocols/a2a-agent-interoperability.md', 'tools-skills-protocols', 'generated'),
  chapter('secure-agent-communication', 'Secure Agent Communication', 'tools-skills-protocols/secure-agent-communication.md', 'tools-skills-protocols', 'generated'),
  chapter('human-approval-gates', 'Human Approval Gates', 'tools-skills-protocols/human-approval-gates.md', 'tools-skills-protocols', 'generated'),

  chapter('choosing-multi-agent-topology', 'Choosing Multi-Agent Topology', 'multi-agent-systems/choosing-multi-agent-topology.md', 'multi-agent-systems'),
  chapter('task-delegation', 'Task Delegation', 'multi-agent-systems/task-delegation.md', 'multi-agent-systems', 'generated'),
  chapter('supervisor-worker', 'Supervisor / Worker', 'multi-agent-systems/supervisor-worker.md', 'multi-agent-systems', 'generated'),
  chapter('debate-and-consensus', 'Debate and Consensus', 'multi-agent-systems/debate-and-consensus.md', 'multi-agent-systems', 'generated'),
  chapter('parallel-agents', 'Parallel Agents', 'multi-agent-systems/parallel-agents.md', 'multi-agent-systems', 'generated'),
  chapter('crewai-flows-and-crews', 'CrewAI Flows and Crews', 'multi-agent-systems/crewai-flows-and-crews.md', 'multi-agent-systems', 'generated'),

  chapter('agentic-system-architecture', 'Agentic System Architecture', 'systems-architecture/agentic-system-architecture.md', 'systems-architecture'),
  chapter('agents-as-services', 'Agents As Services', 'systems-architecture/agents-as-services.md', 'systems-architecture'),
  chapter('agentic-rag-systems', 'Agentic RAG Systems', 'systems-architecture/agentic-rag-systems.md', 'systems-architecture'),
  chapter('open-personal-agent-architectures', 'Open Personal Agent Architectures', 'systems-architecture/open-personal-agent-architectures.md', 'systems-architecture'),
  chapter('coding-agents', 'Coding Agents', 'systems-architecture/coding-agents.md', 'systems-architecture'),
  chapter('computer-use-agents', 'Computer-Use Agents', 'systems-architecture/computer-use-agents.md', 'systems-architecture'),
  chapter('domain-agent-architectures', 'Domain Agent Architectures', 'systems-architecture/domain-agent-architectures.md', 'systems-architecture'),
  chapter('architecture-decision-records', 'Architecture Decision Records', 'systems-architecture/architecture-decision-records.md', 'systems-architecture'),
  chapter('reference-architecture', 'Reference Architecture', 'systems-architecture/reference-architecture.md', 'systems-architecture'),

  chapter('production-runtime-overview', 'Overview', 'production-runtime/overview.md', 'production-runtime'),
  chapter('durable-workflows', 'Durable Workflows', 'production-runtime/durable-workflows.md', 'production-runtime', 'generated'),
  chapter('observability-and-evals', 'Observability and Evals', 'production-runtime/observability-and-evals.md', 'production-runtime', 'generated'),
  chapter('production-evaluation-feedback-loops', 'Production Evaluation Feedback Loops', 'production-runtime/production-evaluation-feedback-loops.md', 'production-runtime'),
  chapter('cost-controls-runtime-budgets', 'Cost Controls and Runtime Budgets', 'production-runtime/cost-controls-runtime-budgets.md', 'production-runtime'),
  chapter('policy-enforcement', 'Policy Enforcement', 'production-runtime/policy-enforcement.md', 'production-runtime', 'generated'),
  chapter('event-triggered-agents', 'Event-Triggered Agents', 'production-runtime/event-triggered-agents.md', 'production-runtime', 'generated'),
  chapter('mastra-runtime', 'Mastra Runtime', 'production-runtime/mastra-runtime.md', 'production-runtime', 'generated'),

  chapter('hands-on-labs', 'Lab Guide', 'hands-on-labs/index.md', 'hands-on-labs'),
  chapter('lab-01-tool-using-agent', '01 - Tool-Using Agent', 'hands-on-labs/lab-01-tool-using-agent.md', 'hands-on-labs'),
  chapter('lab-02-agent-loop-and-planning', '02 - Agent Loop and Planning', 'hands-on-labs/lab-02-agent-loop-and-planning.md', 'hands-on-labs'),
  chapter('lab-03-agentic-rag', '03 - Agentic RAG', 'hands-on-labs/lab-03-agentic-rag.md', 'hands-on-labs'),
  chapter('lab-04-a2a-communication', '04 - A2A Communication', 'hands-on-labs/lab-04-a2a-communication.md', 'hands-on-labs'),
  chapter('lab-05-multi-agent-supervisor', '05 - Multi-Agent Supervisor', 'hands-on-labs/lab-05-multi-agent-supervisor.md', 'hands-on-labs'),
  chapter('lab-06-observability-and-evals', '06 - Observability and Evals', 'hands-on-labs/lab-06-observability-and-evals.md', 'hands-on-labs'),
  chapter('vertical-slice-examples', 'Vertical Slice Examples', 'hands-on-labs/vertical-slice-examples.md', 'hands-on-labs'),

  chapter('historical-patterns', 'Historical Patterns', 'deprecated/historical-patterns.md', 'deprecated'),
  chapter('publishing-and-releases', 'Publishing and Releases', 'publishing/publishing-and-releases.md', 'publishing')
];
```

- [ ] **Step 3: Add curated and consumer helpers**

Append:

```js
export const startHereChapterIds = [
  'introduction',
  'how-to-read',
  'what-is-an-agent',
  'architecture-before-autonomy',
  'choosing-the-right-pattern',
  'pattern-evaluation-checklist',
  'pattern-classification-mind-map',
  'from-patterns-to-systems',
  'pattern-composition-playbook'
];

function siteLink(chapterPath) {
  if (chapterPath === 'hands-on-labs/index.md') return '/hands-on-labs/';
  return `/${chapterPath.replace(/\.md$/, '')}`;
}

function sidebarItem(chapter) {
  return { text: chapter.title, link: siteLink(chapter.path), path: chapter.path };
}

export const sidebarGroups = [
  {
    id: 'start-here',
    text: 'Start Here',
    items: startHereChapterIds.map(id =>
      sidebarItem(bookChapters.find(chapter => chapter.id === id))
    )
  },
  ...bookSections.map(section => ({
    id: section.id,
    text: section.title,
    items: bookChapters
      .filter(chapter => chapter.sectionId === section.id && chapter.sidebar)
      .map(sidebarItem)
  }))
].filter(group => group.items.length > 0);

export const vitepressSidebar = sidebarGroups.map(group => ({
  text: group.text,
  items: group.items.map(({ text, link }) => ({ text, link }))
}));

export const pdfChapters = bookChapters.filter(chapter => chapter.pdf);
```

- [ ] **Step 4: Run the manifest test and verify GREEN**

Run:

```sh
npm run book:manifest:test
```

Expected:

```text
Book manifest OK: 79 chapters
```

- [ ] **Step 5: Commit the manifest**

```sh
git add book/scripts/book-manifest.mjs
git commit -m "feat(book): add canonical chapter manifest"
```

### Task 3: Migrate The VitePress Sidebar

**Files:**
- Modify: `book/docs/.vitepress/config.ts`
- Test: `book/scripts/book-manifest.spec.mjs`

- [ ] **Step 1: Import the canonical sidebar**

At the top of `book/docs/.vitepress/config.ts` add:

```ts
import { vitepressSidebar } from '../../scripts/book-manifest.mjs';
```

- [ ] **Step 2: Replace the hard-coded sidebar**

Replace the complete `sidebar: [...]` value with:

```ts
sidebar: vitepressSidebar,
```

- [ ] **Step 3: Run structural and website builds**

Run:

```sh
npm run book:manifest:test
npm run book:build
```

Expected: both commands exit with code 0.

- [ ] **Step 4: Commit the sidebar migration**

```sh
git add book/docs/.vitepress/config.ts
git commit -m "refactor(book): derive sidebar from manifest"
```

### Task 4: Migrate The PDF Chapter Order

**Files:**
- Modify: `book/scripts/generate-pdf.mjs`
- Test: `book/scripts/book-manifest.spec.mjs`

- [ ] **Step 1: Import canonical PDF chapters**

Add:

```js
import { bookSections, pdfChapters } from './book-manifest.mjs';
```

- [ ] **Step 2: Remove the hard-coded `chapters` array**

Replace it with:

```js
const sectionTitles = new Map(
  bookSections.map(section => [section.id, section.title])
);

const chapters = pdfChapters.map(chapter => [
  `${sectionTitles.get(chapter.sectionId)} / ${chapter.title}`,
  chapter.path
]);
```

- [ ] **Step 3: Verify the 12 omitted chapters enter the PDF source**

Run:

```sh
npm run book:manifest:test
npm run book:pdf
```

Expected: both commands exit with code 0 and the generated PDF contains 79 chapter sections.

- [ ] **Step 4: Inspect the generated PDF**

Run:

```sh
pdfinfo book/releases/Agentic-Systems-Patterns.pdf
pdftotext book/releases/Agentic-Systems-Patterns.pdf - | rg \
  'What Is An Agent\\?|Agent Harnesses|Tool Capability Design|Agents As Services'
```

Expected: all four titles are found.

- [ ] **Step 5: Commit the PDF migration and regenerated artifacts**

```sh
git add book/scripts/generate-pdf.mjs \
  book/releases/Agentic-Systems-Patterns.pdf
git commit -m "fix(book): restore complete PDF parity"
```

### Task 5: Enforce Validation In Publication Commands

**Files:**
- Modify: `book/package.json`
- Test: `book/scripts/book-manifest.spec.mjs`

- [ ] **Step 1: Add manifest validation before build and PDF**

Set the book scripts to:

```json
"build": "npm run manifest:test && npm run diagrams && npm run content && vitepress build docs",
"pdf": "npm run manifest:test && npm run diagrams && npm run content && node scripts/generate-pdf.mjs"
```

- [ ] **Step 2: Run full publication verification**

Run:

```sh
npm run book:manifest:test
npm test
npm run typecheck
npm run book:build
npm run book:pdf
```

Expected: all commands exit with code 0.

- [ ] **Step 3: Verify no independent chapter arrays remain**

Run:

```sh
rg -n 'const chapters = \\[' book/docs/.vitepress/config.ts book/scripts/generate-pdf.mjs
```

Expected: no matches.

- [ ] **Step 4: Review intended changes only**

Run:

```sh
git status --short
git diff --check
git diff --stat
```

Exclude `.specstory`, `.claude`, and local reference PDFs from staging.

- [ ] **Step 5: Commit validation wiring**

```sh
git add book/package.json
git commit -m "build(book): enforce manifest parity"
```

### Task 6: Final Visual And Structural Review

**Files:**
- Review: `book/docs/.vitepress/dist/`
- Review: `book/releases/Agentic-Systems-Patterns.pdf`

- [ ] **Step 1: Start the built-site preview**

Run:

```sh
npm run book:serve
```

Expected: VitePress preview starts successfully.

- [ ] **Step 2: Inspect the website**

Verify:

- “Start Here” remains first.
- Canonical sections follow the approved order.
- No chapter appears twice in its owning sections.
- All 79 chapters are reachable.

- [ ] **Step 3: Inspect the PDF**

Verify:

- the table of contents uses the same order;
- each chapter appears once;
- the 12 restored chapters render correctly;
- internal TOC links still work;
- labs remain near the end;
- publishing material is the appendix.

- [ ] **Step 4: Record completion**

Update this plan’s checkboxes and add a short verification note with:

- manifest chapter count;
- PDF chapter count;
- commands run;
- known non-failing warnings.

- [ ] **Step 5: Commit the completed plan**

```sh
git add docs/superpowers/plans/2026-06-18-canonical-book-manifest.md
git commit -m "docs: complete canonical manifest plan"
```
