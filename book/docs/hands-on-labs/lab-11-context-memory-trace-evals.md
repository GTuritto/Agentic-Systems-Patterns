---
title: Lab 11 - Add Context, Memory, Trace, and Evals
---

# Lab 11 - Add Context, Memory, Trace, and Evals

## Objective

Make the mini-runtime inspectable. Add context packets, scoped memory reads, trace events, and a trajectory eval that can fail even when the final answer looks plausible.

## What You Will Use

- Language: TypeScript or Python
- Framework/runtime: from-scratch educational runtime
- Framework-agnostic lesson: runtime behavior must be observable and testable, not only runnable.
- Pattern chapters: [Context Engineering](/foundations/context-engineering), [Working Memory](/memory-knowledge/working-memory), [Observability and Evals](/production-runtime/observability-and-evals)
- Previous labs: [Lab 09](./lab-09-minimal-agent-loop.md), [Lab 10](./lab-10-tool-registry-and-policy-gate.md)

## Setup

Start from the Lab 10 runtime. Keep tools deterministic and small.

Add a memory fixture:

```ts
const memory = [
  { id: "mem_1", scope: "project", text: "Write tools require approval." },
  { id: "mem_2", scope: "task", text: "The current task may use read tools only." },
];
```

## Runtime Contract

```ts
type ContextPacket = {
  runId: string;
  goal: string;
  stateSummary: string;
  observations: Array<{ summary: string }>;
  toolsDisclosed: string[];
  memoryRefs: string[];
  omittedRefs: Array<{ ref: string; reason: string }>;
};

type TraceEvent = {
  runId: string;
  step: number;
  type:
    | "context_built"
    | "decision"
    | "policy_decision"
    | "tool_result"
    | "stop";
  data: unknown;
};

type EvalCase = {
  caseId: string;
  input: string;
  expected: {
    toolsCalled?: string[];
    toolsNotCalled?: string[];
    stopReason: string;
  };
};
```

## Guided Change

Add `buildContext(state)` so every model decision receives a deliberate packet:

- active goal;
- compact state summary;
- recent observations;
- disclosed tools;
- selected memory refs;
- omitted memory refs with reasons.

Add `recordTrace(event)` and emit trace events for:

1. context built;
2. decision proposed;
3. policy decision;
4. tool result;
5. stop reason.

## Baseline Run

Run a case where the agent calls a read tool and then answers.

Expected trace:

```text
context_built
decision
policy_decision
tool_result
context_built
decision
stop
```

The exact order can vary if your loop stops immediately after a tool, but the trace must show enough to reconstruct the path.

## Failure Case

Create an eval where the final answer says "done", but the runtime called a forbidden write tool.

Expected result:

```text
final answer: plausible
trajectory eval: fail
reason: forbidden tool was called
```

This is why final-answer-only evals are too weak for agentic systems.

## Verify

Check these assertions:

- every run has a trace;
- every stop has a stop reason;
- context records included and omitted memory;
- evals can check tools called and tools not called;
- a forbidden trajectory fails even when final text looks acceptable.

## Production Extension

Before production, add:

- redaction before trace storage;
- retention and deletion policy for memory and traces;
- eval fixtures versioned with prompts, tools, models, and policies;
- incident-to-eval workflow;
- dashboards for stop reasons, tool errors, policy denials, cost, and latency;
- release gates that block risky changes when trajectory evals fail.

## Cross-Framework Mapping

- In LangGraph, context and memory are state inputs, while traces can follow node transitions and checkpoints.
- In Mastra AI, memory, evals, and observability are runtime-level capabilities that should still expose product-owned policy.
- In AutoGen-style systems, message history must be converted into structured trace and eval data.
- In CrewAI, flow and task records need enough structure to evaluate role behavior and final synthesis.

## Related Chapters

- [Context Engineering](/foundations/context-engineering)
- [Working Memory](/memory-knowledge/working-memory)
- [Observability and Evals](/production-runtime/observability-and-evals)
- [Production Evaluation Feedback Loops](/production-runtime/production-evaluation-feedback-loops)
