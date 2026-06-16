---
title: Agent Loop
---

# Agent Loop

The agent loop turns a model call into an agent: observe state, decide the next action, act, evaluate the result, and stop when the goal is complete or a limit is reached.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/agent-loop-pattern)
> - [Download code bundle](/downloads/agent-loop.zip)

## Intent

The Agent Loop Pattern defines the runtime cycle that turns a model call into an agent: observe state, decide the next action, act through tools or messages, evaluate the result, and stop when the goal is complete or a limit is reached.

## Use When

- The next step is not fully known before execution starts.
- The agent may need multiple tool calls or revisions.
- You need explicit stop conditions, budgets, and recoverable state.

## Avoid When

- The task is a fixed workflow with known steps.
- A single prompt or deterministic function is sufficient.
- You cannot safely bound tool use, cost, or runtime.

## Architecture

![Agent loop architecture](../public/diagrams/agent-loop.svg)

## System Shape

- **Pattern boundary:** a narrow agent function, class, or service boundary accepts input plus context and returns a typed answer, action, or decision.
- **State owner:** the caller or a small application service owns task state until a runtime pattern is introduced.
- **Primary artifact:** `agent-loop-pattern/` contains the runnable reference implementation and examples.
- **Operational promise:** The agent loop turns a model call into an agent: observe state, decide the next action, act, evaluate the result, and stop when the goal is complete or a limit is reached.

## Core Protocol

1. Accept a bounded input, goal, or task request.
2. Assemble the minimum useful instructions, context, state, and tool descriptions.
3. Run the model or deterministic helper behind a typed boundary.
4. Validate the result before returning it to users, tools, or durable state.
5. Record enough evidence to explain the output later.

## Implementation Notes

- Persist the loop state: goal, messages, observations, tool calls, outputs, errors, and budget counters.
- Make stop conditions explicit: success predicate, max iterations, max cost, max wall-clock time, and user cancellation.
- Treat model output as a proposal. Validate tool names, tool inputs, structured outputs, and permissions before acting.
- Emit trace events for each loop iteration so failures can be debugged after the run.

## Failure Modes

- Infinite loops caused by vague goals or missing stop conditions.
- Repeated tool calls with no new information.
- Hidden state drift when observations are summarized too aggressively.
- Premature success when the evaluator only checks whether an answer exists.

## Evaluation Strategy

- Use golden tasks that cover normal requests, ambiguous requests, missing context, and invalid input.
- Check that outputs match the expected shape and that unsafe or unsupported requests are rejected.
- Track accuracy, schema validity, latency, token use, and refusal quality.
- Include cases that prove each "Use When" condition is true for this pattern.
- Include negative cases from "Avoid When" so the system chooses a simpler or safer pattern when appropriate.

## Production Checklist

- Define the input, context, output, and error contract.
- Keep prompts, schemas, and tool descriptions versioned.
- Add deterministic tests for the smallest useful behavior.
- Log model decisions without leaking secrets or private user data.
- Define human escalation for ambiguous, high-risk, or policy-blocked work.
- Keep the source bundle, generated chapter, tests, and deployment artifact in the same release.

## Code Walkthrough

Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.

## Source Code

This pattern currently has no dedicated code excerpt. Use the source and download links below for the full pattern folder.

## Download

- [Download source bundle](/downloads/agent-loop.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/agent-loop-pattern)

The download bundle contains the current `agent-loop-pattern/` folder from this repository.

## Related Patterns

- [Goals and State](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/goals-and-state-pattern/README.md)
- [Tool-Using Agent](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/tool-using-agent-pattern/README.md)
- [Evaluator-Optimizer](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/evaluator-optimizer-pattern/README.md)
