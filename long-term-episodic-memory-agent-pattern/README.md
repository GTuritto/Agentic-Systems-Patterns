# Long-Term Episodic Memory Agent Pattern

Description: Maintains a timeline of episodic memories in a vector DB; retrieves relevant events for reasoning.

Value: Persistent personalized assistants with long-term recall.

## Deliverables

- Vector DB integration (Chroma or Weaviate)
- Memory storage and retrieval functions
- TS + Python examples with HuggingFace embeddings

## Notes

- Prefer `langchain-community` + FAISS for local dev; allow swapping to Chroma/Weaviate.
- Use sentence-transformers `all-MiniLM-L6-v2` for embeddings.
- Ensure .env-driven config and Mistral HTTP-only usage.
