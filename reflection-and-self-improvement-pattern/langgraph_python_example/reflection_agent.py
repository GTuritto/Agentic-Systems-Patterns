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
        {'role': 'system', 'content': 'You are a helpful assistant that reflects on your answers and tries to improve them if possible.'},
        {'role': 'user', 'content': user_input},
    ]
    # First response
    answer = ask_mistral(messages)
    print('\nInitial Answer:\n', answer)
    # Reflection step
    messages.append({'role': 'assistant', 'content': answer})
    messages.append({'role': 'system', 'content': 'Reflect on your previous answer. Was it correct, clear, and complete? If not, revise and improve it.'})
    reflection = ask_mistral(messages)
    print('\nReflected/Improved Answer:\n', reflection)

if __name__ == '__main__':
    main()
