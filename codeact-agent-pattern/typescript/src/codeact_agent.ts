import axios from 'axios';
import vm from 'node:vm';

const MISTRAL_API = 'https://api.mistral.ai/v1/chat/completions';

async function mistralPlan(prompt: string, apiKey?: string) {
  if (!apiKey) throw new Error('MISTRAL_API_KEY required');
  const resp = await axios.post(MISTRAL_API, {
    model: 'mistral-small-latest',
    messages: [
      { role: 'system', content: 'You plan tiny step-by-step JavaScript snippets to solve the task. Output JSON with {code, reason}.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0
  }, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  const content = resp.data?.choices?.[0]?.message?.content || '';
  try { return JSON.parse(content); } catch { return { code: '', reason: content }; }
}

export function runSnippet(code: string) {
  const sandbox: any = { console: { log: (..._args: any[]) => {} }, result: null };
  const script = new vm.Script(`(function(){ ${code}\n; return typeof result!== 'undefined'? result : null; })()`);
  const ctx = vm.createContext(sandbox);
  const output = script.runInContext(ctx, { timeout: 500 });
  return { output };
}

export async function runLoop(task: string, plans?: Array<{ code: string }>, apiKey?: string) {
  let observation = '';
  for (let i = 0; i < 3; i++) {
    let plan: { code: string; reason?: string } | undefined = plans?.[i];
    if (!plan) {
      plan = await mistralPlan(`Task: ${task}\nObservation: ${observation}\nRespond with JSON: {"code": "...", "reason":"..."}`, apiKey);
    }
    if (!plan?.code) throw new Error('Planner did not return code');
    const { output } = runSnippet(plan.code);
    if (typeof output === 'number') { return output; }
    observation = `Output was ${JSON.stringify(output)}`;
  }
  throw new Error('Gave up');
}

async function main() {
  const apiKey = process.env.MISTRAL_API_KEY;
  const task = process.argv.slice(2).join(' ') || 'Compute average of numbers [1,2,3,4]. Provide a JS snippet that sets result to the numeric answer.';
  const planCodeArg = process.argv.find(a => a.startsWith('--plan-code='));
  const planCode = planCodeArg ? decodeURIComponent(planCodeArg.split('=')[1]) : undefined;
  const result = await runLoop(task, planCode ? [{ code: planCode }] : undefined, apiKey);
  console.log('FINAL', result);
}

main().catch(err => { console.error(err); process.exit(1); });
