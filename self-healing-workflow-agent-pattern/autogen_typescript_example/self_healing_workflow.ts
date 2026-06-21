type FailureClass =
  | "transient"
  | "rate_limit"
  | "missing_evidence"
  | "stale_plan"
  | "policy_denied"
  | "partial_side_effect"
  | "fatal";

type RecoveryAction = "retry" | "fallback" | "replan" | "compensate" | "escalate" | "stop";

type StepFailure = {
  class: FailureClass;
  message: string;
  sideEffectId?: string;
};

type StepResult =
  | { ok: true; value: string }
  | { ok: false; failure: StepFailure };

function isStepFailure(result: StepResult): result is { ok: false; failure: StepFailure } {
  return result.ok === false;
}

type WorkflowState = {
  workflowId: string;
  stepId: string;
  attempt: number;
  maxAttempts: number;
  budgetRemaining: number;
  idempotencyKey: string;
  trace: string[];
};

type RecoveryDecision = {
  action: RecoveryAction;
  reason: string;
  retryAfterMs?: number;
};

function decideRecovery(state: WorkflowState, failure: StepFailure): RecoveryDecision {
  if (failure.class === "policy_denied") {
    return { action: "stop", reason: "Policy denials are never retried." };
  }

  if (failure.class === "fatal") {
    return { action: "stop", reason: "Fatal domain failure cannot be healed." };
  }

  if (failure.class === "partial_side_effect") {
    return failure.sideEffectId
      ? { action: "compensate", reason: `Compensate partial side effect ${failure.sideEffectId}.` }
      : { action: "escalate", reason: "Partial side effect has no compensation handle." };
  }

  if (state.attempt >= state.maxAttempts || state.budgetRemaining <= 0) {
    return { action: "escalate", reason: "Recovery budget exhausted." };
  }

  if (failure.class === "stale_plan" || failure.class === "missing_evidence") {
    return { action: "replan", reason: "Recovery needs changed state or new evidence." };
  }

  if (failure.class === "rate_limit") {
    return { action: "fallback", reason: "Use lower-cost fallback after quota failure." };
  }

  return {
    action: "retry",
    reason: "Transient failure can retry with same idempotency key.",
    retryAfterMs: Math.min(30_000, 2 ** state.attempt * 250)
  };
}

async function runSelfHealingStep(
  state: WorkflowState,
  step: (idempotencyKey: string) => Promise<StepResult>
): Promise<StepResult> {
  while (state.budgetRemaining > 0) {
    const result = await step(state.idempotencyKey);
    if (result.ok) return result;
    if (!isStepFailure(result)) return result;

    const decision = decideRecovery(state, result.failure);
    state.trace.push(`${state.stepId} attempt ${state.attempt}: ${decision.action} - ${decision.reason}`);

    if (decision.action === "retry") {
      state.attempt += 1;
      state.budgetRemaining -= 1;
      continue;
    }

    return { ok: false, failure: { class: result.failure.class, message: decision.reason } };
  }

  return { ok: false, failure: { class: "fatal", message: "Budget exhausted before step recovered." } };
}
