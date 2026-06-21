# Consensus-Seeking Multi-Agent System Pattern

## Intent

Debate and consensus use multiple independent proposals, critiques, votes, or rankings before producing a final answer.

Use this pattern to expose disagreement, missing evidence, and weak reasoning before a risky answer becomes a final decision. Do not use it to make an answer look more trustworthy without adding independent evidence or a stronger review rule.

## Scenario

A team is reviewing whether an agent-generated incident summary is good enough for an executive update. One agent drafts the summary from traces. A second agent checks chronology against the incident timeline. A third agent checks customer impact and omitted evidence. A judge then accepts, rejects, or asks for a revised summary.

This works only if the agents see meaningfully different evidence or apply different rubrics. Three agents with the same prompt, same context, and same blind spot create a louder single-agent failure. Consensus is not evidence by itself; it is a way to expose disagreement before one accountable owner makes the final call.

## Use When

- A single answer is risky, ambiguous, or likely to miss evidence.
- Participants have genuinely different evidence, roles, rubrics, models, or tools.
- The final decision can wait for the extra cost and latency.
- A written merge rule exists before the workers start.
- Dissent should be preserved for review, not hidden by synthesis.

## Avoid When

- A deterministic test, database query, retrieval step, or policy check can answer directly.
- Participants share the same context and will repeat the same failure.
- Majority vote would replace evidence, tests, or an accountable owner.
- The task needs one clear owner more than it needs more opinions.
- The system cannot trace proposals, critiques, votes, dissent, and final acceptance.

## Architecture

```mermaid
flowchart LR
  G[Goal and acceptance rubric] --> C[Coordinator]
  C --> A[Agent A: evidence review]
  C --> B[Agent B: chronology review]
  C --> D[Agent C: risk review]
  A --> P[Proposals]
  B --> P
  D --> P
  P --> K[Critique and score]
  K --> M{Material dissent?}
  M -->|yes| E[Escalate or revise]
  M -->|no| J[Judge or owner decision]
  J --> O[Final answer with transcript]
  E --> O
```

Read the flow as an evidence-backed decision process. The coordinator does not ask for "more opinions"; it assigns different review contracts, collects traceable outputs, preserves dissent, and gives one owner the final decision.

## Decision Rules

Use debate only when independence is real and the merge rule is known before execution.

| Question | Good Answer | Bad Answer |
| --- | --- | --- |
| What differs between agents? | Evidence source, rubric, role, model, or tool access. | Only the name of the role prompt. |
| Who owns the final decision? | A coordinator, deterministic reducer, or human reviewer. | The majority vote by itself. |
| What can overturn consensus? | Missing evidence, safety violation, failed test, or owner rejection. | Nothing; agreement is treated as truth. |
| What is the cost limit? | Fixed number of agents, turns, tokens, and retries. | Debate continues until outputs look confident. |
| How is dissent handled? | Recorded, classified, and escalated when material. | Smoothed away during synthesis. |

### Debate Gate Flow

```mermaid
flowchart TD
  Q[Question or draft answer] --> B{Single-agent baseline enough?}
  B -->|yes| S[Use simpler path]
  B -->|no| I{Independent evidence or rubric?}
  I -->|no| S
  I -->|yes| P[Run bounded proposals]
  P --> C[Critique with rubric]
  C --> D{Material dissent?}
  D -->|yes| E[Escalate or revise]
  D -->|no| V{Veto or failed test?}
  V -->|yes| E
  V -->|no| O[Owner accepts final answer]
  E --> T[Store transcript and eval case]
  O --> T
```

### When Consensus Hurts Quality

| Situation | Why It Hurts | Better Pattern |
| --- | --- | --- |
| Same prompt, same evidence, same model. | Correlated failures look like agreement. | Single agent plus evaluator, or retrieval/tool verification. |
| Weak majority overrules strong evidence. | Votes hide the reason a minority is correct. | Evidence-weighted judge or human approval gate. |
| Debate happens after synthesis. | Critique cannot change the underlying evidence path. | Review proposals before final synthesis. |
| Workers optimize for persuasion. | Outputs become rhetorical instead of testable. | Score against a rubric with required citations. |
| The owner is unnamed. | No one can accept residual risk. | Supervisor or human final-owner gate. |

### Voting Protocols

| Protocol | Use When | Guardrail |
| --- | --- | --- |
| Majority vote | Outputs are low risk and independently produced. | A safety or evidence veto can override the majority. |
| Weighted rubric | Roles have different authority or expertise. | Weights are fixed before the run starts. |
| Veto rule | One class of defect should block release. | Veto reasons must cite evidence or policy. |
| Pairwise comparison | Several candidate answers compete. | Compare against the same rubric, not preference. |
| Owner review | The decision carries product, legal, safety, or customer risk. | The owner sees dissent and trace evidence before accepting. |

## System Shape

- **Pattern boundary:** a coordinator delegates bounded work to agents with narrow roles, then evaluates and merges their outputs.
- **State owner:** the coordinator owns the shared goal, decomposition, assignments, merge policy, and final acceptance.
- **Primary artifact:** `consensus-seeking-multi-agent-system-pattern/` contains deterministic TypeScript and Python reference implementations plus tests for proposal, critique, dissent, and final-owner behavior.
- **Operational promise:** debate exposes disagreement before a risky answer becomes a final decision.
- **Runnable path:** start with `npm run debate-consensus` before adapting the pattern to a larger system.

## Contract

A debate run should produce a transcript that another engineer can inspect.

| Field | Purpose |
| --- | --- |
| `runId` | Correlates all proposals, critiques, votes, and final decision. |
| `goal` | Defines the exact question being debated. |
| `agents[]` | Records role, evidence scope, model, tools, and permission limits. |
| `proposal` | Captures each agent's answer with citations or evidence references. |
| `critique` | Names specific defects, missing evidence, or risks. |
| `vote` or `score` | Applies a predeclared rubric, not an improvised preference. |
| `dissent` | Preserves material disagreement for the owner. |
| `finalOwner` | Names the coordinator, reducer, or human accountable for acceptance. |
| `stopReason` | Explains accepted, rejected, escalated, budget_exhausted, or inconclusive. |

## Implementation Notes

- Start with a single-agent baseline. Add debate only when measured quality improves enough to justify cost and latency.
- Give each participant a different evidence scope, rubric, model, or tool boundary.
- Keep proposals separate until critique begins. Early shared context can collapse independence.
- Require citations, trace IDs, test output, or source references for material claims.
- Preserve minority reports when they name missing evidence, policy risk, or unsupported claims.
- Cap agent count, turns, judge passes, retry count, total tokens, and wall-clock time.
- Treat a failed worker, missing evidence, or material dissent as a typed outcome, not as prose to smooth over.

## Failure Modes

- False agreement: agents share the same blind spot and all approve the wrong answer.
- Majority trap: two weak answers outvote one evidence-backed objection.
- Debate theater: agents critique style while ignoring source support, tests, or policy.
- Dissent erasure: final synthesis removes the disagreement the pattern was meant to reveal.
- Judge capture: the judge trusts confident prose instead of the predeclared rubric.
- Role collapse: all agents perform the same task despite different titles.
- Cost runaway: debate continues after the decision has become no clearer.
- Owner gap: the system produces a consensus with no one accountable for acceptance.

## Review Checklist

Before using debate or consensus in production, check:

- A single-agent baseline exists and debate beats it on measured tasks.
- Agents receive different evidence, roles, rubrics, models, or tools for a reason.
- The merge policy is written before the run starts.
- Dissent is preserved in the trace instead of erased by synthesis.
- The coordinator can refuse, escalate, or ask for more evidence.
- Cost and latency budgets cap agents, turns, retries, and judge passes.
- Evals include correlated failure, false agreement, bad majority vote, and judge error.

## Evaluation Strategy

- Compare multi-agent output against a single-agent baseline on the same tasks.
- Test cases where all agents agree and are wrong because they share evidence.
- Test cases where the minority answer is correct because it cites stronger evidence.
- Test worker failure, missing worker output, duplicated work, and bad merge decisions.
- Test veto behavior for safety, policy, missing evidence, and failed deterministic checks.
- Measure quality lift, latency cost, token cost, merge accuracy, dissent handling, and final-owner accountability.

## Production Checklist

- Give every worker a narrow role, evidence scope, permission set, and output schema.
- Make the merge policy explicit before workers run.
- Log per-worker inputs, outputs, critiques, scores, votes, and evidence references.
- Keep one owner for final acceptance and escalation.
- Preserve material dissent in the final trace and operator view.
- Add budget controls for agents, turns, retries, judge passes, tokens, and time.
- Define human escalation for high-risk, inconclusive, or policy-blocked work.
- Keep the source bundle, generated chapter, tests, and deployment artifact in the same release.

## Run The Example

```bash
npm run debate-consensus
npm run debate-consensus:test
```
