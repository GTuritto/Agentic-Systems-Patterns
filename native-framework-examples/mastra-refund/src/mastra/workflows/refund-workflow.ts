import { createStep, createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'
import { createRefundDraftTool, lookupRefundPolicyTool } from '../tools/refund-tools'

const refundRequestSchema = z.object({
  ticketId: z.string(),
  tenantId: z.string(),
  requestedAmountCents: z.number().int().nonnegative(),
})

const policyStepOutputSchema = z.object({
  ticketId: z.string(),
  tenantId: z.string(),
  requestedAmountCents: z.number().int().nonnegative(),
  policyVersion: z.string(),
  policySummary: z.string(),
  trace: z.array(z.string()),
})

const draftStepOutputSchema = z.object({
  ticketId: z.string(),
  draftId: z.string(),
  recommendation: z.string(),
  requiresFinanceApproval: z.boolean(),
  stopReason: z.literal('draft_ready_for_finance'),
  toolCalls: z.array(z.string()),
  trace: z.array(z.string()),
})

export const retrievePolicyStep = createStep({
  id: 'retrieve-policy',
  inputSchema: refundRequestSchema,
  outputSchema: policyStepOutputSchema,
  execute: async ({ inputData }) => {
    const policy = await lookupRefundPolicyTool.execute({
      ticketId: inputData.ticketId,
      tenantId: inputData.tenantId,
    })

    return {
      ...inputData,
      policyVersion: policy.policyVersion,
      policySummary: policy.summary,
      trace: policy.trace.map(event => `${event.span}:${event.name}:${event.status}`),
    }
  },
})

export const createDraftStep = createStep({
  id: 'create-refund-draft',
  inputSchema: policyStepOutputSchema,
  outputSchema: draftStepOutputSchema,
  execute: async ({ inputData }) => {
    const draft = await createRefundDraftTool.execute({
      ticketId: inputData.ticketId,
      policyVersion: inputData.policyVersion,
      recommendation: `Draft refund recommendation for ${inputData.requestedAmountCents} cents.`,
    })

    return {
      ticketId: inputData.ticketId,
      draftId: draft.draftId,
      recommendation: draft.recommendation,
      requiresFinanceApproval: draft.requiresFinanceApproval,
      stopReason: 'draft_ready_for_finance',
      toolCalls: ['refund_policy.retrieve', 'refunds.create_draft'],
      trace: [
        'workflow:refund-draft:start',
        ...inputData.trace,
        ...draft.trace.map(event => `${event.span}:${event.name}:${event.status}`),
        'eval:refund_draft_no_money_movement:pending',
      ],
    }
  },
})

export const refundDraftWorkflow = createWorkflow({
  id: 'support-refund-draft-workflow',
  inputSchema: refundRequestSchema,
  outputSchema: draftStepOutputSchema,
})
  .then(retrievePolicyStep)
  .then(createDraftStep)
  .commit()
