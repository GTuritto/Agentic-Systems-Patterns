import { runSnippet, runLoop } from '../src/codeact_agent.js';

(async () => {
  const code = 'const arr=[1,2,3,4]; result = arr.reduce((a,b)=>a+b,0)/arr.length;';
  const r = runSnippet(code);
  if (r.output !== 2.5) throw new Error('snippet failed');
  const out = await runLoop('avg 1..4', [{ code }]);
  if (out !== 2.5) throw new Error('loop failed');
  console.log('CodeAct tests passed');
})();
