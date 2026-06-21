import fs from 'node:fs';
import { runAllCapstones } from '../capstone-projects-runtime/typescript/src/capstones.ts';

type EvidenceSpec = {
  name: string;
  chapter: string;
  traceAsset: string;
  evalReport: string;
  releaseGate: string;
};

const specs: EvidenceSpec[] = [
  {
    name: 'support-refund-agent',
    chapter: 'book/docs/capstone-projects/support-refund-agent.md',
    traceAsset: 'book/docs/public/capstone-assets/traces/support-refund-agent.trace.json',
    evalReport: 'book/docs/public/capstone-assets/eval-reports/support-refund-agent-eval-report.txt',
    releaseGate: 'support_refund_release_gate'
  },
  {
    name: 'research-rag-agent',
    chapter: 'book/docs/capstone-projects/research-rag-agent.md',
    traceAsset: 'book/docs/public/capstone-assets/traces/research-rag-agent.trace.json',
    evalReport: 'book/docs/public/capstone-assets/eval-reports/research-rag-agent-eval-report.txt',
    releaseGate: 'research_rag_release_gate'
  },
  {
    name: 'multi-agent-delivery-workflow',
    chapter: 'book/docs/capstone-projects/multi-agent-delivery-workflow.md',
    traceAsset: 'book/docs/public/capstone-assets/traces/multi-agent-delivery-workflow.trace.json',
    evalReport: 'book/docs/public/capstone-assets/eval-reports/multi-agent-delivery-workflow-eval-report.txt',
    releaseGate: 'delivery_workflow_release_gate'
  }
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(file: string) {
  return fs.readFileSync(file, 'utf8');
}

const runtimeResults = runAllCapstones();

for (const spec of specs) {
  const result = runtimeResults.find(item => item.name === spec.name);
  assert(result, `${spec.name}: runtime result missing`);

  const chapter = read(spec.chapter);
  const traceText = read(spec.traceAsset);
  const evalReport = read(spec.evalReport);
  const traceAsset = JSON.parse(traceText) as unknown;
  const stopReason = String(result.state.stopReason);
  const traceEvents = String(result.trace.length);
  const evalIds = result.evals.map(item => item.caseId);

  assert(chapter.includes(`${spec.name}: pass`), `${spec.name}: chapter missing demo pass line`);
  assert(chapter.includes(`stop: ${stopReason}`), `${spec.name}: chapter missing stop reason ${stopReason}`);
  assert(chapter.includes(`trace events: ${traceEvents}`), `${spec.name}: chapter missing trace event count ${traceEvents}`);
  assert(chapter.includes('/capstone-assets/traces/'), `${spec.name}: chapter missing trace asset link`);
  assert(chapter.includes('/capstone-assets/eval-reports/'), `${spec.name}: chapter missing eval report link`);
  assert(chapter.includes('/capstone-assets/templates/capstone-review-scorecard.txt'), `${spec.name}: chapter missing review scorecard link`);
  assert(chapter.includes(spec.releaseGate), `${spec.name}: chapter missing release gate ${spec.releaseGate}`);
  assert(traceText.includes(spec.releaseGate), `${spec.name}: trace asset missing release gate ${spec.releaseGate}`);
  assert(traceText.includes(stopReason) || chapter.includes(stopReason), `${spec.name}: stop reason missing from evidence`);
  assert(typeof traceAsset === 'object' && traceAsset !== null, `${spec.name}: trace asset is not a JSON object`);
  assert(evalReport.includes(`release: ${spec.name}@1.0.0`), `${spec.name}: eval report missing release version`);
  assert(evalReport.includes('Blocking failures: 0'), `${spec.name}: eval report missing blocking failure count`);
  assert(evalReport.includes('Release decision: pass'), `${spec.name}: eval report missing release decision`);

  for (const evalId of evalIds) {
    assert(chapter.includes(evalId), `${spec.name}: chapter missing eval ${evalId}`);
    assert(evalReport.includes(evalId), `${spec.name}: eval report missing eval ${evalId}`);
  }
}

console.log('Capstone evidence consistency OK');
