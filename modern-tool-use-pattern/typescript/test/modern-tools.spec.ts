import { runScenario } from '../src/agent.js';

async function run() {
  const out = await runScenario();
  if (!out?.titles?.length) throw new Error('No titles stored');
  console.log('Modern Tool Use test OK');
}

run();
