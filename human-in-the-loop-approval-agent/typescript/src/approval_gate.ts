import {
  actionId,
  stableHash,
  type ApprovalDecision,
  type ApprovalRequest,
  type ApprovalResult,
  type ProposedAction,
} from "./approval_contract.ts";

export * from "./approval_contract.ts";

export class ApprovalGate {
  private readonly consumedKeys = new Set<string>();

  async resume(
    request: ApprovalRequest,
    decision: ApprovalDecision,
    action: ProposedAction,
    now: Date,
    execute: (action: ProposedAction) => Promise<void>,
  ): Promise<ApprovalResult> {
    const audit = [
      `approval:${request.approvalId}:decision:${decision.decision}`,
    ];

    if (decision.decision !== "approved") {
      return { status: "rejected", reason: "not_approved", audit };
    }

    if (
      decision.approvalId !== request.approvalId ||
      decision.traceId !== request.traceId ||
      decision.decidedByRole !== request.approverRole
    ) {
      return { status: "rejected", reason: "approval_mismatch", audit };
    }

    const currentActionId = actionId(action, request.policyVersion);
    const currentArgsHash = stableHash(action.args);
    if (
      currentActionId !== request.actionId ||
      currentActionId !== decision.approvedActionId ||
      currentArgsHash !== request.argsHash ||
      currentArgsHash !== decision.approvedArgsHash
    ) {
      return { status: "rejected", reason: "action_changed", audit };
    }

    if (decision.policyVersion !== request.policyVersion) {
      return { status: "rejected", reason: "policy_changed", audit };
    }

    if (now.getTime() >= new Date(request.expiresAt).getTime()) {
      return { status: "rejected", reason: "approval_expired", audit };
    }

    if (this.consumedKeys.has(action.idempotencyKey)) {
      return {
        status: "rejected",
        reason: "idempotency_key_consumed",
        audit,
      };
    }

    this.consumedKeys.add(action.idempotencyKey);
    try {
      await execute(action);
    } catch (error) {
      this.consumedKeys.delete(action.idempotencyKey);
      throw error;
    }
    audit.push(`approval:${request.approvalId}:executed:${request.actionId}`);
    return { status: "executed", audit };
  }
}
