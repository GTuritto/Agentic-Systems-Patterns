# Chain-of-Thought (CoT) Pattern - LangGraph Python Example

This example demonstrates the Chain-of-Thought Pattern using LangGraph and Python. The agent receives a problem, prompts the LLM to reason step by step, and returns the reasoning and answer.

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
        return input("Problem: ")
    def send_action(self, action):
        print(f"Agent reasoning:\n{action}")

class CoTAgent(Agent):
    def __init__(self, llm):
        self.llm = llm
    def act(self, observation):
        prompt = f"Let's solve this step by step. {observation}\nExplain your reasoning at each step, then give the final answer."
        return self.llm.complete(prompt)

llm = LLM(
    provider="mistral",
    api_key=MISTRAL_API_KEY,
    api_url=MISTRAL_API_URL,
)

env = SimpleEnvironment()
agent = CoTAgent(llm)

observation = env.get_observation()
action = agent.act(observation)
env.send_action(action)
```

---

- Try a math or logic problem to see step-by-step reasoning.
- Make sure your `.env` file contains your Mistral API key.
