---
title: Agent UX and Human Trust
---

# Agent UX and Human Trust

Agent UX is the interface between human judgment and machine autonomy. A good agent interface shows progress, asks for help at the right time, and makes its actions inspectable.

Use this chapter when humans assign goals, review outputs, approve actions, or recover failed runs.

## UX Goals

An agent experience should help users answer:

- What is the agent trying to do?
- What has it already done?
- What evidence is it using?
- What will it do next?
- What needs my approval?
- What failed?
- How do I correct it?
- How do I stop it?

Trust comes from control and visibility, not from confident language.

## Interaction Modes

| Mode | Use When | UX Requirement |
| --- | --- | --- |
| Interactive | The user is present and can clarify or approve. | Streaming progress, questions, cancel, approval UI. |
| Background | Work takes minutes or hours. | Status page, notifications, resume, audit trail. |
| Human review | The agent prepares work for approval. | Diff, evidence, rationale, accept/edit/reject. |
| Autonomous | The agent runs within bounded authority. | Policy scope, traceability, alerts, rollback. |
| Multi-agent | Several agents collaborate. | Role visibility, handoff status, final owner. |

The UX should match the risk. A read-only research agent can be lightweight. A production-deploying coding agent needs stronger review and rollback.

## Progress Design

Show progress at meaningful boundaries:

- understanding the goal;
- selecting a route;
- retrieving evidence;
- calling tools;
- waiting for external systems;
- evaluating output;
- requesting approval;
- completing or stopping.

Do not stream hidden reasoning as the primary progress signal. Show actions, evidence, and state transitions.

## Explainability

Users need actionable explanations.

Good explanations include:

- source evidence;
- tool results;
- policy checks;
- uncertainty;
- alternative paths considered when relevant;
- reason for escalation or refusal.

Avoid explanations that expose private prompts, irrelevant internal chains of thought, or vague claims such as "the model decided."

## Corrections

Design correction paths before users need them.

Correction types:

- edit final answer;
- correct extracted fields;
- change route;
- add missing context;
- reject memory write;
- retry with a different tool;
- escalate to human;
- cancel and roll back.

Corrections should update evals and, where appropriate, memory. They should not disappear into chat history.

## Multi-Agent UX

Multi-agent systems need role clarity.

Show:

- which agent owns the task;
- which agents contributed;
- what each role produced;
- where handoffs occurred;
- which agent or workflow made the final decision;
- where a human entered the loop.

If users cannot tell who is responsible, the system will feel unreliable even when the output is correct.

## Approval UX

Approval requests should be specific.

An approval should show:

- proposed action;
- target system;
- affected data or user;
- evidence;
- risk level;
- policy result;
- reversible or irreversible status;
- expected result;
- approval and rejection options.

Never ask for broad approval such as "continue with all actions" when the agent can perform high-risk side effects.

## Failure UX

A failed run should be useful.

Return:

- what completed;
- what failed;
- why it stopped;
- whether anything changed externally;
- what the user can do next;
- link or ID for trace review.

Failure UX is part of reliability. A system that fails clearly can still be trusted.

## Related Chapters

- [Human Approval Gates](../tools-skills-protocols/human-approval-gates)
- [Goals and State](../foundations/goals-and-state)
- [Routing and Handoffs](../pattern-selection/routing-and-handoffs)
- [Observability and Evals](../production-runtime/observability-and-evals)
- [Agent Development Lifecycle](./agent-development-lifecycle)
