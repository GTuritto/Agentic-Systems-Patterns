
# Minimal DSPy pipeline example using Mistral LLM
# Requires: pip install dspy-ai mistral-common mistralai
import dspy
from mistralai.client import MistralClient
import os

# Set up Mistral LLM for DSPy
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
if not MISTRAL_API_KEY:
    raise RuntimeError("Set MISTRAL_API_KEY in your environment.")

class MistralLLM(dspy.LLM):
    def __init__(self):
        self.client = MistralClient(api_key=MISTRAL_API_KEY)
    def __call__(self, prompt, **kwargs):
        response = self.client.chat(
            model="mistral-tiny",  # or another available model
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content

# Register Mistral as the LLM backend
dspy.settings.configure(llm=MistralLLM())

# Define a simple DSPy module
class Summarizer(dspy.Module):
    def forward(self, text):
        return self.llm("Summarize: " + text)

# Instantiate pipeline
pipeline = dspy.Pipeline([
    Summarizer()
])

if __name__ == "__main__":
    result = pipeline("Large language models are powerful tools for many tasks.")
    print("Summary:", result)
