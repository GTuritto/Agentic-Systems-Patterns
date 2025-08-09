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

def main():
    goal_input = input('State the agent goal: ')
    messages = [
        {'role': 'system', 'content': 'You are a goal-conditioned agent. Given a goal, plan and execute steps to achieve it. Explain your plan and track progress.'},
        {'role': 'user', 'content': f'Goal: {goal_input}'},
    ]
    answer = ask_mistral(messages)
    print('\nGoal-Conditioned Agent Response:\n', answer)

if __name__ == '__main__':
    main()
