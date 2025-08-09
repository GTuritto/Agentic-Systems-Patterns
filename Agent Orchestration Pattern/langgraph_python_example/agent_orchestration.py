# Agent Orchestration Pattern - LangGraph Python Example

This example demonstrates the Agent Orchestration Pattern using LangGraph and Python. An orchestrator coordinates three agents (Researcher, Analyst, Presenter) to solve a task. The LLM is Mistral.

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

class Researcher(Agent):
    def __init__(self, llm):
        self.llm = llm
    def act(self, task):
        prompt = f"You are Alice, a Researcher. Find background info about: {task}"
        return self.llm.complete(prompt)

class Analyst(Agent):
    def __init__(self, llm):
        self.llm = llm
    def act(self, info):
        prompt = f"You are Bob, an Analyst. Analyze the following info: {info}"
        return self.llm.complete(prompt)

class Presenter(Agent):
    def __init__(self, llm):
        self.llm = llm
    def act(self, analysis):
        prompt = f"You are Carol, a Presenter. Summarize and present the findings: {analysis}"
        return self.llm.complete(prompt)

llm = LLM(
    provider="mistral",
    api_key=MISTRAL_API_KEY,
    api_url=MISTRAL_API_URL,
)

env = SimpleEnvironment()
researcher = Researcher(llm)
analyst = Analyst(llm)
presenter = Presenter(llm)

task = env.get_observation()
research = researcher.act(task)
print("Alice (Researcher):", research)
analysis = analyst.act(research)
print("Bob (Analyst):", analysis)
presentation = presenter.act(analysis)
print("Carol (Presenter):", presentation)
```

---

- Try a research or analysis task to see orchestration in action.
- Make sure your `.env` file contains your Mistral API key.
