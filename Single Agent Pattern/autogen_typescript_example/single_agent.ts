// Single Agent Pattern - Autogen TypeScript Example
// To run: npm install && npm run single-agent

import axios from 'axios';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
dotenv.config();

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

async function singleAgent(userInput: string): Promise<string> {
  const response = await axios.post(
    MISTRAL_API_URL,
    {
      model: 'mistral-tiny', // or your preferred Mistral model
      messages: [{ role: 'user', content: userInput }],
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('User: ', async (userInput: string) => {
  try {
    const agentResponse = await singleAgent(userInput);
    console.log('Agent:', agentResponse);
  } catch (err) {
    console.error('Error:', err);
  }
  rl.close();
});

// To run: npm install axios @types/node
import axios from 'axios';
import * as readline from 'readline';

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

async function singleAgent(userInput: string): Promise<string> {
  const response = await axios.post(
    MISTRAL_API_URL,
    {
      model: 'mistral-tiny', // or your preferred Mistral model
      messages: [{ role: 'user', content: userInput }],
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


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('User: ', async (userInput: string) => {
  try {
    const agentResponse = await singleAgent(userInput);
    console.log('Agent:', agentResponse);
  } catch (err) {
    console.error('Error:', err);
  }
  rl.close();
});
