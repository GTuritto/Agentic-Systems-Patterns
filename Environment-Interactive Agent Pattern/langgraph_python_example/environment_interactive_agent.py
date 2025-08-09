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
    env_state = input('Describe the current environment state: ')
    messages = [
        {'role': 'system', 'content': 'You are an environment-interactive agent. Perceive the environment, choose an action, and adapt based on feedback.'},
        {'role': 'user', 'content': f'Environment state: {env_state}'},
    ]
    action = ask_mistral(messages)
    print('\nAgent Action:\n', action)

    feedback = input('Describe the environment feedback after the action: ')
    feedback_messages = [
        {'role': 'system', 'content': 'You are an environment-interactive agent. Given the feedback, adapt your strategy or next action.'},
        {'role': 'user', 'content': f'Feedback: {feedback}'},
    ]
    adaptation = ask_mistral(feedback_messages)
    print('\nAgent Adaptation/Next Action:\n', adaptation)

if __name__ == '__main__':
    main()
