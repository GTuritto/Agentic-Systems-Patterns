---
title: Event-Triggered Agents
---

# Event-Triggered Agents

Event-triggered agents run in response to webhooks, queues, schedules, or domain events.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/event-triggered-agent-pattern)
> - [Download code bundle](/downloads/event-triggered-agents.zip)

## Intent

Event-triggered agents run in response to webhooks, queues, schedules, or domain events.

## Use When

- A domain event should start bounded agent work.
- The task can be idempotent and observable.
- No human may be watching the interaction live.

## Avoid When

- The event payload lacks enough context to act safely.
- Duplicate delivery could cause duplicate side effects.
- Failures cannot be retried or dead-lettered.

## System Shape

- **Pattern boundary:** a production service or framework hosts the agent behind durable workflow, policy, observability, and deployment boundaries.
- **State owner:** the runtime owns durable state, retries, traces, triggers, deployment configuration, and operational controls.
- **Primary artifact:** `event-triggered-agent-pattern/` contains the runnable reference implementation and examples.
- **Operational promise:** Event-triggered agents run in response to webhooks, queues, schedules, or domain events.

## Core Protocol

1. Receive a user request, event, schedule, or workflow step with an idempotency key.
2. Load durable state, policy context, memory, and runtime configuration.
3. Execute one bounded step through the agent, tool, or workflow engine.
4. Checkpoint result, trace data, cost, and error state.
5. Retry, compensate, continue, or escalate according to operational policy.

## Implementation Notes

- Keep the pattern boundary explicit: inputs, state, side effects, and outputs should be visible.
- Validate model-produced decisions before they affect tools, users, or durable state.
- Emit enough trace data to debug failures after the run.

## Failure Modes

- The pattern is applied where a simpler deterministic workflow would be better.
- State, tool calls, or model decisions are not observable enough to debug.
- The system lacks clear stop, retry, or escalation behavior.

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

- [Download source bundle](/downloads/event-triggered-agents.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/event-triggered-agent-pattern)

The download bundle contains the current `event-triggered-agent-pattern/` folder from this repository.

## Related Patterns

- [Durable Workflows](/production-runtime/durable-workflows)
- [Observability and Evals](/production-runtime/observability-and-evals)
- [Policy Enforcement](/production-runtime/policy-enforcement)
- [Choosing the Right Pattern](/pattern-selection/choosing-the-right-pattern)
- [Resource-Aware Agent Design](/pattern-selection/resource-aware-agent-design)
