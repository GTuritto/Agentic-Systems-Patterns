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

- [Download source bundle](/downloads/human-approval-gates.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/human-in-the-loop-approval-agent)

The download bundle contains the current `human-in-the-loop-approval-agent/` folder from this repository.
