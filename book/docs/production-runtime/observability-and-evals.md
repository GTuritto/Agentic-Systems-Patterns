---
title: Observability and Evals
---

# Observability and Evals

Observability records what happened. Evals decide whether behavior is good enough.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/observability-and-evals-pattern)
> - [Download code bundle](/downloads/observability-and-evals.zip)

## Intent

The Observability and Evals Pattern makes agent behavior inspectable and testable. It captures traces, tool calls, prompts, model outputs, costs, latencies, and evaluation results so teams can debug and improve systems over time.

## Use When

- Agent decisions affect users, money, data, or external systems.
- You need regression tests for prompts, tools, routing, or workflows.
- Failures are hard to reproduce from final answers alone.

## Avoid When

- You cannot store traces safely because of privacy or regulatory constraints.
- The prototype is throwaway and has no operational users.
- You only log final answers and call that observability.

## Architecture

![Observability and evals architecture](../public/diagrams/observability-evals.svg)

## System Shape

- **Pattern boundary:** a production service or framework hosts the agent behind durable workflow, policy, observability, and deployment boundaries.
- **State owner:** the runtime owns durable state, retries, traces, triggers, deployment configuration, and operational controls.
- **Primary artifact:** `observability-and-evals-pattern/` contains the runnable reference implementation and examples.
- **Operational promise:** Observability records what happened. Evals decide whether behavior is good enough.

## Core Protocol

1. Receive a user request, event, schedule, or workflow step with an idempotency key.
2. Load durable state, policy context, memory, and runtime configuration.
3. Execute one bounded step through the agent, tool, or workflow engine.
4. Checkpoint result, trace data, cost, and error state.
5. Retry, compensate, continue, or escalate according to operational policy.

## Implementation Notes

- Trace at the level of run, loop iteration, model call, tool call, workflow step, and evaluator result.
- Store enough input/output detail to reproduce failures, with redaction for sensitive data.
- Maintain golden datasets for routing, structured outputs, tool plans, and final answers.
- Treat eval failures as release blockers for production agents.

## Failure Modes

- Logs that omit the prompt, tool input, or model configuration.
- Evals that only check happy paths.
- Metrics without trace IDs, making incidents hard to investigate.
- Storing sensitive data without retention or redaction rules.

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

- [Download source bundle](/downloads/observability-and-evals.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/observability-and-evals-pattern)

The download bundle contains the current `observability-and-evals-pattern/` folder from this repository.

## Related Patterns

- [Evaluator-Optimizer](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/evaluator-optimizer-pattern/README.md)
- [Mastra Runtime](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/mastra-runtime-pattern/README.md)
- [Compliance/Policy Enforcer](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/compliance-policy-enforcer-agent/README.md)
