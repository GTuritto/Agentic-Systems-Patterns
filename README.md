# Agentic Systems Patterns

This repository provides a comprehensive collection of agentic system patterns, focusing on multi-agent and autonomous agent architectures. Each pattern includes:

- A detailed description and diagram in its own `README.md`
- Executable TypeScript and/or Python code examples
- Easy-to-run npm scripts for the TypeScript demos
- Unified `.env` file (only `MISTRAL_API_KEY` if you want live planning; most demos have offline fallbacks)

## Patterns Included

See [`Agentic_Patterns.md`](./Agentic_Patterns.md) for the full list and links to each pattern's documentation and code.

**Examples of patterns covered:**

- Single Agent
- Tool-Using Agent
- Chain-of-Thought (CoT)
- ReAct (Reason + Act)
- Multi-Agent Collaboration
- Task Delegation
- Agent Swarm
- Agent Chain / Pipeline
- Agent Orchestration
- Agent Marketplace
- Recursive Agent
- Reflection and Self-Improvement
- Memory-Augmented Agent
- Secure Agent Communication
- Distributed Agent
- Environment-Interactive Agent
- Goal-Conditioned Agent
- Hierarchical Agent
- Hybrid Agent
- Meta-Cognitive Agent
- Planning Agent

## Project Structure

- Each pattern has its own folder:
   - `README.md` (description, diagram)
   - TypeScript and/or Python example code (varies by pattern)
- Root `package.json` with scripts for runnable demos
- `.env.example` shows `MISTRAL_API_KEY` (copy to `.env` if needed)

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

4. **Quick runnable demos (TypeScript):**

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

5. **Python demos:**

   ```sh
   # Planning (Python mirror)
   npm run plan:py
   ```

## References

- [Agentic_Patterns.md](./Agentic_Patterns.md): Full pattern list and links
- MCP (Model Context Protocol)
- A2A (Agent-to-Agent Communication)
- [Mistral](https://mistral.ai/)

---

**Contributions welcome!**
