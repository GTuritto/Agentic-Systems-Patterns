import { planTask } from '../src/planner.ts';
import { executePlan } from '../src/executor.ts';

async function run() {
  const plan = await planTask('Compute average of [1,2,3,4]'); // uses deterministic fallback
  if (!plan.steps?.length) throw new Error('No steps');
  const results = await executePlan(plan.steps);
  const avg = results['s2'];
  if (avg !== 2.5) throw new Error(`Unexpected avg: ${avg}`);
  console.log('Planning test OK');
}

run();
