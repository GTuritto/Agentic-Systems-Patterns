import Ajv from 'ajv';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const schema = require('../protocol/a2a.schema.json');

const ajv = new Ajv({ allErrors: true, strict: true });

export type Msg =
  | { type: 'Handshake'; payload: any }
  | { type: 'TaskRequest'; payload: any }
  | { type: 'TaskResponse'; payload: any }
  | { type: 'Progress'; payload: any }
  | { type: 'Cancel'; payload: any };

const validators: Record<string, any> = {
  Handshake: ajv.compile((schema as any).properties.Handshake),
  TaskRequest: ajv.compile((schema as any).properties.TaskRequest),
  TaskResponse: ajv.compile((schema as any).properties.TaskResponse),
  Progress: ajv.compile((schema as any).properties.Progress),
  Cancel: ajv.compile((schema as any).properties.Cancel)
};

export class BusMemory {
  private subscribers: Record<string, ((m: Msg) => void)[]> = {};
  publish(m: Msg) {
    const v = validators[m.type];
    if (!v || !v(m.payload)) {
      throw new Error(`Invalid ${m.type}: ${JSON.stringify(v?.errors || 'no validator')}`);
    }
    (this.subscribers[m.type] || []).forEach(fn => fn(m));
  }
  subscribe(type: Msg['type'], fn: (m: Msg) => void) {
    this.subscribers[type] = this.subscribers[type] || [];
    this.subscribers[type].push(fn);
  }
}

export const A2A_SCHEMA = schema as any;
