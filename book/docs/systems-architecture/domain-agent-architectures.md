---
title: Domain Agent Architectures
---

# Domain Agent Architectures

Domain agents apply agentic patterns inside a specialized field such as healthcare, finance, legal operations, education, science, insurance, or software engineering. The pattern is not "add an agent to a domain." The pattern is to encode the domain's evidence, constraints, risk, and review process into the architecture.

Use this chapter when an agent must operate under domain-specific standards rather than generic productivity expectations.

## Intent

Build agents that respect the domain's knowledge sources, vocabulary, decision rights, compliance boundaries, and failure costs.

The architecture should make domain judgment auditable.

## Domain Design Questions

Start with the domain, not the model.

- What decisions can the agent make?
- What decisions can it only recommend?
- What evidence is authoritative?
- What evidence is forbidden or insufficient?
- What requires professional review?
- What user data is sensitive?
- What are the domain-specific failure modes?
- What laws, policies, or standards apply?
- What record must be retained?
- What explanation must be shown to users or reviewers?

The answers shape tools, memory, evals, approval gates, and deployment.

## Common Domain Shapes

| Domain Shape | Agent Role | Architecture Notes |
| --- | --- | --- |
| Healthcare or clinical support | Summarize, triage, draft, explain, prepare evidence. | Keep licensed humans in decision roles; cite sources; log recommendations. |
| Finance or insurance | Analyze documents, classify risk, prepare decisions. | Enforce policy, audit data lineage, require approval for financial actions. |
| Legal operations | Search, summarize, compare, draft, extract obligations. | Preserve privilege boundaries; show citations; avoid unsupervised legal conclusions. |
| Education | Tutor, assess, adapt difficulty, produce feedback. | Track learning goals; avoid over-personalized unsupported claims. |
| Scientific research | Search literature, propose hypotheses, analyze data. | Separate hypothesis generation from validation; track provenance. |
| Software engineering | Search code, edit, test, review, prepare PRs. | Sandbox execution; preserve diffs; require CI and review gates. |

Different domains can share patterns while requiring different risk controls.

## Reference Architecture

```text
Domain request
  -> identity and authorization
  -> domain router
  -> evidence retrieval
  -> domain tool execution
  -> policy and risk checks
  -> agent or workflow decision
  -> human review when required
  -> auditable output
```

The domain router should select sources, tools, and approval paths. It should not bypass governance.

## Evidence Design

Domain agents need explicit evidence policy.

Define:

- authoritative source types;
- freshness requirements;
- citation format;
- source conflict handling;
- minimum evidence for an answer;
- unsupported claim behavior;
- source redaction rules;
- tenant and role boundaries.

If the agent cannot cite or explain the basis for a domain answer, it should lower confidence, ask for clarification, or escalate.

## Review and Approval

Domain agents often produce recommendations rather than final decisions.

Use human review for:

- clinical, legal, financial, or compliance decisions;
- low-confidence classifications;
- conflicting evidence;
- exceptions to policy;
- irreversible actions;
- communications that create obligation or liability.

The review interface should show evidence, policy checks, extracted fields, uncertainty, and the proposed action.

## Domain Evals

Generic evals are not enough.

Add evals for:

- domain terminology;
- document extraction;
- citation accuracy;
- missing evidence;
- policy exceptions;
- escalation thresholds;
- privacy constraints;
- adversarial or ambiguous inputs;
- reviewer override cases.

Use subject matter experts for labels where judgment matters.

## Failure Modes

- The agent sounds authoritative while evidence is weak.
- Domain-specific policy lives only in prompts.
- The agent treats recommendations as decisions.
- Retrieval mixes tenants, jurisdictions, or policy versions.
- Evals measure language quality but not domain correctness.
- Human review lacks enough evidence to make a decision.

## Related Chapters

- [Agentic RAG Systems](./agentic-rag-systems)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Human Approval Gates](../tools-skills-protocols/human-approval-gates)
- [Evaluation-Driven Agent Development](../agent-engineering-practice/evaluation-driven-agent-development)
- [Knowledge-Bound Agents](../memory-knowledge/knowledge-bound-agents)
