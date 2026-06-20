import { runAllCapstones } from './capstones.ts';

for (const result of runAllCapstones()) {
  console.log(`${result.name}: ${result.evals.every(item => item.status === 'pass') ? 'pass' : 'fail'}`);
  console.log(`  stop: ${String(result.state.stopReason)}`);
  console.log(`  trace events: ${result.trace.length}`);
}
