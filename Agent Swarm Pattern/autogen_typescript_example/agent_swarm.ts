// Agent Swarm Pattern - Autogen TypeScript Example
// To run: npm install && npm run agent-swarm

import axios from 'axios';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
dotenv.config();

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

async function swarmAgent(name: string, task: string): Promise<string> {
  const prompt = `You are ${name}, a simple agent. Here is your task: ${task}`;
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

async function agentSwarm(task: string) {
  // Launch 3 agents in parallel
  const agentNames = ['Agent 1', 'Agent 2', 'Agent 3'];
  const results = await Promise.all(agentNames.map(name => swarmAgent(name, task)));
  results.forEach((result, i) => {
    console.log(`${agentNames[i]}:`, result);
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Task: ', async (userInput: string) => {
  try {
    await agentSwarm(userInput);
  } catch (err) {
    console.error('Error:', err);
  }
  rl.close();
});
