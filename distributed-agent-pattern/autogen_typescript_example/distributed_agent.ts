import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import readline from 'readline';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

if (!MISTRAL_API_KEY) {
  console.error('Please set MISTRAL_API_KEY in your .env file');
  process.exit(1);
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

async function distributedAgents(task: string) {
  // Simulate three distributed agents
  const agentNames = ['Agent 1', 'Agent 2', 'Agent 3'];
  let results: string[] = [];
  for (let i = 0; i < agentNames.length; i++) {
    let messages = [
      { role: 'system', content: `${agentNames[i]}: You are a distributed agent. Collaborate with the other agents to solve the following task. Communicate your partial result.` },
      { role: 'user', content: `Task: ${task}` },
    ];
    let result = await askMistral(messages);
    console.log(`\n${agentNames[i]} Partial Result:\n`, result);
    results.push(result);
  }
  // Aggregate results
  let aggregationMessages = [
    { role: 'system', content: 'You are a coordinator. Aggregate the results from all distributed agents into a final answer.' },
    { role: 'user', content: results.map((r, i) => `${agentNames[i]}: ${r}`).join('\n') },
  ];
  let finalResult = await askMistral(aggregationMessages);
  console.log('\nFinal Aggregated Result for User:\n', finalResult);
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('State the distributed task for the agents: ', async (taskInput) => {
    await distributedAgents(taskInput);
    rl.close();
  });
}

main();
