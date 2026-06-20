# Online Reference Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the online book using the flattened `awesome-agentic-patterns` reference catalog while keeping the PDF as a secondary export artifact.

**Architecture:** Keep `book/scripts/book-manifest.mjs` as the only chapter/navigation source of truth. Add authored web-first improvements to existing chapters instead of importing the external taxonomy wholesale. Use the source map as a transparent coverage ledger and validate the online build after each batch.

**Tech Stack:** VitePress Markdown, Node.js ESM manifest validation, existing PDF export only for parity checks.

---

## File Structure

- Modify `book/docs/pattern-selection/source-map.md`: document the flattened local catalog as an intake-scanned source without local filesystem paths.
- Modify `book/docs/tools-skills-protocols/skills.md`: add CLI-first skill design as an agent/human dual-use pattern.
- Modify `book/docs/tools-skills-protocols/tool-capability-design.md`: add tool interface requirements from agent-first tooling, logging, and code-mode tool patterns.
- Modify `book/docs/agent-engineering-practice/agent-harnesses.md`: add harness guidance for logging, background execution, and curated context.
- Modify `book/docs/tools-skills-protocols/human-approval-gates.md`: add denial tracking and permission escalation guidance.
- Modify `book/docs/multi-agent-systems/choosing-multi-agent-topology.md`: add declarative topology guidance.
- Modify `book/docs/pattern-selection/circuit-breakers-fallbacks-replay.md`: add action caching/replay and rollback guidance.
- Modify `book/docs/foundations/context-budgets-and-working-sets.md`: add context compaction and curated-context guidance.
- Modify `book/docs/systems-architecture/coding-agents.md`: add background agent and CI feedback loop guidance.

## Task 1: Finalize Source Coverage Ledger

**Files:**
- Modify: `book/docs/pattern-selection/source-map.md`

- [ ] **Step 1: Confirm local source wording is online-safe**

Run:

```sh
rg -n '/Volumes/|/Users/' book/docs/pattern-selection/source-map.md
```

Expected: no output.

- [ ] **Step 2: Confirm flattened catalog intake is represented**

Run:

```sh
rg -n '167 pattern records|awesome-agentic-patterns|flattened digest' book/docs/pattern-selection/source-map.md
```

Expected: the source map names the flattened digest, the 167-pattern intake count, and the online-book usage rule.

- [ ] **Step 3: Commit the source-map update**

```sh
git add book/docs/pattern-selection/source-map.md
git commit -m "docs(book): record flattened pattern catalog intake"
```

## Task 2: Strengthen Skills And Tool Interface Chapters

**Files:**
- Modify: `book/docs/tools-skills-protocols/skills.md`
- Modify: `book/docs/tools-skills-protocols/tool-capability-design.md`

- [ ] **Step 1: Add CLI-first skill design to `skills.md`**

Add this section before the chapter's final continuation links:

```markdown
## CLI-First Skills

A useful skill should be callable by both a human and an agent. A command-line interface is often the simplest shared contract:

- one command per capability;
- predictable subcommands such as `list`, `get`, `create`, and `run`;
- structured output for agents and readable output for humans;
- non-interactive defaults with explicit `--yes` or `--force` flags;
- credentials from environment or platform stores, not prompts hidden inside the command.

This keeps the skill testable outside the agent loop. If a human cannot run the skill directly and inspect the output, the agent will be harder to debug when the skill fails.
```

- [ ] **Step 2: Add agent-first interface requirements to `tool-capability-design.md`**

Add this checklist under the tool contract discussion:

```markdown
## Agent-First Tool Interface Checklist

Design every tool call so the agent can decide, execute, and recover without guessing:

- name the capability, not the implementation detail;
- declare required inputs, optional inputs, limits, and side effects;
- return machine-readable status, result data, and recoverable error codes;
- log the request id, actor, policy decision, and affected resource;
- provide dry-run or preview mode for destructive operations;
- document fallback behavior when the tool is denied, unavailable, or rate-limited.

The interface should make the safe path the shortest path.
```

- [ ] **Step 3: Verify online build**

Run:

```sh
npm run book:manifest:test
npm run book:build
```

Expected: manifest reports 79 chapters and VitePress build exits 0.

- [ ] **Step 4: Commit**

```sh
git add book/docs/tools-skills-protocols/skills.md book/docs/tools-skills-protocols/tool-capability-design.md
git commit -m "docs(book): expand skill and tool interface guidance"
```

## Task 3: Strengthen Harness, Permissions, And Context Guidance

**Files:**
- Modify: `book/docs/agent-engineering-practice/agent-harnesses.md`
- Modify: `book/docs/tools-skills-protocols/human-approval-gates.md`
- Modify: `book/docs/foundations/context-budgets-and-working-sets.md`

- [ ] **Step 1: Add harness logging and background execution guidance**

Add this section to `agent-harnesses.md`:

```markdown
## Harness Observability For Background Agents

Background agents need a harness that can be inspected after the fact. At minimum, capture:

- the initial task and acceptance criteria;
- selected files, tools, and models;
- tool calls with inputs, outputs, policy decisions, and errors;
- checkpoints or handoff summaries after major phases;
- final verification commands and their results.

Without this record, a background agent becomes an opaque worker. With it, the agent becomes reviewable infrastructure.
```

- [ ] **Step 2: Add denial tracking to `human-approval-gates.md`**

Add this section near approval failure modes:

```markdown
## Denial Tracking

Repeated denials are signal, not noise. Track denied tool requests by tool, scope, and reason. After a small threshold, the agent should stop retrying and choose one of three paths:

1. ask for a broader approval with a clear reason;
2. switch to a lower-risk fallback;
3. stop and report the blocked requirement.

This prevents approval loops where the agent burns its budget asking for the same blocked action in slightly different forms.
```

- [ ] **Step 3: Add context compaction guidance**

Add this section to `context-budgets-and-working-sets.md`:

```markdown
## Compaction Boundaries

Context compaction should happen at stable boundaries, not in the middle of a fragile reasoning step. Good boundaries include:

- after requirements are restated;
- after discovery produces a source list;
- after a plan is accepted;
- after a commit or checkpoint;
- before handing work to another agent.

Each compaction should preserve decisions, open risks, file paths, verification evidence, and user constraints. It should remove transcript noise, not erase accountability.
```

- [ ] **Step 4: Verify online build**

Run:

```sh
npm run book:manifest:test
npm run book:build
```

Expected: manifest reports 79 chapters and VitePress build exits 0.

- [ ] **Step 5: Commit**

```sh
git add book/docs/agent-engineering-practice/agent-harnesses.md book/docs/tools-skills-protocols/human-approval-gates.md book/docs/foundations/context-budgets-and-working-sets.md
git commit -m "docs(book): expand harness permissions and context guidance"
```

## Task 4: Strengthen Multi-Agent And Reliability Guidance

**Files:**
- Modify: `book/docs/multi-agent-systems/choosing-multi-agent-topology.md`
- Modify: `book/docs/pattern-selection/circuit-breakers-fallbacks-replay.md`
- Modify: `book/docs/systems-architecture/coding-agents.md`

- [ ] **Step 1: Add declarative topology guidance**

Add this section to `choosing-multi-agent-topology.md`:

```markdown
## Declare The Topology Before You Code It

A multi-agent system should have a visible topology before it has framework glue. Write down:

- agents and their responsibilities;
- allowed communication paths;
- fan-out and fan-in points;
- gates and approval boundaries;
- shared state and private state;
- failure and cancellation behavior.

This can be a diagram, a table, or a small declarative file. The important property is reviewability: a reader should understand the agent graph without reverse-engineering callbacks and prompts.
```

- [ ] **Step 2: Add action replay guidance**

Add this section to `circuit-breakers-fallbacks-replay.md`:

```markdown
## Replayable Actions

When an agent performs expensive or risky work, make the action replayable:

- record the input, selected tool, policy decision, and result;
- attach an idempotency key to external side effects;
- cache safe read-only results when freshness rules allow it;
- preserve enough context to reproduce a failed run;
- make rollback explicit for operations that change state.

Replay turns a failure from a mystery into a test case.
```

- [ ] **Step 3: Add CI feedback loop guidance**

Add this section to `coding-agents.md`:

```markdown
## CI Feedback Loops

A coding agent should treat CI as an external evaluator, not as an afterthought. A healthy loop is:

1. make a narrow change;
2. run local targeted checks;
3. commit or checkpoint;
4. let CI run the broader suite;
5. ingest failures as concrete repair tasks.

The agent should not keep editing blindly while CI is failing. It should reduce each failure to a reproducible local command or an explicit environmental blocker.
```

- [ ] **Step 4: Verify online build**

Run:

```sh
npm run book:manifest:test
npm run book:build
```

Expected: manifest reports 79 chapters and VitePress build exits 0.

- [ ] **Step 5: Commit**

```sh
git add book/docs/multi-agent-systems/choosing-multi-agent-topology.md book/docs/pattern-selection/circuit-breakers-fallbacks-replay.md book/docs/systems-architecture/coding-agents.md
git commit -m "docs(book): expand topology reliability and coding-agent guidance"
```

## Task 5: Final Online-First Verification

**Files:**
- Test only: no planned source edits

- [ ] **Step 1: Run structural validation**

Run:

```sh
npm run book:manifest:test
```

Expected: `Book manifest OK: 79 chapters`.

- [ ] **Step 2: Run online build**

Run:

```sh
npm run book:build
```

Expected: VitePress build exits 0.

- [ ] **Step 3: Run PDF export only as parity check**

Run:

```sh
npm run book:pdf
```

Expected: PDF generation exits 0. Do not tune prose or layout around PDF unless the export is broken or unreadable.

- [ ] **Step 4: Scan for local private paths in public book docs**

Run:

```sh
rg -n '/Volumes/|/Users/' book/docs README.md
```

Expected: no output.

- [ ] **Step 5: Commit regenerated PDF only if content changed**

If `git status --short` shows `book/releases/Agentic-Systems-Patterns.pdf` changed after `book:pdf`, commit it separately:

```sh
git add book/releases/Agentic-Systems-Patterns.pdf
git commit -m "docs(book): refresh PDF export after online expansion"
```

If only package lockfiles changed, leave them unstaged.

## Self-Review

- Spec coverage: The plan prioritizes online chapter quality, records the flattened reference catalog, updates source coverage, and treats PDF as a secondary parity export.
- Placeholder scan: No `TBD`, `TODO`, or unspecified implementation steps remain.
- Type consistency: All referenced files already exist in the current canonical manifest branch.
