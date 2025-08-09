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

  rl.question('State the agent goal: ', async (goalInput) => {
    let messages = [
      { role: 'system', content: 'You are a goal-conditioned agent. Given a goal, plan and execute steps to achieve it. Explain your plan and track progress.' },
      { role: 'user', content: `Goal: ${goalInput}` },
    ];

    let answer = await askMistral(messages);
    console.log('\nGoal-Conditioned Agent Response:\n', answer);

    rl.close();
  });
}

main();
