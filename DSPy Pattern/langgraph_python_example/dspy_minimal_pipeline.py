
"""
Minimal DSPy pipeline example using Mistral LLM via raw HTTP (requests).
Requirements: pip install dspy-ai requests
"""
import os
import requests
import dspy

# Optionally load environment variables from a .env file if present
try:
    from dotenv import load_dotenv, find_dotenv
    load_dotenv(find_dotenv(usecwd=True), override=True)
except Exception:
    pass

MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
if not MISTRAL_API_KEY:
    raise RuntimeError("Set MISTRAL_API_KEY in your environment.")

class MistralHTTP(dspy.LM):
    def __init__(self, model: str = "mistral-large-latest", **kwargs):
        super().__init__(model=model)

    def __call__(self, prompt: str, **kwargs) -> str:
        resp = requests.post(
            MISTRAL_API_URL,
            headers={
                "Authorization": f"Bearer {MISTRAL_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": self.model,
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

# Define a simple DSPy module that uses the provided LM
class Summarizer(dspy.Module):
    def __init__(self, lm: MistralHTTP):
        super().__init__()
        self.lm = lm
    def forward(self, text: str):
        return self.lm("Summarize: " + text)

if __name__ == "__main__":
    lm = MistralHTTP()
    summarizer = Summarizer(lm)
    result = summarizer("Large language models are powerful tools for many tasks.")
    print("Summary:", result)
