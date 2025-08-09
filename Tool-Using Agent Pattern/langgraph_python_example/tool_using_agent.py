# Tool-Using Agent Pattern - LangGraph Python Example

This example demonstrates the Tool-Using Agent Pattern using LangGraph and Python. The agent receives a user message, determines if a tool (calculator) is needed, calls the tool if required, and returns a response. The LLM is Mistral.

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

class CalculatorTool(Tool):
    def call(self, input_str):
        try:
            return str(eval(input_str))
        except Exception as e:
            return f"Error: {e}"

class SimpleEnvironment(Environment):
    def get_observation(self):
        return input("User: ")
    def send_action(self, action):
        print(f"Agent: {action}")

class ToolUsingAgent(Agent):
    def __init__(self, llm, tools):
        self.llm = llm
        self.tools = {tool.name: tool for tool in tools}
    def act(self, observation):
        if observation.lower().startswith("calculate "):
            expr = observation[len("calculate "):]
            return self.tools["calculator"].call(expr)
        else:
            return self.llm.complete(observation)

llm = LLM(
    provider="mistral",
    api_key=MISTRAL_API_KEY,
    api_url=MISTRAL_API_URL,
)

calc_tool = CalculatorTool(name="calculator")
env = SimpleEnvironment()
agent = ToolUsingAgent(llm, [calc_tool])

observation = env.get_observation()
action = agent.act(observation)
env.send_action(action)
```

---

- Type `calculate 2+2` to see the agent use the calculator tool.
- Replace credentials as needed.
