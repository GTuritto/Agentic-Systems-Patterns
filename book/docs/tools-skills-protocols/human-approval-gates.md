---
title: Human Approval Gates
---

# Human Approval Gates

Human approval gates pause execution before sensitive, expensive, destructive, or externally visible actions.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/human-in-the-loop-approval-agent)
> - [Download code bundle](/downloads/human-approval-gates.zip)

## Intent

Human approval gates pause execution before sensitive, expensive, destructive, or externally visible actions.

## Use When

- The agent may trigger irreversible or high-risk actions.
- A human must review context before continuation.
- The workflow can preserve state while waiting.

## Avoid When

- Every step requires approval and the agent adds no value.
- Approval records cannot capture who approved what and why.
- The workflow cannot safely resume after waiting.

## System Shape

- **Pattern boundary:** the agent discovers or selects a capability, submits a typed request, and receives a typed result across a policy boundary.
- **State owner:** the protocol or capability boundary owns schemas, permissions, invocation records, and response validation.
- **Primary artifact:** `human-in-the-loop-approval-agent/` contains the runnable reference implementation and examples.
- **Operational promise:** Human approval gates pause execution before sensitive, expensive, destructive, or externally visible actions.

## Core Protocol

1. Discover the capability, schema, permissions, and operating constraints.
2. Prepare a typed request from the current goal and state.
3. Authorize the request before invocation.
4. Invoke the tool, skill, or remote agent and validate the result.
5. Return structured output, refusal, progress, or error without losing correlation IDs.

## Implementation Notes

- Keep the pattern boundary explicit: inputs, state, side effects, and outputs should be visible.
- Validate model-produced decisions before they affect tools, users, or durable state.
- Emit enough trace data to debug failures after the run.

## Failure Modes

- The pattern is applied where a simpler deterministic workflow would be better.
- State, tool calls, or model decisions are not observable enough to debug.
- The system lacks clear stop, retry, or escalation behavior.

## Evaluation Strategy

- Test valid calls, invalid arguments, unauthorized calls, timeouts, refusals, and malformed responses.
- Assert that dangerous actions require approval or are blocked before execution.
- Measure tool-selection accuracy, schema validity, authorization failures, and recovery behavior.
- Include cases that prove each "Use When" condition is true for this pattern.
- Include negative cases from "Avoid When" so the system chooses a simpler or safer pattern when appropriate.

## Production Checklist

- Use typed schemas for inputs and outputs.
- Separate model intent from actual execution permissions.
- Add timeouts, retries, idempotency keys, and audit records.
- Treat refusal and cancellation as first-class outcomes.
- Define human escalation for ambiguous, high-risk, or policy-blocked work.
- Keep the source bundle, generated chapter, tests, and deployment artifact in the same release.

## Code Walkthrough

Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.

## Source Code

This pattern currently has no dedicated code excerpt. Use the source and download links below for the full pattern folder.

## Download

- [Download source bundle](/downloads/human-approval-gates.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/human-in-the-loop-approval-agent)

The download bundle contains the current `human-in-the-loop-approval-agent/` folder from this repository.

## Related Patterns

- [Skills](/tools-skills-protocols/skills)
- [MCP-first Tool Use](/tools-skills-protocols/mcp-first-tool-use)
- [A2A Agent Interoperability](/tools-skills-protocols/a2a-agent-interoperability)
- [Choosing the Right Pattern](/pattern-selection/choosing-the-right-pattern)
- [Resource-Aware Agent Design](/pattern-selection/resource-aware-agent-design)
