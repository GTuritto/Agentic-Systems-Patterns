import { BusMemory, A2A_SCHEMA, Msg } from './bus_memory.js';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: true });
const validateReq = ajv.compile(A2A_SCHEMA.TaskRequest);

export class AgentB {
  constructor(private bus: BusMemory) {}
  start() {
    this.bus.subscribe('Handshake', () => {
      this.bus.publish({ type: 'Handshake', payload: { version: '1.0', capabilities: ['tasks'] } });
    });
    this.bus.subscribe('TaskRequest', (m: Msg) => {
      if (!validateReq(m.payload)) return;
      const { id, task_type, input } = m.payload;
      if (task_type !== 'sum') {
        this.bus.publish({ type: 'TaskResponse', payload: { id, status: 'refused', error: 'unsupported_task' } });
        return;
      }
      // progress
      this.bus.publish({ type: 'Progress', payload: { id, stage: 'start', pct: 10, message: 'starting' } });
      const a = input?.a;
      const b = input?.b;
      if (typeof a !== 'number' || typeof b !== 'number') {
        this.bus.publish({ type: 'TaskResponse', payload: { id, status: 'error', error: 'invalid_input' } });
        return;
      }
      // compute safely
      const sum = a + b;
      this.bus.publish({ type: 'Progress', payload: { id, stage: 'compute', pct: 60 } });
      this.bus.publish({ type: 'TaskResponse', payload: { id, status: 'success', output: { sum } } });
    });
    this.bus.subscribe('Cancel', (m: Msg) => {
      console.log('AgentB cancel received:', m.payload);
    });
  }
}
