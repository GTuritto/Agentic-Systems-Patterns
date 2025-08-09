import os
import requests
import re

def ask_mistral(messages):
    api_key = os.getenv('MISTRAL_API_KEY')
    if not api_key:
        raise ValueError('Please set MISTRAL_API_KEY in your .env file')
    url = 'https://api.mistral.ai/v1/chat/completions'
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    data = {
        'model': 'mistral-tiny',
        'messages': messages,
    }
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()['choices'][0]['message']['content'].strip()

def main():
    goal_input = input('State the goal for the planning agent: ')
    # Step 1: Generate a plan
    plan_messages = [
        {'role': 'system', 'content': 'You are a planning agent. Given a goal, generate a step-by-step plan to achieve it.'},
        {'role': 'user', 'content': f'Goal: {goal_input}'},
    ]
    plan = ask_mistral(plan_messages)
    print('\nGenerated Plan:\n', plan)

    # Step 2: Execute each step (for demo, just ask Mistral for each step)
    steps = re.findall(r'Step [0-9]+: (.*)', plan)
    results = []
    for i, step in enumerate(steps):
        exec_messages = [
            {'role': 'system', 'content': f'You are an agent executing step {i+1} of a plan. Perform the step and report the result.'},
            {'role': 'user', 'content': step},
        ]
        result = ask_mistral(exec_messages)
        print(f'\nResult of Step {i+1}:\n', result)
        results.append(result)

    # Step 3: Evaluate and summarize
    eval_messages = [
        {'role': 'system', 'content': 'You are a planning agent. Summarize the results of the executed plan and suggest improvements if any step failed.'},
        {'role': 'user', 'content': '\n'.join([f'Step {i+1}: {r}' for i, r in enumerate(results)])},
    ]
    summary = ask_mistral(eval_messages)
    print('\nPlan Execution Summary:\n', summary)

if __name__ == '__main__':
    main()
