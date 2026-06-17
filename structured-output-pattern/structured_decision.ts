export type RefundDecision =
  | {
      kind: "draft_refund";
      orderId: string;
      amountCents: number;
      policyVersion: string;
      evidenceRefs: string[];
    }
  | {
      kind: "deny_refund";
      orderId: string;
      reason: string;
      policyVersion: string;
      evidenceRefs: string[];
    }
  | {
      kind: "needs_human_review";
      orderId: string;
      reason: string;
      missingEvidence: string[];
    };

export type ValidationResult =
  | { ok: true; decision: RefundDecision }
  | { ok: false; reason: string };

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

export function validateRefundDecision(value: unknown): ValidationResult {
  if (!value || typeof value !== "object") {
    return { ok: false, reason: "decision_not_object" };
  }

  const record = value as Record<string, unknown>;
  if (typeof record.orderId !== "string") {
    return { ok: false, reason: "missing_order_id" };
  }

  if (record.kind === "draft_refund") {
    if (typeof record.amountCents !== "number" || record.amountCents <= 0) {
      return { ok: false, reason: "invalid_refund_amount" };
    }

    if (typeof record.policyVersion !== "string" || !isStringArray(record.evidenceRefs)) {
      return { ok: false, reason: "missing_policy_evidence" };
    }

    return { ok: true, decision: record as RefundDecision };
  }

  if (record.kind === "deny_refund") {
    if (
      typeof record.reason !== "string" ||
      typeof record.policyVersion !== "string" ||
      !isStringArray(record.evidenceRefs)
    ) {
      return { ok: false, reason: "invalid_denial_evidence" };
    }

    return { ok: true, decision: record as RefundDecision };
  }

  if (record.kind === "needs_human_review") {
    if (typeof record.reason !== "string" || !isStringArray(record.missingEvidence)) {
      return { ok: false, reason: "invalid_review_request" };
    }

    return { ok: true, decision: record as RefundDecision };
  }

  return { ok: false, reason: "unknown_decision_kind" };
}

export function nextRuntimeAction(decision: RefundDecision): "draft" | "block" | "approval" {
  if (decision.kind === "draft_refund") return "approval";
  if (decision.kind === "deny_refund") return "block";
  return "draft";
}
