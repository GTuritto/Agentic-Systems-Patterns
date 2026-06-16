---
title: Agent Loop
---

# Agent Loop

The agent loop turns a model call into an agent: observe, decide, act, evaluate, and stop.

```mermaid
flowchart LR
  G[Goal] --> O[Observe]
  O --> D[Decide]
  D --> A[Act]
  A --> E[Evaluate]
  E -->|continue| O
  E -->|done| R[Result]
```

The core engineering work is bounding the loop. Define max iterations, cost, timeout, cancellation, and success criteria before the loop starts.

Source: [`agent-loop-pattern`](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/agent-loop-pattern)
