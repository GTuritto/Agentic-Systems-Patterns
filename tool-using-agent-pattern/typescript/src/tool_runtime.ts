export type Route = "refund_investigation" | "order_status";
export type ToolName =
  | "read_order"
  | "search_refund_policy"
  | "draft_refund_request";

export type ToolProposal = {
  name: string;
  args: unknown;
  idempotencyKey: string;
};

export type ToolObservation =
  | {
      status: "ok";
      tool: ToolName;
      data: unknown;
      trust: "trusted_system" | "untrusted_content";
      evidenceRef: string;
    }
  | {
      status: "refused" | "retryable_error" | "fatal_error";
      tool?: string;
      reason: string;
    };

export type ToolContext = {
  route: Route;
  actorId: string;
  approvedActionIds: string[];
  timeoutMs: number;
  maxAttempts: number;
};

type ValidatedCall =
  | {
      name: "read_order";
      args: { orderId: string };
      idempotencyKey: string;
    }
  | {
      name: "search_refund_policy";
      args: { query: string };
      idempotencyKey: string;
    }
  | {
      name: "draft_refund_request";
      args: { orderId: string; amountCents: number; approvalId: string };
      idempotencyKey: string;
    };

export type ToolHandlers = {
  readOrder(args: { orderId: string }): Promise<unknown>;
  searchRefundPolicy(args: { query: string }): Promise<unknown>;
  draftRefundRequest(args: {
    orderId: string;
    amountCents: number;
    approvalId: string;
  }): Promise<unknown>;
};

const toolsByRoute: Record<Route, ToolName[]> = {
  refund_investigation: [
    "read_order",
    "search_refund_policy",
    "draft_refund_request",
  ],
  order_status: ["read_order"],
};

export function disclosedTools(route: Route): ToolName[] {
  return [...toolsByRoute[route]];
}

function objectArgs(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function validateProposal(
  proposal: ToolProposal,
  context: ToolContext,
): ValidatedCall | ToolObservation {
  if (!toolsByRoute[context.route].includes(proposal.name as ToolName)) {
    return {
      status: "refused",
      tool: proposal.name,
      reason: "tool_not_disclosed_for_route",
    };
  }
  if (!proposal.idempotencyKey) {
    return { status: "refused", reason: "missing_idempotency_key" };
  }

  const args = objectArgs(proposal.args);
  if (!args) return { status: "refused", reason: "invalid_arguments" };

  if (proposal.name === "read_order" && typeof args.orderId === "string") {
    return {
      name: proposal.name,
      args: { orderId: args.orderId },
      idempotencyKey: proposal.idempotencyKey,
    };
  }

  if (
    proposal.name === "search_refund_policy" &&
    typeof args.query === "string"
  ) {
    return {
      name: proposal.name,
      args: { query: args.query },
      idempotencyKey: proposal.idempotencyKey,
    };
  }

  if (
    proposal.name === "draft_refund_request" &&
    typeof args.orderId === "string" &&
    typeof args.amountCents === "number" &&
    Number.isInteger(args.amountCents) &&
    args.amountCents > 0 &&
    typeof args.approvalId === "string"
  ) {
    if (!context.approvedActionIds.includes(args.approvalId)) {
      return {
        status: "refused",
        tool: proposal.name,
        reason: "approval_required",
      };
    }
    return {
      name: proposal.name,
      args: {
        orderId: args.orderId,
        amountCents: args.amountCents,
        approvalId: args.approvalId,
      },
      idempotencyKey: proposal.idempotencyKey,
    };
  }

  return {
    status: "refused",
    tool: proposal.name,
    reason: "invalid_arguments",
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("tool_timeout")), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export class ToolRuntime {
  private readonly completedKeys = new Set<string>();
  private readonly handlers: ToolHandlers;

  constructor(handlers: ToolHandlers) {
    this.handlers = handlers;
  }

  async execute(
    proposal: ToolProposal,
    context: ToolContext,
  ): Promise<ToolObservation> {
    const validated = validateProposal(proposal, context);
    if ("status" in validated) return validated;

    if (this.completedKeys.has(validated.idempotencyKey)) {
      return {
        status: "refused",
        tool: validated.name,
        reason: "idempotency_key_consumed",
      };
    }

    const attempts = validated.name === "draft_refund_request"
      ? 1
      : context.maxAttempts;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const data = await withTimeout(
          this.invoke(validated),
          context.timeoutMs,
        );
        this.completedKeys.add(validated.idempotencyKey);
        return {
          status: "ok",
          tool: validated.name,
          data,
          trust:
            validated.name === "search_refund_policy"
              ? "untrusted_content"
              : "trusted_system",
          evidenceRef: `${validated.name}:${validated.idempotencyKey}`,
        };
      } catch (error) {
        if (attempt === attempts) {
          return {
            status: "retryable_error",
            tool: validated.name,
            reason: error instanceof Error ? error.message : "tool_failure",
          };
        }
      }
    }

    return { status: "fatal_error", reason: "unreachable" };
  }

  private invoke(call: ValidatedCall): Promise<unknown> {
    if (call.name === "read_order") {
      return this.handlers.readOrder(call.args);
    }
    if (call.name === "search_refund_policy") {
      return this.handlers.searchRefundPolicy(call.args);
    }
    return this.handlers.draftRefundRequest(call.args);
  }
}
