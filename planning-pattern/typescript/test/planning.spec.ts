import { planTask } from '../src/planner.ts';
import { executePlan } from '../src/executor.ts';

async function run() {
  const plan = await planTask('Compute average of [1,2,3,4]'); // uses deterministic fallback
  if (!plan.steps?.length) throw new Error('No steps');
  const results = await executePlan(plan.steps);
  const avg = results['s2'];
  if (avg !== 2.5) throw new Error(`Unexpected avg: ${avg}`);
  const changedPlan = await planTask('Compute average of [10,20,30]');
  const changedResults = await executePlan(changedPlan.steps);
  if (changedResults['s2'] !== 20) throw new Error(`Unexpected changed avg: ${changedResults['s2']}`);
  const unsupportedResults = await executePlan([
    { id: 's1', description: 'Send refund directly' },
  ]);
  const unsupported = unsupportedResults['s1'];
  if (typeof unsupported !== 'object' || unsupported === null || !('error_type' in unsupported)) {
    throw new Error('Expected unsupported step to return structured failure');
  }
  if (unsupported.error_type !== 'unsupported_step') {
    throw new Error(`Unexpected unsupported failure: ${unsupported.error_type}`);
  }
  const malformedResults = await executePlan([
    { id: 's2', description: 'Compute average' },
  ]);
  const malformed = malformedResults['s2'];
  if (typeof malformed !== 'object' || malformed === null || !('error_type' in malformed)) {
    throw new Error('Expected missing numbers to return structured failure');
  }
  if (malformed.error_type !== 'missing_numbers') {
    throw new Error(`Unexpected malformed failure: ${malformed.error_type}`);
  }
  console.log('Planning test OK');
}

run();
