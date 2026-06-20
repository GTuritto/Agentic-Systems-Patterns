---
title: Deployment Walkthrough
---

# Deployment Walkthrough

This walkthrough turns a lab-derived agent into a production candidate. It is framework-agnostic: the same gates apply whether the implementation uses direct TypeScript, Python, LangGraph, AutoGen, Mastra, CrewAI, or a custom mini-runtime.

The goal is not to deploy faster. The goal is to deploy with enough control that the team can inspect, stop, replay, and improve the system after real users arrive.

## Scope

Use this walkthrough for systems that can read private data, call tools, write memory, send messages, create drafts, execute workflow steps, or influence business decisions.

For throwaway demos, keep the process lighter. For production, do not skip the gates that match the system's authority.

## 1. Local Development

Local development should prove the runtime contract before cloud infrastructure exists.

Required local evidence:

| Evidence | Required Proof |
| --- | --- |
| install | clean checkout can install dependencies |
| run | one command executes the vertical slice |
| test | unit and trajectory tests pass |
| eval | at least one release-blocking eval runs locally |
| trace | local run emits structured trace events |
| cleanup | local state and temporary data can be removed |

Suggested local commands:

```sh
npm test
npm run typecheck
npm run book:build
```

For Python framework variants, add the project-specific virtual environment, install, test, and eval commands to the lab README.

## 2. Configuration And Secrets

Configuration should make deployment behavior explicit without exposing secrets.

Use these environment groups:

| Group | Examples |
| --- | --- |
| model provider | `OPENAI_API_KEY`, model name, timeout, retry limit |
| runtime | environment, region, service name, release version |
| storage | checkpoint store URL, trace store URL, memory store URL |
| policy | policy version, approval mode, disabled capabilities |
| observability | trace export endpoint, sampling mode, redaction mode |
| evals | eval dataset version, release threshold, failure mode |

Rules:

- commit `.env.example`, not `.env`;
- keep secrets in the deployment platform's secret manager;
- fail startup when required secrets are missing;
- log which configuration version loaded, not secret values;
- treat prompt, model, tool, policy, and eval versions as release inputs.

## 3. Persistence And Checkpointing

Persistence depends on authority. A read-only answer can often be stateless. A workflow that waits for approval, retries tools, or creates side effects needs durable state.

Choose the minimum persistence boundary that supports recovery:

| Need | Persistence Boundary |
| --- | --- |
| request-only answer | request log plus trace |
| conversation continuity | thread state or conversation store |
| human approval wait | checkpoint plus approval record |
| tool side effect | idempotency key plus side-effect record |
| long-running workflow | workflow state plus step checkpoints |
| memory | governed memory store with retention and deletion |

Checkpoint every externally visible step:

1. accepted request;
2. planned action;
3. policy decision;
4. approval request or approval result;
5. tool call attempt;
6. side-effect result;
7. final response;
8. eval or post-run quality result.

Retries should read the checkpoint and decide whether to continue, compensate, or stop. They should not replay side effects blindly.

## 4. Observability Export

Agent observability must explain one run and aggregate many runs.

Export these events:

| Event | Required Fields |
| --- | --- |
| run | trace ID, run ID, actor, tenant, environment, release |
| model | model, prompt version, input reference, output status, tokens, cost, latency |
| tool | tool name, redacted arguments, authorization, status, retry count, idempotency key |
| retrieval | source IDs, freshness, access decision, citation requirements |
| memory | read IDs, write IDs, retention class, policy basis |
| policy | policy version, decision, reason code, enforcement effect |
| approval | approver role, exact action, expiry, result |
| eval | case ID, evaluator version, score, threshold, pass/fail |

Do not store raw secrets, credentials, payment data, or private content unless the retention policy explicitly allows it. Prefer references to encrypted records when raw content is not needed for debugging.

## 5. Eval Gate In CI

CI should block risky changes before deployment.

Tie eval subsets to change type:

| Change | Blocking Eval |
| --- | --- |
| prompt | task success, schema validity, policy compliance |
| model | task success, refusal behavior, tool argument quality, cost |
| tool | authorization, idempotency, error handling |
| retrieval | source access, freshness, citation correctness |
| memory | read scope, write policy, deletion behavior |
| workflow | route correctness, retry, cancellation, resume |
| policy | false allow, false deny, approval routing |

A minimal CI gate should run:

```sh
npm test
npm run typecheck
```

Add project-specific eval commands next to the implementation. The gate should fail closed: if the eval dataset cannot load, the release should stop.

## 6. Rollout

Roll out by capability, not by hope.

Use stages:

1. local run with deterministic fixtures;
2. staging run with synthetic data;
3. internal run with read-only authority;
4. limited tenant or cohort;
5. expanded traffic with dashboards and alerts;
6. full release after trace and eval review.

At each stage, record:

- release version;
- model and prompt version;
- tool schema version;
- policy version;
- eval dataset version;
- trace export status;
- rollback owner.

## 7. Rollback And Kill Switch

Every production agent needs a fast disable path.

Define kill switches at several layers:

| Layer | Disable Action |
| --- | --- |
| model | route to previous model or deterministic fallback |
| prompt | revert prompt version |
| tool | disable one capability in the tool registry |
| memory | disable writes while keeping reads available if safe |
| workflow | pause new runs and let safe in-flight runs finish |
| policy | change risky actions to approval-required or denied |
| agent | route traffic back to human or deterministic workflow |

Rollback should not require a code deploy for common failures. Tool disablement, model rollback, prompt rollback, and policy tightening should be operational controls.

## 8. Production Runbook

Create a runbook before launch.

Minimum runbook:

```text
service:
owner:
on-call:
runtime:
framework:
release:
model versions:
prompt versions:
tool registry:
policy version:
memory stores:
checkpoint stores:
trace dashboard:
eval dashboard:
known failure modes:
rollback command:
kill switch:
incident channel:
post-incident eval process:
```

The runbook should link to the framework selection ADR, production readiness worksheet, eval suite, and deployment dashboard.

## Framework-Specific Deployment Notes

| Framework Shape | Deployment Note |
| --- | --- |
| LangGraph | Use persistent checkpointers for approval waits, resume, and fault tolerance. Treat thread ID as sensitive state. |
| AutoGen | Persist transcripts with redaction and termination metadata. Evaluate role behavior, not only final output. |
| Mastra | Keep TypeScript runtime packaging explicit: agents, workflows, tools, memory, evals, and trace export need ownership. |
| CrewAI | Keep Flow state separate from Crew-local collaboration. Validate crew output before the Flow accepts it. |
| Mini-runtime | Use the deployment process to decide which production controls you must build yourself and which should move into platform infrastructure. |

## Complete When

The system is deployable when:

- local setup is reproducible;
- secrets and config are separated;
- persistence matches authority;
- traces are exported and redacted;
- evals block risky changes;
- rollout stages are documented;
- rollback works without code changes for common failures;
- the runbook names owners, dashboards, and incident actions.

Until then, the system may be useful, but it is not production-ready.
