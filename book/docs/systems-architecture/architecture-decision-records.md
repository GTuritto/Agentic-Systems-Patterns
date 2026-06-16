---
title: Architecture Decision Records for Agents
---

# Architecture Decision Records for Agents

Agentic systems change quickly. Architecture Decision Records keep model, memory, tool, policy, and workflow choices explicit enough that future maintainers can understand why the system behaves the way it does.

Use ADRs when a decision affects safety, cost, reliability, user trust, or the ability to debug production behavior.

## What to Record

Record decisions about:

- Model selection and fallback models
- Tool permissions and approval rules
- Memory retention and deletion
- Retrieval sources and citation policy
- Workflow retries, compensation, and escalation
- Evaluation datasets and release gates
- Observability and logging boundaries
- Human review requirements
- Self-improvement and skill-update policies

## ADR Template

```md
# ADR-000: Title

## Status

Proposed | Accepted | Superseded

## Context

What problem are we solving? What constraints matter?

## Decision

What did we choose?

## Consequences

What improves? What gets harder? What risks remain?

## Verification

How will we know this decision is still working?
```

## Agent-Specific Additions

Add these fields when relevant:

- **Autonomy level:** advisory, proposes edits, executes after approval, or executes autonomously.
- **Tool scope:** exact tools and operations allowed.
- **State owner:** chat history, workflow state, memory store, database, or external system.
- **Failure policy:** retry, re-plan, ask, refuse, rollback, or escalate.
- **Eval gate:** tests or datasets required before release.
- **Rollback path:** how to disable or reverse the decision.

## Example Decisions

- Use a durable workflow for customer-impacting tasks instead of an in-memory loop.
- Require human approval before sending outbound email.
- Store episodic memory for project events but not personal secrets.
- Use hybrid keyword plus vector retrieval for support documentation.
- Run coding agents in disposable worktrees and require `npm test` before commit.
- Keep self-improvement as reviewed skill changes, not silent prompt mutation.

## Failure Modes

- Decisions live only in prompts and disappear from engineering review.
- ADRs describe the happy path but not rollback or verification.
- Model upgrades happen without recording eval impact.
- Memory or tool-scope changes ship without privacy review.
- The ADR says "human approval" but not which actions require it.

## Related Chapters

- [Agentic System Architecture](./agentic-system-architecture)
- [Agentic RAG Systems](./agentic-rag-systems)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Observability and Evals](../production-runtime/observability-and-evals)
