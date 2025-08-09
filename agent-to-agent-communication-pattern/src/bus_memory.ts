import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: true });

// Load schema parts (kept inline for simplicity)
const schema = {
  Handshake: {
    type: 'object',
    required: ['version', 'capabilities'],
    properties: {
      version: { type: 'string' },
      capabilities: { type: 'array', items: { type: 'string' } }
    },
    additionalProperties: false
  },
  TaskRequest: {
    type: 'object',
    required: ['id', 'task_type', 'input', 'meta'],
    properties: {
      id: { type: 'string' },
      task_type: { type: 'string' },
      input: { type: 'object' },
      meta: { type: 'object' }
    },
    additionalProperties: false
  },
  TaskResponse: {
    type: 'object',
    required: ['id', 'status'],
    properties: {
      id: { type: 'string' },
      status: { type: 'string', enum: ['success', 'error', 'refused'] },
      output: { type: ['object', 'null'] },
      error: { type: ['string', 'null'] }
    },
    additionalProperties: false
  },
  Progress: {
    type: 'object',
    required: ['id', 'stage', 'pct'],
    properties: {
      id: { type: 'string' },
      stage: { type: 'string' },
      pct: { type: 'number', minimum: 0, maximum: 100 },
      message: { type: ['string', 'null'] }
    },
    additionalProperties: false
  },
  Cancel: {
    type: 'object',
    required: ['id', 'reason'],
    properties: {
      id: { type: 'string' },
      reason: { type: 'string' }
    },
    additionalProperties: false
  }
} as const;

export type Msg =
  | { type: 'Handshake'; payload: any }
  | { type: 'TaskRequest'; payload: any }
  | { type: 'TaskResponse'; payload: any }
  | { type: 'Progress'; payload: any }
  | { type: 'Cancel'; payload: any };

const validators: Record<string, any> = {
  Handshake: ajv.compile(schema.Handshake),
  TaskRequest: ajv.compile(schema.TaskRequest),
  TaskResponse: ajv.compile(schema.TaskResponse),
  Progress: ajv.compile(schema.Progress),
  Cancel: ajv.compile(schema.Cancel)
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

export const A2A_SCHEMA = schema;
