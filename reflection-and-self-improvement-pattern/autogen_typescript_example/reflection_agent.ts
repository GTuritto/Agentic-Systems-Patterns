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
      { role: 'system', content: 'You are a helpful assistant that reflects on your answers and tries to improve them if possible.' },
      { role: 'user', content: userInput },
    ];

    // First response
    let answer = await askMistral(messages);
    console.log('\nInitial Answer:\n', answer);

    // Reflection step
    messages.push({ role: 'assistant', content: answer });
    messages.push({ role: 'system', content: 'Reflect on your previous answer. Was it correct, clear, and complete? If not, revise and improve it.' });
    let reflection = await askMistral(messages);
    console.log('\nReflected/Improved Answer:\n', reflection);

    rl.close();
  });
}

main();
