---
title: Self-Healing Workflows
---

# Self-Healing Workflows

Self-healing workflows detect failed steps and recover through retry, fallback, re-planning, or escalation.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/self-healing-workflow-agent-pattern)
> - [Download code bundle](/downloads/self-healing-workflows.zip)

## Intent

Self-healing workflows detect failed steps and recover through retry, fallback, re-planning, or escalation.

## Use When

- Failures are expected and can be classified.
- The workflow can retry idempotently or compensate safely.
- Recovery policies are explicit and observable.

## Avoid When

- Every failure requires human judgment.
- Retries can duplicate side effects.
- The system would call a model again without new information.

## Implementation Notes

- Keep the pattern boundary explicit: inputs, state, side effects, and outputs should be visible.
- Validate model-produced decisions before they affect tools, users, or durable state.
- Emit enough trace data to debug failures after the run.

## Failure Modes

- The pattern is applied where a simpler deterministic workflow would be better.
- State, tool calls, or model decisions are not observable enough to debug.
- The system lacks clear stop, retry, or escalation behavior.

## Code Walkthrough

Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.

## Source Code

This pattern currently has no dedicated code excerpt. Use the source and download links below for the full pattern folder.

## Download

- [Download source bundle](/downloads/self-healing-workflows.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/self-healing-workflow-agent-pattern)

The download bundle contains the current `self-healing-workflow-agent-pattern/` folder from this repository.
