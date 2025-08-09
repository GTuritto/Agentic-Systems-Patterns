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
    goal_input = input('State the overall goal for the manager agent: ')
    # Manager agent decomposes the goal into two sub-tasks
    manager_messages = [
        {'role': 'system', 'content': 'You are a manager agent. Decompose the user goal into two sub-tasks and assign each to a worker agent.'},
        {'role': 'user', 'content': f'Goal: {goal_input}'},
    ]
    manager_plan = ask_mistral(manager_messages)
    print('\nManager Agent Plan:\n', manager_plan)

    # Simulate two worker agents (for demo, just ask Mistral for each sub-task)
    sub_tasks = re.findall(r'Sub-task [12]: (.*)', manager_plan)
    worker_results = []
    for i, sub_task in enumerate(sub_tasks):
        worker_messages = [
            {'role': 'system', 'content': f'You are Worker Agent {i+1}. Complete the following sub-task as best as you can.'},
            {'role': 'user', 'content': sub_task},
        ]
        worker_result = ask_mistral(worker_messages)
        print(f'\nWorker Agent {i+1} Result:\n', worker_result)
        worker_results.append(worker_result)

    # Manager aggregates results
    aggregation_messages = [
        {'role': 'system', 'content': 'You are a manager agent. Aggregate the following worker results into a final answer for the user.'},
        {'role': 'user', 'content': '\n'.join([f'Worker {i+1}: {r}' for i, r in enumerate(worker_results)])},
    ]
    final_result = ask_mistral(aggregation_messages)
    print('\nFinal Aggregated Result for User:\n', final_result)

if __name__ == '__main__':
    main()
