# Context Engineering Example: Retrieval-Augmented Generation (RAG) with Mistral
# Requires: pip install langchain-community langchain-mistralai mistralai faiss-cpu
import os
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_mistralai import ChatMistralAI
from langchain.chains import RetrievalQA

# Dummy documents
docs = [
    {"content": "Agentic systems are autonomous AI systems."},
    {"content": "Prompt engineering improves LLM outputs."}
]

# Build vector store (in-memory for demo)
texts = [d["content"] for d in docs]
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_texts(texts, embeddings)

# Set up retriever and QA chain with Mistral
retriever = vectorstore.as_retriever()
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
if not MISTRAL_API_KEY:
    raise RuntimeError("Set MISTRAL_API_KEY in your environment.")
llm = ChatMistralAI(api_key=MISTRAL_API_KEY, model="mistral-tiny")
qa = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)

if __name__ == "__main__":
    query = "What are agentic systems?"
    answer = qa.run(query)
    print("Answer:", answer)
