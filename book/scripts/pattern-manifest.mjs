export const patterns = [
  {
    title: 'Single Agent',
    chapterPath: 'foundations/single-agent.md',
    sourceFolder: 'single-agent-pattern',
    bundleName: 'single-agent',
    summary:
      'A single agent receives a goal or message, consults its context, and produces an answer or action. This is the smallest useful unit in the catalog.',
    useWhen: [
      'One model-backed worker can complete the task without delegation.',
      'The interaction has a narrow objective and a clear success condition.',
      'You want the simplest useful baseline before adding tools, memory, or orchestration.'
    ],
    avoidWhen: [
      'The task needs stateful retries, external approvals, multiple specialists, or independent evaluation.',
      'The agent must recover from long-running failure or resume after interruption.'
    ],
    commands: ['npm run single-agent'],
    codeFiles: [
      'single-agent-pattern/autogen_typescript_example/single_agent.ts',
      'single-agent-pattern/langgraph_python_example/single_agent.py'
    ]
  },
  {
    title: 'Agent Loop',
    chapterPath: 'foundations/agent-loop.md',
    sourceFolder: 'agent-loop-pattern',
    bundleName: 'agent-loop',
    summary:
      'The agent loop turns a model call into an agent: observe state, decide the next action, act, evaluate the result, and stop when the goal is complete or a limit is reached.',
    useWhen: [
      'The next step is not fully known before execution starts.',
      'The agent may need multiple tool calls, observations, or revisions.',
      'You need explicit stop conditions, budgets, and recoverable state.'
    ],
    avoidWhen: [
      'The task is a fixed workflow with known deterministic steps.',
      'A single prompt or deterministic function is sufficient.',
      'You cannot safely bound tool use, cost, or runtime.'
    ]
  },
  {
    title: 'Goals and State',
    chapterPath: 'foundations/goals-and-state.md',
    sourceFolder: 'goals-and-state-pattern',
    bundleName: 'goals-and-state',
    summary:
      'Goals define success; state records progress. Together they make agent work resumable, inspectable, and easier to evaluate.',
    useWhen: [
      'The task has multiple steps or may resume later.',
      'You need to separate objectives, constraints, completed work, pending work, and evidence.',
      'You want debugging and evaluation data that is not buried in chat history.'
    ],
    avoidWhen: [
      'The task is a single stateless transformation.',
      'The system cannot persist state safely or privately.'
    ]
  },
  {
    title: 'Tool Use',
    chapterPath: 'foundations/tool-use.md',
    sourceFolder: 'tool-using-agent-pattern',
    bundleName: 'tool-use',
    summary:
      'Tool use gives an agent controlled access to external capability such as calculators, search, databases, files, code execution, APIs, or business systems.',
    useWhen: [
      'The model needs facts, computation, side effects, or system access outside its context window.',
      'Tool inputs and results can be typed, validated, and observed.',
      'Permissions and policy checks can sit between model intent and execution.'
    ],
    avoidWhen: [
      'A normal function or workflow can solve the problem without model selection.',
      'The tool has broad destructive permissions and no approval boundary.',
      'Tool results cannot be verified or traced.'
    ],
    commands: ['npm run tool-using-agent'],
    codeFiles: [
      'tool-using-agent-pattern/autogen_typescript_example/tool_using_agent.ts',
      'tool-using-agent-pattern/langgraph_python_example/tool_using_agent.py'
    ]
  },
  {
    title: 'Structured Output',
    chapterPath: 'foundations/structured-output.md',
    sourceFolder: 'structured-output-pattern',
    bundleName: 'structured-output',
    summary:
      'Structured output constrains model responses to typed data that software can validate and consume.',
    useWhen: [
      'The model output drives routing, tool plans, policy outcomes, database writes, or workflow transitions.',
      'Downstream systems require stable fields instead of prose.',
      'You can reject, repair, or retry invalid output.'
    ],
    avoidWhen: [
      'The output is purely human-facing prose.',
      'The schema is so broad that validation no longer proves anything useful.'
    ]
  },
  {
    title: 'Context Engineering',
    chapterPath: 'foundations/context-engineering.md',
    sourceFolder: 'context-engineering-pattern',
    bundleName: 'context-engineering',
    summary:
      'Context engineering controls what the model sees: instructions, state, retrieval results, tool documentation, memory, examples, and prior messages.',
    useWhen: [
      'Answer quality depends on selecting the right information before generation.',
      'The agent combines instructions, memory, retrieval, tools, and examples.',
      'You need to manage context budget, freshness, and source trust.'
    ],
    avoidWhen: [
      'All required information is already in a short prompt.',
      'The system cannot distinguish trusted sources from noisy or stale material.'
    ],
    codeFiles: ['context-engineering-pattern/langgraph_python_example/rag_example.py']
  },
  {
    title: 'Planning and Execution',
    chapterPath: 'control-loops/planning-and-execution.md',
    sourceFolder: 'planning-pattern',
    bundleName: 'planning-and-execution',
    summary:
      'Planning separates deciding what to do from doing it. The planner creates steps; the executor runs them, reports progress, and handles errors.',
    useWhen: [
      'The task has meaningful sequencing, dependencies, or recoverable failure points.',
      'You want to inspect or revise the plan before execution.',
      'Execution can be deterministic even if planning uses a model.'
    ],
    avoidWhen: [
      'The plan would always be a single step.',
      'The executor cannot report structured progress or failure.',
      'The model is allowed to execute unvalidated plans directly.'
    ],
    commands: ['npm run plan:test', 'npm run plan:run -- "Compute average of [1,2,3,4]"', 'npm run plan:py'],
    codeFiles: [
      'planning-pattern/typescript/src/planner.ts',
      'planning-pattern/typescript/src/executor.ts',
      'planning-pattern/typescript/src/run.ts',
      'planning-pattern/python/planner.py'
    ]
  },
  {
    title: 'ReAct',
    chapterPath: 'control-loops/react.md',
    sourceFolder: 'react-pattern-reason-act',
    bundleName: 'react',
    summary:
      'ReAct alternates reasoning and acting. The agent reasons about current state, takes an action, observes the result, and repeats.',
    useWhen: [
      'The task requires tool use and the agent cannot know all required information upfront.',
      'Observations should change the next step.',
      'A bounded loop can stop on success, failure, or budget.'
    ],
    avoidWhen: [
      'The task is a deterministic workflow with known steps.',
      'You cannot validate actions before they run.',
      'The reasoning trace would expose sensitive information to users.'
    ],
    commands: ['npm run react-agent'],
    codeFiles: [
      'react-pattern-reason-act/autogen_typescript_example/react_agent.ts',
      'react-pattern-reason-act/langgraph_python_example/react_agent.py'
    ]
  },
  {
    title: 'Reflection',
    chapterPath: 'control-loops/reflection.md',
    sourceFolder: 'reflection-and-self-improvement-pattern',
    bundleName: 'reflection',
    summary:
      'Reflection asks an agent or evaluator to inspect prior output and identify concrete improvements.',
    useWhen: [
      'The system has explicit quality criteria.',
      'A critique can change decisions, tests, state, or final artifacts.',
      'You need a lightweight improvement pass without a full evaluator-optimizer loop.'
    ],
    avoidWhen: [
      'The critique only produces longer output.',
      'There is no acceptance criterion for the revised result.',
      'The model is asked to approve its own unsafe actions.'
    ],
    commands: ['npm run reflection-self-improvement-agent'],
    codeFiles: [
      'reflection-and-self-improvement-pattern/autogen_typescript_example/reflection_agent.ts',
      'reflection-and-self-improvement-pattern/langgraph_python_example/reflection_agent.py'
    ]
  },
  {
    title: 'Evaluator-Optimizer',
    chapterPath: 'control-loops/evaluator-optimizer.md',
    sourceFolder: 'evaluator-optimizer-pattern',
    bundleName: 'evaluator-optimizer',
    summary:
      'Evaluator-Optimizer pairs a generator with an evaluator. The generator proposes; the evaluator scores; the optimizer revises or stops.',
    useWhen: [
      'Output quality can be scored against concrete criteria.',
      'The system can afford multiple attempts.',
      'You need improvement without giving the generator final authority.'
    ],
    avoidWhen: [
      'No evaluator can reliably distinguish good from bad output.',
      'Latency or cost makes iteration unacceptable.',
      'The optimizer can hide safety failures by rewriting evidence.'
    ]
  },
  {
    title: 'Self-Improvement',
    chapterPath: 'control-loops/self-improvement.md',
    sourceFolder: 'reflection-and-self-improvement-pattern',
    bundleName: 'self-improvement',
    summary:
      'Self-improvement uses feedback from prior runs to improve future runs through reviewed changes to prompts, tools, retrieval, policies, tests, or skills.',
    useWhen: [
      'You have run logs, eval failures, and review processes.',
      'Improvements are applied through versioned artifacts.',
      'Humans or automated gates can approve behavior changes.'
    ],
    avoidWhen: [
      'The agent silently rewrites its own instructions in production.',
      'No eval suite exists to catch regressions.',
      'The feedback signal is noisy or easy to game.'
    ],
    codeFiles: [
      'reflection-and-self-improvement-pattern/autogen_typescript_example/reflection_agent.ts',
      'reflection-and-self-improvement-pattern/langgraph_python_example/reflection_agent.py'
    ]
  },
  {
    title: 'Self-Healing Workflows',
    chapterPath: 'control-loops/self-healing-workflows.md',
    sourceFolder: 'self-healing-workflow-agent-pattern',
    bundleName: 'self-healing-workflows',
    summary:
      'Self-healing workflows detect failed steps and recover through retry, fallback, re-planning, or escalation.',
    useWhen: [
      'Failures are expected and can be classified.',
      'The workflow can retry idempotently or compensate safely.',
      'Recovery policies are explicit and observable.'
    ],
    avoidWhen: [
      'Every failure requires human judgment.',
      'Retries can duplicate side effects.',
      'The system would call a model again without new information.'
    ]
  },
  {
    title: 'Memory-Augmented Agent',
    chapterPath: 'memory-knowledge/memory-augmented-agent.md',
    sourceFolder: 'memory-augmented-agent-pattern',
    bundleName: 'memory-augmented-agent',
    summary:
      'Memory-augmented agents store and retrieve information across turns or sessions.',
    useWhen: [
      'The agent needs continuity beyond one interaction.',
      'Stored facts can be scoped, updated, and deleted.',
      'Retrieval results can be cited or inspected.'
    ],
    avoidWhen: [
      'The system would store sensitive data without consent or retention rules.',
      'Retrieved memories cannot be distinguished from current instructions.',
      'The memory store is used as an uncurated transcript dump.'
    ],
    commands: ['npm run memory-augmented-agent'],
    codeFiles: [
      'memory-augmented-agent-pattern/autogen_typescript_example/memory_agent.ts',
      'memory-augmented-agent-pattern/langgraph_python_example/memory_agent.py'
    ]
  },
  {
    title: 'Long-Term Episodic Memory',
    chapterPath: 'memory-knowledge/long-term-episodic-memory.md',
    sourceFolder: 'long-term-episodic-memory-agent-pattern',
    bundleName: 'long-term-episodic-memory',
    summary:
      'Long-term episodic memory stores events: what happened, when, who was involved, and why it mattered.',
    useWhen: [
      'The assistant needs continuity across sessions.',
      'Events can be retrieved by relevance, recency, user, and project scope.',
      'You can enforce retention, privacy, and correction policies.'
    ],
    avoidWhen: [
      'The task only needs semantic facts, not event history.',
      'The system cannot explain or delete remembered events.'
    ]
  },
  {
    title: 'Semantic Recall and RAG',
    chapterPath: 'memory-knowledge/semantic-recall-rag.md',
    sourceFolder: 'context-engineering-pattern',
    bundleName: 'semantic-recall-rag',
    summary:
      'Semantic recall retrieves relevant material by meaning rather than exact keywords. RAG injects retrieved material into context before generation.',
    useWhen: [
      'The agent must answer from a changing or large knowledge base.',
      'Relevant documents can be chunked, embedded, filtered, and cited.',
      'The retrieval layer can enforce source trust and freshness.'
    ],
    avoidWhen: [
      'The answer should come from model knowledge only.',
      'The corpus is too noisy to retrieve safely.',
      'The system cannot cite or inspect retrieved context.'
    ],
    codeFiles: ['context-engineering-pattern/langgraph_python_example/rag_example.py']
  },
  {
    title: 'Working Memory',
    chapterPath: 'memory-knowledge/working-memory.md',
    sourceFolder: 'goals-and-state-pattern',
    bundleName: 'working-memory',
    summary:
      'Working memory is compact, typed task state the agent can update and consult during a run.',
    useWhen: [
      'The agent must track current plan, constraints, entities, evidence, and open questions.',
      'Raw chat history is too noisy or long.',
      'State changes should be inspectable and resumable.'
    ],
    avoidWhen: [
      'The task is stateless.',
      'The memory would become an unvalidated scratchpad with no schema.'
    ]
  },
  {
    title: 'Knowledge-Bound Agents',
    chapterPath: 'memory-knowledge/knowledge-bound-agents.md',
    sourceFolder: 'compliance-policy-enforcer-agent',
    bundleName: 'knowledge-bound-agents',
    summary:
      'Knowledge-bound agents ground answers and actions in approved sources, policies, and citation rules.',
    useWhen: [
      'The domain requires approved sources, citations, or compliance constraints.',
      'The agent should refuse or escalate when evidence is missing.',
      'Freshness and source trust matter.'
    ],
    avoidWhen: [
      'The agent is allowed to speculate freely.',
      'Approved sources cannot be identified or updated.',
      'Policy checks happen only after irreversible actions.'
    ]
  },
  {
    title: 'Skills',
    chapterPath: 'tools-skills-protocols/skills.md',
    sourceFolder: 'skills-pattern',
    bundleName: 'skills',
    summary:
      'Skills package procedural knowledge as discoverable folders of instructions, references, scripts, templates, and assets.',
    useWhen: [
      'The agent needs a repeatable procedure, not just a tool call.',
      'A task benefits from references, scripts, templates, or assets.',
      'You want reusable operational knowledge with clear activation rules.'
    ],
    avoidWhen: [
      'A single typed tool is enough.',
      'The skill would hide broad permissions or vague instructions.',
      'The procedure cannot be tested or reviewed.'
    ]
  },
  {
    title: 'MCP-first Tool Use',
    chapterPath: 'tools-skills-protocols/mcp-first-tool-use.md',
    sourceFolder: 'modern-tool-use-pattern',
    bundleName: 'mcp-first-tool-use',
    summary:
      'MCP-first tool use separates tool capability from agent logic through manifests, validation, invocation, and structured results.',
    useWhen: [
      'Tools are shared across agents or applications.',
      'Tool schemas, context, and permissions need to be discoverable.',
      'You want to test tool invocation separately from model reasoning.'
    ],
    avoidWhen: [
      'A local function call is enough and no discovery boundary is needed.',
      'Tool inputs cannot be validated.',
      'The agent has permission to call too many tools without policy checks.'
    ],
    commands: ['npm run mcp:search', 'npm run mcp:cloud', 'npm run mcp:agent', 'npm run mcp:test'],
    codeFiles: [
      'modern-tool-use-pattern/typescript/src/agent.ts',
      'modern-tool-use-pattern/typescript/src/mcp_search_server.ts',
      'modern-tool-use-pattern/typescript/src/mcp_cloud_server.ts'
    ]
  },
  {
    title: 'A2A Agent Interoperability',
    chapterPath: 'tools-skills-protocols/a2a-agent-interoperability.md',
    sourceFolder: 'agent-to-agent-communication-pattern',
    bundleName: 'a2a-agent-interoperability',
    summary:
      'A2A makes agents discoverable and callable across process, team, runtime, and vendor boundaries.',
    useWhen: [
      'Agents are owned by different services, teams, runtimes, or vendors.',
      'A caller must discover what a remote agent can do before sending work.',
      'Task state must survive asynchronous progress, refusal, error, or cancellation.'
    ],
    avoidWhen: [
      'Both agents are simple functions inside one process.',
      'The interaction is only a local tool call with typed input and output.',
      'You cannot authenticate callers or validate messages.'
    ],
    commands: ['npm run a2a:test', 'npm run a2a:run'],
    codeFiles: [
      'agent-to-agent-communication-pattern/src/run_demo.ts',
      'agent-to-agent-communication-pattern/src/agent_a.ts',
      'agent-to-agent-communication-pattern/src/agent_b.ts',
      'agent-to-agent-communication-pattern/protocol/a2a.schema.json'
    ]
  },
  {
    title: 'Secure Agent Communication',
    chapterPath: 'tools-skills-protocols/secure-agent-communication.md',
    sourceFolder: 'secure-agent-communication-pattern',
    bundleName: 'secure-agent-communication',
    summary:
      'Secure communication protects messages between agents with authentication, integrity, confidentiality, and policy checks.',
    useWhen: [
      'Agents cross trust boundaries.',
      'Messages contain private data or trigger external side effects.',
      'You need identity, authorization, replay protection, and audit logs.'
    ],
    avoidWhen: [
      'All communication is local and already protected by process boundaries.',
      'Security checks cannot be enforced before action.',
      'The protocol lacks correlation IDs and auditability.'
    ],
    commands: ['npm run secure-agent'],
    codeFiles: [
      'secure-agent-communication-pattern/autogen_typescript_example/secure_agent.ts',
      'secure-agent-communication-pattern/langgraph_python_example/secure_agent.py'
    ]
  },
  {
    title: 'Human Approval Gates',
    chapterPath: 'tools-skills-protocols/human-approval-gates.md',
    sourceFolder: 'human-in-the-loop-approval-agent',
    bundleName: 'human-approval-gates',
    summary:
      'Human approval gates pause execution before sensitive, expensive, destructive, or externally visible actions.',
    useWhen: [
      'The agent may trigger irreversible or high-risk actions.',
      'A human must review context before continuation.',
      'The workflow can preserve state while waiting.'
    ],
    avoidWhen: [
      'Every step requires approval and the agent adds no value.',
      'Approval records cannot capture who approved what and why.',
      'The workflow cannot safely resume after waiting.'
    ]
  },
  {
    title: 'Task Delegation',
    chapterPath: 'multi-agent-systems/task-delegation.md',
    sourceFolder: 'task-delegation-pattern',
    bundleName: 'task-delegation',
    summary:
      'Task delegation assigns bounded subtasks to specialized workers and combines their outputs.',
    useWhen: [
      'Specialized workers can complete independent subtasks better than one general agent.',
      'The manager can define expected outputs, constraints, and acceptance criteria.',
      'Subtask results can be merged and checked.'
    ],
    avoidWhen: [
      'The task has no useful decomposition.',
      'Workers share hidden mutable state.',
      'The manager cannot evaluate returned work.'
    ],
    commands: ['npm run task-delegation'],
    codeFiles: [
      'task-delegation-pattern/autogen_typescript_example/task_delegation.ts',
      'task-delegation-pattern/langgraph_python_example/task_delegation.py'
    ]
  },
  {
    title: 'Supervisor / Worker',
    chapterPath: 'multi-agent-systems/supervisor-worker.md',
    sourceFolder: 'hierarchical-agent-pattern',
    bundleName: 'supervisor-worker',
    summary:
      'Supervisor/Worker centralizes goal ownership, task state, routing, and quality gates while workers perform bounded specialist work.',
    useWhen: [
      'Independent specialists are useful but centralized control is still required.',
      'The supervisor can route work and evaluate outputs.',
      'Workers have narrow roles and structured return contracts.'
    ],
    avoidWhen: [
      'The supervisor becomes a bottleneck with no added quality control.',
      'Workers can take uncontrolled side effects.',
      'No one owns final acceptance.'
    ],
    commands: ['npm run hierarchical-agent'],
    codeFiles: [
      'hierarchical-agent-pattern/autogen_typescript_example/hierarchical_agent.ts',
      'hierarchical-agent-pattern/langgraph_python_example/hierarchical_agent.py'
    ]
  },
  {
    title: 'Debate and Consensus',
    chapterPath: 'multi-agent-systems/debate-and-consensus.md',
    sourceFolder: 'consensus-seeking-multi-agent-system-pattern',
    bundleName: 'debate-and-consensus',
    summary:
      'Debate and consensus use multiple independent proposals, critiques, votes, or rankings before producing a final answer.',
    useWhen: [
      'Diversity of reasoning improves quality.',
      'Aggregation rules are clear before agents start.',
      'The system can tolerate extra cost and latency.'
    ],
    avoidWhen: [
      'Agents are not independent and will repeat the same failure.',
      'Voting replaces evidence or tests.',
      'The final decision has no accountable owner.'
    ]
  },
  {
    title: 'Parallel Agents',
    chapterPath: 'multi-agent-systems/parallel-agents.md',
    sourceFolder: 'multi-agent-collaboration-pattern',
    bundleName: 'parallel-agents',
    summary:
      'Parallel agents run independent work concurrently, then merge results through a fan-out/fan-in control point.',
    useWhen: [
      'Work can be split into independent searches, reviews, or candidate generations.',
      'Latency matters and parallelism is safe.',
      'The merge step can compare, rank, or synthesize results.'
    ],
    avoidWhen: [
      'Agents need shared mutable state during execution.',
      'The merge policy is vague.',
      'Parallel work increases cost without increasing quality.'
    ],
    commands: ['npm run multi-agent-collab'],
    codeFiles: [
      'multi-agent-collaboration-pattern/autogen_typescript_example/multi_agent_collab.ts',
      'multi-agent-collaboration-pattern/langgraph_python_example/multi_agent_collab.py'
    ]
  },
  {
    title: 'CrewAI Flows and Crews',
    chapterPath: 'multi-agent-systems/crewai-flows-and-crews.md',
    sourceFolder: 'crewai-flows-and-crews-pattern',
    bundleName: 'crewai-flows-and-crews',
    summary:
      'CrewAI Flows own state and execution order. Crews group specialized agents that collaborate on delegated work inside the flow.',
    useWhen: [
      'You are building Python workflows that combine stateful flow control with collaborating roles.',
      'The flow should own ordering while crews perform bounded work.',
      'You need a practical framework mapping for multi-agent orchestration.'
    ],
    avoidWhen: [
      'A simple function pipeline is enough.',
      'Framework abstractions hide state transitions or error handling.',
      'Crew roles are vague and overlap heavily.'
    ]
  },
  {
    title: 'Durable Workflows',
    chapterPath: 'production-runtime/durable-workflows.md',
    sourceFolder: 'durable-workflow-pattern',
    bundleName: 'durable-workflows',
    summary:
      'Durable workflows make agentic systems resumable and auditable by owning retries, checkpoints, approvals, compensation, and long-running state.',
    useWhen: [
      'The task may outlive one process, request, or model call.',
      'Steps need retries, checkpoints, approvals, or compensation.',
      'Operators must inspect what happened after the run.'
    ],
    avoidWhen: [
      'The task is short, stateless, and deterministic.',
      'The workflow cannot persist enough state to resume safely.',
      'Retries could duplicate side effects.'
    ]
  },
  {
    title: 'Observability and Evals',
    chapterPath: 'production-runtime/observability-and-evals.md',
    sourceFolder: 'observability-and-evals-pattern',
    bundleName: 'observability-and-evals',
    summary:
      'Observability records what happened. Evals decide whether behavior is good enough. Release gates decide whether a change is allowed to ship.',
    useWhen: [
      'You need traces, inputs, tool calls, costs, latency, evaluator scores, and regression datasets.',
      'Agent changes must be compared against known tasks.',
      'Production incidents require replayable evidence.'
    ],
    avoidWhen: [
      'Logs would expose sensitive data without controls.',
      'Metrics do not connect to user-visible quality.',
      'Evals are too synthetic to predict production failures.'
    ]
  },
  {
    title: 'Policy Enforcement',
    chapterPath: 'production-runtime/policy-enforcement.md',
    sourceFolder: 'compliance-policy-enforcer-agent',
    bundleName: 'policy-enforcement',
    summary:
      'Policy enforcement constrains what the agent may say or do through permissions, data-access rules, business rules, safety rules, and escalation.',
    useWhen: [
      'Actions must be checked before execution.',
      'The agent handles regulated, private, or business-critical data.',
      'Policy decisions must be auditable.'
    ],
    avoidWhen: [
      'Policy is only written as prompt text with no runtime enforcement.',
      'The system cannot identify the actor, resource, action, and context.',
      'Exceptions are silent or unreviewed.'
    ]
  },
  {
    title: 'Event-Triggered Agents',
    chapterPath: 'production-runtime/event-triggered-agents.md',
    sourceFolder: 'event-triggered-agent-pattern',
    bundleName: 'event-triggered-agents',
    summary:
      'Event-triggered agents run in response to webhooks, queues, schedules, or domain events.',
    useWhen: [
      'A domain event should start bounded agent work.',
      'The task can be idempotent and observable.',
      'No human may be watching the interaction live.'
    ],
    avoidWhen: [
      'The event payload lacks enough context to act safely.',
      'Duplicate delivery could cause duplicate side effects.',
      'Failures cannot be retried or dead-lettered.'
    ]
  },
  {
    title: 'Mastra Runtime',
    chapterPath: 'production-runtime/mastra-runtime.md',
    sourceFolder: 'mastra-runtime-pattern',
    bundleName: 'mastra-runtime',
    summary:
      'Mastra is a TypeScript runtime pattern for applications that need agents, workflows, tools, memory, evals, and observability in one framework.',
    useWhen: [
      'You want a TypeScript runtime that hosts agents, workflows, tools, memory, and evals together.',
      'You need framework conventions around production agent applications.',
      'You can keep architecture decisions explicit instead of outsourcing them to the framework.'
    ],
    avoidWhen: [
      'A small script or single prompt is enough.',
      'The framework hides workflow state, testability, or observability.',
      'You are choosing a framework before identifying runtime requirements.'
    ]
  }
];
