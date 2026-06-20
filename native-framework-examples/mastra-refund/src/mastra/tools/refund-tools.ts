import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

const traceEventSchema = z.object({
  span: z.enum(['tool', 'policy']),
  name: z.string(),
  status: z.enum(['allow', 'deny', 'succeeded']),
  reason: z.string().optional(),
})

export const policyEvidenceSchema = z.object({
  policyVersion: z.string(),
  summary: z.string(),
  trace: z.array(traceEventSchema),
})

export const draftSchema = z.object({
  draftId: z.string(),
  recommendation: z.string(),
  requiresFinanceApproval: z.boolean(),
  trace: z.array(traceEventSchema),
})

export const lookupRefundPolicyTool = createTool({
  id: 'refund_policy.retrieve',
  description: 'Retrieve the current refund policy for a support ticket.',
  inputSchema: z.object({
    ticketId: z.string(),
    tenantId: z.string(),
  }),
  outputSchema: policyEvidenceSchema,
  execute: async ({ ticketId, tenantId }) => {
    return {
      policyVersion: 'refund-v4',
      summary: `Ticket ${ticketId} for ${tenantId}: agent may draft; finance must issue money.`,
      trace: [
        {
          span: 'policy',
          name: 'tenant_read_check',
          status: 'allow',
          reason: 'same_tenant_ticket_context',
        },
        {
          span: 'tool',
          name: 'refund_policy.retrieve',
          status: 'succeeded',
        },
      ],
    }
  },
})

export const createRefundDraftTool = createTool({
  id: 'refunds.create_draft',
  description: 'Create a refund recommendation draft. It does not issue money or message the customer.',
  inputSchema: z.object({
    ticketId: z.string(),
    policyVersion: z.string(),
    recommendation: z.string(),
  }),
  outputSchema: draftSchema,
  execute: async ({ ticketId, policyVersion, recommendation }) => {
    return {
      draftId: `draft-${ticketId}`,
      recommendation: `${recommendation} Cite ${policyVersion}. Do not issue money or promise payment.`,
      requiresFinanceApproval: true,
      trace: [
        {
          span: 'tool',
          name: 'refunds.create_draft',
          status: 'succeeded',
        },
      ],
    }
  },
})

export const forbiddenRefundIssueToolName = 'refunds.issue_refund'
export const forbiddenCustomerMessageToolName = 'email.send_customer_message'
