---
title: Memory-Augmented Agent
---

# Memory-Augmented Agent

Memory-augmented agents store and retrieve information across turns or sessions.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/memory-augmented-agent-pattern)
> - [Download code bundle](/downloads/memory-augmented-agent.zip)

## Intent

Memory-augmented agents store and retrieve information across turns or sessions.

## Use When

- The agent needs continuity beyond one interaction.
- Stored facts can be scoped, updated, and deleted.
- Retrieval results can be cited or inspected.

## Avoid When

- The system would store sensitive data without consent or retention rules.
- Retrieved memories cannot be distinguished from current instructions.
- The memory store is used as an uncurated transcript dump.

## System Shape

- **Pattern boundary:** a retrieval or memory boundary decides what information enters context and what new information can be stored.
- **State owner:** the memory or retrieval layer owns long-lived knowledge, while the agent owns task-local working state.
- **Primary artifact:** `memory-augmented-agent-pattern/` contains the runnable reference implementation and examples.
- **Operational promise:** Memory-augmented agents store and retrieve information across turns or sessions.
- **Runnable path:** start with `npm run memory-augmented-agent` before adapting the pattern to a larger system.

## Core Protocol

1. Classify the information need: working state, episodic memory, semantic knowledge, policy, or source evidence.
2. Retrieve only scoped, relevant, and permitted material.
3. Inject retrieved material with source labels, freshness, and trust level.
4. Generate or act while keeping retrieved evidence separate from instructions.
5. Write back memory only after validation, consent, retention, and correction rules pass.

## Implementation Notes

- Keep the pattern boundary explicit: inputs, state, side effects, and outputs should be visible.
- Validate model-produced decisions before they affect tools, users, or durable state.
- Emit enough trace data to debug failures after the run.

## Failure Modes

- The pattern is applied where a simpler deterministic workflow would be better.
- State, tool calls, or model decisions are not observable enough to debug.
- The system lacks clear stop, retry, or escalation behavior.

## Evaluation Strategy

- Use questions with known source answers, stale sources, conflicting sources, and missing evidence.
- Measure recall, precision, citation faithfulness, freshness, and refusal when evidence is absent.
- Test deletion, correction, and privacy boundaries separately from answer quality.
- Include cases that prove each "Use When" condition is true for this pattern.
- Include negative cases from "Avoid When" so the system chooses a simpler or safer pattern when appropriate.

## Production Checklist

- Define retention, deletion, correction, and consent rules.
- Separate instructions from retrieved facts and user memories.
- Record source IDs and retrieval scores for audit and debugging.
- Add guards against prompt injection from retrieved documents.
- Define human escalation for ambiguous, high-risk, or policy-blocked work.
- Keep the source bundle, generated chapter, tests, and deployment artifact in the same release.

## Run the Example

```sh
npm run memory-augmented-agent
```

## Code Walkthrough

Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.

## Source Code

These excerpts show the implementation shape. The complete code is available in the download bundle and repository source.

### `memory-augmented-agent-pattern/autogen_typescript_example/memory_agent.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/memory-augmented-agent-pattern/autogen_typescript_example/memory_agent.ts)

```ts
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import readline from 'readline';
import fs from 'fs';

type MemoryMessage = { role: string; content: string };

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MEMORY_FILE = './memory-augmented-agent-pattern/autogen_typescript_example/memory.json';

if (!MISTRAL_API_KEY) {
  console.error('Please set MISTRAL_API_KEY in your .env file');
  process.exit(1);
}

function loadMemory(): MemoryMessage[] {
  if (fs.existsSync(MEMORY_FILE)) {
  return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8')) as MemoryMessage[];
  }
  return [];
}

function saveMemory(memory: MemoryMessage[]) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

async function askMistral(messages: any[]) {
  const response = await axios.post(
    MISTRAL_API_URL,
    {
      model: 'mistral-tiny',
      messages,
    },
    {
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content.trim();
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let memory: MemoryMessage[] = loadMemory();

  rl.question('Ask the agent a question: ', async (userInput) => {
    // Retrieve relevant memory (for demo, just concatenate all previous user/assistant messages)
  let context = memory.map((m: MemoryMessage) => `${m.role}: ${m.content}`).join('\n');
    let messages = [
      { role: 'system', content: 'You are a helpful assistant with memory. Use the following context from previous interactions if relevant:\n' + context },
      { role: 'user', content: userInput },
    ];

    let answer = await askMistral(messages);
    console.log('\nAgent Answer (with memory):\n', answer);

    // Update memory
  memory.push({ role: 'user', content: userInput });
  memory.push({ role: 'assistant', content: answer });
    saveMemory(memory);

    rl.close();
  });
}

main();
```

### `memory-augmented-agent-pattern/langgraph_python_example/memory_agent.py`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/memory-augmented-agent-pattern/langgraph_python_example/memory_agent.py)

```py
import os
import json
import requests

MEMORY_FILE = os.path.join(os.path.dirname(__file__), 'memory.json')

def load_memory():
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, 'r') as f:
            return json.load(f)
    return []

def save_memory(memory):
    with open(MEMORY_FILE, 'w') as f:
        json.dump(memory, f, indent=2)

def ask_mistral(messages):
    api_key = os.getenv('MISTRAL_API_KEY')
    if not api_key:
        raise ValueError('Please set MISTRAL_API_KEY in your .env file')
    url = 'https://api.mistral.ai/v1/chat/completions'
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    data = {
        'model': 'mistral-tiny',
        'messages': messages,
    }
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()['choices'][0]['message']['content'].strip()

def main():
    memory = load_memory()
    user_input = input('Ask the agent a question: ')
    # Retrieve relevant memory (for demo, just concatenate all previous user/assistant messages)
    context = '\n'.join([f"{m['role']}: {m['content']}" for m in memory])
    messages = [
        {'role': 'system', 'content': 'You are a helpful assistant with memory. Use the following context from previous interactions if relevant:\n' + context},
        {'role': 'user', 'content': user_input},
    ]
    answer = ask_mistral(messages)
    print('\nAgent Answer (with memory):\n', answer)
    # Update memory
    memory.append({'role': 'user', 'content': user_input})
    memory.append({'role': 'assistant', 'content': answer})
    save_memory(memory)

if __name__ == '__main__':
    main()
```

## Download

- [Download source bundle](/downloads/memory-augmented-agent.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/memory-augmented-agent-pattern)

The download bundle contains the current `memory-augmented-agent-pattern/` folder from this repository.

## Related Patterns

- [Long-Term Episodic Memory](/memory-knowledge/long-term-episodic-memory)
- [Semantic Recall and RAG](/memory-knowledge/semantic-recall-rag)
- [Working Memory](/memory-knowledge/working-memory)
- [Choosing the Right Pattern](/pattern-selection/choosing-the-right-pattern)
- [Resource-Aware Agent Design](/pattern-selection/resource-aware-agent-design)
