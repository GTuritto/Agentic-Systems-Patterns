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
