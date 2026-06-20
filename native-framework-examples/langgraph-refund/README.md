# Native LangGraph Refund Example

This example maps the Support Refund Agent capstone into a real LangGraph `StateGraph`. It is the native counterpart to the deterministic Lab 12 state graph.

It demonstrates:

- graph state;
- nodes and edges;
- in-memory checkpointing;
- interrupt-driven human approval;
- resume with a thread ID;
- deterministic eval checks over state and trace fields.

## Setup

Official references:

- [LangGraph install](https://docs.langchain.com/oss/python/langgraph/install)
- [LangGraph graph API](https://docs.langchain.com/oss/python/langgraph/graph-api)
- [LangGraph interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)
- [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence)

```sh
cd native-framework-examples/langgraph-refund
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```sh
python refund_graph.py
```

Expected behavior:

1. the first invocation pauses at the approval interrupt;
2. the resumed invocation approves the draft;
3. the final eval passes without issuing money.

## Production Notes

Replace `InMemorySaver` with durable checkpoint storage before production. Keep side effects idempotent because LangGraph can re-run a node after an interrupt or retry.

Do not let the graph hide product policy. The framework should host the state transitions, checkpoint, and interrupt; the application should still own refund authority, tenant policy, trace retention, and release evals.
