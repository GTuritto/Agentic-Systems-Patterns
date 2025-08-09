// Recursive Agent Pattern - Autogen TypeScript Example
// To run: npm install && npm run recursive-agent

import axios from 'axios';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
dotenv.config();

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

async function recursiveAgent(task: string, depth: number = 0): Promise<string> {
  if (depth > 2) {
    // Base case: stop recursion
    return `Base case reached at depth ${depth}. Task: ${task}`;
  }
  // Ask the LLM if the task should be decomposed
  const prompt = `You are a recursive agent at depth ${depth}. Should this task be decomposed? If yes, list subtasks. If no, solve it. Task: ${task}`;
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
  const output = response.data.choices[0].message.content.trim();
  if (output.toLowerCase().includes('subtask')) {
    // Extract subtasks (simple split for demo)
    const subtasks = output.split(/subtask\s*\d*[:\-]?/i).map(s => s.trim()).filter(Boolean);
    const results = await Promise.all(subtasks.map(st => recursiveAgent(st, depth + 1)));
    return `Results at depth ${depth}:\n` + results.join('\n');
  } else {
    return `Solved at depth ${depth}: ${output}`;
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Task: ', async (userInput: string) => {
  try {
    const result = await recursiveAgent(userInput);
    console.log(result);
  } catch (err) {
    console.error('Error:', err);
  }
  rl.close();
});
