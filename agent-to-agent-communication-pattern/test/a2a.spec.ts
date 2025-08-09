import { BusMemory } from '../src/bus_memory.ts';
import type { Msg } from '../src/bus_memory.ts';
import { AgentA } from '../src/agent_a.ts';
import { AgentB } from '../src/agent_b.ts';

async function run() {
  const bus = new BusMemory();
  const a = new AgentA(bus);
  const b = new AgentB(bus);
  a.start();
  b.start();
  a.handshake();
  // success case
  a.requestTask('t1', 'sum', { a: 1, b: 2 });
  // refusal case (unsupported task)
  a.requestTask('t2', 'multiply' as any, { a: 2, b: 3 });
  // error case (bad input)
  a.requestTask('t3', 'sum', { a: 'x' as any, b: 1 });
  // cancel case
  bus.publish({ type: 'Cancel', payload: { id: 't4', reason: 'user_request' } } as Msg);
  console.log('A2A tests executed: success, refusal, error, cancel');
}

run();
