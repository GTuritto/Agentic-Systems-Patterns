import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import readline from 'readline';
import fs from 'fs';

type MemoryMessage = { role: string; content: string };

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MEMORY_FILE = './Memory-Augmented Agent Pattern/autogen_typescript_example/memory.json';

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
