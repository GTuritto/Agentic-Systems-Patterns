# Agentic Systems Patterns

This document provides an overview of the most important patterns in Agentic Systems, focusing on multi-agent and autonomous agent architectures. The patterns are listed from the most basic and common to the more advanced and complex, with references to MCP (Model Context Protocol), Agent Communication Protocols (A2A), Autogen, and LangGraph where relevant.

## 1. [Single Agent Pattern](./Single Agent Pattern/README.md)

- **Description:** A single autonomous agent interacts with its environment to achieve a goal.
- **Example:** A chatbot answering user queries.



## 2. [Tool-Using Agent Pattern](./Tool-Using Agent Pattern/README.md)

- **Description:** An agent that leverages external tools or APIs to enhance its capabilities.
- **Example:** An agent that uses a calculator API to solve math problems.



## 3. [Chain-of-Thought (CoT) Pattern](./Chain-of-Thought (CoT) Pattern/README.md)

- **Description:** An agent decomposes a problem into a sequence of reasoning steps.
- **Example:** Step-by-step problem solving in math or logic tasks.



## 4. [ReAct Pattern (Reason + Act)](./ReAct Pattern (Reason + Act)/README.md)

- **Description:** The agent alternates between reasoning and taking actions, often using tools or APIs.
- **Example:** An agent that reasons about a question, then queries a database, then reasons again.



## 5. [Multi-Agent Collaboration Pattern](./Multi-Agent Collaboration Pattern/README.md)

- **Description:** Multiple agents with different roles or expertise collaborate to solve a problem.
- **Example:** One agent generates ideas, another critiques, a third implements.



## 6. [Task Delegation Pattern](./Task Delegation Pattern/README.md)

- **Description:** A manager agent delegates subtasks to specialized worker agents.
- **Example:** A project manager agent assigns coding, testing, and documentation to different agents.



## 7. [Agent Swarm Pattern](./Agent Swarm Pattern/README.md)

- **Description:** Many simple agents work in parallel, often with emergent behavior.
- **Example:** Agents searching a solution space in parallel and sharing findings.



## 8. [Agent Chain / Pipeline Pattern](./Agent Chain - Pipeline Pattern/README.md)

- **Description:** Agents are organized in a pipeline, each transforming or enriching the output of the previous.
- **Example:** Data extraction agent → summarization agent → translation agent.



## 9. [Agent Orchestration Pattern](./Agent Orchestration Pattern/README.md)

- **Description:** An orchestrator coordinates multiple agents, possibly with dynamic role assignment and communication.
- **Example:** LangGraph workflows, Autogen orchestrators.



## 10. [Agent Marketplace Pattern](./Agent Marketplace Pattern/README.md)

- **Description:** Agents offer and request services in a marketplace-like environment, negotiating and trading tasks.
- **Example:** Agents bidding for tasks based on expertise or availability.



## 11. [Recursive Agent Pattern](./Recursive Agent Pattern/README.md)

- **Description:** Agents can spawn or call other agents recursively to solve subproblems.
- **Example:** An agent that delegates subtasks to new agent instances as needed.



## 12. [Reflection and Self-Improvement Pattern](./Reflection and Self-Improvement Pattern/README.md)

- **Description:** Agents reflect on their own performance and adapt or improve over time.
- **Example:** An agent that reviews its own outputs and updates its strategy.



## 13. Consensus/Negotiation Pattern

- **Description:** Multiple agents negotiate or vote to reach a consensus on a decision.
- **Example:** Agents voting on the best solution to a problem.



## 14. [Memory-Augmented Agent Pattern](./Memory-Augmented Agent Pattern/README.md)

- **Description:** Agents use persistent memory or knowledge bases to inform decisions across sessions.
- **Example:** An agent that remembers user preferences or past conversations.



## 15. [Secure Agent Communication Pattern](./Secure Agent Communication Pattern/README.md)

- **Description:** Agents communicate using secure protocols, ensuring privacy, integrity, and authenticity of messages. Includes encryption, authentication, and integrity checks for sensitive or adversarial environments.
- **Example:** Agents exchanging encrypted messages using secure protocols.



## 16. [Distributed Agent Pattern](./Distributed Agent Pattern/README.md)

- **Description:** Multiple agents operate across different locations or systems, collaborating to achieve shared or individual goals. They communicate, coordinate, and partition tasks for scalable, robust, and fault-tolerant systems.
- **Example:** Multi-agent systems in cloud or edge computing.



## 17. [Environment-Interactive Agent Pattern](./Environment-Interactive Agent Pattern/README.md)

- **Description:** Agents actively perceive, interact with, and adapt to their environment, learning from feedback and outcomes of their actions. Foundational for dynamic, real-world, or simulated environments.
- **Example:** Robotics and autonomous systems.



## 18. [Goal-Conditioned Agent Pattern](./Goal-Conditioned Agent Pattern/README.md)

- **Description:** Agents operate with explicit goals or objectives, planning and adapting actions to achieve them. Enables flexible, adaptive, and user-driven interactions.
- **Example:** Task completion agents (e.g., "Book a flight to Paris").



## 19. [Hierarchical Agent Pattern](./Hierarchical Agent Pattern/README.md)

- **Description:** Agents are organized in a hierarchy, with higher-level agents delegating tasks to sub-agents. Useful for decomposing complex problems into manageable sub-tasks.
- **Example:** Project management agents (manager/subordinate roles).



## 20. [Hybrid Agent Pattern](./Hybrid Agent Pattern/README.md)

- **Description:** Combines multiple agentic patterns or reasoning approaches (e.g., symbolic, ML, rule-based) within a single agent or system for greater flexibility and robustness.
- **Example:** Agents that use both rules and LLMs for decision making.



## 21. [Meta-Cognitive Agent Pattern](./Meta-Cognitive Agent Pattern/README.md)

- **Description:** Agents reason about their own reasoning, monitor confidence, and adapt strategies dynamically. Enables self-awareness, transparency, and improved robustness.
- **Example:** Agents that explain their reasoning and confidence.



## 22. [Planning Agent Pattern](./Planning Agent Pattern/README.md)

- **Description:** Agents generate, evaluate, and execute multi-step plans to achieve complex goals, adapting plans based on feedback or changing circumstances.
- **Example:** Automated workflow execution.



---


**References:**

- MCP (Model Context Protocol)
- Agent Communication Protocols (A2A)
- Autogen
- LangGraph


This list can be expanded with examples and code for each pattern as needed.
