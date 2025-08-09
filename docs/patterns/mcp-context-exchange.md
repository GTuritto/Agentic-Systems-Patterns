# MCP Context Exchange Pattern

A minimal Model Context Protocol showcasing discovery, validation, invocation, and result exchange.

## Sequence

```mermaid
sequenceDiagram
  participant C as MCP Client
  participant S as MCP Server
  C->>S: GET /manifest
  S-->>C: {tools, context}
  C->>C: Validate input with JSON Schema
  C->>S: POST /invoke {tool, input}
  S-->>C: {ok, output}
```

## Notes

- Tools expose JSON Schemas for inputs.
- Client validates before invoking.
- No external web IO; Mistral can be used for planning text only if needed.
