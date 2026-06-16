---
title: Secure Agent Communication
---

# Secure Agent Communication

Secure communication protects messages between agents with authentication, integrity, confidentiality, and policy checks.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/secure-agent-communication-pattern)
> - [Download code bundle](/downloads/secure-agent-communication.zip)

## Intent

Secure communication protects messages between agents with authentication, integrity, confidentiality, and policy checks.

## Use When

- Agents cross trust boundaries.
- Messages contain private data or trigger external side effects.
- You need identity, authorization, replay protection, and audit logs.

## Avoid When

- All communication is local and already protected by process boundaries.
- Security checks cannot be enforced before action.
- The protocol lacks correlation IDs and auditability.

## Implementation Notes

- Keep the pattern boundary explicit: inputs, state, side effects, and outputs should be visible.
- Validate model-produced decisions before they affect tools, users, or durable state.
- Emit enough trace data to debug failures after the run.

## Failure Modes

- The pattern is applied where a simpler deterministic workflow would be better.
- State, tool calls, or model decisions are not observable enough to debug.
- The system lacks clear stop, retry, or escalation behavior.

## Run the Example

```sh
npm run secure-agent
```

## Code Walkthrough

Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.

## Source Code

These excerpts show the implementation shape. The complete code is available in the download bundle and repository source.

### `secure-agent-communication-pattern/autogen_typescript_example/secure_agent.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/secure-agent-communication-pattern/autogen_typescript_example/secure_agent.ts)

```ts
import crypto from 'crypto';
import readline from 'readline';

// Simulated symmetric key for demo (never hardcode in production)
const SECRET_KEY = 'my_demo_secret_key_123';

function encrypt(text: string): string {
  const cipher = crypto.createCipher('aes-256-ctr', SECRET_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encrypted: string): string {
  const decipher = crypto.createDecipher('aes-256-ctr', SECRET_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Agent 1: Enter a message to send securely: ', (message) => {
    const encrypted = encrypt(message);
    console.log('\n[Agent 1] Encrypted message sent:', encrypted);

    // Simulate Agent 2 receiving and decrypting
    const decrypted = decrypt(encrypted);
    console.log('[Agent 2] Decrypted message received:', decrypted);
    rl.close();
  });
}

main();
```

### `secure-agent-communication-pattern/langgraph_python_example/secure_agent.py`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/secure-agent-communication-pattern/langgraph_python_example/secure_agent.py)

```py
import os
from cryptography.fernet import Fernet

def get_key():
    # For demo, use a static key (never do this in production)
    return Fernet.generate_key()

SECRET_KEY = get_key()
fernet = Fernet(SECRET_KEY)

def encrypt(text):
    return fernet.encrypt(text.encode()).decode()

def decrypt(token):
    return fernet.decrypt(token.encode()).decode()

def main():
    message = input('Agent 1: Enter a message to send securely: ')
    encrypted = encrypt(message)
    print(f'\n[Agent 1] Encrypted message sent: {encrypted}')
    # Simulate Agent 2 receiving and decrypting
    decrypted = decrypt(encrypted)
    print(f'[Agent 2] Decrypted message received: {decrypted}')

if __name__ == '__main__':
    main()
```

## Download

- [Download source bundle](/downloads/secure-agent-communication.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/secure-agent-communication-pattern)

The download bundle contains the current `secure-agent-communication-pattern/` folder from this repository.
