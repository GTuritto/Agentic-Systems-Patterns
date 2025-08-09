import { BusMemory } from './bus_memory.js';
import { AgentA } from './agent_a.js';
import { AgentB } from './agent_b.js';

async function run() {
  const bus = new BusMemory();
  const a = new AgentA(bus);
  const b = new AgentB(bus);
  a.start();
  b.start();
  a.handshake();
  a.requestTask('t1', 'sum', { a: 2, b: 5 });
}

run();
