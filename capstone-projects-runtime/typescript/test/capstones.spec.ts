import {
  runAllCapstones,
  runMultiAgentDeliveryCapstone,
  runResearchRagCapstone,
  runSupportRefundCapstone
} from '../src/capstones.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const support = runSupportRefundCapstone();
assert(support.evals.every(item => item.status === 'pass'), 'support refund evals should pass');
assert(support.trace.some(event => event.reason === 'agent_cannot_issue_refund'), 'support refund should deny money movement');
assert(String(support.state.draftRecommendation).includes('Do not issue money'), 'support refund draft should stop before money movement');

const research = runResearchRagCapstone();
assert(research.evals.every(item => item.status === 'pass'), 'research RAG evals should pass');
assert(Array.isArray(research.state.contextPacket), 'research context packet should be an array');
assert((research.state.contextPacket as string[]).includes('refund-policy-v4'), 'research should include current source');
assert(!(research.state.contextPacket as string[]).includes('refund-policy-v2'), 'research should exclude stale source');

const delivery = runMultiAgentDeliveryCapstone();
assert(delivery.evals.every(item => item.status === 'pass'), 'delivery workflow evals should pass');
assert(delivery.state.finalOwner === 'workflow', 'delivery workflow should keep one final owner');
assert(delivery.trace.some(event => event.caseId === 'delivery_workflow_release_gate'), 'delivery workflow should emit release gate eval');

assert(runAllCapstones().length === 3, 'expected three capstones');

console.log('Capstone project tests OK');
