# Agent Swarm Pattern - LangGraph Python Example

This example demonstrates the Agent Swarm Pattern using LangGraph and Python. Three simple agents work in parallel on the same task and return their findings. The LLM is Mistral.

## Requirements

- Python 3.8+
- `langgraph` library
- `python-dotenv` (for .env support)
- Mistral LLM API access

## Install dependencies

```bash
pip install langgraph python-dotenv requests
```

## Example Code

```python
import os
from langgraph import Agent, Environment, LLM
from dotenv import load_dotenv

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

class SimpleEnvironment(Environment):
    def get_observation(self):
        return input("Task: ")
    def send_action(self, action):
        print(action)

class SwarmAgent(Agent):
    def __init__(self, llm, name):
        self.llm = llm
        self.name = name
    def act(self, task):
        prompt = f"You are {self.name}, a simple agent. Here is your task: {task}"
        return self.llm.complete(prompt)

llm = LLM(
    provider="mistral",
    api_key=MISTRAL_API_KEY,
    api_url=MISTRAL_API_URL,
)

env = SimpleEnvironment()
agent_names = ["Agent 1", "Agent 2", "Agent 3"]
agents = [SwarmAgent(llm, name) for name in agent_names]

task = env.get_observation()
results = [agent.act(task) for agent in agents]
for name, result in zip(agent_names, results):
    print(f"{name}: {result}")
```

---

- Try a search or brainstorming task to see parallel agent outputs.
- Make sure your `.env` file contains your Mistral API key.
