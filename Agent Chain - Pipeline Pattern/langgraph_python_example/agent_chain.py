# Agent Chain / Pipeline Pattern - LangGraph Python Example

This example demonstrates the Agent Chain / Pipeline Pattern using LangGraph and Python. Three agents (Extractor, Summarizer, Translator) process input sequentially. The LLM is Mistral.

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
        return input("Input: ")
    def send_action(self, action):
        print(action)

class Extractor(Agent):
    def __init__(self, llm):
        self.llm = llm
    def act(self, input_text):
        prompt = f"You are Alice, an Extractor. Extract the key information from: {input_text}"
        return self.llm.complete(prompt)

class Summarizer(Agent):
    def __init__(self, llm):
        self.llm = llm
    def act(self, extracted):
        prompt = f"You are Bob, a Summarizer. Summarize this: {extracted}"
        return self.llm.complete(prompt)

class Translator(Agent):
    def __init__(self, llm):
        self.llm = llm
    def act(self, summary):
        prompt = f"You are Carol, a Translator. Translate this to French: {summary}"
        return self.llm.complete(prompt)

llm = LLM(
    provider="mistral",
    api_key=MISTRAL_API_KEY,
    api_url=MISTRAL_API_URL,
)

env = SimpleEnvironment()
extractor = Extractor(llm)
summarizer = Summarizer(llm)
translator = Translator(llm)

input_text = env.get_observation()
extracted = extractor.act(input_text)
print("Alice (Extractor):", extracted)
summarized = summarizer.act(extracted)
print("Bob (Summarizer):", summarized)
translated = translator.act(summarized)
print("Carol (Translator):", translated)
```

---

- Try a paragraph or document to see the pipeline in action.
- Make sure your `.env` file contains your Mistral API key.
