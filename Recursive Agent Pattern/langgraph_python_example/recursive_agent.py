# Recursive Agent Pattern - LangGraph Python Example

This example demonstrates the Recursive Agent Pattern using LangGraph and Python. An agent recursively decomposes a task and spawns new agents for subtasks. The LLM is Mistral.

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

class RecursiveAgent(Agent):
    def __init__(self, llm, depth=0):
        self.llm = llm
        self.depth = depth
    def act(self, task):
        if self.depth > 2:
            return f"Base case reached at depth {self.depth}. Task: {task}"
        prompt = f"You are a recursive agent at depth {self.depth}. Should this task be decomposed? If yes, list subtasks. If no, solve it. Task: {task}"
        output = self.llm.complete(prompt).strip()
        if 'subtask' in output.lower():
            subtasks = [s.strip() for s in output.split('subtask') if s.strip()]
            results = [RecursiveAgent(self.llm, self.depth + 1).act(st) for st in subtasks]
            return f"Results at depth {self.depth}:\n" + '\n'.join(results)
        else:
            return f"Solved at depth {self.depth}: {output}"

llm = LLM(
    provider="mistral",
    api_key=MISTRAL_API_KEY,
    api_url=MISTRAL_API_URL,
)

env = SimpleEnvironment()
agent = RecursiveAgent(llm)

task = env.get_observation()
result = agent.act(task)
env.send_action(result)
```

---

- Try a task that can be decomposed into subtasks to see recursion in action.
- Make sure your `.env` file contains your Mistral API key.
