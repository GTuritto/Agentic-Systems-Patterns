# MCP Context Exchange Pattern (TypeScript)

Expose an agent’s tools and context via a minimal MCP server and consume it via an MCP client.

## Endpoints

- GET `/manifest` → `{ tools: ToolManifest[], context: ContextEntry[] }`
- POST `/invoke` → `{ ok: boolean, tool: string, output: any, error?: string }`

## Run

- Server: `ts-node --esm ./src/mcp_server.ts`
- Client: `ts-node --esm ./src/mcp_client.ts`

Optional env:

- `PORT` (default 8787)
- `MCP_BASE` (client base URL)

## Tools

- `math.add` → adds two numbers (safe arithmetic)
- `web.search` → mocked search results
