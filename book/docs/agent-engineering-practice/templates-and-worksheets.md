---
title: Templates and Worksheets
---

# Templates and Worksheets

These templates turn the book's guidance into reviewable engineering artifacts. Use them when a lab becomes a product slice, when a team chooses a framework, or when an agent gains more authority.

Copy only the sections that matter. A short, complete decision record beats a long template with empty answers.

For filled examples, compare these templates with the [Capstone Projects](../capstone-projects/).

## Framework Selection ADR

Use this ADR when adopting LangGraph, AutoGen, Mastra, CrewAI, a mini-runtime, or another framework.

```md
# ADR-000: Choose [Framework] for [Agent or Workflow]

## Status

Proposed | Accepted | Superseded

## Context

What product problem are we solving?
What user-visible workflow will this framework host?
What constraints matter: language, deployment, compliance, team skills, latency, cost, or existing infrastructure?

## Decision

We will use [framework] for [scope].
The framework will own [state/control flow/tools/memory/evals/observability/deployment].
The application will still own [policy/domain data/security/approval/rollback].

## Alternatives Considered

| Option | Why It Fit | Why We Did Not Choose It |
| --- | --- | --- |
| Direct code / mini-runtime | | |
| LangGraph | | |
| AutoGen | | |
| Mastra | | |
| CrewAI | | |

## Responsibility Boundary

| Responsibility | Owner | Evidence |
| --- | --- | --- |
| State | framework/application/platform | schema, checkpoint, migration plan |
| Control flow | framework/application/platform | graph, workflow, team, flow, loop |
| Tools | framework/application/platform | manifest, schema, permission model |
| Policy | framework/application/platform | enforcement point before authority |
| Memory | framework/application/platform | retention, deletion, correction rules |
| Observability | framework/application/platform | trace schema and dashboard |
| Evals | framework/application/platform | fixtures, thresholds, CI gate |
| Deployment | framework/application/platform | runbook, rollback, kill switch |

## Vertical Slice Proof

- user request:
- state object:
- read tool:
- side-effect tool:
- policy decision:
- trace:
- eval:
- rollback:

## Acceptance Criteria

- local install and run commands are documented;
- state can be inspected and replayed;
- policy runs before side effects;
- evals fail the build for critical regressions;
- traces explain one failed run;
- rollback can disable the risky capability;
- framework-specific code does not hide product policy.

## Consequences

What gets easier?
What gets harder?
What lock-in or migration risk remains?
Which production incident would make us revisit this decision?

## Review Trigger

Review this ADR after model upgrade, framework upgrade, new write-capable tool, new memory type, production incident, or repeated human override.
```

## Production Readiness Worksheet

Use this worksheet before exposing the system to real users, real data, or real side effects.

| Gate | Answer | Evidence |
| --- | --- | --- |
| Owner | Who owns the runtime and incidents? | team, on-call, runbook |
| Scope | Which users, tenants, tools, data, and workflows are in scope? | ADR, service config |
| State | What state exists and where is it persisted? | schema, checkpoint store |
| Idempotency | Which actions can be retried safely? | idempotency keys, side-effect records |
| Tools | Which tools can be called and with what authority? | tool manifest, permission map |
| Policy | Where does policy run before authority? | enforcement code, tests |
| Approval | Which actions require approval? | approval schema, UI/API, expiry |
| Memory | What can be read or written? | retention, deletion, correction rules |
| Observability | Can one failed run be reconstructed? | trace dashboard, redaction proof |
| Evals | What blocks release? | eval fixtures, thresholds, CI output |
| Security | How are secrets, egress, and sandboxing handled? | secret manager, network policy |
| Rollback | How do we disable model, prompt, tool, workflow, or agent? | runbook, feature flag |
| Incident Loop | How do incidents become evals? | post-incident process |

Readiness rating:

```text
green: every high-authority path has evidence
yellow: limited internal or read-only release only
red: demo only; no real users, data, or side effects
```

## Lab-To-Production Checklist

Use this checklist after completing any hands-on lab.

```text
lab:
target product slice:
framework/language:
owner:

Architecture
[ ] Pattern selected and linked
[ ] Framework decision recorded
[ ] State owner named
[ ] Tool boundary defined
[ ] Policy boundary defined
[ ] Human approval boundary defined when needed

Implementation
[ ] Install command documented
[ ] Local run command documented
[ ] Test command documented
[ ] Eval command documented
[ ] .env.example committed
[ ] Secrets excluded from source
[ ] Tool schemas validated
[ ] Side effects use idempotency keys
[ ] Errors have typed outcomes

Production
[ ] Checkpoint or explicit stateless decision recorded
[ ] Trace schema implemented
[ ] Trace redaction implemented
[ ] Eval threshold defined
[ ] CI gate configured
[ ] Rollback path documented
[ ] Kill switch tested
[ ] Runbook created

Evidence
[ ] Test output attached
[ ] Eval output attached
[ ] Example trace attached
[ ] ADR linked
[ ] Owner accepted residual risk
```

If a checked item has no evidence, leave it unchecked.

## Release Gate Checklist

Use this gate for each production release.

| Check | Required Before Release |
| --- | --- |
| Prompt/model changed | run task, refusal, policy, tool, and cost evals |
| Tool changed | run authorization, schema, idempotency, and error evals |
| Policy changed | run false-allow, false-deny, approval, and escalation evals |
| Memory changed | run read-scope, write-policy, deletion, and correction evals |
| Retrieval changed | run access, freshness, citation, and missing-evidence evals |
| Runtime changed | run retry, cancellation, checkpoint, and trace completeness evals |

Release decision:

```text
release version:
change type:
eval dataset version:
passing threshold:
actual result:
known failures:
approved by:
rollback owner:
rollback command:
```

## Incident-To-Eval Worksheet

Use this after production incidents, near misses, or serious human overrides.

```text
incident ID:
date:
service:
trace ID:
owner:

What happened?

Which boundary failed?
[ ] state
[ ] tool
[ ] policy
[ ] approval
[ ] memory
[ ] retrieval
[ ] model/prompt
[ ] workflow
[ ] observability
[ ] eval gate

What should have happened?

New eval case:
input:
expected trajectory:
expected tool behavior:
expected policy behavior:
expected output:
blocking threshold:

Release rule:
[ ] blocks future release
[ ] warning only
[ ] monitor only

Follow-up:
code change:
policy change:
runbook change:
ADR update:
owner:
due date:
```

An incident that does not produce an eval, a policy change, or a runbook update is likely to repeat.

## Related Chapters

- [Framework Selection](./framework-selection)
- [Real Framework Setup Notes](./real-framework-setup-notes)
- [Cross-Framework Decision Matrix](./cross-framework-decision-matrix)
- [Architecture Decision Records for Agents](../systems-architecture/architecture-decision-records)
- [Deployment Walkthrough](../production-runtime/deployment-walkthrough)
- [Lab Production Readiness Checklist](../hands-on-labs/production-readiness-checklist)
