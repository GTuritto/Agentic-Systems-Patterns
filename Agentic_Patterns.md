# Agentic Systems Patterns

This document provides an overview of the most important patterns in Agentic Systems, focusing on multi-agent and autonomous agent architectures. The patterns are listed from the most basic and common to the more advanced and complex, with references to MCP (Model Context Protocol), Agent Communication Protocols (A2A), Autogen, and LangGraph where relevant.

## 1. [Single Agent Pattern](./single-agent-pattern/README.md)

- **Description:** A single autonomous agent interacts with its environment to achieve a goal.
- **Example:** A chatbot answering user queries.



## 2. [Tool-Using Agent Pattern](./tool-using-agent-pattern/README.md)

- **Description:** An agent that leverages external tools or APIs to enhance its capabilities.
- **Example:** An agent that uses a calculator API to solve math problems.



## 3. [Chain-of-Thought (CoT) Pattern](./chain-of-thought-cot-pattern/README.md)

- **Description:** An agent decomposes a problem into a sequence of reasoning steps.
- **Example:** Step-by-step problem solving in math or logic tasks.



## 4. [ReAct Pattern (Reason + Act)](./react-pattern-reason-act/README.md)

- **Description:** The agent alternates between reasoning and taking actions, often using tools or APIs.
- **Example:** An agent that reasons about a question, then queries a database, then reasons again.



## 5. [Multi-Agent Collaboration Pattern](./multi-agent-collaboration-pattern/README.md)

- **Description:** Multiple agents with different roles or expertise collaborate to solve a problem.
- **Example:** One agent generates ideas, another critiques, a third implements.



## 6. [Task Delegation Pattern](./task-delegation-pattern/README.md)

- **Description:** A manager agent delegates subtasks to specialized worker agents.
- **Example:** A project manager agent assigns coding, testing, and documentation to different agents.



## 7. [Agent Swarm Pattern](./agent-swarm-pattern/README.md)

- **Description:** Many simple agents work in parallel, often with emergent behavior.
- **Example:** Agents searching a solution space in parallel and sharing findings.



## 8. [Agent Chain / Pipeline Pattern](./agent-chain-pipeline-pattern/README.md)

- **Description:** Agents are organized in a pipeline, each transforming or enriching the output of the previous.
- **Example:** Data extraction agent → summarization agent → translation agent.



## 9. [Agent Orchestration Pattern](./agent-orchestration-pattern/README.md)

- **Description:** An orchestrator coordinates multiple agents, possibly with dynamic role assignment and communication.
- **Example:** LangGraph workflows, Autogen orchestrators.



## 10. [Agent Marketplace Pattern](./agent-marketplace-pattern/README.md)

- **Description:** Agents offer and request services in a marketplace-like environment, negotiating and trading tasks.
- **Example:** Agents bidding for tasks based on expertise or availability.



## 11. [Recursive Agent Pattern](./recursive-agent-pattern/README.md)

- **Description:** Agents can spawn or call other agents recursively to solve subproblems.
- **Example:** An agent that delegates subtasks to new agent instances as needed.



## 12. [Reflection and Self-Improvement Pattern](./reflection-and-self-improvement-pattern/README.md)

- **Description:** Agents reflect on their own performance and adapt or improve over time.
- **Example:** An agent that reviews its own outputs and updates its strategy.



## 13. [Consensus-Seeking Multi-Agent System Pattern](./consensus-seeking-multi-agent-system-pattern/README.md)

- **Description:** Multiple agents propose answers and a meta-agent synthesizes a consensus using voting, ranking, or critique loops.
- **Example:** Independent solvers generate proposals; a judge agent aggregates into a final decision.



## 14. [Memory-Augmented Agent Pattern](./memory-augmented-agent-pattern/README.md)

- **Description:** Agents use persistent memory or knowledge bases to inform decisions across sessions.
- **Example:** An agent that remembers user preferences or past conversations.



## 15. [Secure Agent Communication Pattern](./secure-agent-communication-pattern/README.md)

- **Description:** Agents communicate using secure protocols, ensuring privacy, integrity, and authenticity of messages. Includes encryption, authentication, and integrity checks for sensitive or adversarial environments.
- **Example:** Agents exchanging encrypted messages using secure protocols.



## 16. [Distributed Agent Pattern](./distributed-agent-pattern/README.md)

- **Description:** Multiple agents operate across different locations or systems, collaborating to achieve shared or individual goals. They communicate, coordinate, and partition tasks for scalable, robust, and fault-tolerant systems.
- **Example:** Multi-agent systems in cloud or edge computing.



## 17. [Environment-Interactive Agent Pattern](./environment-interactive-agent-pattern/README.md)

- **Description:** Agents actively perceive, interact with, and adapt to their environment, learning from feedback and outcomes of their actions. Foundational for dynamic, real-world, or simulated environments.
- **Example:** Robotics and autonomous systems.



## 18. [Goal-Conditioned Agent Pattern](./goal-conditioned-agent-pattern/README.md)

- **Description:** Agents operate with explicit goals or objectives, planning and adapting actions to achieve them. Enables flexible, adaptive, and user-driven interactions.
- **Example:** Task completion agents (e.g., "Book a flight to Paris").



## 19. [Hierarchical Agent Pattern](./hierarchical-agent-pattern/README.md)

- **Description:** Agents are organized in a hierarchy, with higher-level agents delegating tasks to sub-agents. Useful for decomposing complex problems into manageable sub-tasks.
- **Example:** Project management agents (manager/subordinate roles).



## 20. [Hybrid Agent Pattern](./hybrid-agent-pattern/README.md)

- **Description:** Combines multiple agentic patterns or reasoning approaches (e.g., symbolic, ML, rule-based) within a single agent or system for greater flexibility and robustness.
- **Example:** Agents that use both rules and LLMs for decision making.



## 21. [Meta-Cognitive Agent Pattern](./meta-cognitive-agent-pattern/README.md)

- **Description:** Agents reason about their own reasoning, monitor confidence, and adapt strategies dynamically. Enables self-awareness, transparency, and improved robustness.
- **Example:** Agents that explain their reasoning and confidence.



## 22. [Planning Agent Pattern](./planning-pattern/README.md)

- **Description:** Agents generate, evaluate, and execute multi-step plans to achieve complex goals, adapting plans based on feedback or changing circumstances.
- **Example:** Automated workflow execution.

## 23. [DSPy Pattern](./dspy-pattern/README.md)
- **Description:** Modular, composable pipelines for LLMs and agentic systems using DSPy framework.
- **Example:** Tool-using agent with modular skills and pipeline optimization.

## 24. [Prompt Engineering Pattern](./prompt-engineering-pattern/README.md)
- **Description:** Best practices and techniques for designing effective prompts for LLMs and agents.
- **Example:** Using prompt templates and few-shot examples for robust outputs.

## 25. [Context Engineering Pattern](./context-engineering-pattern/README.md)
- **Description:** Structuring and managing context for LLMs and agents to maximize effectiveness.
- **Example:** Retrieval-augmented generation and dynamic context injection.

---

## 26. [Context-Aware Routing Agent Pattern](./context-aware-routing-agent-pattern/README.md)

- **Description:** Orchestrator that dynamically routes incoming queries to the most suitable specialist agent based on intent classification or semantic similarity.
- **Example:** Router selects between code assistant, data analyst, or support bot using embeddings + rules.

## 27. [Long-Term Episodic Memory Agent Pattern](./long-term-episodic-memory-agent-pattern/README.md)

- **Description:** Maintains a timeline of episodic memories in a vector DB and retrieves relevant events for reasoning.
- **Example:** Personal assistant recalls past meetings and preferences across sessions.

## 28. [Adversarial Testing Agent Pattern](./adversarial-testing-agent-pattern/README.md)

- **Description:** “Red team” agent that attempts to mislead or break another agent to test robustness.
- **Example:** Safe prompt injection attempts and robustness checklist generation.

## 29. [Self-Healing Workflow Agent Pattern](./self-healing-workflow-agent-pattern/README.md)

- **Description:** Detects and recovers from workflow failures by retrying or re-planning.
- **Example:** ETL agent retries with fallback data sources on transient failures.

## 30. [Simulation-Based Planner Agent Pattern](./simulation-based-planner-agent-pattern/README.md)

- **Description:** Simulates potential action sequences to pick the optimal execution plan.
- **Example:** Simulated rollouts to choose best sequence for a deployment or logistics task.

## 31. [Event-Triggered Agent Pattern](./event-triggered-agent-pattern/README.md)

- **Description:** Activated only by external events (webhooks, Kafka, Pub/Sub) to reduce latency and compute.
- **Example:** Webhook-triggered summarization pipeline.

---

## Applied Examples

- [API Integration Copilot](./api-integration-copilot/README.md)
- [Data Pipeline Orchestrator Agent](./data-pipeline-orchestrator-agent/README.md)
- [Human-in-the-Loop Approval Agent](./human-in-the-loop-approval-agent/README.md)
- [Compliance/Policy Enforcer Agent](./compliance-policy-enforcer-agent/README.md)
- [Multi-Modal Tool-Using Agent](./multi-modal-tool-using-agent/README.md)

---

## Interoperability Patterns

- [MCP Context Exchange Pattern](./mcp-context-exchange-pattern/README.md)
- [A2A Agent-to-Agent Communication Protocol](./agent-to-agent-communication-pattern/README.md)

---

## Runnable demo patterns (this repo)

- [CodeAct Agent Pattern](./codeact-agent-pattern/README.md)
	- Think → plan tiny JS snippet → execute in sandbox → observe → iterate.
- [Planning Pattern (Planner + Executor)](./planning-pattern/README.md)
	- Deterministic fallback; optional Mistral HTTP planning.
- [Modern Tool Use Pattern (MCP-first)](./modern-tool-use-pattern/README.md)
	- Agent discovers MCP manifests (search, cloud) and invokes tools with Ajv validation.

**References:**

- MCP (Model Context Protocol)
- Agent Communication Protocols (A2A)
- Autogen
- LangGraph


This list can be expanded with examples and code for each pattern as needed.
