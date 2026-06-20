---
title: Lab Framework and Language Matrix
---

# Lab Framework and Language Matrix

The labs are intentionally language- and framework-agnostic. They use different tools so you can see the architectural pattern beneath the framework API.

| Lab | Pattern | Language | Framework / Runtime | Framework-Agnostic Lesson |
| --- | --- | --- | --- | --- |
| [Lab 01 - Tool-Using Agent](./lab-01-tool-using-agent.md) | Tool use | TypeScript | Minimal custom runtime / AutoGen-style example | The model proposes a capability use; software owns validation and execution. |
| [Lab 02 - Agent Loop and Planning](./lab-02-agent-loop-and-planning.md) | Planning and execution | TypeScript, with Python mirror | Framework-neutral planner/executor | Planning and execution are separate responsibilities even when one framework packages both. |
| [Lab 03 - Agentic RAG](./lab-03-agentic-rag.md) | Retrieval and grounding | Python | LangChain/LangGraph-style retrieval stack | Retrieval produces scoped evidence; generation must stay grounded in that evidence. |
| [Lab 04 - A2A Communication](./lab-04-a2a-communication.md) | Agent-to-agent protocol | TypeScript | Protocol-first runtime with Ajv schema validation | Agent communication needs typed envelopes, correlation IDs, refusals, errors, and cancellation. |
| [Lab 05 - Multi-Agent Supervisor](./lab-05-multi-agent-supervisor.md) | Supervisor / worker | TypeScript | AutoGen-style manager/worker example | A supervisor owns decomposition, worker contracts, and final synthesis. |
| [Lab 06 - Observability and Evals](./lab-06-observability-and-evals.md) | Trace and eval harness | TypeScript | Framework-neutral tests over examples | Evals should inspect trajectories, not only final answers. |

## How To Read The Matrix

Do not treat the framework column as the point of the lab. Treat it as the implementation surface. The durable lesson is the boundary: state, tools, policy, context, communication, evaluation, or runtime control.

If you later use LangGraph, Mastra AI, AutoGen, CrewAI, Semantic Kernel, MCP, or a custom runtime, keep the same questions in view:

- What does the framework own?
- What does your application still own?
- Where is state persisted?
- Where are tool calls validated?
- Where is policy enforced?
- What can be replayed after a failure?

## Current Coverage

The current labs are strongest on TypeScript examples, protocol boundaries, and small runnable demos. The Python coverage is concentrated in the Agentic RAG lab.

Planned lab expansion should add:

- a Mastra AI lab for TypeScript runtime packaging of agents, tools, workflows, memory, and evals;
- a CrewAI lab for Python flows, crews, role boundaries, and task contracts;
- a from-scratch mini-runtime track that shows what frameworks package under the hood.
