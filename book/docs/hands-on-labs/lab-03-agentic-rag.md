---
title: Lab 03 - Build Agentic RAG
---

# Lab 03 - Build Agentic RAG

## Objective

Build the retrieval boundary behind an Agentic RAG system: retrieve scoped evidence, inject it into context, answer from that evidence, and refuse or escalate when the evidence is not enough.

## What You Will Use

- Language: Python
- Framework/runtime: LangChain/LangGraph-style retrieval stack with FAISS and Hugging Face embeddings
- Framework-agnostic lesson: retrieval produces scoped evidence; generation should stay grounded in that evidence.
- Pattern chapters: [Semantic Recall and RAG](/memory-knowledge/semantic-recall-rag), [Agentic RAG Systems](/systems-architecture/agentic-rag-systems)
- Source folder: [`context-engineering-pattern/`](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/context-engineering-pattern)
- Download: [semantic-recall-rag.zip](/downloads/semantic-recall-rag.zip)
- Main file: `context-engineering-pattern/langgraph_python_example/rag_example.py`

## Setup

The RAG example is Python-based and calls Mistral for answer generation. From the repository root:

```sh
python3 -m venv .venv-rag
source .venv-rag/bin/activate
pip install -r context-engineering-pattern/langgraph_python_example/requirements.txt
export MISTRAL_API_KEY="<your key>"
```

## Run It

```sh
python3 context-engineering-pattern/langgraph_python_example/rag_example.py
```

## Inspect The Code

Open `context-engineering-pattern/langgraph_python_example/rag_example.py` and find:

- `docs`: the tiny demo corpus.
- `HuggingFaceEmbeddings`: the embedding model.
- `FAISS.from_texts`: the vector index.
- `retrieve(query)`: the retrieval boundary.
- `chat_mistral(messages)`: the generation boundary.

The key design move is to keep retrieved evidence separate from the instruction. The model should answer from the context, not from vague memory.

## Change One Thing

Add a new document to the `docs` list:

```py
{"content": "Agentic RAG uses retrieval, planning, tool use, and verification around a knowledge base."}
```

Then change the query:

```py
query = "What makes RAG agentic?"
```

## Expected Result

The answer should reflect the new document. If the answer does not cite or use retrieved evidence, the retrieval boundary is not doing enough work.

## Production Extension

Add production controls:

- document IDs
- source URLs
- freshness timestamps
- access-control filters
- citation requirements
- prompt-injection checks on retrieved text
- refusal when evidence is missing

Agentic RAG is not only vector search. It is a controlled loop around retrieval, evidence, tool use, and verification.

## Cross-Framework Mapping

- In LangGraph, retrieval can be a graph node that updates state with evidence before generation.
- In LangChain, this maps to retrievers, document loaders, vector stores, and chains or runnables.
- In Mastra AI, retrieval becomes a knowledge or tool capability used by an agent or workflow.
- In CrewAI, a research role may retrieve evidence, but the flow still needs to validate grounding and citations.

## Related Chapters

- [Context Engineering](/foundations/context-engineering)
- [Knowledge-Bound Agents](/memory-knowledge/knowledge-bound-agents)
- [Working Memory](/memory-knowledge/working-memory)
