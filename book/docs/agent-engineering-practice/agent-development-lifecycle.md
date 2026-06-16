---
title: Agent Development Lifecycle
---

# Agent Development Lifecycle

Agent development is not prompt writing with deployment at the end. It is a product engineering lifecycle with requirements, architecture, implementation, evaluation, operations, and governance.

Use this lifecycle when an agent will serve real users, call tools, touch private data, or run for more than a demo session.

## Lifecycle Stages

| Stage | Main Question | Output |
| --- | --- | --- |
| 1. Capability framing | What should the agent do, and what should it never do? | Capability map, exclusions, risk class. |
| 2. Pattern selection | What is the least agentic architecture that works? | Pattern choice and complexity budget. |
| 3. Boundary design | Where do model decisions stop and software controls begin? | Tool contracts, policies, state model. |
| 4. Implementation | How does the agent perceive, decide, act, and stop? | Runnable agent, workflow, or multi-agent system. |
| 5. Evaluation | How do we know it works? | Eval suite, failure modes, quality gates. |
| 6. Deployment | How does it run safely in production? | Observability, rollback, rate limits, approvals. |
| 7. Governance | How does it improve without losing control? | Review process, audit logs, versioning, incident loop. |

The lifecycle is iterative. Production data should update evals, policies, prompts, and tool design.

## Capability Framing

Start with a capability map, not a framework choice.

Capture:

- user jobs and business outcomes;
- allowed actions;
- forbidden actions;
- required evidence;
- required tools and data;
- approval points;
- privacy and compliance constraints;
- acceptable latency and cost;
- expected failure behavior.

An agent with a clear "will not do" list is easier to ship than an agent defined only by what it might do.

## Pattern Selection

Select the simplest pattern that handles the task:

- Use a prompt for a single bounded task.
- Use a prompt chain for known phases.
- Use routing when inputs need different paths.
- Use an agent loop when the next step depends on observations.
- Use multi-agent systems when separate roles need separate context, tools, or permissions.

Do not start with a multi-agent architecture because the domain has many tasks. Start by grouping capabilities into stable workflows, then split agents only where role boundaries are real.

## Boundary Design

Before implementation, define the system boundaries:

- What owns state?
- What owns policy?
- What owns tool permissions?
- What owns memory writes?
- What owns final approval?
- What can be replayed after failure?
- What can be changed without redeploying code?

The model may propose actions. Software should validate, execute, log, and enforce.

## Implementation

Implementation should make the lifecycle visible in code.

Minimum implementation units:

- a goal or request object;
- typed state;
- tool schemas;
- policy checks;
- stop conditions;
- trace events;
- eval fixtures;
- deployment configuration.

Avoid implementations where the only durable artifact is a conversation transcript. Transcripts are useful, but they are not a state model.

## Evaluation

Evaluate before launch and after launch.

Pre-launch evaluation should include:

- happy-path tasks;
- ambiguous user requests;
- missing data;
- tool failure;
- retrieval failure;
- prompt injection attempts;
- approval-required actions;
- cost and latency budgets.

Post-launch evaluation should add production failures, user corrections, human override cases, and edge cases found in traces.

## Deployment

Production deployment needs more than a hosted endpoint.

Include:

- model and prompt versioning;
- rate limits and cost budgets;
- tool-level timeouts;
- audit logs;
- trace IDs across tools and agents;
- alerting for breaker events;
- human escalation paths;
- rollback for prompts, policies, and tools.

If a deployment cannot explain what the agent did, it is not ready for high-impact work.

## Governance

Governance is the control loop around the agent.

Review:

- new tools;
- prompt and policy changes;
- memory schemas;
- eval changes;
- approval thresholds;
- incident reports;
- model upgrades.

Treat agent changes like product and infrastructure changes. Small prompt edits can change behavior as much as code changes.

## Related Chapters

- [Choosing the Right Pattern](../pattern-selection/choosing-the-right-pattern)
- [Goals and State](../foundations/goals-and-state)
- [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use)
- [Observability and Evals](../production-runtime/observability-and-evals)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Agentic System Architecture](../systems-architecture/agentic-system-architecture)
