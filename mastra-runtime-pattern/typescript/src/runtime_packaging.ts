export type ToolCall = {
  name: string;
  input: Record<string, unknown>;
};

export type RuntimeTrace = {
  step: string;
  detail: Record<string, unknown>;
};

export type RuntimeState = {
  runId: string;
  goal: string;
  memory: Record<string, string>;
  traces: RuntimeTrace[];
  toolCalls: ToolCall[];
  result?: string;
};

export type Tool = {
  name: string;
  description: string;
  execute(input: Record<string, unknown>, state: RuntimeState): Promise<string>;
};

export type Agent = {
  name: string;
  instructions: string;
  decide(state: RuntimeState): Promise<ToolCall | { answer: string }>;
};

export type WorkflowStep = {
  name: string;
  run(state: RuntimeState): Promise<RuntimeState>;
};

export type PackagedRuntime = {
  agent: Agent;
  tools: Record<string, Tool>;
  workflow: WorkflowStep[];
  run(goal: string): Promise<RuntimeState>;
};

function trace(state: RuntimeState, step: string, detail: Record<string, unknown>) {
  state.traces.push({ step, detail });
}

export function createSupportRuntime(): PackagedRuntime {
  const tools: Record<string, Tool> = {
    read_policy: {
      name: "read_policy",
      description: "Read the support policy for a refund request.",
      execute: async input => `Policy ${input.policyId}: refunds under 30 days can be drafted for review.`,
    },
    draft_response: {
      name: "draft_response",
      description: "Draft a customer-safe response without sending it.",
      execute: async input => `Draft response for ${input.customerId}: refund request is ready for review.`,
    },
  };

  const agent: Agent = {
    name: "support-runtime-agent",
    instructions: "Check policy before drafting. Do not send messages directly.",
    decide: async state => {
      if (!state.memory.policy) {
        return { name: "read_policy", input: { policyId: "refund-v1" } };
      }
      if (!state.memory.draft) {
        return { name: "draft_response", input: { customerId: "cust_123" } };
      }
      return { answer: "Policy checked and draft created for human review." };
    },
  };

  const workflow: WorkflowStep[] = [
    {
      name: "agent_decision",
      run: async state => {
        const decision = await agent.decide(state);
        trace(state, "agent_decision", { decision });

        if ("answer" in decision) {
          state.result = decision.answer;
          return state;
        }

        const tool = tools[decision.name];
        if (!tool) throw new Error(`Unknown tool: ${decision.name}`);

        const output = await tool.execute(decision.input, state);
        state.toolCalls.push(decision);
        trace(state, "tool_result", { tool: tool.name, output });

        if (tool.name === "read_policy") state.memory.policy = output;
        if (tool.name === "draft_response") state.memory.draft = output;
        return state;
      },
    },
  ];

  return {
    agent,
    tools,
    workflow,
    run: async goal => {
      const state: RuntimeState = {
        runId: "mastra_style_001",
        goal,
        memory: {},
        traces: [],
        toolCalls: [],
      };

      while (!state.result && state.toolCalls.length < 4) {
        for (const step of workflow) {
          trace(state, "workflow_step", { name: step.name });
          await step.run(state);
        }
      }

      if (!state.result) throw new Error("Runtime did not finish within budget");
      trace(state, "stop", { reason: "success" });
      return state;
    },
  };
}

export function evaluateRuntime(state: RuntimeState) {
  const reasons: string[] = [];
  const called = state.toolCalls.map(call => call.name);
  const forbiddenTools = ["send_message", "refunds.issue_refund", "issue_refund"];

  if (!called.includes("read_policy")) reasons.push("policy was not read");
  if (!called.includes("draft_response")) reasons.push("draft was not created");
  for (const toolName of forbiddenTools) {
    if (called.includes(toolName)) reasons.push(`forbidden tool was called: ${toolName}`);
  }
  if (!state.traces.some(event => event.step === "tool_result")) reasons.push("tool results were not traced");

  return reasons.length === 0
    ? { status: "pass" as const }
    : { status: "fail" as const, reasons };
}
