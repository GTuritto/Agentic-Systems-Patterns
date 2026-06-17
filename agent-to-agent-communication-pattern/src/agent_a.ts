import { BusMemory, A2A_SCHEMA } from './bus_memory.ts';
import type { Msg } from './bus_memory.ts';
import Ajv from 'ajv';
import crypto from 'node:crypto';
const ajv = new Ajv({ allErrors: true, strict: true });
const validateResponse = ajv.compile((A2A_SCHEMA as any).properties.TaskResponse);

export class AgentA {
  private bus: BusMemory;
  private traceId = crypto.randomUUID();
  constructor(bus: BusMemory) { this.bus = bus; }
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
    this.bus.publish({
      type: 'TaskRequest',
      payload: {
        id,
        task_type,
        input,
        meta: {
          trace_id: this.traceId,
          message_id: crypto.randomUUID(),
          idempotency_key: `task:${id}`,
          from_agent: 'agent-a',
          to_agent: 'agent-b',
          tenant_id: 'tenant_a',
          auth: {
            audience: 'agent-b',
            scopes: ['task:sum']
          },
          timeout_ms: 30000,
          ts: Date.now()
        }
      }
    });
  }
  cancel(id: string, reason: string) {
    this.bus.publish({ type: 'Cancel', payload: { id, reason } });
  }
}
