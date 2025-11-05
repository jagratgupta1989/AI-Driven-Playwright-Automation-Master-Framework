// utils/credentials.js
// Author: Nannu
// Purpose: Securely store and retrieve encrypted credentials for test automation

const crypto = require('crypto');

// Replace with a secure key in production
const ENCRYPTION_KEY = crypto.createHash('sha256').update('your-strong-key').digest();
const IV = Buffer.alloc(16, 0); // Initialization vector (for demo only)

// Encrypted credentials (replace with your own encrypted values)
const encryptedCredentials = {
  qalearningrepository: {
    username: 'f5cf8aa4d7fa15cf8786a3325898833b7c8d4b931c6a205f08de22bc86318b78',
    password: 'ffd5ad2b0cec72ee1c760322cfb9f443'
  }
};

function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function getCredentials(alias) {
  const entry = encryptedCredentials[alias];
  if (!entry) throw new Error('No credentials found for alias: ' + alias);
  return {
    username: decrypt(entry.username),
    password: decrypt(entry.password)
  };
}

module.exports = { encrypt, decrypt, getCredentials };
