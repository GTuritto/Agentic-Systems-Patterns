import os
import requests
from jsonschema import validate

MAN_BASE = os.environ.get("MCP_BASE", "http://localhost:8787")

man = requests.get(f"{MAN_BASE}/manifest").json()
print("Manifest tools:", [t["name"] for t in man["tools"]])

for t in man["tools"]:
    schema = t["input_schema"]
    if t["name"] == "math.add":
        payload = {"a": 2, "b": 5}
        validate(payload, schema)
        out = requests.post(f"{MAN_BASE}{t['endpoint']}", json={"tool": t["name"], "input": payload}).json()
        print("math.add ->", out)
    if t["name"] == "web.search":
        payload = {"query": "agentic systems"}
        validate(payload, schema)
        out = requests.post(f"{MAN_BASE}{t['endpoint']}", json={"tool": t["name"], "input": payload}).json()
        print("web.search ->", out)
