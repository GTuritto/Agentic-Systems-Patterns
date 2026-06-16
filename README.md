# Agentic Systems Patterns

A practical book and example library for designing modern agentic systems.

The project covers patterns for goals, loops, tools, skills, memory, structured output, protocols, multi-agent coordination, durable execution, observability, evals, and production runtimes. It is maintained as both a source-code reference and a publishable book.

- Read the book: https://gturitto.github.io/Agentic-Systems-Patterns/
- Download the PDF: https://gturitto.github.io/Agentic-Systems-Patterns/releases/Agentic-Systems-Patterns.pdf
- Start the labs: https://gturitto.github.io/Agentic-Systems-Patterns/hands-on-labs/
- Browse the catalog: [Agentic_Patterns.md](./Agentic_Patterns.md)

## What Is Here

This repository has three related parts:

- `book/docs/`: VitePress source for the published book.
- `book/docs/hands-on-labs/`: guided labs that use the runnable examples as a learning path.
- Pattern folders such as `agent-loop-pattern/`, `skills-pattern/`, and `modern-tool-use-pattern/`: source material and runnable examples.
- `deprecated/`: historical patterns kept for reference, but no longer recommended as primary architecture patterns.
- `book/docs/public/downloads/`: generated ZIP bundles for pattern source downloads during the publishing pipeline.

Most runnable examples are TypeScript. Some patterns also include Python mirrors.

## Pattern Catalog

The active catalog is organized around current agent engineering practice:

- Foundations: single agents, loops, goals and state, tool use, structured output, and context engineering.
- Control loops: planning, ReAct, reflection, evaluator-optimizer loops, self-improvement, and self-healing workflows.
- Memory and knowledge: working memory, episodic memory, semantic recall, RAG, and knowledge-bound agents.
- Tools, skills, and protocols: Skills, MCP-first tool use, A2A interoperability, secure communication, and human approval gates.
- Multi-agent systems: delegation, supervisor-worker designs, debate and consensus, parallel agents, and CrewAI flows.
- Systems architecture: system composition, Agentic RAG, open personal agents, coding agents, ADRs, and reference architecture.
- Production runtime: durable workflows, observability, evals, policy enforcement, event triggers, and Mastra runtime patterns.
- Hands-on labs: guided exercises for tool use, planning loops, Agentic RAG, A2A communication, multi-agent supervision, and evals.

Start with [Agentic_Patterns.md](./Agentic_Patterns.md) for the complete index.

## Quick Start

Requirements:

- Node.js 22 for the book publishing pipeline.
- Node.js 20 or newer for the TypeScript examples.
- Python 3 for the Python demos.

Install root dependencies:

```sh
npm install
```

Run the checks:

```sh
npm test
npm run typecheck
```

Optional live-provider support:

```sh
cp .env.example .env
```

Set `MISTRAL_API_KEY` in `.env` if you want demos that call a live model. Most examples include deterministic fallbacks and can run without a provider key.

## Example Commands

```sh
# A2A protocol demo
npm run a2a:test

# Planning with deterministic fallback
npm run plan:test
npm run plan:run -- "Compute average of [1,2,3,4]"

# CodeAct with an explicit local plan
npm run codeact:ts -- --plan-code='result = (1+2+3+4)/4'

# Modern Tool Use with MCP servers
npm run mcp:search &
npm run mcp:cloud &
npm run mcp:agent

# LLM router
npm run router:test
npm run router:run -- "I need a refund for a wrong charge on my invoice."

# Python planning mirror
npm run plan:py
```

## Book Publishing

The book is built with VitePress and deployed to GitHub Pages from GitHub Actions.

```sh
# Install book dependencies
npm run book:install

# Start local preview
npm run book:start

# Regenerate expanded book pages and source bundles
npm run book:content

# Validate or export draw.io diagrams
npm run book:diagrams

# Build the static site
npm run book:build

# Generate the offline PDF
npm run book:pdf
```

Deployment runs from [.github/workflows/publish-book.yml](./.github/workflows/publish-book.yml) on each push to `main`. The workflow builds the PDF, builds the VitePress site, uploads the Pages artifact, and deploys the site.

The checked-in PDF lives at [book/releases/Agentic-Systems-Patterns.pdf](./book/releases/Agentic-Systems-Patterns.pdf). The deployed PDF is published under `/releases/Agentic-Systems-Patterns.pdf` on GitHub Pages.

Pattern chapters and source download bundles are generated from [book/scripts/pattern-manifest.mjs](./book/scripts/pattern-manifest.mjs). Each active pattern page embeds representative code excerpts and links to a downloadable bundle under `/downloads/<pattern>.zip`. Architecture chapters under `book/docs/systems-architecture/` are hand-written because they describe cross-pattern composition rather than one source folder.

Architecture diagrams are maintained as editable diagrams.net files under `book/diagrams/` and rendered as SVG assets under `book/docs/public/diagrams/`. If the `drawio` CLI is installed, `npm run book:diagrams` refreshes the SVG exports; otherwise it validates that the committed SVG exports exist for the site and PDF builds.

## Repository Map

```text
.
├── Agentic_Patterns.md              # Full active/deprecated pattern index
├── book/
│   ├── docs/                        # VitePress book source
│   ├── releases/                    # Checked-in offline PDF artifact
│   └── scripts/                     # Book page, download, and PDF generation
├── deprecated/                      # Archived patterns kept for history
├── *-pattern/                       # Pattern chapters and examples
├── package.json                     # Root demo/test scripts
└── .github/workflows/publish-book.yml
```

## Contributing Notes

- Keep active patterns in kebab-case folders.
- Add deprecated or superseded material under `deprecated/` and mark it clearly in [Agentic_Patterns.md](./Agentic_Patterns.md).
- Prefer deterministic example paths for tests and demos.
- When adding book chapters, update `book/docs/.vitepress/config.ts` so the sidebar and PDF order stay aligned.
- When adding or changing active pattern chapters, update `book/scripts/pattern-manifest.mjs` so generated pages, code excerpts, and download bundles stay aligned.
- When adding cross-pattern architecture chapters, place them under `book/docs/systems-architecture/` and update `book/scripts/generate-pdf.mjs`.
- When adding architecture diagrams, edit `book/diagrams/*.drawio`, export or commit the matching SVG under `book/docs/public/diagrams/`, and run `npm run book:diagrams`.
- Run `npm test`, `npm run typecheck`, `npm run book:pdf`, and `npm run book:build` before publishing larger changes.

## License

This book/reference and its examples are licensed under the [Creative Commons Attribution-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/) (`CC-BY-SA-4.0`).

Last reviewed: 2026-06-16.
