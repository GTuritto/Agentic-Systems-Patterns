import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// Types
interface ToolManifest {
  name: string;
  description: string;
  input_schema: object; // JSON Schema
  endpoint: string; // e.g., /invoke
  method: 'POST';
}

interface ContextEntry {
  key: string;
  value: string;
}

const tools: ToolManifest[] = [
  {
    name: 'math.add',
    description: 'Safely add two numbers',
    input_schema: {
      type: 'object',
      required: ['a', 'b'],
      properties: {
        a: { type: 'number' },
        b: { type: 'number' }
      },
      additionalProperties: false
    },
    endpoint: '/invoke',
    method: 'POST'
  },
  {
    name: 'web.search',
    description: 'Return mock search results for a query (no external IO).',
    input_schema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string', minLength: 1 }
      },
      additionalProperties: false
    },
    endpoint: '/invoke',
    method: 'POST'
  }
];

const context: ContextEntry[] = [
  { key: 'llm.provider', value: 'mistral' },
  { key: 'embeddings', value: 'sentence-transformers/all-MiniLM-L6-v2' },
  { key: 'notes', value: 'No external web IO; safe math only; Node ESM.' }
];

const app = express();
app.use(express.json());

app.get('/manifest', (_req: Request, res: Response) => {
  res.json({ tools, context });
});

app.post('/invoke', (req: Request, res: Response) => {
  const { tool, input } = req.body || {};
  const manifest = tools.find(t => t.name === tool);
  if (!manifest) return res.status(400).json({ ok: false, error: 'unknown_tool', tool });
  // minimal validation (client performs full JSON Schema validation)
  if (manifest.name === 'math.add') {
    const { a, b } = input || {};
    if (typeof a !== 'number' || typeof b !== 'number') {
      return res.status(400).json({ ok: false, tool, error: 'invalid_input' });
    }
    return res.json({ ok: true, tool, output: { sum: a + b } });
  }
  if (manifest.name === 'web.search') {
    const { query } = input || {};
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ ok: false, tool, error: 'invalid_input' });
    }
    // mocked results
    const results = [
      { title: `Result for ${query} #1`, url: 'https://example.com/1', snippet: 'Sample snippet 1' },
      { title: `Result for ${query} #2`, url: 'https://example.com/2', snippet: 'Sample snippet 2' }
    ];
    return res.json({ ok: true, tool, output: { results } });
  }
  return res.status(400).json({ ok: false, tool, error: 'not_implemented' });
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`MCP server listening on http://localhost:${port}`);
});
