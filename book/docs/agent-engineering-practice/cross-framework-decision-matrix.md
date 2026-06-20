---
title: Cross-Framework Decision Matrix
---

# Cross-Framework Decision Matrix

This chapter compares LangGraph, AutoGen-style systems, Mastra AI, CrewAI, and a small custom runtime by engineering responsibility. The goal is not to crown one framework. The goal is to decide what should own state, tools, policy, memory, evals, deployment, and failure recovery for a specific system.

Use this chapter after the labs. The labs show each framework shape in isolation. This chapter helps choose among them for a real product.

![Cross-framework state ownership comparison](/diagrams/framework-state-ownership.svg)

## Decision Rule

Choose the framework that makes your highest-risk boundary easiest to inspect, test, and operate.

If the highest risk is resumable state, prefer graph or workflow state. If the highest risk is multi-agent accountability, prefer a transcript or flow that records role behavior. If the highest risk is production runtime packaging, prefer a runtime with conventions for tools, memory, evals, and observability. If the highest risk is exact policy control, a small direct runtime may be safer than a large abstraction.

## Framework Fit Matrix

| Option | Best When | Avoid When | Keep Portable |
| --- | --- | --- | --- |
| LangGraph-style state graph | Work has branching, checkpoints, interrupts, resume, or node-level observability. | A simple sequence or single tool call is enough. Graph shape would hide rather than clarify state. | State schema, node contracts, checkpoint records, interrupt payloads, eval fixtures. |
| AutoGen-style team | Collaboration, role behavior, and transcript review are central. | The team is just a chain with agent names. Conversation history becomes the only state store. | Message schema, role contracts, termination rules, transcript evals, tool policy. |
| Mastra-style runtime | TypeScript product needs agents, tools, workflows, memory, evals, and observability packaged together. | Runtime conventions would hide product policy or deployment requirements. | Tool manifests, workflow contracts, memory rules, evals, trace schema. |
| CrewAI-style flows and crews | Python workflows need flow-owned state plus bounded specialist crews. | Roles overlap, flow acceptance is vague, or crews replace deterministic workflow design. | Flow state, task contracts, role permissions, crew outputs, acceptance evals. |
| Mini-runtime/custom code | Scope is narrow, policy needs exact control, or the team already has workflow infrastructure. | You need production durability, scaling, hosted observability, and ecosystem integrations immediately. | Everything: state, policy, tools, memory, evals, traces, deployment contracts. |

## Responsibility Matrix

| Responsibility | LangGraph-style | AutoGen-style | Mastra-style | CrewAI-style | Mini-runtime |
| --- | --- | --- | --- | --- | --- |
| State owner | Graph state and checkpoints. | Team/task state outside the transcript. | Runtime workflow and memory state. | Flow state. | Your application model. |
| Control flow | Nodes, edges, conditional transitions, interrupts. | Team turn policy and termination. | Workflows and agent runtime. | Flows coordinate crews and tasks. | Loop, router, or workflow code you write. |
| Tool policy | Guard nodes, middleware, or tool wrappers. | Manager/runtime execution boundary. | Tool and workflow policy hooks. | Role tools plus flow constraints. | Explicit policy gate. |
| Memory | State plus memory stores. | Transcript plus external memory. | Runtime memory abstractions. | Flow/crew context and external stores. | Context packet and memory policy. |
| Evals | Node paths, state diffs, checkpoints, final output. | Transcript turns, roles, tool calls, termination. | Runtime traces, tool calls, workflow outcomes. | Flow acceptance and role outputs. | Trajectory tests you define. |
| Observability | Per-node traces and checkpoint inspection. | Structured message transcript. | Runtime observability and eval hooks. | Flow/task/role records. | Trace schema and storage you build. |
| Deployment | App runtime plus checkpointer and stores. | App runtime plus agent service boundaries. | TypeScript runtime packaging. | Python flow app and workers. | Existing product infrastructure. |
| Escape hatch | Nodes are plain code if state stays explicit. | Transcript can be exported and replayed. | Keep tools/evals outside framework-only code. | Keep flow state separate from role chat. | Maximum control, maximum operational burden. |

## Choose By Risk

| Dominant Risk | Better Default | Why |
| --- | --- | --- |
| Lost progress or interrupted workflows | LangGraph-style or durable workflow | Checkpoints, resumability, and state transitions are first-class. |
| Unaccountable multi-agent behavior | AutoGen-style transcript or CrewAI-style flow | You can inspect role turns, handoffs, and final acceptance. |
| TypeScript product runtime consistency | Mastra-style runtime | Agents, tools, workflows, memory, and evals share one application structure. |
| Python role-based workflow automation | CrewAI-style flow | Flow state and crew execution map well to Python automation teams. |
| Strict policy and minimal scope | Mini-runtime/custom code | The application owns the exact boundary and avoids framework defaults. |
| Framework uncertainty | Mini-runtime first, then migrate | Building primitives once clarifies what the framework must provide. |

## Migration And Escape Hatches

Do not let the framework become the only place where product logic exists. Keep these assets portable:

- state schemas;
- tool manifests and side-effect classes;
- policy rules;
- approval records;
- memory retention and deletion rules;
- prompt and instruction files;
- context packet shape;
- trace schema;
- eval fixtures;
- deployment and rollback notes;
- ADRs explaining why the framework was chosen.

Portability is not theoretical. Framework APIs change, teams switch stacks, and production systems outgrow early assumptions. The safest framework adoption keeps product contracts outside framework-specific decorators and callbacks wherever possible.

## Decision Checklist

Before choosing a framework, answer:

- What owns durable state?
- Where does policy run before side effects?
- How are tools typed, scoped, approved, and traced?
- What is the smallest replayable trace that explains a failure?
- Which evals fail the build?
- What happens when a run is interrupted?
- How do we roll back prompts, tools, policies, and model choices?
- What data must never enter memory or traces?
- Which parts can migrate if the framework changes?
- Which production incident would prove this framework was the wrong choice?

## Related Chapters

- [Framework Selection](./framework-selection)
- [Building a Minimal Agent Runtime](./building-a-minimal-agent-runtime)
- [Agent Harnesses](./agent-harnesses)
- [Lab Production Readiness Checklist](../hands-on-labs/production-readiness-checklist)
- [Architecture Decision Records for Agents](../systems-architecture/architecture-decision-records)
- [Observability and Evals](../production-runtime/observability-and-evals)
