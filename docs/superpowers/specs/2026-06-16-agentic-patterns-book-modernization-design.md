# Agentic Patterns Book Modernization Design

## Goal

Modernize this repository into a publishable digital book and reference site for agentic system patterns, while preserving older material in a `deprecated/` archive.

## Publishing Model

The primary publishing target is GitHub Pages through a VitePress site in `book/`. VitePress is a good fit because the project is a Markdown-first reference work with code links, framework notes, local search, and a structured sidebar. The generated site can publish to `https://gturitto.github.io/Agentic-Systems-Patterns/` or a custom domain later.

The secondary target is an offline PDF stored in the repository at `book/releases/Agentic-Systems-Patterns.pdf`. The PDF is generated from the VitePress build or a dedicated print route. Keeping a PDF in the repo is acceptable for this personal book/reference because it makes the current snapshot easy to open, share, and archive. If the PDF becomes large, it can later move to GitHub Releases.

## License

The book/reference and examples use Creative Commons Attribution-ShareAlike 4.0 International (`CC-BY-SA-4.0`). The repository `LICENSE`, root README, VitePress footer, and generated PDF should all point to the canonical license URL: https://creativecommons.org/licenses/by-sa/4.0/

## Catalog Structure

The active book catalog will be reorganized into these sections:

1. Foundations
   - Single Agent
   - Agent Loop
   - Goals and Task State
   - Tool Use
   - Structured Output
   - Context Engineering

2. Control Loops
   - Planning and Execution
   - ReAct
   - Reflection
   - Evaluator-Optimizer
   - Self-Improvement
   - Self-Healing Workflows

3. Memory and Knowledge
   - Short-Term Memory
   - Long-Term Episodic Memory
   - Semantic Recall / RAG
   - Working Memory
   - Knowledge-Bound Agents

4. Tools, Skills, and Protocols
   - Skills
   - MCP-first Tool Use
   - A2A Agent Interoperability
   - Secure Agent Communication
   - Human Approval Gates

5. Multi-Agent Systems
   - Task Delegation
   - Supervisor / Worker
   - Debate and Consensus
   - Parallel Agents
   - CrewAI Crews and Flows

6. Production Runtime
   - Durable Workflows
   - Observability and Tracing
   - Evals and Regression Tests
   - Policy Enforcement
   - Event-Triggered Agents
   - Mastra Runtime Pattern

## Deprecation Policy

Older or weak pattern folders will move under `deprecated/`. The active index will retain a deprecated section that lists each archived folder and explains why it moved. Deprecation does not delete content; it removes stale or speculative material from the main learning path.

Likely deprecated or merged patterns:

- `agent-marketplace-pattern`: speculative and not a core practical pattern.
- `agent-swarm-pattern`: folded into Parallel Agents unless a concrete search/optimization implementation is added.
- `hybrid-agent-pattern`: too broad; folded into production runtime architecture.
- `meta-cognitive-agent-pattern`: folded into Reflection, Evaluator-Optimizer, and Self-Improvement.
- `recursive-agent-pattern`: folded into Planning, Task Decomposition, and Goals.
- `distributed-agent-pattern`: replaced by A2A, durable workflows, and protocol-first composition.
- Thin applied examples with only placeholder `.gitkeep` files: moved to deprecated unless promoted into real chapters.

## New Active Chapters

The refactor will add or deepen these active folders:

- `agent-loop-pattern`
- `goals-and-state-pattern`
- `skills-pattern`
- `evaluator-optimizer-pattern`
- `durable-workflow-pattern`
- `observability-and-evals-pattern`
- `mastra-runtime-pattern`
- `crewai-flows-and-crews-pattern`
- `structured-output-pattern`
- `agent-to-agent-communication-pattern` deepened as the A2A chapter instead of duplicating it
- `modern-tool-use-pattern` deepened as the MCP-first chapter

Each new chapter will include:

- When to use the pattern
- When not to use it
- Architecture sketch in Mermaid
- Core loop or data flow
- Failure modes
- Implementation notes
- Links to runnable examples when available

## Code Modernization

The first implementation pass will keep the examples pragmatic:

- TypeScript examples stay runnable through root npm scripts.
- Python examples stay runnable through explicit Python commands or npm wrappers.
- New examples favor deterministic offline fallbacks so tests do not require paid APIs.
- Mastra receives a TypeScript runtime chapter and scaffold-level example based on agents, workflows, tools, memory, evals, and observability.
- CrewAI receives a Python chapter centered on Flows owning state/execution and Crews doing delegated agent work.
- A2A and MCP examples are promoted from demos into protocol chapters.

## GitHub Pages Plan

Create a VitePress app under `book/`:

- `book/docs/` contains the publishable manuscript pages.
- `book/docs/.vitepress/config.ts` defines the book navigation, title, repository URL, base URL, license footer, and GitHub Pages deployment settings.
- `.github/workflows/publish-book.yml` builds and deploys the site to GitHub Pages.

The root README will link to:

- the local book source in `book/docs/`
- the published GitHub Pages URL placeholder
- the PDF at `book/releases/Agentic-Systems-Patterns.pdf`

## PDF Plan

The repo will include:

- `book/releases/.gitkeep` initially
- `book/releases/README.md` explaining how generated PDFs are stored
- an npm script such as `book:pdf` once the VitePress print route or PDF generator is added

The first refactor can add the release folder and documentation before generating the final PDF. A later pass can add Playwright, PrinceXML, Pandoc, or another PDF generator. For this repo, Playwright-based PDF generation is likely the most portable because it can print the local static site without requiring a paid formatter.

## Verification

The refactor is complete when:

- `npm test` passes.
- `npm run typecheck` passes.
- `npm audit --omit=dev` reports no vulnerabilities.
- `npm run book:build` builds the static site into `book/docs/.vitepress/dist`.
- `book/docs/` has a coherent sidebar and no stale links to active folders that moved to `deprecated/`.
- The active index lists deprecated patterns with reasons.
- The root README, `LICENSE`, package metadata, VitePress footer, and PDF release notes identify `CC-BY-SA-4.0`.

## References

- Mastra docs: https://mastra.ai/docs
- CrewAI docs: https://docs.crewai.com/en/introduction
- Google ADK A2A docs: https://google.github.io/adk-docs/a2a/
- Anthropic Agent Skills docs: https://console.anthropic.com/docs/en/agents-and-tools/agent-skills/overview
- VitePress docs: https://vitepress.dev
- GitHub Pages docs: https://docs.github.com/pages
