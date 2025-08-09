import os
import requests
import re

def symbolic_module(user_input):
    match = re.match(r'add (\d+) and (\d+)', user_input.lower())
    if match:
        sum_result = int(match.group(1)) + int(match.group(2))
        return f'Symbolic: The sum is {sum_result}.'
    return None

def ml_module(user_input):
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
        'messages': [
            {'role': 'system', 'content': 'You are an ML module. Answer the user query as best as you can.'},
            {'role': 'user', 'content': user_input},
        ],
    }
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    return 'ML: ' + response.json()['choices'][0]['message']['content'].strip()

def main():
    user_input = input('Ask the hybrid agent a question: ')
    symbolic_result = symbolic_module(user_input)
    if symbolic_result:
        final_result = symbolic_result
    else:
        final_result = ml_module(user_input)
    print('\nHybrid Agent Response:\n', final_result)

if __name__ == '__main__':
    main()
