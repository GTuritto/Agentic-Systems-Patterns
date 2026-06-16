---
title: Durable Workflows
---

# Durable Workflows

Durable workflows make agentic systems resumable and auditable by owning retries, checkpoints, approvals, compensation, and long-running state.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/durable-workflow-pattern)
> - [Download code bundle](/downloads/durable-workflows.zip)

## Intent

The Durable Workflow Pattern wraps agent steps in a resumable execution model. The workflow owns ordering, retries, persisted state, approvals, and compensation; agents perform bounded work inside workflow steps.

## Use When

- Work spans minutes, hours, or external approvals.
- Tool calls may fail and must be retried safely.
- You need auditability, resumability, and operational control.

## Avoid When

- The task is a short interactive chat response.
- State does not need to survive process restarts.
- The workflow engine would add more complexity than the task deserves.

## Architecture

![Durable workflow architecture](../public/diagrams/durable-workflow.svg)

## System Shape

- **Pattern boundary:** a production service or framework hosts the agent behind durable workflow, policy, observability, and deployment boundaries.
- **State owner:** the runtime owns durable state, retries, traces, triggers, deployment configuration, and operational controls.
- **Primary artifact:** `durable-workflow-pattern/` contains the runnable reference implementation and examples.
- **Operational promise:** Durable workflows make agentic systems resumable and auditable by owning retries, checkpoints, approvals, compensation, and long-running state.

## Core Protocol

1. Receive a user request, event, schedule, or workflow step with an idempotency key.
2. Load durable state, policy context, memory, and runtime configuration.
3. Execute one bounded step through the agent, tool, or workflow engine.
4. Checkpoint result, trace data, cost, and error state.
5. Retry, compensate, continue, or escalate according to operational policy.

## Implementation Notes

- Persist state after every externally visible action.
- Make steps idempotent or attach idempotency keys to tool calls.
- Separate orchestration state from model conversation state.
- Model calls should be retryable only when repeating them cannot duplicate side effects.

## Failure Modes

- Retrying side-effectful steps without idempotency.
- Losing human approval state after deployment or restart.
- Workflows that hide agent uncertainty behind a successful task status.
- No compensation path for partially completed external actions.

## Evaluation Strategy

- Replay production-like traces through regression evals before deployment.
- Test retries, duplicate events, partial outages, policy denial, and human approval waits.
- Measure reliability, recovery time, cost, latency, user impact, and eval regression rate.
- Include cases that prove each "Use When" condition is true for this pattern.
- Include negative cases from "Avoid When" so the system chooses a simpler or safer pattern when appropriate.

## Production Checklist

- Use durable checkpoints for long-running or externally visible work.
- Add structured traces, metrics, cost tracking, and replay data.
- Define deployment rollback and feature-flag strategy.
- Document operational ownership, alerts, and escalation paths.
- Define human escalation for ambiguous, high-risk, or policy-blocked work.
- Keep the source bundle, generated chapter, tests, and deployment artifact in the same release.

## Code Walkthrough

Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.

## Source Code

This pattern currently has no dedicated code excerpt. Use the source and download links below for the full pattern folder.

## Download

- [Download source bundle](/downloads/durable-workflows.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/durable-workflow-pattern)

The download bundle contains the current `durable-workflow-pattern/` folder from this repository.

## Related Patterns

- [Goals and State](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/goals-and-state-pattern/README.md)
- [Self-Healing Workflow](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/self-healing-workflow-agent-pattern/README.md)
- [Human-in-the-Loop Approval](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/human-in-the-loop-approval-agent/README.md)
