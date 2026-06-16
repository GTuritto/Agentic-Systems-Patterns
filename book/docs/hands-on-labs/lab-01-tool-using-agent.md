---
title: Lab 01 - Build a Tool-Using Agent
---

# Lab 01 - Build a Tool-Using Agent

## Objective

Build the smallest useful agent boundary: a user message enters, the agent decides whether a tool is needed, the tool runs behind code, and the result returns through a controlled interface.

## What You Will Use

- Pattern chapter: [Tool Use](/foundations/tool-use)
- Source folder: [`tool-using-agent-pattern/`](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/tool-using-agent-pattern)
- Download: [tool-use.zip](/downloads/tool-use.zip)
- Main file: `tool-using-agent-pattern/autogen_typescript_example/tool_using_agent.ts`

## Setup

From the repository root:

```sh
npm install
```

The calculator path works without a model key. The fallback chat path calls Mistral and requires `MISTRAL_API_KEY`.

## Run It

```sh
NON_INTERACTIVE_INPUT="calculate 2+2" npm run tool-using-agent
```

Expected result:

```text
Agent: 4
```

## Inspect The Code

Open `tool-using-agent-pattern/autogen_typescript_example/tool_using_agent.ts` and find:

- `calculatorTool(input: string)`: the real capability.
- `toolUsingAgent(userInput: string)`: the routing boundary.
- The `calculate ` prefix check: the smallest possible tool-selection policy.

The important design point is that the model does not execute the calculation. Code owns the tool.

## Change One Thing

Change the input:

```sh
NON_INTERACTIVE_INPUT="calculate (12+8)/5" npm run tool-using-agent
```

Then try invalid input:

```sh
NON_INTERACTIVE_INPUT="calculate not-a-number" npm run tool-using-agent
```

## Expected Result

The valid expression should return a number. The invalid expression should return an error string instead of crashing the process.

## Production Extension

Replace prefix routing with a typed tool request:

- tool name
- JSON schema for arguments
- authorization check
- timeout
- structured success or error result
- trace ID for the run

Do not give the model broad access to arbitrary functions. Expose narrow tools with explicit permissions.

## Related Chapters

- [MCP-first Tool Use](/tools-skills-protocols/mcp-first-tool-use)
- [Human Approval Gates](/tools-skills-protocols/human-approval-gates)
- [Policy Enforcement](/production-runtime/policy-enforcement)
