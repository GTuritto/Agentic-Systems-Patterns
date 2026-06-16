# Diagram Expansion Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the remaining Mermaid architecture blocks in generated pattern chapters with diagrams.io source diagrams and committed SVG exports.

**Architecture:** Keep editable diagram sources under `book/diagrams/*.drawio` and published SVGs under `book/docs/public/diagrams/*.svg`. Update `book/scripts/generate-pattern-pages.mjs` so generated chapters can prefer a diagram asset for the Architecture section instead of reusing README Mermaid blocks.

**Tech Stack:** diagrams.net `.drawio` XML, SVG exports, VitePress Markdown, existing book generation scripts.

---

### Task 1: Add Diagram Assets

**Files:**
- Create: `book/diagrams/agent-loop.drawio`
- Create: `book/diagrams/goals-state-working-memory.drawio`
- Create: `book/diagrams/structured-output-validation.drawio`
- Create: `book/diagrams/evaluator-optimizer-loop.drawio`
- Create: `book/diagrams/a2a-agent-interoperability.drawio`
- Create: `book/diagrams/mcp-first-tool-use.drawio`
- Create: `book/diagrams/skills-packaging.drawio`
- Create: `book/diagrams/supervisor-worker.drawio`
- Create: `book/diagrams/crewai-flows-crews.drawio`
- Create: `book/diagrams/durable-workflow.drawio`
- Create: `book/diagrams/observability-evals.drawio`
- Create: `book/diagrams/mastra-runtime.drawio`
- Create matching SVG exports under `book/docs/public/diagrams/`

- [ ] **Step 1: Generate editable `.drawio` files**

Use simple, readable diagrams with large text, directional arrows, and no decorative background.

- [ ] **Step 2: Generate matching SVG exports**

Because the local `drawio` CLI is not installed, commit SVG exports so `npm run book:diagrams` can validate them during local and CI builds.

### Task 2: Prefer Diagram Assets In Generated Chapters

**Files:**
- Modify: `book/scripts/generate-pattern-pages.mjs`

- [ ] **Step 1: Add a diagram map**

Map pattern bundle names to diagram asset filenames and alt text.

- [ ] **Step 2: Use the diagram map for Architecture**

When a pattern has a mapped diagram, render:

```md
![Alt text](../public/diagrams/name.svg)
```

instead of the README Mermaid architecture block.

### Task 3: Regenerate And Verify

**Files:**
- Modify: generated pattern chapters under `book/docs/`
- Modify: `book/releases/Agentic-Systems-Patterns.pdf`
- Modify: `book/docs/public/releases/Agentic-Systems-Patterns.pdf`

- [ ] **Step 1: Regenerate content, diagrams, PDF, and site**

Run:

```sh
npm run book:content
npm run book:diagrams
npm run book:pdf
npm run book:build
```

- [ ] **Step 2: Confirm Mermaid is gone**

Run:

```sh
rg "```mermaid|sequenceDiagram|flowchart " book/docs
```

Expected result: no matches in published book Markdown.

- [ ] **Step 3: Run verification**

Run:

```sh
npm test
npm run typecheck
rg "<private local path terms>" book/docs docs/superpowers/plans README.md
```

Expected result: tests and typecheck pass; private-path scan returns no matches after replacing the placeholder with local source paths and PDF source labels that should not appear in published content.

### Task 4: Commit And Deploy

**Files:**
- Stage intended book, diagram, PDF, and plan files.
- Leave `.specstory/` local files unstaged.

- [ ] **Step 1: Commit**

Run:

```sh
git commit -m "feat(book): expand diagrams.io coverage"
```

- [ ] **Step 2: Push and verify Pages**

Push to `origin main`, watch the `Publish Book` workflow, and confirm representative live pages plus PDF return `HTTP/2 200`.
