export type PolicyOutcome = 'allow' | 'deny' | 'require_approval' | 'escalate';

export type PolicyContext = {
  traceId: string;
  actor: {
    id: string;
    role: 'support_agent' | 'finance_reviewer' | 'viewer';
    tenantId: string;
  };
  resource: {
    type: 'customer_record' | 'refund' | 'email' | 'memory' | 'document';
    id: string;
    tenantId: string;
  };
  capability: 'read' | 'write' | 'send' | 'refund' | 'remember' | 'answer';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  evidenceStatus: 'present' | 'missing' | 'stale' | 'forbidden';
  budgetState: 'within_budget' | 'approval_threshold' | 'exhausted';
  hasHumanApproval: boolean;
  policyVersion: string;
};

export type PolicyDecision = {
  traceId: string;
  policyVersion: string;
  decision: PolicyOutcome;
  reason: string;
  executionAllowed: boolean;
  requiredApprovalRole?: 'finance_reviewer' | 'security_reviewer' | 'manager';
};

export function enforcePolicy(context: PolicyContext): PolicyDecision {
  const base = {
    traceId: context.traceId,
    policyVersion: context.policyVersion
  };

  if (context.actor.tenantId !== context.resource.tenantId) {
    return {
      ...base,
      decision: 'deny',
      reason: 'tenant_boundary',
      executionAllowed: false
    };
  }

  if (context.evidenceStatus === 'forbidden') {
    return {
      ...base,
      decision: 'deny',
      reason: 'evidence_forbidden',
      executionAllowed: false
    };
  }

  if (context.evidenceStatus === 'missing' || context.evidenceStatus === 'stale') {
    return {
      ...base,
      decision: 'escalate',
      reason: 'required_evidence_not_current',
      executionAllowed: false
    };
  }

  if (context.budgetState === 'exhausted') {
    return {
      ...base,
      decision: 'escalate',
      reason: 'budget_exhausted',
      executionAllowed: false
    };
  }

  if (context.capability === 'refund' && context.riskLevel !== 'low' && !context.hasHumanApproval) {
    return {
      ...base,
      decision: 'require_approval',
      reason: 'refund_requires_review',
      executionAllowed: false,
      requiredApprovalRole: 'finance_reviewer'
    };
  }

  if (context.capability === 'send' && context.actor.role !== 'support_agent') {
    return {
      ...base,
      decision: 'deny',
      reason: 'role_cannot_send',
      executionAllowed: false
    };
  }

  if (context.capability === 'remember' && context.riskLevel !== 'low') {
    return {
      ...base,
      decision: 'require_approval',
      reason: 'memory_write_requires_review',
      executionAllowed: false,
      requiredApprovalRole: 'manager'
    };
  }

  return {
    ...base,
    decision: 'allow',
    reason: 'policy_passed',
    executionAllowed: true
  };
}

export function evaluatePolicyDecision(context: PolicyContext, decision: PolicyDecision) {
  const failures: string[] = [];

  if (decision.executionAllowed && decision.decision !== 'allow') {
    failures.push('non_allowing_decision_marked_executable');
  }

  if (context.actor.tenantId !== context.resource.tenantId && decision.decision !== 'deny') {
    failures.push('cross_tenant_access_not_denied');
  }

  if (context.capability === 'refund' && context.riskLevel !== 'low' && !context.hasHumanApproval) {
    if (decision.decision !== 'require_approval') failures.push('refund_review_not_required');
  }

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    failures
  };
}
