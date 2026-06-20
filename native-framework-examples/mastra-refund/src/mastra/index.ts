import { Mastra } from '@mastra/core'
import { refundDraftAgent } from './agents/refund-agent'
import { refundDraftWorkflow } from './workflows/refund-workflow'

export const mastra = new Mastra({
  agents: {
    refundDraftAgent,
  },
  workflows: {
    refundDraftWorkflow,
  },
})
