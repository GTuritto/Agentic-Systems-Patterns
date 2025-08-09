// Agent Orchestration Pattern - Autogen TypeScript Example
// To run: npm install && npm run agent-orchestration

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

async function orchestrator(task: string) {
  // Dynamically assign roles and tasks
  const roles = [
    { name: 'Alice', role: 'Researcher', subtask: 'Find background info about: ' + task },
    { name: 'Bob', role: 'Analyst', subtask: 'Analyze the following info: ' },
    { name: 'Carol', role: 'Presenter', subtask: 'Summarize and present the findings: ' }
  ];

  // Step 1: Researcher
  const research = await agent(roles[0].name, roles[0].role, roles[0].subtask);
  console.log(`${roles[0].name} (${roles[0].role}):`, research);

  // Step 2: Analyst
  const analysis = await agent(roles[1].name, roles[1].role, roles[1].subtask + research);
  console.log(`${roles[1].name} (${roles[1].role}):`, analysis);

  // Step 3: Presenter
  const presentation = await agent(roles[2].name, roles[2].role, roles[2].subtask + analysis);
  console.log(`${roles[2].name} (${roles[2].role}):`, presentation);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Task: ', async (userInput: string) => {
  try {
    await orchestrator(userInput);
  } catch (err) {
    console.error('Error:', err);
  }
  rl.close();
});
