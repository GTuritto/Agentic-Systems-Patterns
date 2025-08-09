import axios from 'axios';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: true });

interface ToolManifest {
  name: string;
  description: string;
  input_schema: object;
  endpoint: string;
  method: 'POST';
}

interface ContextEntry { key: string; value: string }

async function main() {
  const base = process.env.MCP_BASE || 'http://localhost:8787';
  const man = await axios.get(`${base}/manifest`).then(r => r.data as { tools: ToolManifest[], context: ContextEntry[] });
  console.log('Manifest tools:', man.tools.map(t => t.name));

  // validate a sample invoke for each tool
  for (const t of man.tools) {
    const validate = ajv.compile(t.input_schema);
    if (t.name === 'math.add') {
      const input = { a: 2, b: 3 };
      if (!validate(input)) throw new Error('schema validation failed for math.add');
      const out = await axios.post(`${base}${t.endpoint}`, { tool: t.name, input }).then(r => r.data);
      console.log('math.add ->', out);
    }
    if (t.name === 'web.search') {
      const input = { query: 'agentic systems' };
      if (!validate(input)) throw new Error('schema validation failed for web.search');
      const out = await axios.post(`${base}${t.endpoint}`, { tool: t.name, input }).then(r => r.data);
      console.log('web.search ->', out);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
