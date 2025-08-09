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

  rl.question('Ask the agent a question: ', async (userInput) => {
    let messages = [
      { role: 'system', content: 'You are a meta-cognitive agent. For each answer, explain your reasoning, state your confidence, and if uncertain, suggest a strategy to resolve uncertainty.' },
      { role: 'user', content: userInput },
    ];

    let answer = await askMistral(messages);
    console.log('\nMeta-Cognitive Agent Answer:\n', answer);

    rl.close();
  });
}

main();
