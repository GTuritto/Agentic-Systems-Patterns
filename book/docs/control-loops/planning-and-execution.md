---
title: Planning and Execution
---

# Planning and Execution

Planning separates deciding what to do from doing it. The planner creates steps; the executor runs them, reports progress, and handles errors.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/planning-pattern)
> - [Download code bundle](/downloads/planning-and-execution.zip)

## Intent

Planning separates deciding what to do from doing it. The planner creates steps; the executor runs them, reports progress, and handles errors.

## Use When

- The task has meaningful sequencing, dependencies, or recoverable failure points.
- You want to inspect or revise the plan before execution.
- Execution can be deterministic even if planning uses a model.

## Avoid When

- The plan would always be a single step.
- The executor cannot report structured progress or failure.
- The model is allowed to execute unvalidated plans directly.

## Implementation Notes

- Keep the pattern boundary explicit: inputs, state, side effects, and outputs should be visible.
- Validate model-produced decisions before they affect tools, users, or durable state.
- Emit enough trace data to debug failures after the run.

## Failure Modes

- The pattern is applied where a simpler deterministic workflow would be better.
- State, tool calls, or model decisions are not observable enough to debug.
- The system lacks clear stop, retry, or escalation behavior.

## Run the Example

```sh
npm run plan:test
npm run plan:run -- "Compute average of [1,2,3,4]"
npm run plan:py
```

## Code Walkthrough

Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.

## Source Code

These excerpts show the implementation shape. The complete code is available in the download bundle and repository source.

### `planning-pattern/typescript/src/planner.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/planning-pattern/typescript/src/planner.ts)

```ts
import axios from 'axios';

const MISTRAL_API = 'https://api.mistral.ai/v1/chat/completions';

export interface PlanStep { id: string; description: string }
export interface Plan { steps: PlanStep[]; rationale: string }

export async function planTask(goal: string, apiKey?: string): Promise<Plan> {
  if (!apiKey) {
    // deterministic fallback plan (no network) for tests
    return { steps: [
      { id: 's1', description: 'Load numbers [1,2,3,4]' },
      { id: 's2', description: 'Compute average' }
    ], rationale: 'synthetic' };
  }
  const resp = await axios.post(MISTRAL_API, {
    model: 'mistral-small-latest',
    messages: [
      { role: 'system', content: 'Return JSON {steps: [{id, description}], rationale} for the goal.' },
      { role: 'user', content: goal }
    ],
    temperature: 0
  }, { headers: { Authorization: `Bearer ${apiKey}` } });
  const content = resp.data?.choices?.[0]?.message?.content || '';
  try { return JSON.parse(content); } catch { return { steps: [], rationale: content }; }
}
```

### `planning-pattern/typescript/src/executor.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/planning-pattern/typescript/src/executor.ts)

```ts
export async function executePlan(steps: { id: string; description: string }[], onProgress?: (pct: number, stage: string) => void) {
  const results: Record<string, any> = {};
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    onProgress?.(Math.round((i / steps.length) * 100), s.id);
    // trivial synthetic execution
    if (s.description.includes('Load numbers')) results[s.id] = [1,2,3,4];
    else if (s.description.includes('Compute average')) {
      const arr = results['s1'] || [];
      results[s.id] = arr.reduce((a:number,b:number)=>a+b,0)/arr.length;
    } else results[s.id] = null;
  }
  onProgress?.(100, 'done');
  return results;
}
```

### `planning-pattern/typescript/src/run.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/planning-pattern/typescript/src/run.ts)

```ts
import { planTask } from './planner.js';
import { executePlan } from './executor.js';

async function main() {
  const goal = process.argv.slice(2).join(' ') || 'Compute average of [1,2,3,4]';
  const plan = await planTask(goal, process.env.MISTRAL_API_KEY);
  console.log('Plan:', plan);
  const results = await executePlan(plan.steps, (pct, stage) => console.log('Progress', pct, stage));
  console.log('Results:', results);
}

main();
```

## Download

- [Download source bundle](/downloads/planning-and-execution.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/planning-pattern)

The download bundle contains the current `planning-pattern/` folder from this repository.
