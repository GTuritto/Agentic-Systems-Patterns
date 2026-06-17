import crypto from 'crypto';

type SecureAgentEnvelope = {
  traceId: string;
  messageId: string;
  idempotencyKey: string;
  issuedAt: string;
  expiresAt: string;
  caller: {
    subject: string;
    tenantId: string;
    serviceId: string;
  };
  auth: {
    issuer: string;
    audience: string;
    scopes: string[];
  };
  capability: 'read' | 'delegate' | 'tool_call' | 'workflow_command';
  encryptedPayload: string;
};

type TraceEvent = {
  traceId: string;
  event: string;
  decision?: 'allow' | 'deny';
  reason?: string;
  subject?: string;
  scopes?: string[];
};

const key = crypto.randomBytes(32);

function encryptPayload(payload: object): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, ciphertext]).toString('base64url');
}

function decryptPayload(token: string): unknown {
  const data = Buffer.from(token, 'base64url');
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const ciphertext = data.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]).toString('utf8');

  return JSON.parse(plaintext);
}

function authorizeEnvelope(input: {
  envelope: SecureAgentEnvelope;
  requiredAudience: string;
  requiredScope: string;
  now: Date;
}) {
  const { envelope, requiredAudience, requiredScope, now } = input;

  if (envelope.auth.audience !== requiredAudience) {
    return { decision: 'deny' as const, reason: 'wrong_audience' };
  }

  if (!envelope.auth.scopes.includes(requiredScope)) {
    return { decision: 'deny' as const, reason: 'missing_scope' };
  }

  if (new Date(envelope.expiresAt).getTime() <= now.getTime()) {
    return { decision: 'deny' as const, reason: 'expired_message' };
  }

  return { decision: 'allow' as const, reason: 'authorized' };
}

function trace(event: TraceEvent) {
  console.log(JSON.stringify(event));
}

function main() {
  const traceId = crypto.randomUUID();
  const envelope: SecureAgentEnvelope = {
    traceId,
    messageId: crypto.randomUUID(),
    idempotencyKey: `agent-message:${crypto.randomUUID()}`,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    caller: {
      subject: 'agent:customer-support',
      tenantId: 'tenant_a',
      serviceId: 'support-agent-runtime'
    },
    auth: {
      issuer: 'https://identity.example.test',
      audience: 'billing-agent',
      scopes: ['agent:delegate', 'refund:draft']
    },
    capability: 'tool_call',
    encryptedPayload: encryptPayload({
      tool: 'refunds.draft_refund',
      orderId: 'ord_redacted',
      amountCents: 2500
    })
  };

  trace({
    traceId,
    event: 'secure_message_received',
    subject: envelope.caller.subject,
    scopes: envelope.auth.scopes
  });

  const authorization = authorizeEnvelope({
    envelope,
    requiredAudience: 'billing-agent',
    requiredScope: 'refund:draft',
    now: new Date()
  });

  trace({
    traceId,
    event: 'authorization_decision',
    decision: authorization.decision,
    reason: authorization.reason
  });

  if (authorization.decision === 'deny') return;

  const payload = decryptPayload(envelope.encryptedPayload);
  trace({ traceId, event: 'payload_decrypted_after_authorization' });
  console.log(payload);
}

main();
