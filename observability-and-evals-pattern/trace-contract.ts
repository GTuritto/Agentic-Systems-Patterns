export type SpanType =
  | "run"
  | "model"
  | "tool"
  | "retrieval"
  | "memory"
  | "policy"
  | "approval"
  | "evaluator"
  | "workflow";

export type AgentTraceEvent = {
  traceId: string;
  runId: string;
  spanId: string;
  parentSpanId?: string;
  requestId: string;
  actorId: string;
  tenantId: string;
  environment: "dev" | "staging" | "prod";
  step: string;
  spanType: SpanType;
  timestamp: string;
  status: "started" | "succeeded" | "failed" | "denied" | "waiting" | "cancelled";
  latencyMs: number;
  versionSet: {
    model?: string;
    prompt?: string;
    toolSchema?: string;
    policy?: string;
    retriever?: string;
    harness?: string;
  };
  model?: string;
  tool?: string;
  policyDecision?: "allow" | "deny" | "require_approval" | "escalate";
  evidenceRefs?: string[];
  memoryRefs?: string[];
  sideEffectRef?: string;
  idempotencyKey?: string;
  costCents?: number;
  stopReason?: string;
  redaction: "none" | "pii_removed" | "secret_removed" | "content_reference_only";
};

export type TraceCheckResult = {
  ok: boolean;
  missing: string[];
};

export function checkTraceContract(events: AgentTraceEvent[]): TraceCheckResult {
  const missing: string[] = [];
  const spanTypes = new Set(events.map(event => event.spanType));
  const run = events.find(event => event.spanType === "run");

  if (!run) missing.push("run span");
  if (!spanTypes.has("model")) missing.push("model span");
  if (!events.some(event => event.stopReason)) missing.push("stop reason");
  if (!events.every(event => event.traceId && event.runId && event.spanId)) {
    missing.push("correlation ids");
  }

  for (const event of events) {
    if (event.spanType === "tool" && !event.policyDecision) {
      missing.push(`policy decision for tool span ${event.spanId}`);
    }

    if (event.spanType === "tool" && event.status === "succeeded" && !event.idempotencyKey) {
      missing.push(`idempotency key for tool span ${event.spanId}`);
    }

    if (event.spanType === "retrieval" && event.status === "succeeded" && !event.evidenceRefs?.length) {
      missing.push(`evidence refs for retrieval span ${event.spanId}`);
    }

    if (event.redaction === "none" && event.environment === "prod") {
      missing.push(`redaction classification for production span ${event.spanId}`);
    }
  }

  return {
    ok: missing.length === 0,
    missing: [...new Set(missing)]
  };
}
