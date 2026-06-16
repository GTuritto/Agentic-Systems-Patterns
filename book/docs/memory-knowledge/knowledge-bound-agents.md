---
title: Knowledge-Bound Agents
---

# Knowledge-Bound Agents

Knowledge-bound agents ground answers and actions in approved sources, policies, and citation rules.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/compliance-policy-enforcer-agent)
> - [Download code bundle](/downloads/knowledge-bound-agents.zip)

## Intent

Knowledge-bound agents ground answers and actions in approved sources, policies, and citation rules.

## Use When

- The domain requires approved sources, citations, or compliance constraints.
- The agent should refuse or escalate when evidence is missing.
- Freshness and source trust matter.

## Avoid When

- The agent is allowed to speculate freely.
- Approved sources cannot be identified or updated.
- Policy checks happen only after irreversible actions.

## System Shape

- **Pattern boundary:** a retrieval or memory boundary decides what information enters context and what new information can be stored.
- **State owner:** the memory or retrieval layer owns long-lived knowledge, while the agent owns task-local working state.
- **Primary artifact:** `compliance-policy-enforcer-agent/` contains the runnable reference implementation and examples.
- **Operational promise:** Knowledge-bound agents ground answers and actions in approved sources, policies, and citation rules.

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

- [Download source bundle](/downloads/knowledge-bound-agents.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/compliance-policy-enforcer-agent)

The download bundle contains the current `compliance-policy-enforcer-agent/` folder from this repository.

## Related Patterns

- [Memory-Augmented Agent](/memory-knowledge/memory-augmented-agent)
- [Long-Term Episodic Memory](/memory-knowledge/long-term-episodic-memory)
- [Semantic Recall and RAG](/memory-knowledge/semantic-recall-rag)
- [Choosing the Right Pattern](/pattern-selection/choosing-the-right-pattern)
- [Resource-Aware Agent Design](/pattern-selection/resource-aware-agent-design)
