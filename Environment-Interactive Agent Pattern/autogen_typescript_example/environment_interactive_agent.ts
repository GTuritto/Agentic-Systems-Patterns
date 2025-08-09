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

  rl.question('Describe the current environment state: ', async (envState) => {
    let messages = [
      { role: 'system', content: 'You are an environment-interactive agent. Perceive the environment, choose an action, and adapt based on feedback.' },
      { role: 'user', content: `Environment state: ${envState}` },
    ];

    let action = await askMistral(messages);
    console.log('\nAgent Action:\n', action);

    rl.question('Describe the environment feedback after the action: ', async (feedback) => {
      let feedbackMessages = [
        { role: 'system', content: 'You are an environment-interactive agent. Given the feedback, adapt your strategy or next action.' },
        { role: 'user', content: `Feedback: ${feedback}` },
      ];
      let adaptation = await askMistral(feedbackMessages);
      console.log('\nAgent Adaptation/Next Action:\n', adaptation);
      rl.close();
    });
  });
}

main();
