# Prompt Engineering Pattern

## Description
Prompt engineering designs the instructions, examples, and context an LLM receives. For agents, prompts define goals, constraints, available tools, output formats, and recovery behavior.

## Why Good Prompting Matters
- Reduces ambiguity and errors
- Improves output quality and consistency
- Enables complex behaviors (e.g., tool use, reasoning)

## Best Practices
- Use clear instructions and context
- Provide examples (few-shot prompting)
- Test and iterate on prompts
- Use prompt templates for reusability

## Example
**Bad Prompt:**
> Summarize this.

**Good Prompt:**
> Summarize the following article in 3 bullet points, focusing on key findings and recommendations:

## References
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

## How to run (TypeScript)

This example calls Mistral via HTTP using axios (no vendor SDKs). Node is configured for ESM.

1. Install dependencies:

```bash
npm install
```

2. Export your Mistral key and run with `ts-node` in ESM mode:

```bash
export MISTRAL_API_KEY=your_key_here
npx ts-node --esm prompt-engineering-pattern/autogen_typescript_example/prompt_examples.ts
```

Notes:
- Ensure axios, dotenv, ts-node, and typescript are installed (package.json is included at repo root).
- Endpoint: https://api.mistral.ai/v1/chat/completions
- Set MISTRAL_API_KEY in your environment before running.
