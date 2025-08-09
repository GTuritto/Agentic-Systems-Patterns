import os
import json
import requests

MISTRAL_API = 'https://api.mistral.ai/v1/chat/completions'

def plan_task(goal: str, api_key: str | None = None):
    if not api_key:
        return {
            "goal": goal,
            "steps": [
                {"id": "s1", "description": "Load numbers [1,2,3,4]"},
                {"id": "s2", "description": "Compute average of s1"}
            ]
        }
    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {
        "model": "mistral-small-latest",
        "messages": [
            {"role": "system", "content": "You are a planner. Output JSON {steps:[{id,description}], rationale}"},
            {"role": "user", "content": goal}
        ],
        "temperature": 0
    }
    r = requests.post(MISTRAL_API, json=payload, headers=headers, timeout=10)
    r.raise_for_status()
    content = r.json().get("choices", [{}])[0].get("message", {}).get("content", "{}")
    try:
        return json.loads(content)
    except Exception:
        return {"goal": goal, "steps": []}
