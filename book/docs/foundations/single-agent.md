---
title: Single Agent
---

# Single Agent

A single agent receives a goal or message, consults its context, and produces an answer or action. This is the smallest useful unit in the catalog.

Use it when one model-backed worker can complete the task without delegation, durable orchestration, or protocol-level interoperability.

Avoid it when the task needs stateful retries, external approvals, multiple specialists, or independent evaluation.

Source: [`single-agent-pattern`](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/single-agent-pattern)
