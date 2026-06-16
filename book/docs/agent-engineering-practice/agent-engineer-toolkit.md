---
title: Agent Engineer Toolkit
---

# Agent Engineer Toolkit

An agent engineer chooses models, tools, memory, orchestration, evals, and deployment infrastructure as one system. The toolkit should support the architecture, not define it.

Use this chapter to decide what to build directly and what to take from a framework.

## Toolkit Layers

| Layer | Responsibility | Examples of Decisions |
| --- | --- | --- |
| Model layer | Reasoning, generation, tool calling, structured output. | Model quality, latency, cost, context window, deployment mode. |
| Orchestration layer | Workflow, routing, loops, state, retries. | Code workflow, LangGraph-style graph, CrewAI-style crew, Mastra-style runtime. |
| Tool layer | External actions and data access. | MCP servers, internal APIs, browser tools, code execution, database functions. |
| Memory layer | Working, episodic, semantic, and user memory. | Vector index, relational store, filesystem state, memory write policy. |
| Evaluation layer | Quality and regression checks. | Golden datasets, judges, human labels, production traces. |
| Observability layer | Debugging and operations. | Traces, metrics, costs, logs, run replay. |
| Security layer | Permissions and containment. | Sandboxes, secrets, policy gates, audit, egress controls. |
| UX layer | Human interaction and trust. | Streaming, approvals, explanations, handoffs, recovery. |

The layers can come from one framework, several libraries, or direct code. The important part is that each layer has an owner.

## Build vs Framework

Use a framework when it removes real operational complexity:

- graph execution;
- durable state;
- tracing;
- tool registration;
- eval integration;
- human approval flows;
- deployment management;
- multi-agent orchestration.

Build directly when:

- the workflow is small;
- the team needs full control over state and policy;
- framework abstractions hide important failures;
- the system must integrate with existing infrastructure;
- the agent is part of a larger product workflow.

Frameworks should make boundaries clearer. If a framework makes it hard to see state, tool calls, permissions, or failure modes, use a smaller abstraction.

## Framework Evaluation Checklist

Before adopting a framework, test it against the agent's production requirements.

- Can it persist and resume state?
- Can it represent approval gates?
- Can it restrict tools per role or route?
- Can it trace model calls, tool calls, and handoffs?
- Can it run evals against realistic fixtures?
- Can it support model fallback and routing?
- Can it expose cost and latency by step?
- Can it run in the team's deployment environment?
- Can engineers debug failures without reading framework internals?
- Can it be removed later if the product outgrows it?

Do a thin vertical slice before committing the whole architecture.

## Model Selection

Choose models by workload, not benchmark rank alone.

Evaluate:

- structured output reliability;
- tool-use reliability;
- instruction following;
- latency;
- cost per completed task;
- context window behavior;
- refusal and safety behavior;
- multimodal needs;
- support for deployment constraints;
- provider stability and versioning.

Use multiple models when it reduces cost or improves quality. A small model may route, classify, or extract. A stronger model may plan, synthesize, or resolve edge cases.

## Tooling Decisions

Tools need engineering discipline.

Good tools have:

- narrow names;
- explicit descriptions;
- typed inputs;
- typed outputs;
- permission scopes;
- timeouts;
- idempotency where possible;
- clear side-effect labels;
- test fixtures.

Poor tools expose broad surfaces such as unrestricted shell, generic browser control, or "database query" without policy checks. Broad tools can be useful for trusted coding agents, but they need sandboxing and audit.

## Memory Decisions

Memory is not one feature. It is several stores with different rules.

- Working memory holds the current task state.
- Episodic memory stores previous runs and user interactions.
- Semantic memory stores facts and documents.
- Procedural memory stores skills, playbooks, and preferences.

Decide who can write memory, how writes are validated, how old memory expires, and how retrieval is cited.

## Toolkit Anti-Patterns

- Choosing a framework before choosing a pattern.
- Giving every agent every tool.
- Treating vector search as memory without write policy.
- Logging final answers but not tool decisions.
- Using model routing without evals for route quality.
- Shipping a demo framework path without production state, policy, and observability.

## Related Chapters

- [Choosing the Right Pattern](../pattern-selection/choosing-the-right-pattern)
- [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use)
- [Working Memory](../memory-knowledge/working-memory)
- [Mastra Runtime](../production-runtime/mastra-runtime)
- [CrewAI Flows and Crews](../multi-agent-systems/crewai-flows-and-crews)
- [Agentic System Architecture](../systems-architecture/agentic-system-architecture)
