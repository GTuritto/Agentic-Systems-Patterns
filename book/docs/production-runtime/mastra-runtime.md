---
title: Mastra Runtime
---

# Mastra Runtime

Mastra is a TypeScript runtime pattern for applications that need agents, workflows, tools, memory, evals, and observability in one framework.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/mastra-runtime-pattern)
> - [Download code bundle](/downloads/mastra-runtime.zip)

## Intent

The Mastra Runtime Pattern uses Mastra as a TypeScript runtime for production agent applications. Mastra gives agents, workflows, tools, memory, evals, and observability a shared application structure.

## Use When

- You are building a TypeScript or Node-based agent product.
- You need agents and deterministic workflows in the same runtime.
- You want memory, tools, evals, and tracing to be first-class concerns.

## Avoid When

- You only need a small script or single model call.
- Your team is committed to a Python-first agent stack.
- You cannot accept framework conventions around project structure and deployment.

## Architecture

```mermaid
flowchart TD
  App[Application] --> Agent[Mastra Agent]
  App --> Workflow[Mastra Workflow]
  Agent --> Tools[Tools]
  Agent --> Memory[Memory]
  Workflow --> Agent
  Workflow --> Evals[Evals]
  App --> Obs[Observability]
```

## Implementation Notes

- Use agents for open-ended decisions where the next step is not known upfront.
- Use workflows for predetermined control flow, state transitions, retries, and production orchestration.
- Keep tools typed and independently testable.
- Capture traces and evals from the beginning rather than adding them after failures.

## Failure Modes

- Treating the framework as the architecture instead of modeling goals, state, and failure modes.
- Putting deterministic workflow logic inside prompts.
- Creating tools with vague descriptions and unvalidated inputs.
- Shipping without eval datasets or trace review.

## Code Walkthrough

Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.

## Source Code

This pattern currently has no dedicated code excerpt. Use the source and download links below for the full pattern folder.

## Download

- [Download source bundle](/downloads/mastra-runtime.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/mastra-runtime-pattern)

The download bundle contains the current `mastra-runtime-pattern/` folder from this repository.

## Related Patterns

- [Durable Workflow](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/durable-workflow-pattern/README.md)
- [Observability and Evals](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/observability-and-evals-pattern/README.md)
- [Agent Loop](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/agent-loop-pattern/README.md)
