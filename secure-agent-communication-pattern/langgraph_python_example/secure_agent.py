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
