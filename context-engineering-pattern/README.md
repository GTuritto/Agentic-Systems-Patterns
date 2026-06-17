# Context Engineering Pattern

## Intent

Context engineering decides what the model sees before it answers or acts. In RAG and semantic recall systems, that means retrieving evidence, filtering it by permission and freshness, separating facts from instructions, and giving the model a working set that is small enough to use and strong enough to justify the answer.

RAG is not "put search results in the prompt." It is an evidence pipeline. The system must decide which sources are eligible, what counts as fresh enough, what the caller may see, how retrieved content is cited, and what the agent should do when evidence is missing or conflicting.

## Use When

- The answer depends on a large, changing, or private knowledge base.
- Relevant sources can be chunked, embedded, filtered, cited, and inspected.
- The retrieval layer can enforce tenant, role, source, and freshness constraints.
- The agent can refuse or escalate when evidence is missing.
- The system can evaluate retrieval quality separately from final-answer quality.

## Avoid When

- The required knowledge is already in the task input or deterministic system state.
- The corpus is too noisy, stale, or untrusted to retrieve safely.
- The system cannot distinguish trusted metadata from untrusted document content.
- The answer needs exact database state that should come from a typed tool, not semantic search.
- Citations, source IDs, or retrieval traces cannot be stored for review.

## Architecture

```mermaid
flowchart LR
  Q[Question or task] --> C[Classify information need]
  C --> F[Apply source and permission filters]
  F --> R[Retrieve candidates]
  R --> S[Score freshness and relevance]
  S --> E[Build evidence set]
  E --> W[Assemble working context]
  W --> A[Answer, refuse, or escalate]
  A --> T[Trace sources and decision]
```

## System Shape

- **Pattern boundary:** the retrieval boundary decides what evidence may enter the model working set.
- **State owner:** the retrieval layer owns indexes, source metadata, freshness, access rules, and retrieval traces.
- **Model role:** the model uses retrieved evidence to answer, ask for missing evidence, or explain why it cannot answer.
- **Policy boundary:** source eligibility, tenant access, redaction, freshness, and memory write rules run before generation.
- **Operational promise:** the model answers from inspected evidence rather than from vague memory or unfiltered context.

## Core Protocol

1. Classify the information need: policy, documentation, user memory, event history, private record, or public source.
2. Apply caller, tenant, role, source, freshness, and data-handling filters.
3. Retrieve candidate chunks with metadata, not naked text.
4. Rank and trim candidates by relevance, freshness, diversity, and trust.
5. Build an evidence set with source IDs, citations, confidence, and known gaps.
6. Assemble context with instructions separated from retrieved content.
7. Generate an answer, refusal, or escalation using only eligible evidence.
8. Record retrieval query, filters, source IDs, scores, citations, and stop reason.

## Implementation Notes

Treat retrieved material as evidence, not authority. A web page, email, ticket, PDF, or document can contain useful facts and malicious instructions at the same time.

```ts
type EvidenceChunk = {
  sourceId: string;
  sourceType: 'policy' | 'docs' | 'ticket' | 'email' | 'memory' | 'web';
  tenantId?: string;
  trustLevel: 'trusted' | 'internal' | 'user_supplied' | 'public' | 'unknown';
  freshness: {
    retrievedAt: string;
    sourceUpdatedAt?: string;
    maxAgeDays?: number;
  };
  permissions: {
    allowedRoles: string[];
    redaction: 'none' | 'pii' | 'secret' | 'tenant_scoped';
  };
  score: number;
  excerpt: string;
  citation: string;
};
```

The evidence contract should travel with the answer:

```ts
type RagAnswer = {
  status: 'answered' | 'missing_evidence' | 'conflicting_evidence' | 'refused';
  answer?: string;
  citations: string[];
  evidenceRefs: string[];
  missingEvidence?: string[];
};
```

A small eligibility check catches many production failures:

```ts
function isEligibleEvidence(chunk: EvidenceChunk, callerRole: string, now: Date) {
  if (!chunk.permissions.allowedRoles.includes(callerRole)) return false;
  if (chunk.permissions.redaction === 'secret') return false;

  if (chunk.freshness.sourceUpdatedAt && chunk.freshness.maxAgeDays) {
    const updatedAt = new Date(chunk.freshness.sourceUpdatedAt).getTime();
    const ageDays = (now.getTime() - updatedAt) / 86_400_000;
    if (ageDays > chunk.freshness.maxAgeDays) return false;
  }

  return chunk.trustLevel !== 'unknown';
}
```

Do not let the model decide whether a source is allowed. The model can summarize evidence quality. Software should enforce eligibility.

## Failure Modes

- Stale but plausible evidence is retrieved and treated as current.
- Retrieved text contains instructions that override the system goal.
- Chunks from the wrong tenant, role, or customer enter the context.
- The retriever returns semantically similar but operationally wrong sources.
- Citations point to broad documents instead of the exact supporting chunk.
- The agent answers when the evidence is missing or conflicting.
- Memory writes store an unverified summary as if it were durable fact.
- Retrieval scores are logged, but filters, source IDs, and freshness are not.
- The final answer is evaluated, but retrieval quality is not.

## Evaluation Strategy

RAG evals should test retrieval and answer behavior separately.

- Test known-answer questions where the correct source is present.
- Test missing-evidence cases where the agent should refuse or ask for help.
- Test stale-source cases where an older source conflicts with a newer one.
- Test conflicting-source cases where the answer must explain uncertainty.
- Test prompt injection inside retrieved documents.
- Test tenant and permission boundaries.
- Test citation coverage: every factual claim should map to source evidence.
- Test retrieval precision and recall before testing final prose quality.

A compact eval fixture can make the evidence requirement explicit:

```json
{
  "case_id": "stale_refund_policy",
  "question": "Can a damaged item be refunded after 45 days?",
  "retrieved_sources": [
    { "source_id": "refund_policy_2024", "freshness": "stale" },
    { "source_id": "refund_policy_2026", "freshness": "current" }
  ],
  "expected": {
    "must_cite": ["refund_policy_2026"],
    "must_not_cite": ["refund_policy_2024"],
    "status": "answered",
    "checks": ["freshness", "citation_coverage", "no_untrusted_instructions"]
  }
}
```

Measure retrieval recall, retrieval precision, source freshness, citation faithfulness, missing-evidence refusal rate, prompt-injection resistance, tenant-boundary violations, and answer quality grounded in cited evidence.

## Production Checklist

- Define eligible sources by tenant, role, source type, freshness, and data class.
- Keep source metadata with every retrieved chunk.
- Separate instructions from retrieved facts in the assembled context.
- Redact or exclude sources before generation, not after.
- Require citations for factual claims.
- Refuse or escalate when evidence is missing, stale, or conflicting.
- Trace query, filters, source IDs, scores, context assembly, and final citations.
- Evaluate retrieval quality separately from answer quality.
- Review memory writes before storing retrieved summaries as durable facts.
- Version chunking, embedding model, retrieval filters, rerankers, prompts, and citation rules.

## How to run (Python RAG)

This example uses Hugging Face embeddings (`all-MiniLM-L6-v2`), FAISS, and `requests` to call Mistral chat completions.

1. Create a virtual environment and install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r context-engineering-pattern/langgraph_python_example/requirements.txt
```

2. Export your Mistral key and run the example:

```bash
export MISTRAL_API_KEY=your_key_here
python context-engineering-pattern/langgraph_python_example/rag_example.py
```

Notes:

- First run will download the sentence-transformers model; allow time and network access.
- Endpoint: https://api.mistral.ai/v1/chat/completions
- No OpenAI or vendor SDKs are used.

## References

- [Retrieval-Augmented Generation paper](https://arxiv.org/abs/2005.11401)

## Related Patterns

- [Context Budgets and Working Sets](/foundations/context-budgets-and-working-sets)
- [Working Memory](/memory-knowledge/working-memory)
- [Memory-Augmented Agent](/memory-knowledge/memory-augmented-agent)
- [Knowledge-Bound Agents](/memory-knowledge/knowledge-bound-agents)
- [Agentic RAG Systems](/systems-architecture/agentic-rag-systems)
- [Pattern Evaluation Checklist](/pattern-selection/pattern-evaluation-checklist)
