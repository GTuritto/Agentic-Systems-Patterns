import { Agent } from '@mastra/core/agent'
import { createRefundDraftTool, lookupRefundPolicyTool } from '../tools/refund-tools'

export const refundDraftAgent = new Agent({
  id: 'refund-draft-agent',
  name: 'Refund Draft Agent',
  instructions: [
    'Draft refund recommendations for support review.',
    'Always use refund_policy.retrieve before recommending a refund.',
    'Use refunds.create_draft only for draft records.',
    'Never issue money, alter payment state, or send customer messages.',
    'Escalate when policy evidence is missing.',
  ].join('\n'),
  model: 'openai/gpt-4.1-mini',
  tools: {
    lookupRefundPolicyTool,
    createRefundDraftTool,
  },
})
