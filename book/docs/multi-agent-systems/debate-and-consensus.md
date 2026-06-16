---
title: Debate and Consensus
---

# Debate and Consensus

Debate and consensus use multiple independent proposals, critiques, votes, or rankings before producing a final answer.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/consensus-seeking-multi-agent-system-pattern)
> - [Download code bundle](/downloads/debate-and-consensus.zip)

## Intent

Debate and consensus use multiple independent proposals, critiques, votes, or rankings before producing a final answer.

## Use When

- Diversity of reasoning improves quality.
- Aggregation rules are clear before agents start.
- The system can tolerate extra cost and latency.

## Avoid When

- Agents are not independent and will repeat the same failure.
- Voting replaces evidence or tests.
- The final decision has no accountable owner.

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

- [Download source bundle](/downloads/debate-and-consensus.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/consensus-seeking-multi-agent-system-pattern)

The download bundle contains the current `consensus-seeking-multi-agent-system-pattern/` folder from this repository.
