---
title: Evaluator-Optimizer
---

# Evaluator-Optimizer

Evaluator-Optimizer pairs a generator with an evaluator. The generator proposes; the evaluator scores; the optimizer revises or stops.

```mermaid
flowchart LR
  I[Input] --> G[Generate]
  G --> E[Evaluate]
  E -->|pass| R[Return]
  E -->|revise| G
```

Source: [`evaluator-optimizer-pattern`](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/evaluator-optimizer-pattern)
