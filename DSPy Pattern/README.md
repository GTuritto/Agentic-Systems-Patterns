# DSPy Pattern

## Description
DSPy is a framework for building modular, composable pipelines for LLMs and agentic systems. It enables the design of complex workflows by chaining together reusable modules, supporting both prompt engineering and advanced context management.

## Key Concepts
- **Modules:** Encapsulate LLM calls, tools, or logic as reusable components.
- **Pipelines:** Compose modules into end-to-end workflows.
- **Optimization:** DSPy supports prompt and pipeline optimization for better performance.

## Example Use Cases
- Tool-using agents with modular skills
- Multi-step reasoning and decision-making
- Automated prompt optimization

## References
- [DSPy GitHub](https://github.com/stanfordnlp/dspy)
- [DSPy Paper](https://arxiv.org/abs/2402.19149)

## How to run

This repo's DSPy example uses Mistral via raw HTTP (no vendor SDKs).

1) Create and activate a virtual environment, then install deps:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r "DSPy Pattern/langgraph_python_example/requirements.txt"
```

2) Export your Mistral API key and run the example:

```bash
export MISTRAL_API_KEY=your_key_here
python "DSPy Pattern/langgraph_python_example/dspy_minimal_pipeline.py"
```

Notes:
- Model: mistral-large-latest
- HTTP endpoint: https://api.mistral.ai/v1/chat/completions
- Library usage: requests for HTTP; dspy-ai for the pipeline abstraction
