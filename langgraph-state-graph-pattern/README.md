# LangGraph State Graph Pattern

This folder supports Lab 12. It is a deterministic LangGraph-style reference implementation that focuses on the architectural contract: typed graph state, nodes, edges, checkpoints, interrupt/resume, and trajectory evals.

Run the demo:

```bash
npm run langgraph-state
```

Run the tests:

```bash
npm run langgraph-state:test
```

The code intentionally avoids live model calls so the lab can run without API keys.
