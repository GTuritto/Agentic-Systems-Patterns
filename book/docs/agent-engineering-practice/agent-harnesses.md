---
title: Agent Harnesses
---

# Agent Harnesses

An agent harness is the layer around the loop. The loop calls the model, reads state, decides, acts, and stops. The harness gives that loop a usable working environment: tools, files, memory, skills, permissions, subagents, approvals, traces, and recovery.

This is the part many people mistake for the agent itself. It is not the agent. It is the operating shell that makes the agent useful for real work.

## Why Harnesses Exist

A raw agent loop is small enough to fit in a few functions. Real tasks need more than that: a place to keep intermediate work, a way to load only the context that matters, a way to call tools safely, a way to split work across subagents, a way to pause for approval, a way to remember useful facts, a way to recover after failure, and a way to inspect what happened afterward. All of that together is the harness.

Coding agents make the point obvious. A coding agent does not only call a model. It reads files, edits files, runs tests, tracks tasks, invokes tools, asks for approval, handles failures, and keeps a trace of the session. The model matters, but the harness is what decides whether the work is controlled.

## Harness vs Framework vs Runtime

The terms overlap, but the distinction is worth keeping.

| Layer | Main Job | Examples Of Responsibility |
| --- | --- | --- |
| Framework | Gives abstractions for building agents. | Model adapters, tool calling, chains, agents, prompts. |
| Runtime | Executes and operates agent work. | Durable state, retries, streaming, deployment, persistence. |
| Harness | Gives the agent a working environment. | Files, skills, memory, subagents, permissions, approvals, context management. |

A product may use all three. A framework may include a runtime, and a runtime may include harness features. The names matter less than the responsibilities, and the question that cuts through the overlap is simple: which layer owns which control?

## Core Harness Capabilities

A capable harness usually exposes these surfaces.

| Capability | What It Does | Main Risk |
| --- | --- | --- |
| Workspace | Gives the agent files, artifacts, notes, and scratch state. | Sensitive data leakage or stale artifacts. |
| Context manager | Selects what enters the model context. | Token bloat, missing evidence, summarization drift. |
| Tool registry | Exposes tools with schemas and descriptions. | Broad tools, unsafe actions, weak authorization. |
| Skill loader | Loads procedural instructions only when needed. | Irrelevant activation or hidden unsafe scripts. |
| Memory layer | Reads and writes durable information. | Stale, private, or poisoned memory. |
| Planner | Tracks tasks, subtasks, and progress. | Plans become theater instead of control. |
| Subagent manager | Delegates work to isolated contexts. | Trace fragmentation and unclear ownership. |
| Permission gate | Blocks or pauses risky actions. | Prompt-only approval or approval fatigue. |
| Sandbox | Contains code, browser, shell, or file actions. | Escape, secret exposure, or uncontrolled network access. |
| Trace surface | Records decisions, tool calls, costs, and errors. | Final-answer-only logs. |

Not every agent needs every capability. A narrow support classifier may need almost none of this; a coding or research agent probably needs most of it.

## Workspace And Artifacts

Longer tasks need a workspace, and it fills up quickly with user-provided files, retrieved documents, generated drafts, code patches, plans, task notes, tool outputs, and evaluation results. None of that should be treated as a dumping ground. Files and artifacts need ownership, naming, retention, and visibility rules like any other state.

Good workspace design answers a handful of questions up front: what the agent can read, what it can write, what the user can inspect, what is temporary, what becomes durable state, and what must never enter the model context at all. The workspace is part of the security model, not separate from it.

## Context Management

The harness decides what the model sees, and that decision is often more important than the prompt. A strong model with bad context still fails; a smaller model with clean context often works.

The context manager controls the instructions, the active goal, the current state, the relevant files, the retrieved evidence, the available tools, the selected memory, the recent observations, and the budget and stop rules. All of it should be loaded deliberately. Putting the whole workspace, the full conversation, every tool, all memory, and all retrieved documents into every call is not context engineering. It is context flooding. For the operating rules behind this, see [Context Budgets And Working Sets](../foundations/context-budgets-and-working-sets); a harness should be able to explain the working set it assembled for each model call.

## Skills And Progressive Disclosure

Skills let a harness keep the base agent small. At startup the agent may see only the names and short descriptions of the available skills. When one becomes relevant, the harness loads the deeper instructions, references, scripts, templates, or examples behind it.

That is progressive disclosure, and it pays off across token budget, domain specialization, team-owned procedures, repeatable work, and safer tool use. Treat skills as versioned, tested artifacts rather than loose prompt fragments. A skill is procedural code and documentation that can change how the agent behaves, so it deserves the same discipline as any other code.

## Subagents And Context Isolation

Subagents are worth reaching for when a task benefits from isolated context: when work can happen in parallel, when a specialist needs different instructions or different tools, when a task should not pollute the main context, or when the main agent should receive a summary rather than every detail. Do not use them as decoration. Every subagent adds cost, latency, coordination, and trace complexity.

The harness has to make subagent work visible: who delegated the task, what context was passed, what tools were available, what result came back, what evidence supports it, and how the main agent used it. If subagent work cannot be traced, it cannot be trusted.

## Permissions And Approvals

The harness enforces permission boundaries before execution. The model can propose reading a file, calling an API, running a command, sending a message, updating a record, or writing a memory. The harness decides whether each of those is actually allowed.

Good permission systems draw distinctions the model cannot be trusted to draw for itself: read versus write, local versus remote, safe versus risky, reversible versus irreversible, user-visible versus hidden, cheap versus expensive, approved versus unapproved. Approval should be specific. "Allow tools" is too broad to mean anything. "Allow this agent to update ticket `INC-2048` with this summary" is something a person can actually review.

The harness policy can be expressed as a simple gate:

```ts
interface ToolRequest {
  tool: string;
  mode: 'read' | 'write';
  target: string;
  userVisible: boolean;
}

function authorizeHarnessAction(request: ToolRequest, permissions: HarnessPermissions) {
  if (!permissions.tools.includes(request.tool)) {
    return { allowed: false, reason: 'tool_not_in_profile' };
  }

  if (request.mode === 'write' && !permissions.canWrite) {
    return { allowed: false, reason: 'write_not_allowed' };
  }

  if (request.userVisible && !permissions.hasApproval) {
    return { allowed: false, reason: 'approval_required' };
  }

  return { allowed: true };
}
```

That is the harness doing its job: model intent becomes a checked request before anything happens.

## Memory In A Harness

Harness memory is not one store. It is a set of controlled reads and writes spanning working memory for the current task, episodic memory for past events, semantic memory for facts and documents, procedural memory for skills and playbooks, and user memory for durable preferences.

For each, the harness decides what can be written, who can inspect it, how long it lasts, and when it should be deleted. Memory writes should be explicit events. If the agent can silently rewrite what it will believe tomorrow, the harness is weak.

## Sandboxes

Harnesses become security-critical the moment they expose code execution, shell commands, browser control, or filesystem writes. A sandbox has to control filesystem access, network access, environment variables, secrets, installed packages, process lifetime, clipboard and browser-profile access, and upload and download paths.

The right default is least privilege: give the agent the narrowest environment that can still complete the task, and widen it only when a specific need forces you to.

## Harness Failure Modes

Harnesses fail in predictable ways. Every tool is available all the time. Every file enters context. Memory writes are invisible. Subagents create work nobody owns. Approvals are too broad. Sandbox boundaries are unclear. Traces omit tool inputs and outputs. Skills go stale but keep loading. Context compression removes the very evidence you need to debug the run. Every one of these is an architecture failure, not a model failure, which is exactly why a better model will not save you from them.

## Design Checklist

Before adopting or building a harness, ask:

1. What does the harness own?
2. What state does it persist?
3. What can the model see?
4. What can the model propose?
5. What can the harness execute without approval?
6. What tools are scoped by role or task?
7. What files can be read or written?
8. What memory can be written?
9. What subagent work is traceable?
10. What happens when the run is interrupted?
11. What does the operator see after failure?
12. How can a harness change be evaluated before release?

If the harness cannot answer these, it is not ready to hold a serious agent.

## Design Rule

The model supplies judgment. The harness supplies control.

## Related Chapters

- [What Is An Agent?](../foundations/what-is-an-agent)
- [Agent Engineer Toolkit](./agent-engineer-toolkit)
- [Framework Selection](./framework-selection)
- [Context Budgets And Working Sets](../foundations/context-budgets-and-working-sets)
- [Skills](../tools-skills-protocols/skills)
- [Working Memory](../memory-knowledge/working-memory)
- [Agent Security and Sandboxing](./agent-security-and-sandboxing)
- [Coding Agents](../systems-architecture/coding-agents)
