# Agent Marketplace Pattern - LangGraph Python Example

This example demonstrates the Agent Marketplace Pattern using LangGraph and Python. Agents with different skills and costs bid for a task, and the marketplace assigns the task to the best match. The LLM is Mistral.

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
        task = input("Task: ")
        skill = input("Required skill (translation/summarization/data analysis): ")
        return task, skill
    def send_action(self, action):
        print(action)

class MarketplaceAgent(Agent):
    def __init__(self, llm, name, skill, cost):
        self.llm = llm
        self.name = name
        self.skill = skill
        self.cost = cost
    def act(self, task):
        prompt = f"You are {self.name}, an expert in {self.skill}. Complete this task: {task}"
        return self.llm.complete(prompt)

llm = LLM(
    provider="mistral",
    api_key=MISTRAL_API_KEY,
    api_url=MISTRAL_API_URL,
)

agents = [
    MarketplaceAgent(llm, "Alice", "translation", 5),
    MarketplaceAgent(llm, "Bob", "summarization", 3),
    MarketplaceAgent(llm, "Carol", "data analysis", 4)
]

env = SimpleEnvironment()
task, required_skill = env.get_observation()
bidders = [a for a in agents if a.skill == required_skill]
if not bidders:
    env.send_action("No agent available for this skill.")
else:
    winner = min(bidders, key=lambda a: a.cost)
    env.send_action(f"Marketplace: Assigning task to {winner.name} (Skill: {winner.skill}, Cost: {winner.cost})")
    result = winner.act(task)
    env.send_action(f"{winner.name}: {result}")
```

---

- Try a task and required skill to see agent bidding and assignment.
- Make sure your `.env` file contains your Mistral API key.
