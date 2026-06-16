---
title: Hands-On Labs
---

# Hands-On Labs

The labs turn the reference chapters into a build path. Each lab uses code that already lives in this repository, so you can read the pattern, run the example, change one thing, and connect the result back to production design.

Run these commands from the repository root before starting:

```sh
npm install
npm test
npm run typecheck
```

Some examples can run with deterministic fallbacks. Examples that call live models require a `.env` file with `MISTRAL_API_KEY`.

## Lab Sequence

1. [Build a Tool-Using Agent](./lab-01-tool-using-agent.md)
2. [Build an Agent Loop with Planning](./lab-02-agent-loop-and-planning.md)
3. [Build Agentic RAG](./lab-03-agentic-rag.md)
4. [Build A2A Agent Communication](./lab-04-a2a-communication.md)
5. [Build a Multi-Agent Supervisor](./lab-05-multi-agent-supervisor.md)
6. [Add Observability and Evals](./lab-06-observability-and-evals.md)

## How To Use These Labs

Read the objective first, then run the command exactly as shown. After that, inspect the named source files and make the small change in the lab. The goal is not to memorize a framework API. The goal is to see where the pattern becomes code: input contracts, state, tool boundaries, stop conditions, evaluation, and failure handling.

Each lab ends with a production extension. Treat that section as the bridge between a working demo and an architecture decision.

## Recommended Order

Do the labs in order if you are new to agent systems. The sequence starts with one agent and one tool, then adds planning, retrieval, remote agent communication, multi-agent coordination, and production-quality evaluation.

If you already know the basics, start with the lab closest to your current system and use the related chapters as reference material.
