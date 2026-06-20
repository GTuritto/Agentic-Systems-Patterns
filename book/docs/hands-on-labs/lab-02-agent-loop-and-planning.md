---
title: Lab 02 - Build an Agent Loop with Planning
---

# Lab 02 - Build an Agent Loop with Planning

## Objective

Separate planning from execution. The planner decides the steps; the executor runs bounded operations and records results. This gives you the control structure behind many agent loops without making every step autonomous.

## What You Will Use

- Language: TypeScript, with a Python mirror
- Framework/runtime: framework-neutral planner and executor
- Framework-agnostic lesson: planning and execution are separate responsibilities even when a framework packages them together.
- Pattern chapters: [Agent Loop](/foundations/agent-loop), [Planning and Execution](/control-loops/planning-and-execution)
- Source folder: [`planning-pattern/`](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/planning-pattern)
- Download: [planning-and-execution.zip](/downloads/planning-and-execution.zip)
- Main files:
  - `planning-pattern/typescript/src/planner.ts`
  - `planning-pattern/typescript/src/executor.ts`
  - `planning-pattern/typescript/src/run.ts`

## Setup

From the repository root:

```sh
npm install
```

## Run It

Run the deterministic test:

```sh
npm run plan:test
```

Run the CLI path:

```sh
npm run plan:run -- "Compute average of [1,2,3,4]"
```

Run the Python mirror:

```sh
npm run plan:py
```

## Inspect The Code

Open `planning-pattern/typescript/src/planner.ts` and inspect how a task becomes a list of steps. Then open `planning-pattern/typescript/src/executor.ts` and inspect how execution turns those steps into named results.

Look for these boundaries:

- the plan object
- step IDs
- deterministic executor functions
- result map
- failure surface

## Change One Thing

Change the task text:

```sh
npm run plan:run -- "Compute average of [10,20,30]"
```

Then inspect whether the deterministic fallback still produces the expected plan shape.

## Expected Result

The test should print:

```text
Planning test OK
```

The CLI should print a plan and computed result. If you extend the planner, keep the executor deterministic and testable.

## Production Extension

Add loop controls before using this pattern in production:

- maximum steps
- maximum retries
- stop reason
- checkpoint after each step
- structured error result
- human review for high-risk steps

Planning is useful only when execution is bounded and inspectable.

## Cross-Framework Mapping

- In LangGraph, planning and execution can be separate nodes connected through shared graph state.
- In Mastra AI, the same split can appear as a workflow that coordinates agent and tool steps.
- In AutoGen-style systems, a manager agent may propose a plan while executor functions perform bounded work.
- In CrewAI, a flow can own the sequence while crews or agents handle delegated tasks.

## Related Chapters

- [Goals and State](/foundations/goals-and-state)
- [Self-Healing Workflows](/control-loops/self-healing-workflows)
- [Durable Workflows](/production-runtime/durable-workflows)
