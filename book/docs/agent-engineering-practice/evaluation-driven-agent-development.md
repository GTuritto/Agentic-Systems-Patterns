---
title: Evaluation-Driven Agent Development
---

# Evaluation-Driven Agent Development

Agent quality improves when evaluation drives development. A useful eval suite tells the team what fails, why it matters, and whether a change made the system better.

Use this chapter when an agent is moving from prototype to production.

## Intent

Build agents from failure modes and success metrics, not from demos.

The eval loop is:

1. list the tasks the agent must handle;
2. list the ways those tasks can fail;
3. define business and quality metrics;
4. create fixtures and datasets;
5. run the agent against those datasets;
6. inspect failures;
7. improve prompts, tools, state, policy, or architecture;
8. repeat on every meaningful change.

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

If only the final response is evaluated, the team will miss the failure that caused it.

## Failure Mode Inventory

Start each agent project with a failure mode inventory.

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

Each failure mode should map to at least one test, trace query, or production alert.

## Metrics

Use a small set of metrics that match the product.

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

Do not optimize one metric in isolation. A lower escalation rate is bad if the agent is making unsafe decisions instead.

## Eval Dataset Types

| Dataset | Source | Use |
| --- | --- | --- |
| Golden tasks | Handwritten examples | Basic regression coverage. |
| Adversarial tasks | Designed edge cases | Safety, routing, policy, prompt injection. |
| Production traces | Real runs with redaction | Realistic behavior and long-tail failures. |
| Human-labeled data | Subject matter experts | Ground truth for judgment-heavy tasks. |
| Synthetic variants | Generated from known cases | Coverage expansion after human review. |
| Incident fixtures | Past failures | Prevent regressions. |

Production traces are valuable, but they need privacy controls and careful labeling.

## Judges

Model judges can help, but they need constraints.

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

## Evaluation-Driven Development Loop

For every meaningful agent change:

1. Add or update eval cases before changing prompts or tools.
2. Run the current system to establish a baseline.
3. Make the smallest change that targets the failure.
4. Run the eval suite again.
5. Inspect regressions, not only the average score.
6. Promote the change only if it improves the targeted behavior without harming critical cases.

This loop works for prompts, tools, policies, memory, routing, models, and orchestration.

## Production Monitoring

Runtime monitoring should feed the eval suite.

Capture:

- failed runs;
- human overrides;
- user corrections;
- low-confidence routes;
- breaker events;
- tool failures;
- high-cost runs;
- slow runs;
- policy denials;
- unusual memory writes.

Every serious incident should become at least one eval case.

## Related Chapters

- [Observability and Evals](../production-runtime/observability-and-evals)
- [Circuit Breakers, Fallbacks, and Replay](../pattern-selection/circuit-breakers-fallbacks-replay)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Evaluator-Optimizer](../control-loops/evaluator-optimizer)
- [Agent Development Lifecycle](./agent-development-lifecycle)
