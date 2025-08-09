// Multi-Agent Collaboration Pattern - Autogen TypeScript Example
// To run: npm install && npm run multi-agent-collab

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

async function multiAgentCollab(task: string) {
  // Agent 1: Idea Generator
  const idea = await agent('Alice', 'Idea Generator', task);
  console.log('Alice (Idea Generator):', idea);

  // Agent 2: Critic
  const critique = await agent('Bob', 'Critic', `Here is an idea: ${idea}\nPlease critique or improve it.`);
  console.log('Bob (Critic):', critique);

  // Agent 1: Finalize
  const final = await agent('Alice', 'Idea Generator', `Here is the critique: ${critique}\nPlease finalize the solution.`);
  console.log('Alice (Finalized):', final);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Task: ', async (userInput: string) => {
  try {
    await multiAgentCollab(userInput);
  } catch (err) {
    console.error('Error:', err);
  }
  rl.close();
});
