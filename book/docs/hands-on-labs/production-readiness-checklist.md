---
title: Lab Production Readiness Checklist
---

# Lab Production Readiness Checklist

The labs are teaching implementations. This checklist defines what must be added before a lab pattern becomes production work.

Use this after completing a lab. The goal is to identify the next engineering boundary: persistence, authorization, retries, idempotency, observability, eval gates, deployment, and rollback. For the full production path, continue with [Deployment Walkthrough](../production-runtime/deployment-walkthrough) and [Templates and Worksheets](../agent-engineering-practice/templates-and-worksheets).

## Universal Production Gate

Every lab needs these controls before real users, real data, or real side effects:

| Gate | Required Evidence |
| --- | --- |
| State ownership | State schema, owner, persistence strategy, migration plan, and replay story. |
| Auth and permissions | Actor identity, tenant/resource scope, tool permissions, approval rules, and audit records. |
| Tool safety | Input schemas, side-effect class, idempotency key, timeout, retry policy, and error contract. |
| Memory safety | Retention, deletion, redaction, consent, correction path, and write policy. |
| Observability | Trace IDs, model/tool events, policy decisions, costs, latency, stop reasons, and redaction. |
| Eval gates | Golden tasks, negative cases, trajectory checks, safety checks, and release-blocking thresholds. |
| Deployment | Runtime owner, environment config, secrets, scaling limits, rollback, kill switch, and incident path. |
| Human control | Approval UI/API, escalation rules, cancellation, reviewer identity, and expiry. |

## Per-Lab Readiness Matrix

| Lab | Production Additions |
| --- | --- |
| Lab 01 - Tool-Using Agent | Tool schemas, side-effect labels, permission checks, idempotency, timeout/retry, and audit records. |
| Lab 02 - Agent Loop and Planning | Durable state, plan versioning, step retry policy, cancellation, partial failure handling, and plan evals. |
| Lab 03 - Agentic RAG | Source ACLs, freshness, citation checks, retrieval evals, prompt-injection filtering, and evidence retention rules. |
| Lab 04 - A2A Communication | Agent identity, signed envelopes, correlation IDs, cancellation semantics, schema versioning, and replay logs. |
| Lab 05 - Multi-Agent Supervisor | Worker contracts, merge policy, per-worker traces, disagreement handling, final acceptance owner, and cost caps. |
| Lab 06 - Observability and Evals | Trace storage, redaction, eval datasets, release thresholds, incident-to-eval workflow, and dashboard ownership. |
| Lab 07 - Mastra Runtime Packaging | Deployment config, tool/memory policy, workflow retries, eval integration, trace export, and framework upgrade plan. |
| Lab 08 - CrewAI Flows and Crews | Flow checkpoints, role permissions, task schemas, crew output validators, human escalation, and flow acceptance evals. |
| Lab 09 - Minimal Agent Loop | Decision validation, tool registry, stop policy, state persistence, timeout/cancellation, and trace events. |
| Lab 10 - Tool Registry and Policy Gate | Policy context, approval records, schema validation, side-effect isolation, idempotency, and denial analytics. |
| Lab 11 - Context, Memory, Trace, and Evals | Memory governance, trace redaction, eval fixture versioning, context audit, and incident replay. |
| Lab 12 - LangGraph State Graph | Durable checkpointer, thread IDs, interrupt payloads, node idempotency, state migrations, and resume tests. |
| Lab 13 - AutoGen Transcript Evals | Message schemas, team termination, transcript redaction, role permissions, transcript replay, and team-level eval gates. |

## Framework-Specific Deployment Questions

| Framework Shape | Production Questions |
| --- | --- |
| LangGraph-style | Where is the checkpointer stored? How are thread IDs assigned? Which nodes can cause side effects? What state migrations are supported? |
| AutoGen-style | Who owns the transcript? Which messages are durable? How does termination work? How are agent tools permissioned? |
| Mastra-style | Which runtime features are framework-owned? How are workflows deployed? How are tools, memory, traces, and evals exported? |
| CrewAI-style | What does the flow own? What does the crew own? How are role outputs validated? How are crew failures escalated? |
| Mini-runtime | Which production controls are you willing to build and operate yourself? Which should move into an existing workflow platform? |

## Release Gate Template

Before shipping a lab-derived system, require:

```text
state: persisted or explicitly stateless
policy: enforced before side effects
tools: typed, scoped, idempotent, timed out
memory: governed by retention/deletion rules
trace: redacted and replayable
evals: include happy path, negative path, and trajectory checks
deployment: rollback and kill switch documented
owner: team and escalation path assigned
```

If any line is unknown, the system is still a demo.

## Related Chapters

- [Cross-Framework Decision Matrix](../agent-engineering-practice/cross-framework-decision-matrix)
- [Framework Selection](../agent-engineering-practice/framework-selection)
- [Real Framework Setup Notes](../agent-engineering-practice/real-framework-setup-notes)
- [Templates and Worksheets](../agent-engineering-practice/templates-and-worksheets)
- [Production Runtime Overview](../production-runtime/overview)
- [Deployment Walkthrough](../production-runtime/deployment-walkthrough)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Observability and Evals](../production-runtime/observability-and-evals)
