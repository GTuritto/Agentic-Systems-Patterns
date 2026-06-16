---
title: Lab 06 - Add Observability and Evals
---

# Lab 06 - Add Observability and Evals

## Objective

Turn the examples into something you can evaluate. A production agent needs trace data, regression tasks, expected outcomes, and failure review before it needs more autonomy.

## What You Will Use

- Pattern chapters: [Observability and Evals](/production-runtime/observability-and-evals), [Evaluator-Optimizer](/control-loops/evaluator-optimizer)
- Source folder: [`observability-and-evals-pattern/`](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/observability-and-evals-pattern)
- Download: [observability-and-evals.zip](/downloads/observability-and-evals.zip)
- Existing test commands:
  - `npm run plan:test`
  - `npm run a2a:test`
  - `npm run mcp:test`
  - `npm test`

## Setup

From the repository root:

```sh
npm install
```

## Run It

Run the deterministic checks:

```sh
npm run plan:test
npm run a2a:test
npm run mcp:test
```

Then run the full suite:

```sh
npm test
```

## Inspect The Code

Use the test files as the first eval dataset:

- `planning-pattern/typescript/test/planning.spec.ts`
- `agent-to-agent-communication-pattern/test/a2a.spec.ts`
- `modern-tool-use-pattern/typescript/test/modern-tools.spec.ts`

Each test checks a contract:

- planning produces executable steps
- A2A handles success, refusal, error, and cancel
- MCP tool use discovers tools and returns useful data

## Change One Thing

Add one negative case to the A2A test by sending malformed input with a new task ID:

```ts
a.requestTask('t6', 'sum', { a: null, b: 10 } as any);
```

Run:

```sh
npm run a2a:test
```

## Expected Result

The system should report an error outcome, not a successful result. In an eval dataset, negative cases are as important as happy paths.

## Production Extension

Create a trace and eval record for every run:

```json
{
  "run_id": "run_001",
  "pattern": "a2a-agent-interoperability",
  "input": "sum task",
  "expected": "success with sum",
  "actual": "success with sum",
  "score": 1,
  "stop_reason": "completed",
  "latency_ms": 25
}
```

Then add release gates:

- no schema failures
- no missing trace IDs
- no unexpected tool calls
- no regression in golden tasks
- no unresolved safety or policy failures

Observability records what happened. Evals decide whether it is good enough to ship.

## Related Chapters

- [Agent Development Lifecycle](/agent-engineering-practice/agent-development-lifecycle)
- [Evaluation-Driven Agent Development](/agent-engineering-practice/evaluation-driven-agent-development)
- [Policy Enforcement](/production-runtime/policy-enforcement)
