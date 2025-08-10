import { routerByLLM, routerByEmbedding, combineRouters } from './router_strategies.ts';
import { billingAgent, techSupportAgent, salesAgent } from './specialists.ts';
import type { RouterState } from './specialists.ts';

async function main() {
  const args = process.argv.slice(2);
  const inputText = args.join(' ') || 'I need a refund for a wrong charge on my invoice.';
  const state: RouterState = { fast: process.env.FAST === 'true', budget: (process.env.BUDGET as any) || 'std' };
  const apiKey = process.env.MISTRAL_API_KEY;

  const llm = await routerByLLM([
    { role: 'system', content: 'Route user requests to billing, tech, or sales.' },
    { role: 'user', content: inputText }
  ], apiKey);
  const emb = await routerByEmbedding(inputText);
  const decision = combineRouters(llm, emb, state);

  let output: any;
  const routes = ['billing','tech','sales'] as const;
  for (const r of [decision.route, ...routes.filter(x=>x!==decision.route)]) {
    try {
      if (r==='billing') output = await billingAgent({ user: 'demo', text: inputText }, state);
      else if (r==='tech') output = await techSupportAgent({ issue: inputText }, state);
      else output = await salesAgent({ product: 'unknown', text: inputText }, state);
      console.log(JSON.stringify({ route: r, from: decision, llm, emb, output }, null, 2));
      return;
    } catch (e:any) {
      console.error('Agent failed on route', r, e?.message || e);
      continue;
    }
  }
  console.error('All specialists failed');
  process.exit(1);
}

main().catch(err=>{ console.error(err); process.exit(1); });
