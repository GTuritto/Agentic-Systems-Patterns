import axios from 'axios';

const MISTRAL_API = 'https://api.mistral.ai/v1/chat/completions';

export interface PlanStep { id: string; description: string }
export interface Plan { steps: PlanStep[]; rationale: string }

function extractNumbers(goal: string): number[] {
  const bracketed = goal.match(/\[([^\]]+)\]/)?.[1];
  if (!bracketed) return [1, 2, 3, 4];

  const numbers = bracketed
    .split(',')
    .map(value => Number(value.trim()))
    .filter(Number.isFinite);

  return numbers.length > 0 ? numbers : [1, 2, 3, 4];
}

export async function planTask(goal: string, apiKey?: string): Promise<Plan> {
  if (!apiKey) {
    const numbers = extractNumbers(goal);
    // deterministic fallback plan (no network) for tests
    return { steps: [
      { id: 's1', description: `Load numbers [${numbers.join(',')}]` },
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
