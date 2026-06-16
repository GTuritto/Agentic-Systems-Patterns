---
title: Lab 04 - Build A2A Agent Communication
---

# Lab 04 - Build A2A Agent Communication

## Objective

Build a typed communication boundary between two agents. One agent requests work, another agent accepts, refuses, errors, or receives cancellation through explicit messages.

## What You Will Use

- Pattern chapter: [A2A Agent Interoperability](/tools-skills-protocols/a2a-agent-interoperability)
- Source folder: [`agent-to-agent-communication-pattern/`](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/agent-to-agent-communication-pattern)
- Download: [a2a-agent-interoperability.zip](/downloads/a2a-agent-interoperability.zip)
- Main files:
  - `agent-to-agent-communication-pattern/src/agent_a.ts`
  - `agent-to-agent-communication-pattern/src/agent_b.ts`
  - `agent-to-agent-communication-pattern/src/bus_memory.ts`
  - `agent-to-agent-communication-pattern/protocol/a2a.schema.json`

## Setup

From the repository root:

```sh
npm install
```

## Run It

Run the protocol test:

```sh
npm run a2a:test
```

Run the demo:

```sh
npm run a2a:run
```

## Inspect The Code

Open `agent-to-agent-communication-pattern/src/agent_a.ts` and `agent-to-agent-communication-pattern/src/agent_b.ts`.

Look for:

- handshake
- task request
- task response
- refusal
- invalid input error
- cancellation
- schema validation with Ajv

## Change One Thing

In the test, add a second valid task request with a different ID:

```ts
a.requestTask('t5', 'sum', { a: 10, b: 15 });
```

Run:

```sh
npm run a2a:test
```

## Expected Result

The receiver should process the new task without confusing it with the existing task IDs. If correlation IDs are missing, progress and results become hard to match.

## Production Extension

Before using A2A across services, add:

- authentication
- authorization
- idempotency keys
- task leases
- retry policy
- durable task state
- audit logs
- transport-level encryption

A2A is a protocol boundary, not just one agent calling another function.

## Related Chapters

- [Secure Agent Communication](/tools-skills-protocols/secure-agent-communication)
- [MCP-first Tool Use](/tools-skills-protocols/mcp-first-tool-use)
- [Open Personal Agent Architectures](/systems-architecture/open-personal-agent-architectures)
