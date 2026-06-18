import { createHash } from "node:crypto";

export type ProposedAction = {
  tool: "refunds.issue_refund";
  toolVersion: string;
  args: {
    orderId: string;
    amountCents: number;
  };
  tenantId: string;
  actorId: string;
  resourceIds: string[];
  idempotencyKey: string;
};

export type ApprovalRequest = {
  approvalId: string;
  actionId: string;
  traceId: string;
  proposedAction: ProposedAction;
  argsHash: string;
  evidenceRefs: string[];
  policyVersion: string;
  approverRole: "finance_approver";
  expiresAt: string;
};

export type ApprovalDecision = {
  approvalId: string;
  decision: "approved" | "denied";
  decidedBy: string;
  decidedByRole: "finance_approver";
  decidedAt: string;
  reason: string;
  approvedActionId?: string;
  approvedArgsHash?: string;
  policyVersion: string;
  traceId: string;
};

export type ApprovalResult =
  | { status: "executed"; audit: string[] }
  | {
      status: "rejected";
      reason:
        | "not_approved"
        | "approval_mismatch"
        | "action_changed"
        | "policy_changed"
        | "approval_expired"
        | "idempotency_key_consumed";
      audit: string[];
    };

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

export function stableHash(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

export function actionId(
  action: ProposedAction,
  policyVersion: string,
): string {
  return stableHash({ ...action, policyVersion });
}

export function createApprovalRequest(input: {
  approvalId: string;
  traceId: string;
  action: ProposedAction;
  evidenceRefs: string[];
  policyVersion: string;
  expiresAt: string;
}): ApprovalRequest {
  return {
    approvalId: input.approvalId,
    actionId: actionId(input.action, input.policyVersion),
    traceId: input.traceId,
    proposedAction: input.action,
    argsHash: stableHash(input.action.args),
    evidenceRefs: input.evidenceRefs,
    policyVersion: input.policyVersion,
    approverRole: "finance_approver",
    expiresAt: input.expiresAt,
  };
}
