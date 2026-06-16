---
title: Lab 05 - Build a Multi-Agent Supervisor
---

# Lab 05 - Build a Multi-Agent Supervisor

## Objective

Build the supervision shape behind multi-agent systems: one coordinator owns the goal, delegates bounded work, gathers worker outputs, and produces the final answer.

## What You Will Use

- Pattern chapters: [Supervisor / Worker](/multi-agent-systems/supervisor-worker), [Task Delegation](/multi-agent-systems/task-delegation)
- Source folder: [`hierarchical-agent-pattern/`](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/hierarchical-agent-pattern)
- Download: [supervisor-worker.zip](/downloads/supervisor-worker.zip)
- Main file: `hierarchical-agent-pattern/autogen_typescript_example/hierarchical_agent.ts`

## Setup

This example calls Mistral. From the repository root:

```sh
npm install
cp .env.example .env
```

Set `MISTRAL_API_KEY` in `.env`.

## Run It

```sh
npm run hierarchical-agent
```

When prompted, enter a goal such as:

```text
Draft a short plan for evaluating an agentic RAG prototype.
```

## Inspect The Code

Open `hierarchical-agent-pattern/autogen_typescript_example/hierarchical_agent.ts` and find:

- the manager prompt
- worker prompts
- subtask extraction
- aggregation prompt
- final answer path

The supervisor owns decomposition and final acceptance. Workers should not silently redefine the goal.

## Change One Thing

Change the manager instruction so it asks for three subtasks instead of two. Then inspect the parsing logic:

```ts
const subTasks = managerPlan.match(/Sub-task [12]: (.*)/g) || [];
```

Update the regex so the code can collect the third subtask.

## Expected Result

The manager should produce a plan, workers should produce bounded results, and the final aggregation should combine the worker outputs. If the parsing is brittle, the supervisor loses work.

## Production Extension

Replace natural-language subtask parsing with structured output:

- `subtasks: Array<{ id, role, objective, constraints, expected_output }>`
- worker-specific permissions
- per-worker timeout
- merge policy
- judge or evaluator
- human escalation for disagreement

Multi-agent systems need strong contracts. More agents without a merge policy usually means more failure modes.

## Related Chapters

- [Parallel Agents](/multi-agent-systems/parallel-agents)
- [Debate and Consensus](/multi-agent-systems/debate-and-consensus)
- [CrewAI Flows and Crews](/multi-agent-systems/crewai-flows-and-crews)
