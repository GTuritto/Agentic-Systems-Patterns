import { BusMemory } from '../src/bus_memory.js';
import { AgentA } from '../src/agent_a.js';
import { AgentB } from '../src/agent_b.js';

async function run() {
  const bus = new BusMemory();
  const a = new AgentA(bus);
  const b = new AgentB(bus);
  a.start();
  b.start();
  a.handshake();
  a.requestTask('x', 'sum', { a: 1, b: 2 });
  console.log('A2A test executed');
}

run();
