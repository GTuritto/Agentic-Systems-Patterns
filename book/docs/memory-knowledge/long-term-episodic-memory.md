---
title: Long-Term Episodic Memory
---

# Long-Term Episodic Memory

Long-term episodic memory stores events: what happened, when, who was involved, and why it mattered.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/long-term-episodic-memory-agent-pattern)
> - [Download code bundle](/downloads/long-term-episodic-memory.zip)

## Intent

Long-term episodic memory stores events: what happened, when, who was involved, and why it mattered.

## Use When

- The assistant needs continuity across sessions.
- Events can be retrieved by relevance, recency, user, and project scope.
- You can enforce retention, privacy, and correction policies.

## Avoid When

- The task only needs semantic facts, not event history.
- The system cannot explain or delete remembered events.

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

- [Download source bundle](/downloads/long-term-episodic-memory.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/long-term-episodic-memory-agent-pattern)

The download bundle contains the current `long-term-episodic-memory-agent-pattern/` folder from this repository.
