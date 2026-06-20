---
title: Hands-On Labs
---

# Hands-On Labs

The labs turn the reference chapters into a build path. Each lab uses code that already lives in this repository, so you can read the pattern, run the example, change one thing, and connect the result back to production design.

The labs are intentionally framework-agnostic. They move between TypeScript and Python, and across minimal custom runtimes, LangChain/LangGraph-style retrieval, AutoGen-style manager/worker examples, A2A protocol code, MCP-style tool boundaries, and framework-neutral tests. The point is not to teach one API. The point is to show the architecture that survives when the framework changes.

Use [Lab Framework and Language Matrix](./framework-language-matrix.md) before starting if you want to see which language, framework, and architectural boundary each lab emphasizes. Use [Lab Production Readiness Checklist](./production-readiness-checklist.md) after each lab to identify what the demo still needs before production. Use [From-Scratch Mini-Framework Track](./from-scratch-mini-framework.md) when you want to understand what agent frameworks package under the hood. Use [Vertical Slice Examples](./vertical-slice-examples.md) after the labs, or whenever you want to see several patterns composed into one realistic task. Use [Capstone Projects](/capstone-projects/) when you want product-shaped examples with ADRs, traces, evals, runbooks, rollback plans, and native framework slices.

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

The examples stay small on purpose. A small example is useful only when the lab also says what is intentionally missing: durable state, policy enforcement, stronger schemas, approval, tracing, evals, deployment, or framework integration. When a native framework slice exists, treat it as the next comparison point, not as a replacement for the deterministic lab.

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

## End-To-End Reader Path

Use this path when you want to move from learning to implementation:

1. Start with [Lab Framework and Language Matrix](./framework-language-matrix.md) and choose the highest-risk boundary.
2. Run the matching deterministic lab.
3. Read the production extension and readiness checklist.
4. Compare the matching native example under `native-framework-examples/`.
5. Map the same behavior to a capstone.
6. Fill out the framework selection ADR and rollback worksheet.
7. Add evals that fail the build before adding real side-effect tools.

For the support refund path, use Lab 07, `native-framework-examples/mastra-refund/`, the Support Refund Agent capstone, and the production readiness worksheet.

## Lab Sequence

1. [Lab Framework and Language Matrix](./framework-language-matrix.md)
2. [Lab Production Readiness Checklist](./production-readiness-checklist.md)
3. [Build a Tool-Using Agent](./lab-01-tool-using-agent.md)
4. [Build an Agent Loop with Planning](./lab-02-agent-loop-and-planning.md)
5. [Build Agentic RAG](./lab-03-agentic-rag.md)
6. [Build A2A Agent Communication](./lab-04-a2a-communication.md)
7. [Build a Multi-Agent Supervisor](./lab-05-multi-agent-supervisor.md)
8. [Add Observability and Evals](./lab-06-observability-and-evals.md)
9. [Package Agents, Tools, Workflows, Memory, and Evals](./lab-07-mastra-runtime-packaging.md)
10. [Model Flows, Crews, Roles, and Task Contracts](./lab-08-crewai-flows-and-crews.md)
11. [Study the From-Scratch Mini-Framework Track](./from-scratch-mini-framework.md)
12. [Build a Minimal Agent Loop](./lab-09-minimal-agent-loop.md)
13. [Build a Tool Registry and Policy Gate](./lab-10-tool-registry-and-policy-gate.md)
14. [Add Context, Memory, Trace, and Evals](./lab-11-context-memory-trace-evals.md)
15. [Model State Graphs, Checkpoints, and Interrupts](./lab-12-langgraph-state-graph.md)
16. [Evaluate Multi-Agent Transcripts](./lab-13-autogen-transcript-evals.md)
17. [Study Vertical Slice Examples](./vertical-slice-examples.md)

## How To Use These Labs

Read the objective first, then run the command exactly as shown. After that, inspect the named source files and make the small change in the lab. The goal is to see where the pattern becomes code: input contracts, state, tool boundaries, stop conditions, evaluation, and failure handling.

Each lab ends with a production extension. Treat that section as the bridge between a working demo and an architecture decision.

## Recommended Order

Do the labs in order if you are new to agent systems. The sequence starts with one agent and one tool, then adds planning, retrieval, remote agent communication, multi-agent coordination, and production-quality evaluation.

If you already know the basics, start with the lab closest to your current system and use the related chapters as reference material.

After the labs, read the vertical slices to see how the same patterns compose into support, coding, and research workflows. Then read the [Capstone Projects](/capstone-projects/) to see production-shaped systems with framework mappings, native slices, and release evidence.

If you are evaluating frameworks, do the mini-framework track before choosing a production runtime. Building the primitives once makes it easier to see which responsibilities a framework owns and which responsibilities remain in your application.
