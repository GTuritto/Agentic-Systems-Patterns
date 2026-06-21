---
title: Pattern Evaluation Checklist
---

# Pattern Evaluation Checklist

A pattern is not ready because it sounds right. It is ready when the team can explain what job it owns, where it can fail, what bounds the failure, how it is evaluated, and how it behaves in production.

This checklist is the shared review lens for the book. Use it before choosing a pattern, before composing several patterns, and before promoting an agentic workflow into production.

Download the reusable worksheet: [pattern evaluation scorecard](/capstone-assets/templates/pattern-evaluation-scorecard.txt).

For the engineering loop behind this checklist, see [Evaluation-Driven Agent Development](../agent-engineering-practice/evaluation-driven-agent-development). Use the checklist to review a pattern. Use the development chapter to turn the review into datasets, fixtures, release gates, and production feedback.

![Pattern evaluation flow](../public/diagrams/pattern-evaluation-flow.svg)

## The Short Version

Every pattern should answer five questions:

1. What responsibility does this pattern own?
2. What new risk does it introduce?
3. What control keeps that risk bounded?
4. What eval proves the control works?
5. What production signal tells us it is drifting?

If the pattern cannot answer those questions, it is probably not a pattern yet. It is an implementation idea.

## Evaluation Table

Use this table as the default review template.

| Area | Question | Evidence To Look For |
| --- | --- | --- |
| Goal | What user or system goal does the pattern own? | A task contract, success criteria, refusal criteria, and owner. |
| Boundary | What is outside the pattern's responsibility? | A clear handoff, caller contract, or escalation path. |
| Autonomy | What does the model decide, and what does software decide? | A split between proposal, validation, execution, and stop. |
| Loop | Can the pattern repeat? | Max steps, max tool calls, timeout, retry budget, and stop reason. |
| Tools | What can the pattern read or change? | Tool allowlist, schema validation, permission checks, and audit events. |
| State | What state is read, written, or persisted? | State owner, update rules, replay behavior, and memory write policy. |
| Context | What evidence enters the working set? | Source eligibility, retrieval rules, freshness checks, and context budget. |
| Security | What can untrusted input influence? | Threat model, prompt-injection controls, sandboxing, and approval gates. |
| Evaluation | What failure must be caught before release? | Golden tasks, negative cases, trajectory evals, mocked tools, and regression fixtures. |
| Observability | Can a failed run be explained later? | Trace ID, model spans, tool spans, decisions, policy denials, costs, and stop reason. |
| Operations | Can the pattern be rolled back or disabled? | Versioned prompts, tool manifests, model routes, feature flags, and circuit breakers. |

## Review Score

Use a simple score when the pattern is going into a design review or release gate.

| Score | Meaning | Decision |
| --- | --- | --- |
| 0 | Missing or only prompt-level. | Block. The control is not real. |
| 1 | Described but not implemented or tested. | Do not release. Convert the description into code, config, or tests. |
| 2 | Implemented but weakly tested or hard to inspect. | Release only for low-risk internal use. |
| 3 | Implemented, tested, traceable, and owned. | Accept for the stated risk level. |

Score these areas: goal, boundary, autonomy split, tools, state, context, security, evaluation, observability, and operations. A production pattern should not have any `0` scores. A pattern that touches money, private data, infrastructure, customer communication, or durable memory should not have any `1` scores.

The point is not to create bureaucracy. The score prevents a common design-review failure: everyone agrees the idea is good, but nobody proves the boundary exists.

Use the downloadable [pattern evaluation scorecard](/capstone-assets/templates/pattern-evaluation-scorecard.txt) when the review must leave an auditable record. It captures the score, owner, evidence, release mode, blocking gaps, accepted risks, and next evidence for each area.

## Score Decision Path

Use this path during review. It turns the score into a release decision without hiding high-risk gaps behind a good average.

```mermaid
flowchart TD
    A[Score goal, boundary, autonomy, tools, state, context, security, evaluation, observability, and operations] --> B{Any score is 0?}
    B -->|Yes| X[Block release]
    B -->|No| C{Security, tools, approvals, or side effects score 1?}
    C -->|Yes| Y[Block production release]
    C -->|No| D{Average score}

    D -->|Below 2| P[Prototype only]
    D -->|2 to 2.5| I[Internal or low-risk pilot]
    D -->|Above 2.5| S[Staged production rollout]

    P --> E[Name missing evidence]
    I --> E
    S --> F{Incident or drift found?}
    F -->|Yes| R[Add regression eval before expanding rollout]
    F -->|No| G[Keep monitoring traces and score drift]
```

## Minimum Bar By Pattern Type

Different patterns need different proof.

| Pattern Type | Minimum Evaluation Guidance |
| --- | --- |
| Prompt chain | Validate each step output, gate transitions, and test malformed intermediate results. |
| Router | Test ambiguous requests, unsupported tasks, high-risk routes, and fallback behavior. |
| Agent loop | Test stop conditions, tool selection, recovery from bad observations, and budget exhaustion. |
| Tool-use pattern | Test forbidden tools, invalid arguments, idempotency, timeouts, and policy denials. |
| RAG or memory pattern | Test source relevance, stale evidence, missing evidence, citation coverage, and unsafe memory writes. |
| Evaluator or reflection pattern | Test false approvals, overcorrection, rubric ambiguity, and disagreement handling. |
| Multi-agent pattern | Test context isolation, permission isolation, merge accuracy, worker failure, and final accountability. |
| Human approval pattern | Test escalation criteria, approver visibility, timeout behavior, and audit records. |
| Production runtime pattern | Test replay, rollback, canary gates, incident-to-eval conversion, and operator diagnosis. |

## A Small Review Contract

For lightweight design reviews, keep the contract short:

```yaml
pattern: tool_using_agent
owned_goal: "Investigate refund eligibility from approved business systems."
model_decides:
  - "which allowed read tool to call next"
  - "whether evidence is sufficient for a recommendation"
software_decides:
  - "which tools exist"
  - "whether the caller is authorized"
  - "whether a side effect requires approval"
  - "when the run stops"
controls:
  max_steps: 6
  max_tool_calls: 8
  timeout_ms: 45000
  forbidden_tools:
    - refunds.issue_refund
    - support.send_customer_email
evals:
  blocking:
    - "does not issue refunds directly"
    - "returns needs_human when evidence is missing"
    - "cites policy before recommending refund"
operations:
  trace_fields:
    - task_id
    - trace_id
    - tool_calls
    - policy_denials
    - stop_reason
review_score:
  goal: 3
  boundary: 3
  autonomy_split: 2
  tools: 3
  state: 2
  context: 2
  security: 3
  evaluation: 2
  observability: 3
  operations: 2
release_decision: "internal pilot only until trajectory evals and replay are stronger"
```

The contract is intentionally plain. It should be easy to review in a pull request, easy to turn into tests, and easy to compare against a production trace.

## Release Decision Rules

Use these rules after scoring:

- Any `0`: block release.
- Any `1` on security, tools, approvals, or side effects: block production release.
- Average below 2: keep it as a prototype.
- Average 2-2.5: allow internal or low-risk pilot only.
- Average above 2.5 with no high-risk gaps: allow staged production rollout.
- Any incident involving the pattern: add a regression eval before expanding rollout.

If the team disagrees about a score, record the disagreement. A disagreement usually means the ownership boundary, evidence, or risk tolerance is still unclear.

## Common Failure Smells

Watch for these smells during pattern selection:

- The pattern has no single owner.
- The model owns permission checks.
- The loop stops only when the model says it is done.
- The tool list is broader than the task.
- Memory writes happen as a side effect of conversation.
- The eval checks only the final answer, not the trajectory.
- The trace cannot show why a tool was called.
- Multi-agent routing is used to hide unclear responsibilities.
- The fallback path is "ask the model again."
- Rollback requires manual reconstruction of prompts, tools, or policies.

These are not style problems. They are architecture problems.

## Design Rule

Choose the simplest pattern whose risks you can bound and whose behavior you can evaluate. If you cannot test the boundary, the boundary is not real yet.

## Related Chapters

- [Architecture Before Autonomy](./architecture-before-autonomy)
- [Choosing the Right Pattern](./choosing-the-right-pattern)
- [From Patterns To Systems](./from-patterns-to-systems)
- [Pattern Composition Playbook](./pattern-composition-playbook)
- [Evaluation-Driven Agent Development](../agent-engineering-practice/evaluation-driven-agent-development)
- [Agent Threat Model](../agent-engineering-practice/agent-threat-model)
- [Agents As Services](../systems-architecture/agents-as-services)
- [Choosing Multi-Agent Topology](../multi-agent-systems/choosing-multi-agent-topology)
- [Production Evaluation Feedback Loops](../production-runtime/production-evaluation-feedback-loops)
