---
title: Lab 09 - Build a Minimal Agent Loop
---

# Lab 09 - Build a Minimal Agent Loop

## Objective

Build the smallest useful runtime primitive: a loop that receives a goal, asks for a typed decision, updates state, and stops for an explicit reason.

## What You Will Use

- Language: TypeScript or Python
- Framework/runtime: from-scratch educational runtime
- Framework-agnostic lesson: an agent is a controlled loop with state, decisions, observations, budgets, and stop reasons.
- Pattern chapters: [What Is An Agent?](/foundations/what-is-an-agent), [Agent Loop](/foundations/agent-loop), [Goals and State](/foundations/goals-and-state)
- Theory chapter: [Building a Minimal Agent Runtime](/agent-engineering-practice/building-a-minimal-agent-runtime)

## Setup

Use the maintained TypeScript reference or create your own small file outside production code, such as `scratch/minimal-agent-loop.ts` or `scratch/minimal_agent_loop.py`.

Reference files:

- `minimal-agent-runtime/typescript/src/runtime.ts`
- `minimal-agent-runtime/typescript/src/run_demo.ts`
- `minimal-agent-runtime/typescript/test/runtime.spec.ts`

Run the reference test first:

```sh
npm run mini-runtime:test
```

This lab does not require a model key. Use a deterministic `decide` function so you can test the runtime without model variability.

## Runtime Contract

Use this shape if you implement in TypeScript:

```ts
type StopReason =
  | "success"
  | "blocked"
  | "budget_exhausted"
  | "invalid_decision"
  | "tool_failure";

type Decision =
  | { kind: "answer"; text: string }
  | { kind: "tool"; name: string; input: unknown }
  | { kind: "ask_human"; question: string }
  | { kind: "stop"; reason: StopReason };

type Observation = {
  kind: "decision" | "tool" | "system";
  summary: string;
};

type AgentState = {
  goal: string;
  steps: number;
  maxSteps: number;
  observations: Observation[];
  stopReason?: StopReason;
};
```

The equivalent Python implementation can use dataclasses, typed dictionaries, or plain dictionaries. Keep the fields the same.

## Guided Change

Implement `runAgent(state, decide)`.

The loop should:

1. call `decide(state)`;
2. record an observation for the decision;
3. return with `success` when the decision is an answer;
4. return with the supplied reason when the decision is `stop`;
5. continue for tool decisions without executing a real tool yet;
6. stop with `budget_exhausted` when `steps` reaches `maxSteps`.

## Baseline Run

Use the reference demo:

```sh
npm run mini-runtime
```

Then inspect the immediate-answer case in `minimal-agent-runtime/typescript/test/runtime.spec.ts`, or use a decision function that answers immediately:

```ts
const answerImmediately = async (): Promise<Decision> => ({
  kind: "answer",
  text: "done",
});
```

Expected result:

```text
stopReason: success
steps: 1
observations: at least one decision observation
```

## Failure Case

Use a decision function that always asks for a tool:

```ts
const neverStops = async (): Promise<Decision> => ({
  kind: "tool",
  name: "search",
  input: { query: "keep going" },
});
```

Expected result:

```text
stopReason: budget_exhausted
steps: maxSteps
```

This is the first safety property of an agent runtime: the model cannot create an infinite loop just by continuing to ask.

## Verify

Check these assertions manually or with the reference test:

- immediate answer stops with `success`;
- repeated tool proposals stop with `budget_exhausted`;
- every loop step records an observation;
- the final state contains a stop reason.

The reference test covers these cases with deterministic decisions, so the result is stable across machines.

## Production Extension

Before this loop can run real work, add:

- structured validation for model-produced decisions;
- tool execution through a registry;
- policy checks before side effects;
- trace events for every decision and stop;
- cancellation and timeout controls;
- durable state if the run can pause or resume.

## Cross-Framework Mapping

- In LangGraph, the loop is expressed through graph traversal, state updates, and edges.
- In Mastra AI, the loop is packaged inside agent and workflow runtime behavior.
- In AutoGen-style systems, the loop appears as message turns between manager, worker, and tool executors.
- In CrewAI, the loop is shaped by flow execution and task progression.

## Related Chapters

- [Building a Minimal Agent Runtime](/agent-engineering-practice/building-a-minimal-agent-runtime)
- [Agent Loop](/foundations/agent-loop)
- [Goals and State](/foundations/goals-and-state)
- [Durable Workflows](/production-runtime/durable-workflows)
