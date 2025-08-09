# Context Engineering Pattern

## Description
Context engineering is the art of structuring, managing, and injecting relevant information into LLMs and agentic systems. It is crucial for maximizing the effectiveness of agents, especially in complex or multi-turn scenarios.

## Why Context Engineering is Important
- Ensures the model has access to all necessary information
- Reduces hallucinations and irrelevant outputs
- Enables memory, retrieval, and dynamic adaptation

## Techniques
- Context windows and chunking
- Retrieval-augmented generation (RAG)
- Memory modules and state management
- Dynamic context injection

## Example
- Using a retrieval system to provide relevant documents to an agent before answering a question.

## References
- [RAG Paper](https://arxiv.org/abs/2005.11401)
- [LangChain Context Management](https://python.langchain.com/docs/modules/context)

## How to run (Python RAG)

This example uses Hugging Face embeddings (all-MiniLM-L6-v2), FAISS, and requests → Mistral chat completions.

1) Create a virtual environment and install deps:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r "Context Engineering Pattern/langgraph_python_example/requirements.txt"
```

2) Export your Mistral key and run the example:

```bash
export MISTRAL_API_KEY=your_key_here
python "Context Engineering Pattern/langgraph_python_example/rag_example.py"
```

Notes:
- First run will download the sentence-transformers model; allow time and network access.
- Endpoint: https://api.mistral.ai/v1/chat/completions
- No OpenAI or vendor SDKs are used.
