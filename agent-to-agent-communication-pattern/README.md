# Agent-to-Agent Communication Protocol (A2A)

Schema-driven protocol for agents to negotiate tasks, exchange state, and report results.

## Protocol Types

See `./protocol/a2a.schema.json` for JSON Schemas of:

- Handshake
- TaskRequest
- TaskResponse
- Progress
- Cancel

## How to run (TS)

- Demo: `ts-node --esm ./agent-to-agent-communication-pattern/src/run_demo.ts`
- Test: `ts-node --esm ./agent-to-agent-communication-pattern/test/a2a.spec.ts`

## Notes

- Messages validated against schemas before delivery.
- Bus is in-memory; swap to a real transport without changing messages.
