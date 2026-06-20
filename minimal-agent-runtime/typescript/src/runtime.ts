export type StopReason =
  | "success"
  | "blocked"
  | "budget_exhausted"
  | "invalid_decision"
  | "tool_failure"
  | "refused";

export type Decision =
  | { kind: "answer"; text: string }
  | { kind: "tool"; name: string; input: unknown }
  | { kind: "ask_human"; question: string }
  | { kind: "stop"; reason: StopReason };

export type Observation = {
  kind: "decision" | "tool" | "system" | "policy";
  summary: string;
};

export type ToolResult =
  | { status: "ok"; data: unknown }
  | { status: "refused"; reason: string }
  | { status: "error"; reason: string };

export type ToolDefinition = {
  name: string;
  description: string;
  sideEffect: "read" | "draft" | "write";
  execute(input: unknown): Promise<ToolResult>;
};

export type PolicyDecision =
  | { status: "allow" }
  | { status: "deny"; reason: string }
  | { status: "approval_required"; reason: string };

export type MemoryItem = {
  id: string;
  scope: "project" | "task" | "user";
  text: string;
};

export type ContextPacket = {
  runId: string;
  goal: string;
  stateSummary: string;
  observations: Array<{ summary: string }>;
  toolsDisclosed: string[];
  memoryRefs: string[];
  omittedRefs: Array<{ ref: string; reason: string }>;
};

export type TraceEvent = {
  runId: string;
  step: number;
  type: "context_built" | "decision" | "policy_decision" | "tool_result" | "stop";
  data: unknown;
};

export type AgentState = {
  runId: string;
  goal: string;
  steps: number;
  maxSteps: number;
  observations: Observation[];
  stopReason?: StopReason;
  answer?: string;
  toolsCalled: string[];
};

export type EvalCase = {
  caseId: string;
  input: string;
  expected: {
    toolsCalled?: string[];
    toolsNotCalled?: string[];
    stopReason: StopReason;
  };
};

export type EvalResult =
  | { status: "pass"; caseId: string }
  | { status: "fail"; caseId: string; reasons: string[] };

export type RuntimeConfig = {
  runId?: string;
  goal: string;
  maxSteps: number;
  tools: Record<string, ToolDefinition>;
  memory?: MemoryItem[];
  decide(context: ContextPacket, state: AgentState): Promise<Decision>;
  authorize(tool: ToolDefinition, state: AgentState): PolicyDecision;
};

export type RuntimeResult = {
  state: AgentState;
  trace: TraceEvent[];
};

function summarizeState(state: AgentState) {
  return `${state.steps}/${state.maxSteps} steps, ${state.observations.length} observations`;
}

export function buildContext(
  state: AgentState,
  tools: Record<string, ToolDefinition>,
  memory: MemoryItem[] = [],
): ContextPacket {
  const included = memory.filter(item => item.scope === "task" || item.scope === "project");
  const omitted = memory.filter(item => !included.includes(item));

  return {
    runId: state.runId,
    goal: state.goal,
    stateSummary: summarizeState(state),
    observations: state.observations.slice(-5).map(({ summary }) => ({ summary })),
    toolsDisclosed: Object.keys(tools).sort(),
    memoryRefs: included.map(item => item.id),
    omittedRefs: omitted.map(item => ({ ref: item.id, reason: "out_of_scope" })),
  };
}

function record(trace: TraceEvent[], event: TraceEvent) {
  trace.push(event);
}

function stop(
  state: AgentState,
  trace: TraceEvent[],
  stopReason: StopReason,
  data: Record<string, unknown> = {},
): RuntimeResult {
  state.stopReason = stopReason;
  record(trace, {
    runId: state.runId,
    step: state.steps,
    type: "stop",
    data: { stopReason, ...data },
  });
  return { state, trace };
}

export async function runAgent(config: RuntimeConfig): Promise<RuntimeResult> {
  const state: AgentState = {
    runId: config.runId ?? "run_001",
    goal: config.goal,
    steps: 0,
    maxSteps: config.maxSteps,
    observations: [],
    toolsCalled: [],
  };
  const trace: TraceEvent[] = [];

  while (state.steps < state.maxSteps) {
    const context = buildContext(state, config.tools, config.memory);
    record(trace, { runId: state.runId, step: state.steps, type: "context_built", data: context });

    const decision = await config.decide(context, state);
    state.observations.push({ kind: "decision", summary: decision.kind });
    record(trace, { runId: state.runId, step: state.steps, type: "decision", data: decision });
    state.steps += 1;

    if (decision.kind === "answer") {
      if (!decision.text.trim()) return stop(state, trace, "invalid_decision", { reason: "empty_answer" });
      state.answer = decision.text;
      return stop(state, trace, "success");
    }

    if (decision.kind === "ask_human") {
      state.observations.push({ kind: "system", summary: `human:${decision.question}` });
      return stop(state, trace, "blocked", { reason: "human_required" });
    }

    if (decision.kind === "stop") {
      return stop(state, trace, decision.reason);
    }

    const tool = config.tools[decision.name];
    if (!tool) {
      state.observations.push({ kind: "tool", summary: `unknown:${decision.name}` });
      return stop(state, trace, "refused", { reason: "unknown_tool", tool: decision.name });
    }

    const policy = config.authorize(tool, state);
    state.observations.push({ kind: "policy", summary: `${tool.name}:${policy.status}` });
    record(trace, { runId: state.runId, step: state.steps - 1, type: "policy_decision", data: { tool: tool.name, policy } });

    if (policy.status === "deny") {
      return stop(state, trace, "refused", { reason: policy.reason, tool: tool.name });
    }

    if (policy.status === "approval_required") {
      return stop(state, trace, "blocked", { reason: policy.reason, tool: tool.name });
    }

    const result = await tool.execute(decision.input);
    state.toolsCalled.push(tool.name);
    state.observations.push({ kind: "tool", summary: `${tool.name}:${result.status}` });
    record(trace, { runId: state.runId, step: state.steps - 1, type: "tool_result", data: { tool: tool.name, result } });

    if (result.status === "error") {
      return stop(state, trace, "tool_failure", { tool: tool.name, reason: result.reason });
    }

    if (result.status === "refused") {
      return stop(state, trace, "refused", { tool: tool.name, reason: result.reason });
    }
  }

  return stop(state, trace, "budget_exhausted");
}

export function evaluateTrajectory(result: RuntimeResult, testCase: EvalCase): EvalResult {
  const reasons: string[] = [];

  if (result.state.stopReason !== testCase.expected.stopReason) {
    reasons.push(`expected stopReason ${testCase.expected.stopReason}, got ${result.state.stopReason}`);
  }

  for (const tool of testCase.expected.toolsCalled ?? []) {
    if (!result.state.toolsCalled.includes(tool)) reasons.push(`expected tool call: ${tool}`);
  }

  for (const tool of testCase.expected.toolsNotCalled ?? []) {
    if (result.state.toolsCalled.includes(tool)) reasons.push(`forbidden tool was called: ${tool}`);
  }

  return reasons.length === 0
    ? { status: "pass", caseId: testCase.caseId }
    : { status: "fail", caseId: testCase.caseId, reasons };
}

export const demoTools: Record<string, ToolDefinition> = {
  lookup_policy: {
    name: "lookup_policy",
    description: "Read policy guidance for the current task.",
    sideEffect: "read",
    execute: async input => ({ status: "ok", data: { input, policy: "approval required for writes" } }),
  },
  draft_message: {
    name: "draft_message",
    description: "Create a draft message for review.",
    sideEffect: "draft",
    execute: async input => ({ status: "ok", data: { draft: String(input) } }),
  },
  send_message: {
    name: "send_message",
    description: "Send a message to an external user.",
    sideEffect: "write",
    execute: async input => ({ status: "ok", data: { sent: true, input } }),
  },
};

export function defaultAuthorize(tool: ToolDefinition): PolicyDecision {
  if (tool.sideEffect === "write") {
    return { status: "approval_required", reason: "write_tool_requires_approval" };
  }
  return { status: "allow" };
}
