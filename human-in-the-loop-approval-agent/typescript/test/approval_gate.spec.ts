import {
  actionId,
  ApprovalGate,
  createApprovalRequest,
  stableHash,
  type ApprovalDecision,
  type ProposedAction,
} from "../src/approval_gate.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const action: ProposedAction = {
  tool: "refunds.issue_refund",
  toolVersion: "2026-06-18",
  args: { orderId: "ORD-104", amountCents: 12500 },
  tenantId: "tenant-a",
  actorId: "support-agent",
  resourceIds: ["ORD-104"],
  idempotencyKey: "refund:ORD-104:12500",
};

const request = createApprovalRequest({
  approvalId: "APR-104",
  traceId: "trace-104",
  action,
  evidenceRefs: ["order:ORD-104", "policy:refunds-2026"],
  policyVersion: "refund-policy-v3",
  expiresAt: "2026-06-18T12:30:00.000Z",
});

function decision(
  value: "approved" | "denied" = "approved",
): ApprovalDecision {
  return {
    approvalId: request.approvalId,
    decision: value,
    decidedBy: "finance-user-7",
    decidedByRole: "finance_approver",
    decidedAt: "2026-06-18T12:05:00.000Z",
    reason: value === "approved" ? "Evidence supports refund." : "Insufficient evidence.",
    approvedActionId:
      value === "approved"
        ? actionId(action, request.policyVersion)
        : undefined,
    approvedArgsHash:
      value === "approved" ? stableHash(action.args) : undefined,
    policyVersion: request.policyVersion,
    traceId: request.traceId,
  };
}

async function attempt(
  gate: ApprovalGate,
  approval: ApprovalDecision,
  proposedAction: ProposedAction,
  now = new Date("2026-06-18T12:10:00.000Z"),
) {
  let executions = 0;
  const result = await gate.resume(
    request,
    approval,
    proposedAction,
    now,
    async () => {
      executions += 1;
    },
  );
  return { result, executions };
}

const approved = await attempt(new ApprovalGate(), decision(), action);
assert(approved.result.status === "executed", "Approved action must execute");
assert(approved.executions === 1, "Approved action must execute once");

const denied = await attempt(new ApprovalGate(), decision("denied"), action);
assert(denied.result.status === "rejected", "Denied action must be rejected");
assert(denied.executions === 0, "Denied action must not execute");

const expired = await attempt(
  new ApprovalGate(),
  decision(),
  action,
  new Date("2026-06-18T12:30:00.000Z"),
);
assert(
  expired.result.status === "rejected" &&
    expired.result.reason === "approval_expired",
  "Expired approval must be rejected",
);

const changedAction: ProposedAction = {
  ...action,
  args: { ...action.args, amountCents: 25000 },
};
const changed = await attempt(new ApprovalGate(), decision(), changedAction);
assert(
  changed.result.status === "rejected" &&
    changed.result.reason === "action_changed",
  "Changed arguments must require new approval",
);

const replayGate = new ApprovalGate();
const first = await attempt(replayGate, decision(), action);
const replay = await attempt(replayGate, decision(), action);
assert(first.result.status === "executed", "First execution must succeed");
assert(
  replay.result.status === "rejected" &&
    replay.result.reason === "idempotency_key_consumed",
  "Approval replay must be rejected",
);
assert(replay.executions === 0, "Replay must not execute");

console.log("Approval gate tests OK");
