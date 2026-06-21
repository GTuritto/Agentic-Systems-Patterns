---
title: Capstone - Research RAG Agent
---

# Capstone - Research RAG Agent

Build a research agent that answers from approved sources, cites evidence, refuses unsupported claims, and records enough trace data to debug retrieval failures.

This capstone is evidence heavy. The main risk is not that the model cannot write an answer. The main risk is that the answer looks convincing while using stale, forbidden, or missing evidence.

## Problem

Product, support, and engineering teams often need answers from internal documents. A research agent can reduce search time, but it must respect source access, freshness, citations, and memory rules.

## Non-Goals

- Do not answer from unapproved sources.
- Do not treat retrieved text as trusted instructions.
- Do not store private facts in memory without retention and correction rules.
- Do not cite documents the agent did not actually use.

## Pattern Composition

| Concern | Pattern |
| --- | --- |
| context packet | [Context Engineering](../foundations/context-engineering) |
| retrieval | [Semantic Recall and RAG](../memory-knowledge/semantic-recall-rag) |
| evidence boundary | [Knowledge-Bound Agents](../memory-knowledge/knowledge-bound-agents) |
| memory | [Memory-Augmented Agent](../memory-knowledge/memory-augmented-agent) |
| policy | [Policy Enforcement](../production-runtime/policy-enforcement) |
| quality | [Observability and Evals](../production-runtime/observability-and-evals) |

## Architecture

Read this diagram as an evidence boundary. Retrieval can find candidates, but only source filtering, context assembly, and grounding evals decide what the answer may cite.

![Research RAG agent capstone architecture](../public/diagrams/capstone-research-rag-agent.svg)

```mermaid
flowchart LR
  Question["User question"] --> Policy["Access and task policy"]
  Policy --> Retrieval["Retriever"]
  Retrieval --> Filter["Source filter and freshness check"]
  Filter --> Packet["Context packet"]
  Packet --> Agent["Research agent"]
  Agent --> Answer["Answer with citations"]
  Answer --> Eval["Grounding eval"]
  Packet --> Trace["Trace"]
  Eval --> Trace
```

## Runnable Assets

Run the deterministic capstone implementation:

```sh
npm run capstones:demo
npm run capstones:test
```

Inspect:

- `capstone-projects-runtime/typescript/src/capstones.ts`
- `capstone-projects-runtime/typescript/test/capstones.spec.ts`

Downloadable evidence:

- [Sample trace JSON](/capstone-assets/traces/research-rag-agent.trace.json)
- [Sample eval report](/capstone-assets/eval-reports/research-rag-agent-eval-report.txt)
- [Capstone review scorecard](/capstone-assets/templates/capstone-review-scorecard.txt)
- [Framework selection ADR template](/capstone-assets/templates/framework-selection-adr-template.txt)
- [Production readiness worksheet](/capstone-assets/templates/production-readiness-worksheet.txt)

Expected runtime signal:

```text
research-rag-agent: pass
  stop: answered_with_citation
  trace events: 6
```

The test suite treats these as release evidence:

| Evidence | Runtime Check |
| --- | --- |
| The context packet includes the current approved source | `current_source_used` |
| The context packet excludes the stale source | `stale_source_rejected` |
| The context packet excludes the forbidden source | `forbidden_source_omitted` |
| The answer cites the source it used | `citation_faithfulness` |

Native example:

- `native-framework-examples/langgraph-research-rag/` ([download](/downloads/native-langgraph-research-rag.zip))

## Context Packet

| Field | Required Rule |
| --- | --- |
| `question` | Store normalized question and original user wording separately. |
| `actor` | Include tenant, role, and source access scope. |
| `sources` | Include source ID, title, freshness, ACL result, and citation label. |
| `evidence` | Include only approved passages needed for the answer. |
| `memory` | Include user or project memory only when policy allows it. |
| `instructions` | Separate system instructions from retrieved content. |
| `omissions` | Record sources omitted because of access, freshness, or relevance. |

## Capstone Review Gate

Before treating this capstone as production-grade, verify the evidence boundary:

| Check | Evidence |
| --- | --- |
| Source access runs before context assembly | Forbidden sources are omitted before answer synthesis. |
| Freshness is enforced | Stale sources cannot override current approved sources. |
| Citations are faithful | Every cited claim maps to evidence in the context packet. |
| Missing evidence fails closed | The agent refuses or escalates instead of guessing. |
| Memory writes are governed | Durable memory requires source IDs, confidence, retention, and correction path. |

Record the result in the capstone review scorecard and production readiness worksheet.

## Production Bridge

Use this table when turning the capstone into a service:

| Capstone Artifact | Production Version |
| --- | --- |
| Context packet | Versioned evidence contract with ACLs, freshness, omitted-source notes, and token budget. |
| Source filter | Access-control service with audit trail and policy version. |
| Citation eval | Blocking release gate for unsupported, stale, forbidden, or missing evidence. |
| Memory rule | Governed write path with retention, deletion, correction, consent, and tenant scope. |
| Runbook | Fallback that disables synthesis and returns approved source lists only. |

The first production milestone is an answer path that can explain what it cited, what it omitted, and why.

## Native Framework Mapping

| Framework | Best Mapping |
| --- | --- |
| LangGraph | Graph nodes for classify question, retrieve, filter, answer, cite, evaluate, and escalate. Stores handle long-term memory. |
| Mastra | Agent handles answer synthesis; workflow owns retrieval, source filtering, evals, memory policy, and trace export. |
| AutoGen | Researcher and reviewer agents can collaborate, but source access and citation checks stay in software. |
| CrewAI | Flow owns evidence packet and acceptance; crew can split research and review tasks. |
| Mini-runtime | Direct context builder plus retrieval client, source policy function, answer validator, and trace events. |

## Trace Example

```json
{
  "trace_id": "tr_research_2077",
  "question": "Can the support refund agent issue money?",
  "events": [
    { "span": "policy", "decision": "allow", "scope": "support_docs" },
    { "span": "retrieval", "query": "support refund agent issue money", "top_k": 5 },
    { "span": "source_filter", "allowed": 1, "stale": 1, "forbidden": 1 },
    { "span": "context_packet", "evidence_refs": ["refund-policy-v4"] },
    { "span": "model", "prompt": "research-answer-v1", "status": "succeeded" },
    { "span": "eval", "case_id": "research_rag_release_gate", "status": "pass" }
  ]
}
```

## Eval Report Example

| Eval | What It Checks | Blocking Rule |
| --- | --- | --- |
| `current_source_used` | `refund-policy-v4` reaches the context packet | no answer without current approved evidence |
| `stale_source_rejected` | `refund-policy-v2` stays out of the context packet | no stale policy answer |
| `forbidden_source_omitted` | `finance-private-notes` stays out of the context packet | no forbidden source in context |
| `citation_faithfulness` | cited sources support the answer | no unsupported citation |
| missing evidence refusal | agent refuses when approved evidence is absent | no fabricated answer |
| memory write | memory writes follow retention rules | no sensitive memory write |

Example fixture:

```json
{
  "case_id": "stale_refund_policy_rejected",
  "question": "Can the agent issue refunds directly?",
  "retrieved_sources": ["refund-policy-v2", "refund-policy-v4"],
  "expected": {
    "must_cite": ["refund-policy-v4"],
    "must_not_cite": ["refund-policy-v2"],
    "answer_contains": "may draft but not issue refunds"
  }
}
```

## ADR Example

```md
# ADR-022: Research agent answers only from approved current sources

## Status

Accepted

## Decision

The research agent may answer only from sources that pass access control, freshness, and citation checks. If approved evidence is missing, stale, or conflicting, the agent escalates instead of guessing.

## Rollback

Disable answer synthesis and keep retrieval-only search results available while the source filter or citation evaluator is repaired.
```

## Runbook Example

```text
service: research-rag-agent
owner: knowledge-platform
kill switch: disable answer synthesis
fallback: return ranked source list only
trace dashboard: knowledge/research-agent/traces
eval suite: evals/research-rag
incident trigger: unsupported answer, forbidden source exposure, stale source citation
post-incident action: add retrieval fixture and citation eval before re-enable
```

## Release Checklist

- Source ACLs run before context assembly.
- Retrieved content is separated from instructions.
- Answers cite only evidence in the context packet.
- Missing evidence produces refusal or escalation.
- Memory writes have retention, deletion, and correction rules.
- Evals cover stale, forbidden, missing, and conflicting sources.

## Native Slice Completion Standard

The native LangGraph slice is complete when it proves these outcomes:

| Requirement | Evidence |
| --- | --- |
| source access runs before retrieval output enters context | `check_access` node and policy trace |
| stale and forbidden sources stay out of the evidence packet | `filter_sources` node and omitted source list |
| answer cites only approved current evidence | `answer_with_citations` output and citation eval |
| missing approved evidence escalates | conditional edge to `escalate` |
| release gate blocks bad grounding | `evaluate_answer` failures for stale or forbidden citations |

The slice should remain small. Its job is to prove source policy, context assembly, citation faithfulness, and escalation before adding real vector stores or model calls.

## Related Labs

- [Lab 03 - Agentic RAG](../hands-on-labs/lab-03-agentic-rag)
- [Lab 06 - Observability and Evals](../hands-on-labs/lab-06-observability-and-evals)
- [Lab 11 - Context, Memory, Trace, and Evals](../hands-on-labs/lab-11-context-memory-trace-evals)
- [Lab 12 - LangGraph State Graph](../hands-on-labs/lab-12-langgraph-state-graph)
