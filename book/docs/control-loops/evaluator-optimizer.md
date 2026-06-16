---
title: Evaluator-Optimizer
---

# Evaluator-Optimizer

Evaluator-Optimizer pairs a generator with an evaluator. The generator proposes; the evaluator scores; the optimizer revises or stops.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/evaluator-optimizer-pattern)
> - [Download code bundle](/downloads/evaluator-optimizer.zip)

## Intent

The Evaluator-Optimizer Pattern pairs a generator with an evaluator. The generator proposes work; the evaluator scores it against explicit criteria; the optimizer revises until the output passes or the budget ends.

## Use When

- Quality can be judged more reliably than it can be produced in one pass.
- You have explicit rubrics, tests, policies, or examples.
- Iterative improvement is worth the extra cost and latency.

## Avoid When

- The evaluator is just another vague opinion prompt.
- The task must respond with very low latency.
- You cannot define pass/fail or ranking criteria.

## Architecture

```mermaid
flowchart LR
  I[Input] --> G[Generator]
  G --> O[Candidate Output]
  O --> E[Evaluator]
  E -->|pass| R[Return]
  E -->|revise with feedback| G
  E -->|budget exhausted| F[Return Best or Fail]
```

## Implementation Notes

- Separate generation prompts from evaluation prompts.
- Use deterministic tests when possible, then model-based critique for subjective gaps.
- Persist evaluator feedback so regressions can be analyzed.
- Define max revision count and a fallback behavior before running the loop.

## Failure Modes

- Evaluator drift: the evaluator rewards style over correctness.
- Generator overfits to the evaluator and hides flaws.
- Revision loops that make output longer but not better.
- No retained evidence for why a candidate passed.

## Code Walkthrough

Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.

## Source Code

This pattern currently has no dedicated code excerpt. Use the source and download links below for the full pattern folder.

## Download

- [Download source bundle](/downloads/evaluator-optimizer.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/evaluator-optimizer-pattern)

The download bundle contains the current `evaluator-optimizer-pattern/` folder from this repository.

## Related Patterns

- [Reflection and Self-Improvement](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/reflection-and-self-improvement-pattern/README.md)
- [Observability and Evals](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/observability-and-evals-pattern/README.md)
- [Agent Loop](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/agent-loop-pattern/README.md)
