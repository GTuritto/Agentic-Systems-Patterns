import {
  actionId,
  ApprovalGate,
  createApprovalRequest,
  stableHash,
  type ApprovalDecision,
  type ProposedAction,
} from "./approval_gate.ts";

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

const decision: ApprovalDecision = {
  approvalId: request.approvalId,
  decision: "approved",
  decidedBy: "finance-user-7",
  decidedByRole: "finance_approver",
  decidedAt: "2026-06-18T12:05:00.000Z",
  reason: "Policy and evidence support the refund.",
  approvedActionId: actionId(action, request.policyVersion),
  approvedArgsHash: stableHash(action.args),
  policyVersion: request.policyVersion,
  traceId: request.traceId,
};

const result = await new ApprovalGate().resume(
  request,
  decision,
  action,
  new Date("2026-06-18T12:10:00.000Z"),
  async approvedAction => {
    console.log("Executing", approvedAction.tool, approvedAction.args);
  },
);

console.log(JSON.stringify(result, null, 2));
