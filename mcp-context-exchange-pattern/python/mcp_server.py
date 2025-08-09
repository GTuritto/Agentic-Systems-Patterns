from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Any, Dict

app = FastAPI()

class ToolManifest(BaseModel):
    name: str
    description: str
    input_schema: Dict[str, Any]
    endpoint: str
    method: str

class ContextEntry(BaseModel):
    key: str
    value: str

TOOLS = [
    ToolManifest(
        name="math.add",
        description="Safely add two numbers",
        input_schema={
            "type": "object",
            "required": ["a", "b"],
            "properties": {"a": {"type": "number"}, "b": {"type": "number"}},
            "additionalProperties": False,
        },
        endpoint="/invoke",
        method="POST",
    ),
    ToolManifest(
        name="web.search",
        description="Return mock search results for a query (no external IO).",
        input_schema={
            "type": "object",
            "required": ["query"],
            "properties": {"query": {"type": "string", "minLength": 1}},
            "additionalProperties": False,
        },
        endpoint="/invoke",
        method="POST",
    ),
]

CONTEXT = [
    {"key": "llm.provider", "value": "mistral"},
    {"key": "embeddings", "value": "sentence-transformers/all-MiniLM-L6-v2"},
]

@app.get("/manifest")
def manifest():
    return {"tools": [t.dict() for t in TOOLS], "context": CONTEXT}

class InvokePayload(BaseModel):
    tool: str
    input: Dict[str, Any]

@app.post("/invoke")
def invoke(payload: InvokePayload):
    tool = next((t for t in TOOLS if t.name == payload.tool), None)
    if not tool:
        raise HTTPException(status_code=400, detail="unknown_tool")
    if tool.name == "math.add":
        a = payload.input.get("a")
        b = payload.input.get("b")
        if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
            raise HTTPException(status_code=400, detail="invalid_input")
        return {"ok": True, "tool": tool.name, "output": {"sum": a + b}}
    if tool.name == "web.search":
        q = payload.input.get("query")
        if not isinstance(q, str) or not q:
            raise HTTPException(status_code=400, detail="invalid_input")
        results = [
            {"title": f"Result for {q} #1", "url": "https://example.com/1", "snippet": "Sample snippet 1"},
            {"title": f"Result for {q} #2", "url": "https://example.com/2", "snippet": "Sample snippet 2"},
        ]
        return {"ok": True, "tool": tool.name, "output": {"results": results}}
    raise HTTPException(status_code=400, detail="not_implemented")
