---
title: From Patterns To Systems
---

# From Patterns To Systems

Patterns are useful only when they help you build a system. A production agent is rarely one pattern. It is usually a workflow with a few model-mediated decisions, a retrieval boundary, some tools, state, policy, approvals, evals, and observability. The pattern names matter far less than the way those pieces fit together.

This is where many agent projects go wrong. The team adds a loop, then memory, then tools, then a second agent, then a judge, then a workflow engine. Each addition feels reasonable on its own, and the result is a system nobody can explain. Composition is the discipline that prevents that.

## Start With The Workload

Do not compose patterns from a catalog. Compose them from the workload. Start by asking what the user is actually trying to accomplish, which steps are known in advance and which require model judgment, what evidence has to be retrieved, which actions carry side effects, what state must survive a failure, what needs approval, and what has to be observable after the run.

The answers point to the parts. If the workflow is known, keep code in charge. If the next step depends on observations, add an agent loop. If the task needs evidence, add retrieval. If the task can change the outside world, add policy and approval. If failures matter, add durable state and replay. That is composition: each pattern earns its place rather than arriving by default.

## A Common Shape

Many useful agentic systems follow roughly this shape:

1. Entry point receives a request, event, or scheduled task.
2. Router classifies the task, risk, and required capability.
3. Workflow loads state, policy context, and relevant memory.
4. Retrieval gathers evidence when the answer depends on knowledge.
5. Agent loop handles bounded uncertainty inside the workflow.
6. Tools execute through typed schemas and permission checks.
7. Approval gate pauses high-risk side effects.
8. Evaluators check trajectory, evidence, output, and policy.
9. Runtime stores traces, costs, decisions, tool calls, and stop reasons.
10. Incidents and corrections feed the eval suite.

Not every system needs every step. What stays constant is the ownership. Code owns flow, state, policy, and persistence; the model owns bounded judgment inside those constraints.

## Composition Rules

Run through these rules before adding another pattern.

| Rule | Why It Matters |
| --- | --- |
| One component owns the goal. | Without goal ownership, agents optimize different tasks. |
| One component owns state. | Without state ownership, replay and recovery become guesswork. |
| Tool calls cross a policy boundary. | Without policy, model proposals become actions too quickly. |
| Memory writes are explicit events. | Without memory discipline, stale or unsafe context persists. |
| Loops have stop conditions. | Without stop conditions, autonomy becomes cost and latency growth. |
| Evals inspect trajectories. | Without trajectory evals, unsafe paths can produce plausible answers. |
| Traces connect decisions to effects. | Without traces, failures cannot become better tests. |

These rules matter more than the framework. A framework can help you implement them; it cannot decide them for you.

## Bad Composition

Bad composition usually has the same smell: the model owns too much. The agent infers the goal from vague conversation history, chooses tools without a permission check, and writes memory without classification or review. Retries happen inside hidden loops. Subagents receive the full conversation instead of a narrow task. Evaluators check tone but not evidence. The final answer is logged while the trajectory is lost, and a multi-agent system has no single owner for final synthesis.

These systems can look impressive in a demo. They are painful to operate because nobody can say where responsibility lives.

## Good Composition

Good composition is usually boring. A support refund system, for example, might run a deterministic workflow for intake and account lookup, a router for request type and risk, and retrieval for the current refund policy. It would use structured output for the extracted fields and the recommendation, a small agent loop only for missing-information investigation, policy enforcement before any refund action, human approval for exceptions, and observability and evals across the full run.

The system is agentic where uncertainty exists and deterministic where control matters. That is the whole trick.

A simple composition sketch might look like this:

```ts
async function handleRefundRequest(request: SupportRequest) {
  const route = classifyRequest(request);
  if (route.kind !== 'refund') return handoffTo(route.owner);

  const order = await tools.lookupOrder(request.orderId);
  const policy = await retrievePolicy('refunds', order.region);
  const recommendation = await refundAgent.investigate({
    request,
    order,
    policy
  });

  const decision = enforceRefundPolicy(recommendation, order, policy);
  if (decision.requiresApproval) {
    return approvals.request('refund_exception', decision);
  }

  return tools.draftRefundRequest(decision);
}
```

Only one step uses an agent loop. The workflow still owns route, state, policy, approval, and side effects.

## When To Split Agents

Do not split agents because the task feels large. Split them when the boundary buys something concrete: separate context windows, separate tools, separate permissions, separate teams or ownership, parallel work, independent review, or different user-facing responsibilities.

The weak reasons are easy to recognize once you name them. The architecture diagram looks more advanced. Each prompt sounds like a different job title. The team wants a multi-agent system. The single-agent design has unclear goals or weak tools, so splitting it feels like progress. It is not. Splitting agents does not fix weak architecture; it multiplies it.

## Design Review Checklist

Before approving a composed agentic system, ask:

1. Which parts are deterministic workflows?
2. Which parts are model-mediated decisions?
3. What owns the active goal?
4. What owns durable state?
5. What tools can cause side effects?
6. What policy runs before those side effects?
7. What evidence is required for the final answer?
8. What memory can be written, updated, or deleted?
9. What are the stop conditions?
10. What evals block release?
11. What trace lets an operator replay the run?
12. What happens when the model is wrong but persuasive?

If the design cannot answer these, it is not ready for more autonomy.

## Design Rule

Compose patterns only when each one has a job, an owner, and a failure mode you can test.

## Related Chapters

- [Architecture Before Autonomy](./architecture-before-autonomy)
- [Choosing the Right Pattern](./choosing-the-right-pattern)
- [Agent Development Lifecycle](../agent-engineering-practice/agent-development-lifecycle)
- [Evaluation-Driven Agent Development](../agent-engineering-practice/evaluation-driven-agent-development)
- [Agentic System Architecture](../systems-architecture/agentic-system-architecture)
- [Reference Architecture](../systems-architecture/reference-architecture)
