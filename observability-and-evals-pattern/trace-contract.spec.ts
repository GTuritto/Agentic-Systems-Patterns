import { checkTraceContract, type AgentTraceEvent } from "./trace-contract.ts";

const baseEvent = {
  traceId: "tr_001",
  runId: "run_001",
  requestId: "req_001",
  actorId: "user_001",
  tenantId: "tenant_001",
  environment: "staging",
  timestamp: "2026-06-21T09:00:00.000Z",
  latencyMs: 12,
  versionSet: {
    model: "deterministic-test",
    prompt: "prompt.v1",
    toolSchema: "tools.v1",
    policy: "policy.v1",
    harness: "trace-contract.spec.v1",
  },
  redaction: "pii_removed",
} satisfies Omit<AgentTraceEvent, "spanId" | "step" | "spanType" | "status">;

const validTrace: AgentTraceEvent[] = [
  {
    ...baseEvent,
    spanId: "span_run",
    step: "run_start",
    spanType: "run",
    status: "started",
  },
  {
    ...baseEvent,
    spanId: "span_model",
    parentSpanId: "span_run",
    step: "model_decision",
    spanType: "model",
    status: "succeeded",
    stopReason: "completed",
  },
  {
    ...baseEvent,
    spanId: "span_tool",
    parentSpanId: "span_run",
    step: "tool_call",
    spanType: "tool",
    status: "succeeded",
    policyDecision: "allow",
    idempotencyKey: "idem_001",
  },
];

const missingPolicyTrace: AgentTraceEvent[] = [
  validTrace[0],
  validTrace[1],
  {
    ...baseEvent,
    spanId: "span_tool_missing_policy",
    parentSpanId: "span_run",
    step: "tool_call",
    spanType: "tool",
    status: "succeeded",
    idempotencyKey: "idem_002",
  },
];

const valid = checkTraceContract(validTrace);
if (!valid.ok) {
  throw new Error(`Expected valid trace, missing: ${valid.missing.join(", ")}`);
}

const invalid = checkTraceContract(missingPolicyTrace);
if (invalid.ok) {
  throw new Error("Expected missing policy decision to fail trace contract");
}

if (!invalid.missing.includes("policy decision for tool span span_tool_missing_policy")) {
  throw new Error(`Unexpected missing fields: ${invalid.missing.join(", ")}`);
}

console.log("Trace contract test OK");
