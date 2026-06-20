---
title: Lab 12 - Model State Graphs, Checkpoints, and Interrupts
---

# Lab 12 - Model State Graphs, Checkpoints, and Interrupts

## Objective

Use a LangGraph-style Python state graph to make state, nodes, edges, checkpoints, interrupts, and resume behavior explicit.

## What You Will Use

- Language: Python
- Framework/runtime: LangGraph-style state graph
- Framework-agnostic lesson: graph execution is valuable when state transitions, branching, pause/resume, and node-level observability matter.
- Official terminology checked: LangGraph graph state, nodes, edges, checkpoints, and interrupts.
- Pattern chapters: [Agent Loop](/foundations/agent-loop), [Goals and State](/foundations/goals-and-state), [Durable Workflows](/production-runtime/durable-workflows)
- Source files:
  - `langgraph-state-graph-pattern/python/state_graph.py`
  - `langgraph-state-graph-pattern/python/test_state_graph.py`
- Download: [langgraph-state-graph.zip](/downloads/langgraph-state-graph.zip)

## Setup

From the repository root:

```sh
npm install
```

This lab is deterministic and does not require a model key. It models the LangGraph execution contract without external dependencies so the state behavior is easy to inspect.

## Run It

```sh
npm run langgraph-state
npm run langgraph-state:test
```

Expected result:

```text
LangGraph-style state graph tests OK
```

## Inspect The Code

Open `langgraph-state-graph-pattern/python/state_graph.py` and find these boundaries:

- `GraphState`: shared graph state.
- `NODES`: node functions that update state.
- `EDGES`: control flow from one node to the next.
- `checkpoint`: state snapshot before node execution.
- `review`: interrupt point when human approval is missing.
- `run_graph(..., resume_from=...)`: resume path from a saved state.
- `evaluate_graph`: trajectory eval over checkpoints, state, and stop reason.

## Baseline Run

The first run stops at human approval:

```text
stop_reason: human_interrupt
trace includes checkpoint:review
```

The resumed run starts from the review node with approval:

```text
stop_reason: success
trace starts with checkpoint:review
```

This is the core state-graph lesson: the runtime should not have to replay classification, retrieval, and drafting when a saved checkpoint is enough.

## Change One Thing

Remove the `checkpoint(run, node)` call before node execution.

Expected result: the test should fail because the graph can no longer prove where it paused and resumed.

Restore the checkpoint call and rerun:

```sh
npm run langgraph-state:test
```

## Verify

Check that:

- every node boundary can create a checkpoint;
- interrupt state is explicit;
- resume starts from a known node;
- retrieved evidence and draft state survive resume;
- evals inspect trajectory and state, not only final text.

## Production Extension

Before using a real LangGraph implementation in production, add:

- durable checkpointer storage;
- thread IDs for independent user/task state;
- idempotency around node side effects;
- typed state schemas and reducers;
- interrupt payloads for human approval;
- replay tests for failed, interrupted, and resumed runs;
- trace export for node inputs, outputs, errors, and stop reasons.

## Cross-Framework Mapping

- In LangGraph, this maps directly to graph state, nodes, edges, checkpoints, and interrupts.
- In Mastra AI, the same responsibility may be represented as workflow steps, memory, and runtime traces.
- In AutoGen-style systems, checkpointing usually needs explicit transcript and task state outside the conversation.
- In CrewAI, flow state provides the equivalent durable control boundary while crews perform delegated work.

## Related Chapters

- [Goals and State](/foundations/goals-and-state)
- [Agent Loop](/foundations/agent-loop)
- [Durable Workflows](/production-runtime/durable-workflows)
- [Observability and Evals](/production-runtime/observability-and-evals)
