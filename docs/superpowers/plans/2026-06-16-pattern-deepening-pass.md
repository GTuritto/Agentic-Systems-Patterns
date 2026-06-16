# Pattern Deepening Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand every generated active pattern chapter into a stronger field reference without hand-editing generated Markdown.

**Architecture:** Keep `book/scripts/pattern-manifest.mjs` as the pattern metadata source and update `book/scripts/generate-pattern-pages.mjs` as the rendering boundary. Generated pages should derive deeper reference sections from existing manifest data and README sections, then `book:content`, `book:pdf`, and `book:build` should refresh the published artifacts.

**Tech Stack:** Node.js ESM scripts, VitePress Markdown, Playwright PDF generation, ZIP source bundles.

---

### Task 1: Extend Generated Pattern Reference Sections

**Files:**
- Modify: `book/scripts/generate-pattern-pages.mjs`

- [ ] **Step 1: Add helper functions for reference sections**

Add deterministic helper functions that produce:

- `System Shape`
- `Core Protocol`
- `Evaluation Strategy`
- `Production Checklist`
- fallback `Related Patterns`

The helpers must use `pattern.title`, `pattern.summary`, `pattern.useWhen`, `pattern.avoidWhen`, `pattern.chapterPath`, `pattern.sourceFolder`, `pattern.bundleName`, and `pattern.commands` only. They must not require external sources.

- [ ] **Step 2: Insert sections into `renderPattern`**

Render the new sections after `Architecture` and before `Implementation Notes`, preserving any README-provided sections that already exist. Keep source code, download links, and commands in the existing order after the conceptual sections.

- [ ] **Step 3: Keep generated Markdown stable**

Use plain ASCII, no dynamic dates, no random ordering, and no environment-dependent content. The same manifest should generate the same Markdown every time.

### Task 2: Regenerate Book Content

**Files:**
- Modify: generated files under `book/docs/`
- Modify: generated ZIP bundles under `book/docs/public/downloads/`

- [ ] **Step 1: Run content generation**

Run:

```sh
npm run book:content
```

Expected result:

```text
Generated 32 expanded pattern chapters.
Generated source bundles in .../book/docs/public/downloads.
```

- [ ] **Step 2: Inspect representative chapters**

Read representative generated chapters:

```sh
sed -n '1,220p' book/docs/foundations/tool-use.md
sed -n '1,220p' book/docs/tools-skills-protocols/a2a-agent-interoperability.md
sed -n '1,220p' book/docs/production-runtime/mastra-runtime.md
```

Expected result: each includes the new deeper sections and still includes source/download links.

### Task 3: Refresh PDF and Site Artifacts

**Files:**
- Modify: `book/releases/Agentic-Systems-Patterns.pdf`
- Modify: `book/docs/public/releases/Agentic-Systems-Patterns.pdf`

- [ ] **Step 1: Regenerate PDF**

Run:

```sh
npm run book:pdf
```

Expected result: PDF written to both release locations.

- [ ] **Step 2: Build static site**

Run:

```sh
npm run book:build
```

Expected result: VitePress production build completes.

### Task 4: Verify Repository Health

**Files:**
- No new source files expected beyond the plan.

- [ ] **Step 1: Run root tests**

Run:

```sh
npm test
```

Expected result: all existing deterministic demos/tests pass.

- [ ] **Step 2: Run typecheck**

Run:

```sh
npm run typecheck
```

Expected result: TypeScript compiles without errors.

- [ ] **Step 3: Check for forbidden local PDF references**

Run:

```sh
rg "<private local path terms>" book/docs docs/superpowers/plans
```

Expected result: no matches after replacing the placeholder with the local machine paths and PDF source labels that should never appear in published book content.

### Task 5: Commit and Deploy

**Files:**
- Stage only book/source changes and the plan.
- Leave `.specstory/` changes unstaged.

- [ ] **Step 1: Review changed files**

Run:

```sh
git status --short
git diff --stat
```

Expected result: changed generated pattern chapters, generator, PDF artifacts, ZIP bundles, and the plan. `.specstory/` remains unstaged.

- [ ] **Step 2: Commit**

Run:

```sh
git add book docs/superpowers/plans/2026-06-16-pattern-deepening-pass.md
git reset .specstory/history/2026-06-16_09-40-31Z-revise-this-entire-sourcecode.md .specstory/statistics.json
git commit -m "feat(book): deepen pattern reference chapters"
```

Expected result: one commit containing the pattern deepening pass.

- [ ] **Step 3: Push and check deployment**

Run:

```sh
git push origin main
gh run list --repo GTuritto/Agentic-Systems-Patterns --workflow "Publish Book" --limit 1
```

Expected result: push succeeds and the latest `Publish Book` workflow starts.

- [ ] **Step 4: Verify live pages**

After deployment succeeds, check representative URLs:

```sh
curl -I -L https://gturitto.github.io/Agentic-Systems-Patterns/foundations/tool-use
curl -I -L https://gturitto.github.io/Agentic-Systems-Patterns/tools-skills-protocols/a2a-agent-interoperability
curl -I -L https://gturitto.github.io/Agentic-Systems-Patterns/releases/Agentic-Systems-Patterns.pdf
```

Expected result: each returns `HTTP/2 200`.
