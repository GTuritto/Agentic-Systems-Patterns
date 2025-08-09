// ReAct Pattern (Reason + Act) - Autogen TypeScript Example
// To run: npm install && npm run react-agent

import axios from 'axios';
import * as readline from 'readline';
import { evaluate } from 'mathjs';
import * as dotenv from 'dotenv';
dotenv.config();

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

function calculatorTool(input: string): string {
  try {
    const val = evaluate(input);
    return val.toString();
  } catch (e) {
    return `Error: ${e}`;
  }
}

async function reactAgent(userInput: string): Promise<string> {
  let context = userInput;
  let done = false;
  let result = '';
  while (!done) {
    // Step 1: Reason
    const reasoningPrompt = `You are an agent. Think step by step about what to do next. If you need to use a tool, say TOOL: <expression>. If you are done, say FINAL: <answer>.\nContext: ${context}`;
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: 'mistral-tiny',
        messages: [{ role: 'user', content: reasoningPrompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const agentOutput = response.data.choices[0].message.content.trim();
    console.log('Agent:', agentOutput);
    if (agentOutput.startsWith('TOOL:')) {
      const expr = agentOutput.replace('TOOL:', '').trim();
      const toolResult = calculatorTool(expr);
      context += `\nTool result: ${toolResult}`;
    } else if (agentOutput.startsWith('FINAL:')) {
      result = agentOutput.replace('FINAL:', '').trim();
      done = true;
    } else {
      // If the agent doesn't follow the protocol, end loop
      result = agentOutput;
      done = true;
    }
  }
  return result;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Task: ', async (userInput: string) => {
  try {
    const agentResponse = await reactAgent(userInput);
    console.log('Final Answer:', agentResponse);
  } catch (err) {
    console.error('Error:', err);
  }
  rl.close();
});
