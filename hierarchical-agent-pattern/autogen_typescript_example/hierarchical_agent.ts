import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import readline from 'readline';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

type ChatMessage = {
  role: 'system' | 'user';
  content: string;
};

function askLocalModel(messages: ChatMessage[]) {
  const systemPrompt = messages[0]?.content ?? '';
  const userPrompt = messages[messages.length - 1]?.content ?? '';

  if (systemPrompt.includes('Decompose the user goal')) {
    return [
      'Sub-task 1: Define evaluation criteria for answer quality, retrieval grounding, latency, and failure handling.',
      'Sub-task 2: Create a small test set with expected evidence, negative cases, and acceptance thresholds.',
    ].join('\n');
  }

  if (systemPrompt.includes('Worker Agent 1')) {
    return `Worker 1 result: ${userPrompt} Criteria should include citation accuracy, unsupported-claim rate, p95 latency, and visible refusal behavior.`;
  }

  if (systemPrompt.includes('Worker Agent 2')) {
    return `Worker 2 result: ${userPrompt} The test set should include grounded answers, missing-evidence questions, stale-document checks, and threshold failures.`;
  }

  return [
    'Final answer: evaluate the RAG prototype with quality, grounding, latency, and failure-handling criteria.',
    'Use a small test set with positive cases, missing-evidence cases, stale-document cases, and blocking thresholds.',
    'Accept the prototype only when worker evidence meets the supervisor policy.',
  ].join('\n');
}

async function askMistral(messages: ChatMessage[]) {
  if (!MISTRAL_API_KEY) {
    return askLocalModel(messages);
  }

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
    const managerMessages: ChatMessage[] = [
      { role: 'system', content: 'You are a manager agent. Decompose the user goal into two sub-tasks and assign each to a worker agent.' },
      { role: 'user', content: `Goal: ${goalInput}` },
    ];
    const managerPlan = await askMistral(managerMessages);
    console.log('\nManager Agent Plan:\n', managerPlan);

    // Simulate two worker agents (for demo, just ask Mistral for each sub-task)
    const subTasks = managerPlan.match(/Sub-task [12]: (.*)/g) || [];
    const workerResults: string[] = [];
    for (let i = 0; i < subTasks.length; i++) {
      const workerMessages: ChatMessage[] = [
        { role: 'system', content: `You are Worker Agent ${i+1}. Complete the following sub-task as best as you can.` },
        { role: 'user', content: subTasks[i] },
      ];
      const workerResult = await askMistral(workerMessages);
      console.log(`\nWorker Agent ${i+1} Result:\n`, workerResult);
      workerResults.push(workerResult);
    }

    // Manager aggregates results
    const aggregationMessages: ChatMessage[] = [
      { role: 'system', content: 'You are a manager agent. Aggregate the following worker results into a final answer for the user.' },
      { role: 'user', content: workerResults.map((r, i) => `Worker ${i+1}: ${r}`).join('\n') },
    ];
    const finalResult = await askMistral(aggregationMessages);
    console.log('\nFinal Aggregated Result for User:\n', finalResult);

    rl.close();
  });
}

main();
