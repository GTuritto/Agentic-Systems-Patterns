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

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('State the overall goal for the manager agent: ', async (goalInput) => {
    // Manager agent decomposes the goal into two sub-tasks
    let managerMessages = [
      { role: 'system', content: 'You are a manager agent. Decompose the user goal into two sub-tasks and assign each to a worker agent.' },
      { role: 'user', content: `Goal: ${goalInput}` },
    ];
    let managerPlan = await askMistral(managerMessages);
    console.log('\nManager Agent Plan:\n', managerPlan);

    // Simulate two worker agents (for demo, just ask Mistral for each sub-task)
    const subTasks = managerPlan.match(/Sub-task [12]: (.*)/g) || [];
    let workerResults: string[] = [];
    for (let i = 0; i < subTasks.length; i++) {
      let workerMessages = [
        { role: 'system', content: `You are Worker Agent ${i+1}. Complete the following sub-task as best as you can.` },
        { role: 'user', content: subTasks[i] },
      ];
      let workerResult = await askMistral(workerMessages);
      console.log(`\nWorker Agent ${i+1} Result:\n`, workerResult);
      workerResults.push(workerResult);
    }

    // Manager aggregates results
    let aggregationMessages = [
      { role: 'system', content: 'You are a manager agent. Aggregate the following worker results into a final answer for the user.' },
      { role: 'user', content: workerResults.map((r, i) => `Worker ${i+1}: ${r}`).join('\n') },
    ];
    let finalResult = await askMistral(aggregationMessages);
    console.log('\nFinal Aggregated Result for User:\n', finalResult);

    rl.close();
  });
}

main();
