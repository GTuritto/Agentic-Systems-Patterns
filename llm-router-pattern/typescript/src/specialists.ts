export type RouterState = { fast?: boolean; budget?: 'low'|'std'|'high' };

export async function billingAgent(input: any, _state: RouterState) {
  if (input.fail === 'billing') throw new Error('billing failure');
  return { kind: 'billing', reply: `Billing info processed for ${input.user ?? 'unknown'}` };
}

export async function techSupportAgent(input: any, _state: RouterState) {
  if (input.fail === 'tech') throw new Error('tech failure');
  return { kind: 'tech', reply: `Tech support ticket created: ${input.issue ?? 'n/a'}` };
}

export async function salesAgent(input: any, _state: RouterState) {
  if (input.fail === 'sales') throw new Error('sales failure');
  return { kind: 'sales', reply: `Sales lead captured for ${input.product ?? 'unspecified'}` };
}
