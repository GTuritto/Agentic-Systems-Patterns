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

// Simple symbolic rule-based module
function symbolicModule(input: string): string | null {
  if (input.toLowerCase().includes('add')) {
    const match = input.match(/add (\d+) and (\d+)/i);
    if (match) {
      const sum = parseInt(match[1]) + parseInt(match[2]);
      return `Symbolic: The sum is ${sum}.`;
    }
  }
  return null;
}

async function mlModule(input: string): Promise<string> {
  const messages = [
    { role: 'system', content: 'You are an ML module. Answer the user query as best as you can.' },
    { role: 'user', content: input },
  ];
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
  return 'ML: ' + response.data.choices[0].message.content.trim();
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Ask the hybrid agent a question: ', async (userInput) => {
    // Try symbolic module first
    const symbolicResult = symbolicModule(userInput);
    let mlResult = '';
    if (!symbolicResult) {
      mlResult = await mlModule(userInput);
    }
    // Integrate results
    let finalResult = symbolicResult || mlResult;
    console.log('\nHybrid Agent Response:\n', finalResult);
    rl.close();
  });
}

main();
