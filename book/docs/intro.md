---
title: Agentic Systems Patterns
---

# Agentic Systems Patterns

Most agentic systems do not fail because the model is not smart enough. They fail because the architecture around the model is weak.

The goal is vague. The loop has no real stop condition. The tools are too powerful. State is hidden in a chat transcript. Nobody can replay what happened. The eval suite checks the final answer but not the path that produced it. Observability arrives after the first incident. Autonomy is added before the system has earned it.

This book is about fixing that.

It is not a list of every agent pattern name I could find. It is a practical guide to choosing, composing, testing, securing, and operating agentic patterns without giving up engineering control. A useful agent is not a prompt with ambition. It is software with boundaries.

## The Argument

My argument is simple:

1. Start with the least agentic architecture that can meet the requirement.
2. Add model judgment only where deterministic software is not enough.
3. Treat model outputs as proposals until software validates them.
4. Keep goals, state, tools, memory, and policy outside the model where they can be inspected.
5. Evaluate trajectories, not just final answers.
6. Operate agents like production systems, with traces, budgets, retries, approvals, and incident review.

Agentic design is not about making everything autonomous. It is about deciding exactly where autonomy helps, where it creates risk, and where ordinary software should stay in charge.

## What This Book Covers

The book follows the decisions engineers make when they build real systems:

- foundations: single agents, loops, goals, state, tools, structured outputs, and context;
- pattern selection: when to use chains, routing, workflows, agents, or multi-agent systems;
- engineering practice: lifecycle, framework choice, security, evaluation, and user trust;
- control loops: planning, ReAct, reflection, evaluator-optimizer, and recovery loops;
- memory and knowledge: working memory, episodic memory, retrieval, and evidence boundaries;
- tools, skills, and protocols: tool contracts, MCP, A2A, secure communication, and approval gates;
- multi-agent systems: delegation, supervision, debate, parallel execution, and framework-shaped systems;
- systems architecture: how patterns compose into deployable products;
- production runtime: durable workflows, observability, evaluation, policy, events, and operations.

The pattern chapters are intentionally consistent. They are meant to be scanned during design work. The surrounding chapters carry the argument: why a pattern belongs in a system, what it costs, and how to know whether it is working.

## How To Use It

If you are new to agentic systems, start with [How To Read This Book](/publishing/how-to-read), then read [What Is An Agent?](/foundations/what-is-an-agent), [Architecture Before Autonomy](/pattern-selection/architecture-before-autonomy), [Choosing the Right Pattern](/pattern-selection/choosing-the-right-pattern), and [From Patterns To Systems](/pattern-selection/from-patterns-to-systems).

If you are reviewing a production design, start with the selection and engineering chapters before reading individual pattern pages.

If you are implementing, use the hands-on labs after you understand the architecture. The examples are deliberately small. The production notes show what must change before those examples become systems that can handle state, policy, evals, and observability.

## License

This book/reference and its examples are licensed under [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/) (`CC-BY-SA-4.0`).
