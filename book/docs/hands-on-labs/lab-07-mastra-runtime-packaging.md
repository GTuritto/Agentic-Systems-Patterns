---
title: Lab 07 - Package Agents, Tools, Workflows, Memory, and Evals
---

# Lab 07 - Package Agents, Tools, Workflows, Memory, and Evals

## Objective

Use a Mastra-style TypeScript runtime shape to package the same responsibilities you built from scratch: agent decision, tool execution, workflow control, memory, trace events, and evals.

## What You Will Use

- Language: TypeScript
- Framework/runtime: Mastra-style runtime packaging
- Framework-agnostic lesson: a framework can package primitives, but your application still owns state, policy, tool contracts, traces, and acceptance criteria.
- Pattern chapters: [Mastra Runtime](/production-runtime/mastra-runtime), [Building a Minimal Agent Runtime](/agent-engineering-practice/building-a-minimal-agent-runtime), [Observability and Evals](/production-runtime/observability-and-evals)
- Source files:
  - `mastra-runtime-pattern/typescript/src/runtime_packaging.ts`
  - `mastra-runtime-pattern/typescript/src/run_demo.ts`
  - `mastra-runtime-pattern/typescript/test/runtime_packaging.spec.ts`

## Setup

From the repository root:

```sh
npm install
```

This lab is deterministic and does not require a model key. The point is runtime packaging, not model quality.

## Run It

```sh
npm run mastra-runtime:demo
npm run mastra-runtime:test
```

Expected result:

```text
Mastra-style runtime packaging tests OK
```

## Inspect The Code

Open `mastra-runtime-pattern/typescript/src/runtime_packaging.ts` and find these boundaries:

- `Agent`: owns instructions and proposes the next decision.
- `Tool`: owns typed capability execution.
- `WorkflowStep`: owns deterministic runtime sequence.
- `RuntimeState`: owns memory, traces, tool calls, and result.
- `evaluateRuntime`: checks trajectory, not only final text.

The local code is intentionally small, but the mapping follows the production shape: agents, workflows, tools, memory, traces, and evals belong in one runtime package.

## Change One Thing

Add a new tool named `send_message` with a direct side effect, then update `evaluateRuntime` so the eval fails if that tool appears in `toolCalls`.

Expected lesson: framework tool registration is not permission. Application policy still decides what is safe.

## Verify

Run:

```sh
npm run mastra-runtime:test
```

Check that:

- policy is read before drafting;
- the draft is created for review, not sent;
- workflow steps and tool results are traced;
- the eval fails if a direct send tool is used.

## Production Extension

Before a real Mastra implementation ships, add:

- real tool schemas and input validation;
- workflow retry and compensation policy;
- memory retention, redaction, and deletion controls;
- scorer/eval fixtures tied to release gates;
- trace export to the observability backend;
- approval gates for write tools and external communication.

## Cross-Framework Mapping

- In LangGraph, this becomes graph state, nodes, tools, checkpoints, and evals around graph runs.
- In Mastra AI, these concerns are packaged as agents, workflows, tools, memory, observability, and evals.
- In AutoGen-style systems, the runtime package is split across manager, workers, functions, messages, and transcript evals.
- In CrewAI, the equivalent packaging splits between flow state, crew tasks, agent roles, tools, and flow-level evaluation.

## Related Chapters

- [Mastra Runtime](/production-runtime/mastra-runtime)
- [Framework Selection](/agent-engineering-practice/framework-selection)
- [Building a Minimal Agent Runtime](/agent-engineering-practice/building-a-minimal-agent-runtime)
- [Production Evaluation Feedback Loops](/production-runtime/production-evaluation-feedback-loops)
