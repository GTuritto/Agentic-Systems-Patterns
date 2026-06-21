from dataclasses import dataclass, field
from typing import Callable, Literal, Optional, Union

FailureClass = Literal[
    "transient",
    "rate_limit",
    "missing_evidence",
    "stale_plan",
    "policy_denied",
    "partial_side_effect",
    "fatal",
]
RecoveryAction = Literal["retry", "fallback", "replan", "compensate", "escalate", "stop"]


@dataclass
class StepFailure:
    failure_class: FailureClass
    message: str
    side_effect_id: Optional[str] = None


@dataclass
class StepSuccess:
    value: str


StepResult = Union[StepSuccess, StepFailure]


@dataclass
class WorkflowState:
    workflow_id: str
    step_id: str
    attempt: int
    max_attempts: int
    budget_remaining: int
    idempotency_key: str
    trace: list[str] = field(default_factory=list)


@dataclass
class RecoveryDecision:
    action: RecoveryAction
    reason: str
    retry_after_ms: Optional[int] = None


def decide_recovery(state: WorkflowState, failure: StepFailure) -> RecoveryDecision:
    if failure.failure_class == "policy_denied":
        return RecoveryDecision("stop", "Policy denials are never retried.")

    if failure.failure_class == "fatal":
        return RecoveryDecision("stop", "Fatal domain failure cannot be healed.")

    if failure.failure_class == "partial_side_effect":
        if failure.side_effect_id:
            return RecoveryDecision("compensate", f"Compensate partial side effect {failure.side_effect_id}.")
        return RecoveryDecision("escalate", "Partial side effect has no compensation handle.")

    if state.attempt >= state.max_attempts or state.budget_remaining <= 0:
        return RecoveryDecision("escalate", "Recovery budget exhausted.")

    if failure.failure_class in {"stale_plan", "missing_evidence"}:
        return RecoveryDecision("replan", "Recovery needs changed state or new evidence.")

    if failure.failure_class == "rate_limit":
        return RecoveryDecision("fallback", "Use lower-cost fallback after quota failure.")

    return RecoveryDecision(
        "retry",
        "Transient failure can retry with the same idempotency key.",
        retry_after_ms=min(30_000, 2**state.attempt * 250),
    )


def run_self_healing_step(
    state: WorkflowState,
    step: Callable[[str], StepResult],
) -> StepResult:
    while state.budget_remaining > 0:
        result = step(state.idempotency_key)
        if isinstance(result, StepSuccess):
            return result

        decision = decide_recovery(state, result)
        state.trace.append(f"{state.step_id} attempt {state.attempt}: {decision.action} - {decision.reason}")

        if decision.action == "retry":
            state.attempt += 1
            state.budget_remaining -= 1
            continue

        return StepFailure(result.failure_class, decision.reason)

    return StepFailure("fatal", "Budget exhausted before step recovered.")
