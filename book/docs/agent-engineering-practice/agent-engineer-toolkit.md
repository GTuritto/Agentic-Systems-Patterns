---
title: Agent Engineer Toolkit
---

# Agent Engineer Toolkit

An agent engineer chooses models, tools, memory, orchestration, evals, and deployment infrastructure as one system. The toolkit should support the architecture, not define it.

Use this chapter to decide what to build directly and what to take from a framework.

Think of the toolkit as a capability map. Some capabilities can come from a framework, some from existing platform services, and some should stay product-owned because they define authority, policy, and trust.

## Toolkit Layers

| Layer | Responsibility | Examples of Decisions |
| --- | --- | --- |
| Model layer | Reasoning, generation, tool calling, structured output. | Model quality, latency, cost, context window, deployment mode. |
| Model gateway | Routing, fallback, rate limits, provider abstraction. | Which models are allowed, when fallback happens, how versions are pinned. |
| Context layer | Assembles the model working set. | Context packet shape, source labels, exclusions, token budget. |
| Orchestration layer | Workflow, routing, loops, state, retries. | Code workflow, LangGraph-style graph, CrewAI-style crew, Mastra-style runtime. |
| Tool layer | External actions and data access. | MCP servers, internal APIs, browser tools, code execution, database functions. |
| Policy layer | Runtime allow, deny, approval, escalation, and audit decisions. | Tool authority, data access, memory writes, approval thresholds. |
| Memory layer | Working, episodic, semantic, and user memory. | Vector index, relational store, filesystem state, memory write policy. |
| Retrieval layer | Source search, filtering, reranking, citation. | Index type, source registry, freshness rules, tenant filters. |
| Evaluation layer | Quality and regression checks. | Golden datasets, judges, human labels, production traces. |
| Observability layer | Debugging and operations. | Traces, metrics, costs, logs, run replay. |
| Deployment layer | Runtime hosting, scaling, config, rollback. | Feature flags, canaries, kill switches, environment policy. |
| Security layer | Permissions and containment. | Sandboxes, secrets, policy gates, audit, egress controls. |
| UX layer | Human interaction and trust. | Streaming, approvals, explanations, handoffs, recovery. |
| Governance layer | How the system changes. | ADRs, reviews, release gates, incident-to-eval loop. |

The layers can come from one framework, several libraries, or direct code. The important part is that each layer has an owner.

## Build, Buy, Or Compose

Do not ask "which framework should we use?" first. Ask which toolkit capabilities must be product-owned.

| Capability | Often Framework-Provided | Should Stay Product-Owned |
| --- | --- | --- |
| Model adapters | provider clients, streaming, structured output helpers. | allowed models, fallback policy, cost budgets. |
| Orchestration | graph execution, workflow steps, retries. | state schema, stop reasons, approval waits, rollback. |
| Tooling | tool registration, invocation helpers, MCP clients. | tool authority, side effects, scopes, credentials, approvals. |
| Memory | stores, embeddings, retrieval helpers. | write policy, consent, retention, deletion, correction. |
| Retrieval | indexes, rerankers, connectors. | source registry, access filters, freshness, citation rules. |
| Evals | runners, judges, reports. | blocking cases, incident fixtures, release gates. |
| Observability | spans, logs, dashboards. | trace schema, redaction, audit requirements, replay policy. |
| Deployment | hosting, configs, scaling. | rollout plan, kill switches, incident ownership. |

Frameworks are good at mechanics. Product teams must still own authority.

## Minimum Toolkit By Risk

The toolkit should scale with risk. A demo and a side-effectful production agent do not need the same machinery.

| Risk Level | Minimum Toolkit |
| --- | --- |
| Demo | model call, prompt, sample inputs, simple run log. |
| Internal read-only assistant | context builder, source filters, basic evals, trace IDs, feedback path. |
| Production read-only agent | state model, retrieval policy, eval gates, observability, cost budgets, rollout controls. |
| Production side-effectful agent | typed tools, policy engine, approval gates, idempotency, rollback, incident replay. |
| Regulated or high-risk agent | security review, audit logs, redaction, tenant isolation, human escalation, ADRs, formal release gates. |

Adding toolkit layers is not ceremony when the agent can affect users, money, access, data, or production systems.

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

## Product-Owned Interfaces

Keep these interfaces explicit even when a framework executes them:

- request and response contracts;
- state and event schemas;
- tool manifests;
- context packet shape;
- policy decision schema;
- memory record schema;
- approval request and decision schema;
- eval fixture format;
- trace schema;
- deployment and rollback controls.

These are the pieces that let a team migrate frameworks, debug incidents, and keep authority out of prompts.

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

At toolkit-selection time, look for the minimum surfaces that make tools governable: names, descriptions, typed inputs and outputs, permission scopes, timeouts, idempotency, side-effect labels, and test fixtures. The full design checklist lives in [Tool Capability Design](../tools-skills-protocols/tool-capability-design); this chapter only asks whether your toolkit can support it.

Poor tools expose broad surfaces such as unrestricted shell, generic browser control, or "database query" without policy checks. Broad tools can be useful for trusted coding agents, but they need sandboxing and audit.

The tool layer should be boring on purpose. Tools should look like product capabilities, not raw infrastructure. Prefer `create_refund_draft` over `run_sql`, `send_approved_message` over `post_http`, and `lookup_order_summary` over broad database access.

## Memory Decisions

Memory is not one feature. It is several stores with different rules.

- Working memory holds the current task state.
- Episodic memory stores previous runs and user interactions.
- Semantic memory stores facts and documents.
- Procedural memory stores skills, playbooks, and preferences.

Decide who can write memory, how writes are validated, how old memory expires, and how retrieval is cited.

## Evaluation And Observability Decisions

Evals and traces are toolkit layers, not finishing touches.

At minimum, the toolkit should support:

- offline evals with mocked tools;
- trajectory evals that inspect tool calls and policy decisions;
- regression evals from incidents;
- model, prompt, tool, policy, and memory version tracking;
- traces across model calls, tool calls, retrieval, approvals, and memory writes;
- redaction rules for logs and eval fixtures;
- replay without repeating unsafe side effects.

If the toolkit cannot prove what happened, the team will debug the final answer instead of the system.

## Toolkit Assembly Checklist

Before choosing libraries or frameworks, fill this in:

| Question | Answer Needed |
| --- | --- |
| What owns the active goal and state? | workflow, runtime, app service, or framework. |
| What owns tool authority? | tool registry, policy engine, access-control service. |
| What owns memory writes? | memory service, policy gate, human review. |
| What owns context assembly? | context builder with traceable packets. |
| What owns eval gates? | CI, release process, eval service. |
| What owns observability? | tracing platform, app logs, audit store. |
| What owns rollback? | deployment system, feature flags, tool disablement. |
| What owns user controls? | product UI, approval service, support workflow. |

Unowned layers become production incidents.

## Toolkit Anti-Patterns

- Choosing a framework before choosing a pattern.
- Giving every agent every tool.
- Treating vector search as memory without write policy.
- Logging final answers but not tool decisions.
- Using model routing without evals for route quality.
- Shipping a demo framework path without production state, policy, and observability.
- Treating framework-provided memory as safe by default.
- Letting policy live only in prompt text.
- Adding observability after the first production incident.
- Building a tool layer with no manifest, owner, or disable path.
- Choosing a model gateway without version pinning or fallback rules.

## Related Chapters

- [Framework Selection](./framework-selection)
- [Agent Harnesses](./agent-harnesses)
- [Agent Development Lifecycle](./agent-development-lifecycle)
- [Choosing the Right Pattern](../pattern-selection/choosing-the-right-pattern)
- [Tool Capability Design](../tools-skills-protocols/tool-capability-design)
- [Context Engineering](../foundations/context-engineering)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Observability and Evals](../production-runtime/observability-and-evals)
- [Architecture Decision Records for Agents](../systems-architecture/architecture-decision-records)
- [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use)
- [Working Memory](../memory-knowledge/working-memory)
- [Mastra Runtime](../production-runtime/mastra-runtime)
- [CrewAI Flows and Crews](../multi-agent-systems/crewai-flows-and-crews)
- [Agentic System Architecture](../systems-architecture/agentic-system-architecture)
