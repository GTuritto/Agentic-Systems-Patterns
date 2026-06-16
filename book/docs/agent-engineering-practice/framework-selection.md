---
title: Framework Selection
---

# Framework Selection

Agent frameworks can accelerate development, but they also shape the system's boundaries. Select a framework after you know the pattern, state model, tools, eval needs, and deployment constraints.

Use this chapter to compare frameworks without turning the architecture into a framework demo.

## Intent

Choose whether to build directly, use a lightweight library, or adopt a full agent framework.

The right framework should make the important parts more visible: state, tools, policy, traces, handoffs, and failure modes.

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

Do not adopt a framework that hides a concern your product must control.

## Common Framework Shapes

| Shape | Strength | Risk |
| --- | --- | --- |
| Prompt and tool library | Fast for simple agents. | You must build state, evals, and operations yourself. |
| Graph/workflow framework | Clear execution paths, durable state, conditional edges. | Graphs can become hard to read if every branch becomes a node. |
| Multi-agent framework | Role and delegation primitives. | Easy to overuse agents where a workflow is enough. |
| RAG framework | Retrieval, indexes, and data connectors. | Retrieval can become disconnected from policy and evals. |
| Runtime framework | Deployment, tracing, memory, workflows, and operations. | Runtime choices can become platform lock-in. |

The best choice may combine a small number of layers instead of one large framework.

## Build Directly When

- The workflow is short and stable.
- You need exact control over state and policy.
- The team already has workflow infrastructure.
- The agent is embedded inside an existing product.
- Debuggability matters more than rapid prototyping.
- The framework would introduce more concepts than the domain requires.

Direct code is often the best first production version for a narrow workflow.

## Use a Framework When

- The system needs durable graph execution.
- Agents need tool registration and discovery.
- Multi-agent handoffs are central to the product.
- You need built-in tracing, evals, or deployment support.
- You will build many related agents.
- The team benefits from shared conventions.

Use a framework to make repeated patterns consistent, not to avoid understanding the architecture.

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

## Framework Anti-Patterns

- Selecting a framework because it supports every pattern.
- Replacing architecture decisions with framework defaults.
- Giving all framework agents the same context and tools.
- Accepting opaque traces.
- Skipping evals because the framework demo worked.
- Treating framework memory as trustworthy by default.

## Related Chapters

- [Agent Engineer Toolkit](./agent-engineer-toolkit)
- [Choosing the Right Pattern](../pattern-selection/choosing-the-right-pattern)
- [Mastra Runtime](../production-runtime/mastra-runtime)
- [CrewAI Flows and Crews](../multi-agent-systems/crewai-flows-and-crews)
- [Agentic System Architecture](../systems-architecture/agentic-system-architecture)
