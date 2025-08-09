import axios from 'axios';

async function run() {
  const base = process.env.MCP_BASE || 'http://localhost:8787';
  const man = await axios.get(`${base}/manifest`).then(r => r.data);
  if (!man.tools || !Array.isArray(man.tools)) throw new Error('manifest tools missing');
  const add = man.tools.find((t: any) => t.name === 'math.add');
  if (!add) throw new Error('math.add not found');
  const res = await axios.post(`${base}/invoke`, { tool: 'math.add', input: { a: 1, b: 2 } }).then(r => r.data);
  if (!res.ok || res.output.sum !== 3) throw new Error('invoke math.add failed');
  console.log('MCP manifest/invoke test passed');
}

run().catch(err => { console.error(err); process.exit(1); });
