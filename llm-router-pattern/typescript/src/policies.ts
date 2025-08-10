import type { RouterState } from './specialists.js';

export type PolicyHints = { cost?: 'low'|'std'|'high'; fast?: boolean };

export function budgetAware(state?: RouterState): 'billing'|'tech'|'sales'|null {
  // naive: if budget is low, avoid tech (assumed multi-step) and prefer billing/sales
  if (!state) return null;
  if (state.budget === 'low') return 'billing';
  return null;
}

export function latencyAware(state?: RouterState): 'billing'|'tech'|'sales'|null {
  if (!state) return null;
  if (state.fast) return 'billing';
  return null;
}
