# ReAct Pattern (Reason + Act) - LangGraph Python Example

This example demonstrates the ReAct Pattern using LangGraph and Python. The agent alternates between reasoning and acting (using a calculator tool), and iteratively solves the task. The LLM is Mistral.

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
from langgraph import Agent, Environment, LLM, Tool
from dotenv import load_dotenv

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

import sympy as _sp

def safe_calc(expr: str) -> str:
    try:
        return str(_sp.sympify(expr, evaluate=True))
    except Exception as e:
        return f"Error: {e}"

class CalculatorTool(Tool):
    def call(self, input_str):
        return safe_calc(input_str)

class SimpleEnvironment(Environment):
    def get_observation(self):
        return input("Task: ")
    def send_action(self, action):
        print(f"Agent: {action}")

class ReActAgent(Agent):
    def __init__(self, llm, tools):
        self.llm = llm
        self.tools = {tool.name: tool for tool in tools}
    def act(self, observation):
        context = observation
        while True:
            prompt = (
                "You are an agent. Think step by step about what to do next. "
                "If you need to use a tool, say TOOL: <expression>. "
                "If you are done, say FINAL: <answer>.\nContext: " + context
            )
            response = self.llm.complete(prompt)
            print(f"Agent: {response}")
            if response.startswith("TOOL:"):
                expr = response.replace("TOOL:", "").strip()
                tool_result = self.tools["calculator"].call(expr)
                context += f"\nTool result: {tool_result}"
            elif response.startswith("FINAL:"):
                return response.replace("FINAL:", "").strip()
            else:
                return response

llm = LLM(
    provider="mistral",
    api_key=MISTRAL_API_KEY,
    api_url=MISTRAL_API_URL,
)

calc_tool = CalculatorTool(name="calculator")
env = SimpleEnvironment()
agent = ReActAgent(llm, [calc_tool])

observation = env.get_observation()
action = agent.act(observation)
env.send_action(action)
```

---

- Try a multi-step math or logic task to see reasoning and tool use.
- Make sure your `.env` file contains your Mistral API key.
