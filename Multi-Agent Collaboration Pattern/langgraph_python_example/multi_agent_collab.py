# Multi-Agent Collaboration Pattern - LangGraph Python Example

This example demonstrates the Multi-Agent Collaboration Pattern using LangGraph and Python. Two agents (an Idea Generator and a Critic) collaborate to solve a task, exchanging messages and refining the solution. The LLM is Mistral.

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

class IdeaGenerator(Agent):
    def __init__(self, llm):
        self.llm = llm
    def act(self, observation):
        prompt = f"You are Alice, an Idea Generator. Here is your task: {observation}"
        return self.llm.complete(prompt)

class Critic(Agent):
    def __init__(self, llm):
        self.llm = llm
    def act(self, idea):
        prompt = f"You are Bob, a Critic. Here is an idea: {idea}\nPlease critique or improve it."
        return self.llm.complete(prompt)

llm = LLM(
    provider="mistral",
    api_key=MISTRAL_API_KEY,
    api_url=MISTRAL_API_URL,
)

env = SimpleEnvironment()
idea_agent = IdeaGenerator(llm)
critic_agent = Critic(llm)

task = env.get_observation()
idea = idea_agent.act(task)
print("Alice (Idea Generator):", idea)
critique = critic_agent.act(idea)
print("Bob (Critic):", critique)
final = idea_agent.act(f"Here is the critique: {critique}\nPlease finalize the solution.")
print("Alice (Finalized):", final)
```

---

- Try a creative or open-ended task to see agent collaboration.
- Make sure your `.env` file contains your Mistral API key.
