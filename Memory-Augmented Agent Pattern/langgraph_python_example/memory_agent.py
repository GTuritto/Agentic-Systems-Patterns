import os
import json
import requests

MEMORY_FILE = os.path.join(os.path.dirname(__file__), 'memory.json')

def load_memory():
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, 'r') as f:
            return json.load(f)
    return []

def save_memory(memory):
    with open(MEMORY_FILE, 'w') as f:
        json.dump(memory, f, indent=2)

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
    memory = load_memory()
    user_input = input('Ask the agent a question: ')
    # Retrieve relevant memory (for demo, just concatenate all previous user/assistant messages)
    context = '\n'.join([f"{m['role']}: {m['content']}" for m in memory])
    messages = [
        {'role': 'system', 'content': 'You are a helpful assistant with memory. Use the following context from previous interactions if relevant:\n' + context},
        {'role': 'user', 'content': user_input},
    ]
    answer = ask_mistral(messages)
    print('\nAgent Answer (with memory):\n', answer)
    # Update memory
    memory.append({'role': 'user', 'content': user_input})
    memory.append({'role': 'assistant', 'content': answer})
    save_memory(memory)

if __name__ == '__main__':
    main()
