---
title: Framework Selection
---

# Framework Selection

Agent frameworks can accelerate development, but they also shape the system's boundaries. Select a framework after you know the pattern, state model, tools, eval needs, and deployment constraints.

Use this chapter to compare frameworks without turning the architecture into a framework demo.

## Intent

Choose whether to build directly, use a lightweight library, or adopt a full agent framework.

The right framework should make the important parts more visible: state, tools, policy, traces, handoffs, and failure modes.

The wrong framework makes the demo faster and the system harder to own. It hides state, turns tool calls into magic, makes memory feel automatic, and gives the team a vocabulary before it has an architecture.

## Selection Criteria

| Criterion | Questions |
| --- | --- |
| Control flow | Does it support chains, graphs, loops, routing, and human gates? |
| State | Can it persist, resume, inspect, and migrate state? |
| Tooling | Can tools be typed, scoped, tested, and audited? |
| Multi-agent | Can it represent roles, handoffs, and ownership clearly? |
| Memory | Does it separate working, episodic, semantic, and procedural memory? |
| Evaluation | Can evals run against routes, tools, traces, and final outputs? |
| Observability | Does it expose model calls, tool calls, costs, latency, and errors? |
| Security | Can tools and agents run with least privilege? |
| Deployment | Can it run where your system must run? |
| Escape hatch | Can you drop to code when the abstraction is wrong? |
| Portability | Can prompts, tools, evals, policies, and state survive a framework change? |
| Ownership | Can your team debug production failures without waiting for framework internals? |

Do not adopt a framework that hides a concern your product must control.

## Fit By Problem Shape

Start from the workload, not the framework category.

| Problem Shape | Better Fit | Watch For |
| --- | --- | --- |
| Single bounded task | direct code or prompt library. | overbuilding state and orchestration. |
| Known phases | prompt chain or workflow. | hiding validation between steps. |
| Branching workflow | graph or durable workflow framework. | graph sprawl and unclear state ownership. |
| Tool-heavy agent | tool registry plus policy boundary. | broad tools and weak approval controls. |
| Evidence-heavy answers | RAG framework plus context builder. | retrieval disconnected from policy and evals. |
| Long-running work | durable workflow runtime. | in-memory loops and lost approval state. |
| Multi-role work | multi-agent framework or service topology. | fake specialization with duplicated context. |
| Cross-agent communication | A2A, service contracts, queues, or workflows. | natural-language handoffs without schema. |
| Product runtime | application/runtime framework. | platform lock-in and opaque operations. |
| Coding agents | sandboxed harness with file, command, test, and approval controls. | shell access without policy or replay. |

If two approaches both work, choose the one that makes state, tools, policy, evals, and rollback easier to inspect.

## Common Framework Shapes

| Shape | Strength | Risk |
| --- | --- | --- |
| Prompt and tool library | Fast for simple agents. | You must build state, evals, and operations yourself. |
| Graph/workflow framework | Clear execution paths, durable state, conditional edges. | Graphs can become hard to read if every branch becomes a node. |
| Multi-agent framework | Role and delegation primitives. | Easy to overuse agents where a workflow is enough. |
| RAG framework | Retrieval, indexes, and data connectors. | Retrieval can become disconnected from policy and evals. |
| Runtime framework | Deployment, tracing, memory, workflows, and operations. | Runtime choices can become platform lock-in. |

The best choice may combine a small number of layers instead of one large framework.

## Capability Matrix

Use this matrix during evaluation. The goal is not to assign a score for marketing features. The goal is to identify which responsibilities the framework owns and which ones your application must still own.

| Capability | Questions To Ask |
| --- | --- |
| State model | Where is state stored? Can it be inspected, migrated, replayed, and versioned? |
| Tool boundary | Are tools typed? Are scopes, side effects, approvals, and trace fields explicit? |
| Policy | Can policy run before tool calls, memory writes, retrieval, and final answers? |
| Memory | Are working, episodic, semantic, and user memory separated? Can writes be reviewed? |
| Context | Can the framework show what context packet was assembled for each model call? |
| Human approval | Are approvals durable, exact-action bound, expiring, and auditable? |
| Evals | Can evals test trajectories, tool calls, refusals, memory writes, and citations? |
| Observability | Are model calls, tool calls, costs, latency, policy decisions, and retries traced? |
| Security | Can it enforce least privilege, sandboxing, credential scope, and egress limits? |
| Deployment | Does it support your runtime, data residency, scaling, rollback, and incident process? |
| Interop | Can it expose or consume MCP, A2A, REST, queues, or your existing service contracts? |
| Exit path | Can you move prompts, tools, state, policies, and evals out later? |

## Build Directly When

- The workflow is short and stable.
- You need exact control over state and policy.
- The team already has workflow infrastructure.
- The agent is embedded inside an existing product.
- Debuggability matters more than rapid prototyping.
- The framework would introduce more concepts than the domain requires.

Direct code is often the best first production version for a narrow workflow.

Build directly does not mean build carelessly. It means using normal software boundaries: typed inputs, state tables, tool clients, policy checks, tests, traces, and deployment controls. A small direct implementation with strong boundaries is better than a framework implementation that hides them.

## Use a Framework When

- The system needs durable graph execution.
- Agents need tool registration and discovery.
- Multi-agent handoffs are central to the product.
- You need built-in tracing, evals, or deployment support.
- You will build many related agents.
- The team benefits from shared conventions.

Use a framework to make repeated patterns consistent, not to avoid understanding the architecture.

Framework adoption is strongest when the team already knows the responsibilities it needs the framework to carry. It is weakest when the team says, "we need agents", and lets the framework define the architecture after the fact.

## Evaluation Process

Run a framework through a vertical slice:

1. one real user request;
2. one route or workflow;
3. one read tool;
4. one write tool behind approval;
5. one memory read or write;
6. one failure path;
7. one eval case;
8. one trace inspection;
9. one deployment path.

If the slice is hard to inspect, hard to test, or hard to secure, stop before the framework spreads.

Add a second vertical slice for failure:

1. malformed user request;
2. missing evidence;
3. denied policy check;
4. tool timeout;
5. approval wait;
6. cancellation;
7. replay from trace;
8. rollback of prompt, model, or tool configuration.

Most frameworks look good on the happy path. The failure slice tells you whether you can operate it.

## Portability And Exit

Assume the framework may change. The safest way to adopt one is to keep the core assets portable:

- tool manifests;
- prompt and instruction files;
- state schemas;
- memory schemas;
- approval rules;
- policy rules;
- eval fixtures;
- trace schema;
- context packet shape;
- architecture decision records.

Avoid burying these assets inside framework-specific callbacks or decorators if they represent product policy. The framework can execute them. It should not be the only place where they exist.

## Framework Anti-Patterns

- Selecting a framework because it supports every pattern.
- Replacing architecture decisions with framework defaults.
- Giving all framework agents the same context and tools.
- Accepting opaque traces.
- Skipping evals because the framework demo worked.
- Treating framework memory as trustworthy by default.
- Using a multi-agent framework for simple routing.
- Treating built-in observability as sufficient without incident replay.
- Accepting framework tool abstractions that cannot express side effects or approvals.
- Letting framework defaults decide memory retention, context assembly, or security scope.

## Decision Checklist

Before adopting a framework, answer:

- Which pattern are we implementing?
- Which responsibilities does the framework own?
- Which responsibilities remain in our application?
- Can we inspect state, context, tool calls, memory, policy decisions, and traces?
- Can we run evals without calling real side-effectful tools?
- Can we enforce approval and least privilege outside the prompt?
- Can we deploy, roll back, and disable one capability quickly?
- Can we migrate away without rewriting prompts, tools, state, evals, and policy?
- Which ADR records this choice?
- What failure would make us reconsider the framework?

## Related Chapters

- [Agent Engineer Toolkit](./agent-engineer-toolkit)
- [Agent Harnesses](./agent-harnesses)
- [Agent Development Lifecycle](./agent-development-lifecycle)
- [Architecture Decision Records for Agents](../systems-architecture/architecture-decision-records)
- [Choosing the Right Pattern](../pattern-selection/choosing-the-right-pattern)
- [Tool Capability Design](../tools-skills-protocols/tool-capability-design)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Observability and Evals](../production-runtime/observability-and-evals)
- [Mastra Runtime](../production-runtime/mastra-runtime)
- [CrewAI Flows and Crews](../multi-agent-systems/crewai-flows-and-crews)
- [Agentic System Architecture](../systems-architecture/agentic-system-architecture)
