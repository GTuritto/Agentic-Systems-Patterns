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

![Evaluator-optimizer loop architecture](../public/diagrams/evaluator-optimizer-loop.svg)

## System Shape

- **Pattern boundary:** a controller repeatedly chooses the next step, executes it, observes the result, and decides whether to continue.
- **State owner:** the loop controller owns progress, budgets, stop conditions, and recovery state.
- **Primary artifact:** `evaluator-optimizer-pattern/` contains the runnable reference implementation and examples.
- **Operational promise:** Evaluator-Optimizer pairs a generator with an evaluator. The generator proposes; the evaluator scores; the optimizer revises or stops.

## Core Protocol

1. Initialize goal state, constraints, budgets, and stop conditions.
2. Choose the next action from the current state instead of assuming the whole path upfront.
3. Execute the action through a validated tool, worker, or local function.
4. Observe the result and update state with evidence, errors, and remaining work.
5. Stop, retry, re-plan, or escalate according to explicit policy.

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

## Evaluation Strategy

- Test success cases, partial failure, repeated failure, budget exhaustion, and bad intermediate observations.
- Assert that the loop stops for the right reason and does not hide failed steps.
- Measure completion rate, number of iterations, recovery quality, cost, and latency.
- Include cases that prove each "Use When" condition is true for this pattern.
- Include negative cases from "Avoid When" so the system chooses a simpler or safer pattern when appropriate.

## Production Checklist

- Set hard iteration, cost, and time limits.
- Persist state after meaningful steps if the run can be interrupted.
- Make retries idempotent or add compensation.
- Expose trace events for each decision, action, observation, and stop reason.
- Define human escalation for ambiguous, high-risk, or policy-blocked work.
- Keep the source bundle, generated chapter, tests, and deployment artifact in the same release.

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
