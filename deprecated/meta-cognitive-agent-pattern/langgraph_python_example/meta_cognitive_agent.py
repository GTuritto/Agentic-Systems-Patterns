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
    user_input = input('Ask the agent a question: ')
    messages = [
        {'role': 'system', 'content': 'You are a meta-cognitive agent. For each answer, explain your reasoning, state your confidence, and if uncertain, suggest a strategy to resolve uncertainty.'},
        {'role': 'user', 'content': user_input},
    ]
    answer = ask_mistral(messages)
    print('\nMeta-Cognitive Agent Answer:\n', answer)

if __name__ == '__main__':
    main()
