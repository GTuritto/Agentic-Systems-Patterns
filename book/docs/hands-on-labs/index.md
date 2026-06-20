---
title: Hands-On Labs
---

# Hands-On Labs

The labs turn the reference chapters into a build path. Each lab uses code that already lives in this repository, so you can read the pattern, run the example, change one thing, and connect the result back to production design.

The labs are intentionally framework-agnostic. They move between TypeScript and Python, and across minimal custom runtimes, LangChain/LangGraph-style retrieval, AutoGen-style manager/worker examples, A2A protocol code, MCP-style tool boundaries, and framework-neutral tests. The point is not to teach one API. The point is to show the architecture that survives when the framework changes.

Use [Lab Framework and Language Matrix](./framework-language-matrix.md) before starting if you want to see which language, framework, and architectural boundary each lab emphasizes. Use [Vertical Slice Examples](./vertical-slice-examples.md) after the labs, or whenever you want to see several patterns composed into one realistic task.

Run these commands from the repository root before starting:

```sh
npm install
npm test
npm run typecheck
```

Some examples can run with deterministic fallbacks. Examples that call live models require a `.env` file with `MISTRAL_API_KEY`.

## Lab Standard

Each lab should leave you with three things: a runnable example, a specific design boundary you can explain, and one production hardening step you know how to make.

Every lab follows the same learning contract:

1. State the objective.
2. Name the language, framework, and source files.
3. Run a baseline command.
4. Inspect the code boundary.
5. Change one thing.
6. Verify the result.
7. Identify what production would need next.

The examples stay small on purpose. A small example is useful only when the lab also says what is intentionally missing: durable state, policy enforcement, stronger schemas, approval, tracing, evals, deployment, or framework integration.

## Framework-Agnostic Rule

Frameworks change the API, not the architecture questions. For every lab, ask:

- What owns state?
- What can the model decide?
- What can software validate?
- What tools are exposed?
- What policy is enforced outside the prompt?
- What is traced?
- Why does the run stop?

Those questions apply whether the code uses LangGraph, LangChain, Mastra AI, AutoGen-style agents, CrewAI, MCP, A2A, or a small custom runtime.

## Lab Sequence

1. [Lab Framework and Language Matrix](./framework-language-matrix.md)
2. [Build a Tool-Using Agent](./lab-01-tool-using-agent.md)
3. [Build an Agent Loop with Planning](./lab-02-agent-loop-and-planning.md)
4. [Build Agentic RAG](./lab-03-agentic-rag.md)
5. [Build A2A Agent Communication](./lab-04-a2a-communication.md)
6. [Build a Multi-Agent Supervisor](./lab-05-multi-agent-supervisor.md)
7. [Add Observability and Evals](./lab-06-observability-and-evals.md)
8. [Study Vertical Slice Examples](./vertical-slice-examples.md)

## How To Use These Labs

Read the objective first, then run the command exactly as shown. After that, inspect the named source files and make the small change in the lab. The goal is to see where the pattern becomes code: input contracts, state, tool boundaries, stop conditions, evaluation, and failure handling.

Each lab ends with a production extension. Treat that section as the bridge between a working demo and an architecture decision.

## Recommended Order

Do the labs in order if you are new to agent systems. The sequence starts with one agent and one tool, then adds planning, retrieval, remote agent communication, multi-agent coordination, and production-quality evaluation.

If you already know the basics, start with the lab closest to your current system and use the related chapters as reference material.

After the labs, read the vertical slices to see how the same patterns compose into support, coding, and research workflows.
