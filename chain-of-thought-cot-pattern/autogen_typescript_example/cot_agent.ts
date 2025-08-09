// Chain-of-Thought (CoT) Pattern - Autogen TypeScript Example
// To run: npm install && npm run cot-agent

import axios from 'axios';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
dotenv.config();

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

function buildCoTPrompt(userInput: string): string {
  return `Let's solve this step by step. ${userInput}\nExplain your reasoning at each step, then give the final answer.`;
}

async function cotAgent(userInput: string): Promise<string> {
  const prompt = buildCoTPrompt(userInput);
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Problem: ', async (userInput: string) => {
  try {
    const agentResponse = await cotAgent(userInput);
    console.log('Agent reasoning:\n', agentResponse);
  } catch (err) {
    console.error('Error:', err);
  }
  rl.close();
});
