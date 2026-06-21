---
title: Capstone Projects
---

# Capstone Projects

The capstones show how the patterns combine into product-shaped systems. Each capstone starts from a concrete workflow, chooses the right agentic boundaries, maps the design across frameworks, and defines the production evidence required before release.

Use these chapters after the labs. The labs isolate one pattern at a time. The capstones combine patterns into systems with state, tools, policy, memory, observability, evals, deployment, rollback, ownership, and selected native framework slices.

## Capstone Set

| Capstone | Primary Goal | Main Patterns | Framework Lens |
| --- | --- | --- | --- |
| [Support Refund Agent](./support-refund-agent) | Draft policy-safe refund recommendations. | Tool use, policy enforcement, approval gates, observability, evals. | Mastra runtime, LangGraph workflow, mini-runtime, native Mastra and LangGraph slices. |
| [Research RAG Agent](./research-rag-agent) | Answer from approved sources with citations and memory rules. | Context engineering, semantic recall, knowledge-bound agents, memory, evals. | LangGraph graph, direct Python/TypeScript, Mastra runtime, native LangGraph slice. |
| [Multi-Agent Delivery Workflow](./multi-agent-delivery-workflow) | Coordinate specialist agents while preserving one accountable owner. | Supervisor/worker, CrewAI flows, AutoGen transcripts, durable workflows. | CrewAI, AutoGen, LangGraph, Mastra, native CrewAI and AutoGen slices. |

## Run The Capstones

The capstones include deterministic TypeScript assets so readers can inspect state, traces, evals, and rollback behavior without model provider keys.

```sh
npm run capstones:demo
npm run capstones:test
```

Source:

- `capstone-projects-runtime/typescript/src/capstones.ts`
- `capstone-projects-runtime/typescript/test/capstones.spec.ts`

## What Each Capstone Proves

Each capstone includes:

- problem and non-goals;
- pattern composition;
- system architecture;
- data and state model;
- tool, policy, memory, and approval boundaries;
- native framework mapping;
- native framework example path where one exists;
- trace example;
- eval report example;
- ADR example;
- runbook example;
- release and rollback checklist.

The repeated structure matters. It gives readers a reusable design review shape: if a future project cannot fill these sections, it is not ready for production.

## Capstone Completion Standard

A capstone is complete only when it can answer these questions:

| Question | Required Evidence |
| --- | --- |
| What owns state? | State schema, checkpoint plan, migration note. |
| What owns authority? | Tool manifest, policy decision, approval rule. |
| What proves quality? | Eval cases, thresholds, failure examples. |
| What proves observability? | Trace event sequence and required fields. |
| What proves production readiness? | Deployment notes, runbook, rollback path. |
| What proves portability? | Framework mapping and assets kept outside framework-only code. |

Do not treat a capstone as a larger lab. Treat it as a small production design review.

## Recommended Reading Order

1. [Support Refund Agent](./support-refund-agent)
2. [Research RAG Agent](./research-rag-agent)
3. [Multi-Agent Delivery Workflow](./multi-agent-delivery-workflow)
4. [Deployment Walkthrough](../production-runtime/deployment-walkthrough)
5. [Templates and Worksheets](../agent-engineering-practice/templates-and-worksheets)

The first capstone is tool and policy heavy. The second is evidence and memory heavy. The third is coordination heavy.
