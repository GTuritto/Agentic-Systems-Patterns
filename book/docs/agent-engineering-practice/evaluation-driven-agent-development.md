---
title: Evaluation-Driven Agent Development
---

# Evaluation-Driven Agent Development

Evaluation is where agent development becomes engineering.

Without evals, the team is arguing from demos, anecdotes, and vibes. With evals, the team can say what failed, why it matters, whether the next change helped, and what it broke.

Use this chapter when an agent is moving from prototype to production, or when a prototype already feels impressive but nobody can prove it is reliable.

## Intent

Build agents from failure modes and success metrics, not from demos. A demo shows that the agent can work once. An eval suite shows whether it keeps working across the cases that matter.

The eval loop is:

1. list the tasks the agent must handle;
2. list the ways those tasks can fail;
3. define business and quality metrics;
4. create fixtures and datasets;
5. run the agent against those datasets;
6. inspect failures;
7. improve prompts, tools, state, policy, or architecture;
8. repeat on every meaningful change.

The key word is architecture. If an eval fails because the agent lacks state, a prompt edit is the wrong fix. If it fails because the tool is unsafe, a better instruction is not enough. Evals should be allowed to change the design.

## What To Evaluate

Evaluate the full trajectory, not only the final answer.

| Layer | What To Check |
| --- | --- |
| Routing | Correct path, confidence, fallback behavior. |
| Planning | Valid steps, dependency order, missing constraints. |
| Retrieval | Source relevance, freshness, coverage, citations. |
| Tool use | Correct tool, valid input, safe side effects, error handling. |
| Memory | Correct recall, safe write, no stale or private leakage. |
| Policy | Permissions, approval requirements, refusals. |
| Final output | Correctness, completeness, tone, format, evidence. |
| Operations | Latency, cost, retries, breaker events, escalation. |

If only the final response is evaluated, the team will miss the failure that caused it. The answer may look right even though the agent used stale evidence, skipped approval, retried a tool six times, or wrote bad memory for the next run.

## Failure Mode Inventory

Start each agent project with a failure mode inventory. This is the most useful early artifact because it turns fear into testable cases.

Examples:

- selects the wrong route;
- asks for information it already has;
- misses a required approval;
- calls a write tool when read-only analysis is enough;
- retrieves irrelevant evidence;
- trusts stale memory;
- loops without progress;
- gives a confident answer with weak evidence;
- exposes sensitive data;
- exceeds cost or latency budget;
- cannot resume after interruption.

Each failure mode should map to at least one test, trace query, or production alert. If a failure is important but invisible, the system is not ready.

A good inventory is specific to the product. "Hallucination" is too broad. "Answers refund-policy questions without citing the current policy document" is testable. "Tool misuse" is too broad. "Calls `issue_refund` before a manager approval record exists" is testable.

## Metrics

Use a small set of metrics that match the product. More metrics do not create more truth. They usually create more ways to ignore the real failure.

Common metrics:

- task completion rate;
- correctness;
- evidence coverage;
- tool-call accuracy;
- route accuracy;
- approval precision and recall;
- hallucination rate;
- user correction rate;
- human escalation rate;
- cost per completed task;
- latency by step;
- incident rate.

Do not optimize one metric in isolation. A lower escalation rate is bad if the agent is making unsafe decisions instead. Lower latency is bad if the agent is skipping retrieval. Higher task completion is bad if it completes the wrong task.

The best metrics form a constraint set: quality cannot improve by violating safety, cost, latency, evidence, or approval requirements.

## Eval Dataset Types

| Dataset | Source | Use |
| --- | --- | --- |
| Golden tasks | Handwritten examples | Basic regression coverage. |
| Adversarial tasks | Designed edge cases | Safety, routing, policy, prompt injection. |
| Production traces | Real runs with redaction | Realistic behavior and long-tail failures. |
| Human-labeled data | Subject matter experts | Ground truth for judgment-heavy tasks. |
| Synthetic variants | Generated from known cases | Coverage expansion after human review. |
| Incident fixtures | Past failures | Prevent regressions. |

Production traces are valuable, but they need privacy controls and careful labeling. Do not dump raw user conversations into an eval pipeline without redaction, retention rules, and access controls.

Synthetic data is useful for expanding coverage, but it should not become the ground truth by itself. Generated cases often miss the messy parts of real usage: missing context, contradictory user instructions, weird phrasing, stale records, and partial tool outages.

## Judges

Model judges can help, but they need constraints. They are reviewers, not law.

Use model judges for:

- subjective quality;
- rubric-based review;
- comparing two outputs;
- checking whether a claim is supported by evidence.

Use deterministic checks for:

- schema validity;
- required fields;
- forbidden tools;
- budget limits;
- citation presence;
- route labels;
- permission gates.

Combine both. A model judge should not be the only control before a high-risk action.

Also evaluate the judge. Give it known good and bad examples. Track false accepts and false rejects. If the judge rewards polished prose over evidence, it will make the agent look better while the system gets worse.

## Evaluation-Driven Development Loop

For every meaningful agent change:

1. Add or update eval cases before changing prompts or tools.
2. Run the current system to establish a baseline.
3. Make the smallest change that targets the failure.
4. Run the eval suite again.
5. Inspect regressions, not only the average score.
6. Promote the change only if it improves the targeted behavior without harming critical cases.

This loop works for prompts, tools, policies, memory, routing, models, and orchestration.

Average scores are dangerous. A change that improves easy cases and breaks policy cases is not an improvement. Keep a small set of blocking evals that must pass every time: schema validity, forbidden tool calls, approval behavior, privacy boundaries, and known incident fixtures.

## Production Monitoring

Runtime monitoring should feed the eval suite. The production system is the best source of cases the team failed to imagine, so capture the signals that expose them: failed runs, human overrides, user corrections, low-confidence routes, breaker events, tool failures, high-cost and slow runs, policy denials, and unusual memory writes. Every serious incident should become at least one eval case. The goal is not blame. The goal is to make the failure hard to repeat.

Monitoring should also show when the eval suite is stale. If production traces contain task types, tool paths, or policy decisions that never appear in tests, the eval suite no longer represents the system.

For the production operating loop, see [Production Evaluation Feedback Loops](../production-runtime/production-evaluation-feedback-loops).

## Release Gates

Before shipping a meaningful agent change, define what must pass.

Minimum release gates:

- no schema failures in golden tasks;
- no forbidden tool calls;
- no missing trace IDs;
- no approval bypasses;
- no regression on incident fixtures;
- no unsupported claims in evidence-bound answers;
- no unresolved high-risk failures from the review queue.

These gates should be boring. That is the point. They keep the team from shipping an exciting demo that reopens old failures.

## Related Chapters

- [Observability and Evals](../production-runtime/observability-and-evals)
- [Production Evaluation Feedback Loops](../production-runtime/production-evaluation-feedback-loops)
- [Circuit Breakers, Fallbacks, and Replay](../pattern-selection/circuit-breakers-fallbacks-replay)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Evaluator-Optimizer](../control-loops/evaluator-optimizer)
- [Agent Development Lifecycle](./agent-development-lifecycle)
