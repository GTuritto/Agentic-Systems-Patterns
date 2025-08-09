// Prompt Engineering Example: Good vs Bad Prompt
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

async function callLLM(prompt: string): Promise<string> {
  if (!MISTRAL_API_KEY) throw new Error('Missing MISTRAL_API_KEY in .env');
  const response = await axios.post(
    MISTRAL_API_URL,
    {
      model: 'mistral-tiny', // or another available model
      messages: [
        { role: 'user', content: prompt }
      ]
    },
    {
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.choices[0].message.content;
}

async function main() {
  const badPrompt = 'Summarize this.';
  const goodPrompt = 'Summarize the following article in 3 bullet points, focusing on key findings and recommendations:';
  const article = 'Agentic systems are AI systems that can act autonomously to achieve goals.';

  console.log('Bad Prompt Result:');
  console.log(await callLLM(`${badPrompt} ${article}`));

  console.log('\nGood Prompt Result:');
  console.log(await callLLM(`${goodPrompt} ${article}`));
}

main();
