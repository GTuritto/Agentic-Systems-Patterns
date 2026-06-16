# Agentic Systems Patterns

This repository is a working manuscript and example library for agentic system patterns. It focuses on autonomous agents, multi-agent systems, tool use, memory, planning, routing, and interoperability.

Each pattern lives in its own kebab-case folder and usually includes:

- A short conceptual description in `README.md`
- TypeScript and/or Python examples
- Root-level npm scripts for runnable TypeScript demos
- Optional `.env` support for `MISTRAL_API_KEY`; many demos have deterministic fallbacks

## Patterns Included

See [`Agentic_Patterns.md`](./Agentic_Patterns.md) for the full list and links to each pattern's documentation and code.

**Examples of patterns covered:**

- Single Agent
- Agent Loop
- Goals and State
- Tool-Using Agent
- Structured Output
- Chain-of-Thought (CoT)
- ReAct (Reason + Act)
- Evaluator-Optimizer
- Multi-Agent Collaboration
- Task Delegation
- Agent Chain / Pipeline
- Agent Orchestration
- Reflection and Self-Improvement
- Memory-Augmented Agent
- Skills
- MCP-first Tool Use
- A2A Agent Interoperability
- Secure Agent Communication
- Environment-Interactive Agent
- Goal-Conditioned Agent
- Hierarchical Agent
- Planning Agent
- Durable Workflow
- Observability and Evals
- Mastra Runtime
- CrewAI Flows and Crews

## Project Structure

- Pattern folders use kebab-case names such as `single-agent-pattern/` and `tool-using-agent-pattern/`.
- Each pattern folder contains its own documentation and examples.
- Deprecated or historical patterns are preserved under `deprecated/`.
- The publishable book source lives under `book/docs/`.
- The root `package.json` exposes runnable TypeScript demos and tests.
- `.env.example` documents optional environment variables.

## Getting Started

1. **Clone the repository:**

   ```sh
   git clone <your-repo-url>
   cd <repo-folder>
   ```
2. **Install dependencies:**

   ```sh
   npm install
   ```
3. **Set up environment variables (optional):**
   - Copy `.env.example` to `.env` and set `MISTRAL_API_KEY` if you want live planning. Most demos run without it.

4. **Run the test suite:**

   ```sh
   npm test
   npm run typecheck
   ```

5. **Quick runnable demos (TypeScript):**

   ```sh
   # A2A protocol demo (success/refusal/error/cancel)
   npm run a2a:test

   # Planning (Planner + Executor) with deterministic fallback
   npm run plan:test
   npm run plan:run -- "Compute average of [1,2,3,4]"

   # CodeAct: provide a preplanned snippet to avoid network
   npm run codeact:ts -- --plan-code='result = (1+2+3+4)/4'

   # Modern Tool Use (MCP-first): start both servers then run agent
   npm run mcp:search &
   npm run mcp:cloud &
   npm run mcp:agent

   # LLM Router Pattern (LLM classifier + embedding router + policies)
   npm run router:test
   npm run router:run -- "I need a refund for a wrong charge on my invoice."
   ```

6. **Python demos:**

   ```sh
   # Planning (Python mirror)
   npm run plan:py
   ```

## References

- [Agentic_Patterns.md](./Agentic_Patterns.md): Full pattern list and links
- MCP (Model Context Protocol)
- A2A (Agent-to-Agent Communication)
- [Mistral](https://mistral.ai/)

## Digital Publishing

- Source manuscript: `book/docs/`
- Static site generator: VitePress
- Local preview: `npm run book:start`
- Static build: `npm run book:build`
- GitHub Pages workflow: `.github/workflows/publish-book.yml`
- Public URL: `https://gturitto.github.io/Agentic-Systems-Patterns/`
- Offline PDF path: `book/releases/Agentic-Systems-Patterns.pdf`
- License: `CC-BY-SA-4.0`

## License

This book/reference and its examples are licensed under the [Creative Commons Attribution-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/) (`CC-BY-SA-4.0`).
