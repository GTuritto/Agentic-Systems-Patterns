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

  rl.question('State the goal for the planning agent: ', async (goalInput) => {
    // Step 1: Generate a plan
    let planMessages = [
      { role: 'system', content: 'You are a planning agent. Given a goal, generate a step-by-step plan to achieve it.' },
      { role: 'user', content: `Goal: ${goalInput}` },
    ];
    let plan = await askMistral(planMessages);
    console.log('\nGenerated Plan:\n', plan);

    // Step 2: Execute each step (for demo, just ask Mistral for each step)
    const steps = plan.match(/Step [0-9]+: (.*)/g) || [];
    let results: string[] = [];
    for (let i = 0; i < steps.length; i++) {
      let execMessages = [
        { role: 'system', content: `You are an agent executing step ${i+1} of a plan. Perform the step and report the result.` },
        { role: 'user', content: steps[i] },
      ];
      let result = await askMistral(execMessages);
      console.log(`\nResult of Step ${i+1}:\n`, result);
      results.push(result);
    }

    // Step 3: Evaluate and summarize
    let evalMessages = [
      { role: 'system', content: 'You are a planning agent. Summarize the results of the executed plan and suggest improvements if any step failed.' },
      { role: 'user', content: results.map((r, i) => `Step ${i+1}: ${r}`).join('\n') },
    ];
    let summary = await askMistral(evalMessages);
    console.log('\nPlan Execution Summary:\n', summary);

    rl.close();
  });
}

main();
