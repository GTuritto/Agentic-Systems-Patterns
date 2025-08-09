// Agent Marketplace Pattern - Autogen TypeScript Example
// To run: npm install && npm run agent-marketplace

import axios from 'axios';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
dotenv.config();

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

interface AgentProfile {
  name: string;
  skill: string;
  cost: number;
}

const agents: AgentProfile[] = [
  { name: 'Alice', skill: 'translation', cost: 5 },
  { name: 'Bob', skill: 'summarization', cost: 3 },
  { name: 'Carol', skill: 'data analysis', cost: 4 }
];

async function marketplace(task: string, requiredSkill: string) {
  // Agents bid for the task if they have the required skill
  const bidders = agents.filter(a => a.skill === requiredSkill);
  if (bidders.length === 0) {
    console.log('No agent available for this skill.');
    return;
  }
  // Pick the lowest cost agent
  const winner = bidders.reduce((prev, curr) => (curr.cost < prev.cost ? curr : prev));
  console.log(`Marketplace: Assigning task to ${winner.name} (Skill: ${winner.skill}, Cost: ${winner.cost})`);
  const prompt = `You are ${winner.name}, an expert in ${winner.skill}. Complete this task: ${task}`;
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
  console.log(`${winner.name}:`, response.data.choices[0].message.content);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Task: ', (taskInput: string) => {
  rl.question('Required skill (translation/summarization/data analysis): ', async (skillInput: string) => {
    try {
      await marketplace(taskInput, skillInput.trim());
    } catch (err) {
      console.error('Error:', err);
    }
    rl.close();
  });
});
