
"""
Minimal DSPy pipeline example using Mistral LLM via raw HTTP (requests).
Requirements: pip install dspy-ai requests
"""
import os
import requests
import dspy

MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
if not MISTRAL_API_KEY:
    raise RuntimeError("Set MISTRAL_API_KEY in your environment.")

class MistralHTTP(dspy.LLM):
    def __call__(self, prompt: str, **kwargs) -> str:
        resp = requests.post(
            MISTRAL_API_URL,
            headers={
                "Authorization": f"Bearer {MISTRAL_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "mistral-large-latest",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2,
            },
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()
        return (data.get("choices") or [{}])[0].get("message", {}).get("content", "")

# Register Mistral HTTP client as the LLM backend
dspy.settings.configure(llm=MistralHTTP())

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
