import axios from 'axios';
import { spawn, type ChildProcess } from 'node:child_process';
import { runScenario } from '../src/agent.ts';

async function waitFor(url: string) {
  for (let i = 0; i < 20; i++) {
    try {
      await axios.get(url, { timeout: 250 });
      return;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function start(script: string) {
  return spawn('npm', ['run', script], { stdio: 'ignore' });
}

async function run() {
  const children: ChildProcess[] = [start('mcp:search'), start('mcp:cloud')];
  try {
    await Promise.all([
      waitFor('http://localhost:3031/manifest'),
      waitFor('http://localhost:3032/manifest')
    ]);
    const out = await runScenario();
    if (!out?.titles?.length) throw new Error('No titles stored');
    console.log('Modern Tool Use test OK');
  } finally {
    for (const child of children) child.kill();
  }
}

run();
