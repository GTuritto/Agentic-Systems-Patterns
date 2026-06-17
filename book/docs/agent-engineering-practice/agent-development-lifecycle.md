---
title: Agent Development Lifecycle
---

# Agent Development Lifecycle

Agent development is not prompt writing with deployment at the end. It is product engineering with a probabilistic component inside it.

That distinction matters. A prompt can make a demo work. A lifecycle makes the system survivable after the demo: when users ask unclear questions, tools fail, policies change, costs spike, and the model confidently proposes the wrong action.

Use this lifecycle when an agent will serve real users, call tools, touch private data, change external systems, or run for more than a demo session.

The lifecycle has one job: keep autonomy connected to evidence, state, policy, evaluation, and operations.

The first discipline is not to start with the agent. Start with the task, the state it needs, the tools it may use, the risk it creates, and the evidence that proves success. Add autonomy only where it earns its keep.

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

The lifecycle is iterative. Production data should update evals, policies, prompts, tool design, and sometimes the architecture itself. If production failures only produce prompt tweaks, the team is probably treating symptoms.

## Development Gates

The lifecycle should have gates. Without gates, a demo becomes a pilot, a pilot becomes production, and production becomes autonomous without anyone making the decision explicitly.

| Gate | Must Be True |
| --- | --- |
| Prototype ready | Task is framed, success criteria exist, unsafe actions are excluded, and a baseline exists. |
| Pilot ready | Tool contracts, state model, eval fixtures, traces, and human fallback are in place. |
| Production ready | Security review, approval rules, observability, rollback, runbooks, and release gates are in place. |
| Higher autonomy ready | Production traces prove low override rate, evals cover known incidents, and rollback is tested. |

Each gate should have an owner. If nobody owns the gate, the gate does not exist.

## Do Not Start With The Agent

Before building the agent loop, answer these questions:

- What is the user trying to accomplish?
- What would a deterministic workflow do?
- Which parts require judgment, retrieval, planning, or tool choice?
- What state must survive retries or approval waits?
- Which tools are read-only, write-capable, external, or high-risk?
- What evidence proves the result is correct?
- What is the correct behavior when evidence is missing?
- What must the system refuse to do?
- What will be evaluated before launch?
- How will the capability be disabled if it fails?

If those answers are vague, building an agent will mostly automate the ambiguity.

## Capability Framing

Start with a capability map, not a framework choice. A framework cannot tell you what the agent is allowed to do.

Capture the user jobs and business outcomes, the allowed and forbidden actions, the required evidence, the required tools and data, the approval points, the privacy and compliance constraints, the acceptable latency and cost, and the expected failure behavior. The important part is the negative space. An agent with a clear "will not do" list is easier to ship than an agent defined only by what it might do.

Good capability framing sounds concrete:

- "The agent can draft refund recommendations, but cannot issue refunds."
- "The agent can query account history, but cannot access payment instruments."
- "The agent can summarize an incident, but cannot page an on-call engineer without approval."

If the team cannot write boundaries this plainly, the agent is not ready for implementation.

## Pattern Selection

Select the simplest pattern that handles the task. This is where many teams overbuild. A prompt handles a single bounded task. A prompt chain handles known phases. Routing handles inputs that need different paths. An agent loop handles the case where the next step depends on observations. Multi-agent systems handle separate roles that need separate context, tools, or permissions.

Do not start with a multi-agent architecture because the domain has many tasks. Start by grouping capabilities into stable workflows. Split agents only where role boundaries are real: different context, different tools, different permissions, different review responsibilities, or real parallel work.

The wrong pattern usually fails in one of two ways. It is too simple, so it cannot handle uncertainty. Or it is too agentic, so it becomes expensive, slow, and hard to debug. The lifecycle should catch both.

Use a deterministic baseline even when you expect to ship an agent. The baseline gives you something to compare against. If an agent cannot beat a form, a search page, a workflow, or a prompt chain on quality, coverage, or operational cost, the extra autonomy is not justified yet.

## Boundary Design

Before implementation, define the system boundaries. This is the architecture work that prevents the model from quietly becoming the whole application.

- What owns state?
- What owns policy?
- What owns tool permissions?
- What owns memory writes?
- What owns final approval?
- What can be replayed after failure?
- What can be changed without redeploying code?

The model may propose actions. Software validates, executes, logs, and enforces.

This boundary should be visible in code. Tool schemas should not be vague. State transitions should not be hidden in natural language. Approval rules should not live only in the system prompt. Memory writes should be reviewed or constrained before they become future context.

## Implementation

Implementation should make the lifecycle visible in code. A reader should be able to find the goal object, the state model, the tool boundary, the policy checks, the stop condition, and the trace emission without reverse-engineering a prompt.

Minimum implementation units:

- a goal or request object;
- typed state;
- tool schemas;
- policy checks;
- stop conditions;
- trace events;
- eval fixtures;
- deployment configuration.

Avoid implementations where the only durable artifact is a conversation transcript. Transcripts are useful evidence. They are not a state model.

The implementation should also make failure explicit. A failed tool call, a denied policy check, a budget stop, and a user cancellation are different outcomes. Do not collapse them into "the agent failed."

## Release Readiness Checklist

Before an agent reaches production, the team should be able to point to concrete artifacts:

- owner and support path;
- capability map and exclusions;
- input, output, and error contract;
- autonomy level by action;
- tool manifests and capability classes;
- state schema and stop reasons;
- context assembly and memory policy;
- approval rules and escalation path;
- security and privacy review;
- eval suite with blocking cases;
- observability plan and trace schema;
- cost, latency, and tool budgets;
- rollback, kill switch, or capability disablement;
- ADRs for authority, memory, tools, and autonomy changes.

## Evaluation

Evaluate before launch and after launch. Agents change behavior when prompts, tools, models, memory, retrieval indexes, policies, or user populations change. Evaluation is not a launch checklist. It is the feedback loop for the system.

Pre-launch evaluation should cover happy-path tasks, ambiguous user requests, missing data, tool failure, retrieval failure, prompt-injection attempts, approval-required actions, and cost and latency budgets. Post-launch evaluation should add production failures, user corrections, human override cases, and edge cases found in traces. Every serious incident should leave behind an eval case.

Evaluation gates should be tied to releases. A model upgrade, prompt rewrite, tool manifest change, memory policy change, retrieval index change, or approval policy change should run the relevant regression suite before rollout.

Useful blocking evals include:

- forbidden tool calls;
- missing approval before side effects;
- unsafe memory writes;
- stale or missing evidence;
- tenant-boundary violations;
- failure to stop on budget or cancellation;
- hallucinated citations;
- poor recovery from tool failure.

## Deployment

Production deployment needs more than a hosted endpoint. It needs operational control: model and prompt versioning, rate limits and cost budgets, tool-level timeouts, audit logs, trace IDs that span tools and agents, alerting for breaker events, human escalation paths, and rollback for prompts, policies, and tools. If a deployment cannot explain what the agent did, it is not ready for high-impact work. The operator should be able to answer what goal was active, what evidence was used, what tools were called, what policies passed, what changed, and why the run stopped.

Rollout should be staged:

1. offline evals with mocked tools;
2. internal dogfood with read-only tools;
3. limited pilot with human approval on side effects;
4. canary production rollout with tight budgets;
5. broader rollout only after traces and overrides support it;
6. higher autonomy only after production evidence justifies it.

The point is not to slow the team down. The point is to make each increase in autonomy an explicit engineering decision.

## Governance

Governance is the control loop around the agent. It decides how the system changes without losing the boundaries that made it safe enough to ship. That means reviewing new tools, prompt and policy changes, memory schemas, eval changes, approval thresholds, incident reports, and model upgrades.

Treat agent changes like product and infrastructure changes. Small prompt edits can change behavior as much as code changes. New tools can change the risk class of the whole system. A model upgrade can invalidate old eval results. A memory schema change can change what the agent believes about returning users.

The lifecycle is complete only when these changes are reviewed, tested, deployed, observed, and fed back into the next iteration.

## Failure Modes

- Demo-first development becomes production without new controls.
- The team ships an agent without a deterministic baseline.
- Prompt changes ship without regression evals.
- Tools are added before capability boundaries are defined.
- Memory is enabled before write policy, deletion, and correction exist.
- The agent has no clear owner after launch.
- Human approval exists in the UI but not in the runtime policy.
- Production traces cannot reconstruct tool calls, context, memory, and decisions.
- Model upgrades happen without measuring behavior drift.
- Incidents lead only to prompt tweaks, not evals, policy changes, or architecture fixes.

## Lifecycle Review Questions

At each major change, ask:

- Did the autonomy level change?
- Did the tool authority change?
- Did the memory policy change?
- Did the context builder or retrieval index change?
- Did the model, prompt, routing, or fallback change?
- Did approval, budget, or stop behavior change?
- Did observability or redaction change?
- Which evals prove this is still acceptable?
- Which ADR or runbook should be updated?
- How do we roll back?

## Related Chapters

- [Choosing the Right Pattern](../pattern-selection/choosing-the-right-pattern)
- [Architecture Decision Records for Agents](../systems-architecture/architecture-decision-records)
- [Evaluation-Driven Agent Development](./evaluation-driven-agent-development)
- [Goals and State](../foundations/goals-and-state)
- [Tool Capability Design](../tools-skills-protocols/tool-capability-design)
- [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use)
- [Observability and Evals](../production-runtime/observability-and-evals)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Agent UX and Human Trust](./agent-ux-and-human-trust)
- [Agentic System Architecture](../systems-architecture/agentic-system-architecture)
