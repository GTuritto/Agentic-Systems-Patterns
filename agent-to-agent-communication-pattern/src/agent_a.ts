import { BusMemory, A2A_SCHEMA, Msg } from './bus_memory.js';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: true });
const validateResponse = ajv.compile(A2A_SCHEMA.TaskResponse);

export class AgentA {
  constructor(private bus: BusMemory) {}
  start() {
    // listen for responses
    this.bus.subscribe('TaskResponse', (m: Msg) => {
      if (!validateResponse(m.payload)) {
        console.error('Invalid TaskResponse', validateResponse.errors);
        return;
      }
      console.log('AgentA received response:', m.payload);
    });
  }
  handshake() {
    this.bus.publish({ type: 'Handshake', payload: { version: '1.0', capabilities: ['tasks', 'cancel'] } });
  }
  requestTask(id: string, task_type: string, input: any) {
    this.bus.publish({ type: 'TaskRequest', payload: { id, task_type, input, meta: { ts: Date.now() } } });
  }
  cancel(id: string, reason: string) {
    this.bus.publish({ type: 'Cancel', payload: { id, reason } });
  }
}
