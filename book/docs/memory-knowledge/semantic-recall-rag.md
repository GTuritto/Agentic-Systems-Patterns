---
title: Semantic Recall and RAG
---

# Semantic Recall and RAG

Semantic recall retrieves relevant material by meaning rather than exact keywords. RAG injects retrieved material into context before generation.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/context-engineering-pattern)
> - [Download code bundle](/downloads/semantic-recall-rag.zip)

## Intent

Semantic recall retrieves relevant material by meaning rather than exact keywords. RAG injects retrieved material into context before generation.

## Use When

- The agent must answer from a changing or large knowledge base.
- Relevant documents can be chunked, embedded, filtered, and cited.
- The retrieval layer can enforce source trust and freshness.

## Avoid When

- The answer should come from model knowledge only.
- The corpus is too noisy to retrieve safely.
- The system cannot cite or inspect retrieved context.

## Implementation Notes

- Keep the pattern boundary explicit: inputs, state, side effects, and outputs should be visible.
- Validate model-produced decisions before they affect tools, users, or durable state.
- Emit enough trace data to debug failures after the run.

## Failure Modes

- The pattern is applied where a simpler deterministic workflow would be better.
- State, tool calls, or model decisions are not observable enough to debug.
- The system lacks clear stop, retry, or escalation behavior.

## Code Walkthrough

Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.

## Source Code

These excerpts show the implementation shape. The complete code is available in the download bundle and repository source.

### `context-engineering-pattern/langgraph_python_example/rag_example.py`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/context-engineering-pattern/langgraph_python_example/rag_example.py)

```py
"""
Context Engineering Example: Retrieval-Augmented Generation (RAG) with Mistral
Requirements: pip install langchain-community sentence-transformers faiss-cpu requests
Note: This is a minimal example using HuggingFace embeddings by default.
"""
import os
import requests
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from typing import List

# Optionally load environment variables from a local .env if present
try:
    from dotenv import load_dotenv, find_dotenv  # type: ignore
    load_dotenv(find_dotenv(usecwd=True), override=True)
except Exception:
    pass

# Dummy documents
docs = [
    {"content": "Agentic systems are autonomous AI systems."},
    {"content": "Prompt engineering improves LLM outputs."}
]

# Build vector store (in-memory for demo)
texts = [d["content"] for d in docs]
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
try:
    # Try FAISS first (fast vector index)
    vectorstore = FAISS.from_texts(texts, embeddings)
    retriever = vectorstore.as_retriever()

    def retrieve(query: str, k: int = 3):
        return retriever.get_relevant_documents(query)
except Exception:
    # Fallback: simple numpy-based cosine similarity without FAISS
    try:
        import numpy as np  # sentence-transformers depends on numpy, so this should be available
    except Exception as e:  # pragma: no cover
        raise RuntimeError("numpy is required for the FAISS-free fallback but wasn't found") from e

    doc_vecs = np.array(embeddings.embed_documents(texts), dtype=float)
    doc_norms = np.linalg.norm(doc_vecs, axis=1, keepdims=True) + 1e-12
    doc_vecs = doc_vecs / doc_norms

    class _MiniDoc:
        def __init__(self, text: str):
            self.page_content = text

    def retrieve(query: str, k: int = 3):
        q = np.array(embeddings.embed_query(query), dtype=float)
        q = q / (np.linalg.norm(q) + 1e-12)
        sims = (doc_vecs @ q)
        top_idx = np.argsort(-sims)[:k]
        return [_MiniDoc(texts[i]) for i in top_idx]
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
if not MISTRAL_API_KEY:
    raise RuntimeError("Set MISTRAL_API_KEY in your environment.")

def chat_mistral(messages):
    resp = requests.post(
        "https://api.mistral.ai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {MISTRAL_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "mistral-large-latest",
            "messages": messages,
            "temperature": 0.2,
        },
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    return (data.get("choices") or [{}])[0].get("message", {}).get("content", "")

if __name__ == "__main__":
    query = "What are agentic systems?"
    retrieved = retrieve(query)
    context = "\n\n".join(d.page_content for d in retrieved)
    answer = chat_mistral([
        {"role": "system", "content": "Use the provided context to answer the question succinctly."},
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"},
    ])
    print("Answer:", answer)
```

## Download

- [Download source bundle](/downloads/semantic-recall-rag.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/context-engineering-pattern)

The download bundle contains the current `context-engineering-pattern/` folder from this repository.
