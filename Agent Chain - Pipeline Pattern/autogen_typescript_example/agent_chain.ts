// Agent Chain / Pipeline Pattern - Autogen TypeScript Example
// To run: npm install && npm run agent-chain

import axios from 'axios';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
dotenv.config();

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

async function agent(name: string, role: string, input: string): Promise<string> {
  const prompt = `You are ${name}, your role is: ${role}. Here is your input: ${input}`;
  const response = await axios.post(
    MISTRAL_API_URL,
    {
      model: 'mistral-tiny',
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content;
}

async function agentChain(task: string) {
  // Agent 1: Extractor
  const extracted = await agent('Alice', 'Extractor', task);
  console.log('Alice (Extractor):', extracted);

  // Agent 2: Summarizer
  const summarized = await agent('Bob', 'Summarizer', extracted);
  console.log('Bob (Summarizer):', summarized);

  // Agent 3: Translator
  const translated = await agent('Carol', 'Translator (to French)', summarized);
  console.log('Carol (Translator):', translated);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Input: ', async (userInput: string) => {
  try {
    await agentChain(userInput);
  } catch (err) {
    console.error('Error:', err);
  }
  rl.close();
});
