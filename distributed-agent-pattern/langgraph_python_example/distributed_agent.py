import os
import requests

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

def distributed_agents(task):
    agent_names = ['Agent 1', 'Agent 2', 'Agent 3']
    results = []
    for i, name in enumerate(agent_names):
        messages = [
            {'role': 'system', 'content': f'{name}: You are a distributed agent. Collaborate with the other agents to solve the following task. Communicate your partial result.'},
            {'role': 'user', 'content': f'Task: {task}'},
        ]
        result = ask_mistral(messages)
        print(f'\n{name} Partial Result:\n', result)
        results.append(result)
    # Aggregate results
    aggregation_messages = [
        {'role': 'system', 'content': 'You are a coordinator. Aggregate the results from all distributed agents into a final answer.'},
        {'role': 'user', 'content': '\n'.join([f'{name}: {r}' for name, r in zip(agent_names, results)])},
    ]
    final_result = ask_mistral(aggregation_messages)
    print('\nFinal Aggregated Result for User:\n', final_result)

def main():
    task_input = input('State the distributed task for the agents: ')
    distributed_agents(task_input)

if __name__ == '__main__':
    main()
