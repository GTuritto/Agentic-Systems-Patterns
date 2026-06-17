---
title: Agent UX and Human Trust
---

# Agent UX and Human Trust

Agent UX is the interface between human judgment and machine autonomy. A good agent interface shows progress, asks for help at the right time, and makes its actions inspectable.

Use this chapter when humans assign goals, review outputs, approve actions, or recover failed runs.

The core contract is simple: the user should understand what the agent is trying to do, what it has seen, what it has changed, what it is about to do, and how to interrupt or correct it. Trust is not a feeling the UI creates with friendly copy. Trust is the result of bounded autonomy, visible state, and usable control.

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

## Trust Contract

An agent interface should make five things visible enough for the risk of the task:

| Question | UX Obligation |
| --- | --- |
| What is the goal? | Show the active goal, success criteria, and owner. |
| What does it know? | Show evidence, memory used, tool results, and known gaps. |
| What can it do? | Show available authority, pending side effects, and approval requirements. |
| What is happening now? | Show current state, step, wait reason, and progress. |
| How do I intervene? | Provide cancel, pause, approve, deny, edit, retry, escalate, and correction paths. |

This does not mean exposing every internal detail. It means exposing the operational facts a reasonable user needs to supervise the agent.

## Interaction Modes

| Mode | Use When | UX Requirement |
| --- | --- | --- |
| Interactive | The user is present and can clarify or approve. | Streaming progress, questions, cancel, approval UI. |
| Background | Work takes minutes or hours. | Status page, notifications, resume, audit trail. |
| Human review | The agent prepares work for approval. | Diff, evidence, rationale, accept/edit/reject. |
| Autonomous | The agent runs within bounded authority. | Policy scope, traceability, alerts, rollback. |
| Multi-agent | Several agents collaborate. | Role visibility, handoff status, final owner. |

The UX should match the risk. A read-only research agent can be lightweight. A production-deploying coding agent needs stronger review and rollback.

## UX States

Treat agent states as product states, not spinner text.

| State | What The User Should See |
| --- | --- |
| Planning | Goal, route, assumptions, and next step. |
| Retrieving | Sources being searched, filters, and evidence count. |
| Using tool | Tool name, target system, purpose, and side-effect class. |
| Waiting for approval | Proposed action, risk, evidence, approver, and expiry. |
| Asking clarification | The missing input and why it blocks progress. |
| Blocked | Block reason, completed work, and recovery options. |
| Escalating | Who receives the handoff and what context is included. |
| Completed | Result, evidence, changed systems, and trace ID. |
| Failed | Failure class, external changes, retry options, and trace ID. |
| Cancelled | What stopped, what was rolled back, and what remains. |

These states should map to runtime state. If the UI says "working" while the runtime is waiting for approval, the system is hiding the most important fact.

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

A useful progress event is small and concrete:

```ts
type AgentUxEvent = {
  runId: string;
  state:
    | "planning"
    | "retrieving"
    | "using_tool"
    | "waiting_for_approval"
    | "asking_clarification"
    | "blocked"
    | "escalating"
    | "completed"
    | "failed"
    | "cancelled";
  title: string;
  detail?: string;
  evidenceRefs: string[];
  toolCallId?: string;
  approvalId?: string;
  traceId: string;
  userActions: Array<"cancel" | "pause" | "approve" | "deny" | "edit" | "retry" | "escalate" | "inspect">;
};
```

The UI does not need to show the raw event. But the product should be built from events like this, so progress, traceability, and recovery stay aligned.

## User Controls

The controls should match the agent's authority:

- **Cancel:** stop the run and prevent future side effects.
- **Pause:** stop after the current safe boundary.
- **Approve:** allow one exact action, not broad future autonomy.
- **Deny:** stop or route to a safer alternative.
- **Edit:** change a draft, extracted field, plan step, or proposed action.
- **Retry:** repeat a safe step with the same evidence or a revised route.
- **Inspect:** open evidence, tool results, memory, policy decision, or trace.
- **Forget:** remove or reject a memory write.
- **Escalate:** hand off to a human or higher-trust workflow.

Controls are part of the architecture. A cancel button that cannot stop a queued tool call is not a real cancel button.

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

## Visibility Rules

Show the user the right level of detail for the task risk.

| Surface | Low-Risk Task | High-Risk Task |
| --- | --- | --- |
| Goal | short summary. | goal, constraints, owner, success criteria. |
| Evidence | citation links. | citation links, source age, conflicts, missing evidence. |
| Tools | hidden or summarized. | tool name, target system, side effect, result. |
| Memory | relevant preference if used. | memory source, age, scope, correction or forget option. |
| Policy | usually hidden. | policy reason, approval requirement, denial reason. |
| State | lightweight progress. | step, stop reason, retry state, approval state. |

High-risk does not always mean dramatic. Sending an email, changing access, issuing a refund, writing memory, deleting a file, or touching production all deserve more visibility than answering a documentation question.

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

A correction is data. Record what was corrected, who corrected it, which run it affected, whether memory changed, and whether the eval suite needs a new case.

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

Approvals should be attached to exact actions. If the proposed recipient, amount, file, command, permission, memory, or payload changes, the approval should no longer apply.

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

## Trust Calibration

The UI should not make the agent look more certain or more autonomous than it is.

Use confident language only when the system has strong evidence and the action is low risk. Use uncertainty when evidence is partial, stale, conflicting, or outside the agent's authority. Make refusals and escalations normal outcomes rather than embarrassing failures.

Bad trust calibration looks like:

- "Done" when the agent only drafted something;
- "Verified" when citations were not checked;
- "I found the answer" when sources conflict;
- "Running safely" when the tool has broad write access;
- "Remembered" when the user never approved a memory write.

## Failure Modes

- The agent appears busy but does not show what state it is in.
- Tool use is hidden until after side effects happen.
- Memory is used invisibly and the user cannot correct or forget it.
- Approval requests hide the real action or affected resource.
- The user cannot cancel a run that can still execute side effects.
- Errors are summarized as generic failure messages with no recovery path.
- Multi-agent handoffs hide who owns the final decision.
- Progress messages imply certainty while evidence is weak.
- The UI shows a final answer but not the trace, citations, or changed systems.
- Corrections disappear into chat and never improve evals or memory.

## Evaluation Guidance

Agent UX needs evals too. Do not only ask whether the answer is correct. Ask whether the user could supervise the agent.

- Test whether users can identify the active goal and current state.
- Test whether approval requests expose the exact action and side effects.
- Test whether cancellation stops future side effects.
- Test whether corrections update the right artifact: answer, state, memory, or eval.
- Test whether users can inspect evidence and tool results.
- Test whether memory use is visible and correctable.
- Test whether failure messages explain what changed externally.
- Test whether trust language matches evidence strength.
- Test whether multi-agent handoffs show ownership.
- Test whether a user can recover from blocked, failed, or escalated runs.

Measure task success, correction success, approval clarity, cancellation success, evidence inspection rate, user override rate, memory correction rate, failure recovery rate, and trust calibration.

## Production Checklist

- Map runtime states to explicit UI states.
- Show goal, current step, evidence, tool calls, approvals, and stop reason.
- Provide cancel, pause, approve, deny, edit, retry, inspect, forget, and escalate controls where relevant.
- Bind approvals to exact actions.
- Make memory use visible and correctable.
- Show changed external systems after side effects.
- Treat refusal, cancellation, approval wait, and escalation as normal states.
- Record corrections as structured events.
- Feed user corrections, overrides, and failures into evals.
- Keep trace IDs accessible for support and incident review.

## Related Chapters

- [Human Approval Gates](../tools-skills-protocols/human-approval-gates)
- [Goals and State](../foundations/goals-and-state)
- [Tool Capability Design](../tools-skills-protocols/tool-capability-design)
- [Memory-Augmented Agent](../memory-knowledge/memory-augmented-agent)
- [Routing and Handoffs](../pattern-selection/routing-and-handoffs)
- [Observability and Evals](../production-runtime/observability-and-evals)
- [Agent Development Lifecycle](./agent-development-lifecycle)
