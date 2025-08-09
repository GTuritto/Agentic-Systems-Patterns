# Agentic Systems Patterns

This repository provides a comprehensive collection of agentic system patterns, focusing on multi-agent and autonomous agent architectures. Each pattern includes:
- A detailed description and diagram in its own `README.md`
- Executable TypeScript (Autogen) and Python (LangGraph) code examples
- Easy-to-run npm scripts for each TypeScript example
- Unified `.env` file for API keys and configuration

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
  - `autogen_typescript_example/` (TypeScript code)
  - `langgraph_python_example/` (Python code)
- Root `package.json` with scripts for each TypeScript demo
- `.env` file for API keys (e.g., `MISTRAL_API_KEY`)

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
3. **Set up environment variables:**
   - Copy `.env` and add your API keys (e.g., Mistral)

4. **Run a TypeScript example:**
   ```sh
   npm run single-agent
   # or any other script from package.json
   ```

5. **Explore Python examples:**
   - See each pattern's `langgraph_python_example/` folder for LangGraph code.

## References
- [Agentic_Patterns.md](./Agentic_Patterns.md): Full pattern list and links
- [Autogen](https://github.com/microsoft/autogen)
- [LangGraph](https://github.com/langchain-ai/langgraph)
- [Mistral](https://mistral.ai/)

---

**Contributions welcome!**
