import { planTask } from './planner.ts';
import { executePlan } from './executor.ts';

async function main() {
  const goal = process.argv.slice(2).join(' ') || 'Compute average of [1,2,3,4]';
  const plan = await planTask(goal, process.env.MISTRAL_API_KEY);
  console.log('Plan:', plan);
  const results = await executePlan(plan.steps, (pct, stage) => console.log('Progress', pct, stage));
  console.log('Results:', results);
}

main();
