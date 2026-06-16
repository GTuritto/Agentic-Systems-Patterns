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

## System Shape

- **Pattern boundary:** a retrieval or memory boundary decides what information enters context and what new information can be stored.
- **State owner:** the memory or retrieval layer owns long-lived knowledge, while the agent owns task-local working state.
- **Primary artifact:** `long-term-episodic-memory-agent-pattern/` contains the runnable reference implementation and examples.
- **Operational promise:** Long-term episodic memory stores events: what happened, when, who was involved, and why it mattered.

## Core Protocol

1. Classify the information need: working state, episodic memory, semantic knowledge, policy, or source evidence.
2. Retrieve only scoped, relevant, and permitted material.
3. Inject retrieved material with source labels, freshness, and trust level.
4. Generate or act while keeping retrieved evidence separate from instructions.
5. Write back memory only after validation, consent, retention, and correction rules pass.

## Implementation Notes

- Keep the pattern boundary explicit: inputs, state, side effects, and outputs should be visible.
- Validate model-produced decisions before they affect tools, users, or durable state.
- Emit enough trace data to debug failures after the run.

## Failure Modes

- The pattern is applied where a simpler deterministic workflow would be better.
- State, tool calls, or model decisions are not observable enough to debug.
- The system lacks clear stop, retry, or escalation behavior.

## Evaluation Strategy

- Use questions with known source answers, stale sources, conflicting sources, and missing evidence.
- Measure recall, precision, citation faithfulness, freshness, and refusal when evidence is absent.
- Test deletion, correction, and privacy boundaries separately from answer quality.
- Include cases that prove each "Use When" condition is true for this pattern.
- Include negative cases from "Avoid When" so the system chooses a simpler or safer pattern when appropriate.

## Production Checklist

- Define retention, deletion, correction, and consent rules.
- Separate instructions from retrieved facts and user memories.
- Record source IDs and retrieval scores for audit and debugging.
- Add guards against prompt injection from retrieved documents.
- Define human escalation for ambiguous, high-risk, or policy-blocked work.
- Keep the source bundle, generated chapter, tests, and deployment artifact in the same release.

## Code Walkthrough

Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.

## Source Code

This pattern currently has no dedicated code excerpt. Use the source and download links below for the full pattern folder.

## Download

- [Download source bundle](/downloads/long-term-episodic-memory.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/long-term-episodic-memory-agent-pattern)

The download bundle contains the current `long-term-episodic-memory-agent-pattern/` folder from this repository.

## Related Patterns

- [Memory-Augmented Agent](/memory-knowledge/memory-augmented-agent)
- [Semantic Recall and RAG](/memory-knowledge/semantic-recall-rag)
- [Working Memory](/memory-knowledge/working-memory)
- [Choosing the Right Pattern](/pattern-selection/choosing-the-right-pattern)
- [Resource-Aware Agent Design](/pattern-selection/resource-aware-agent-design)
