/**
 * End-to-End Encryption utilities for secure messaging
 * Uses Web Crypto API with AES-256-GCM and ECDH key exchange
 */

// Type definitions
export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface ExportedKeyPair {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedMessage {
  ciphertext: string;
  nonce: string;
  ephemeralPublicKey: string;
}

// Constants
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const NONCE_LENGTH = 12;
const ECDH_CURVE = 'P-256';

/**
 * Generate a new ECDH key pair for the user
 */
export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: ECDH_CURVE,
    },
    true, // extractable
    ['deriveKey', 'deriveBits']
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

/**
 * Export a key pair to base64 strings for storage
 */
export async function exportKeyPair(keyPair: KeyPair): Promise<ExportedKeyPair> {
  const [publicKeyBuffer, privateKeyBuffer] = await Promise.all([
    window.crypto.subtle.exportKey('spki', keyPair.publicKey),
    window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey),
  ]);

  return {
    publicKey: arrayBufferToBase64(publicKeyBuffer),
    privateKey: arrayBufferToBase64(privateKeyBuffer),
  };
}

/**
 * Import a key pair from base64 strings
 */
export async function importKeyPair(exported: ExportedKeyPair): Promise<KeyPair> {
  const [publicKey, privateKey] = await Promise.all([
    window.crypto.subtle.importKey(
      'spki',
      base64ToArrayBuffer(exported.publicKey),
      { name: 'ECDH', namedCurve: ECDH_CURVE },
      true,
      []
    ),
    window.crypto.subtle.importKey(
      'pkcs8',
      base64ToArrayBuffer(exported.privateKey),
      { name: 'ECDH', namedCurve: ECDH_CURVE },
      true,
      ['deriveKey', 'deriveBits']
    ),
  ]);

  return { publicKey, privateKey };
}

/**
 * Import a public key from base64 string
 */
export async function importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    'spki',
    base64ToArrayBuffer(publicKeyBase64),
    { name: 'ECDH', namedCurve: ECDH_CURVE },
    true,
    []
  );
}

/**
 * Derive a shared secret using ECDH
 */
async function deriveSharedKey(
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<CryptoKey> {
  return window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: publicKey,
    },
    privateKey,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a random nonce for AES-GCM
 */
function generateNonce(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(NONCE_LENGTH));
}

/**
 * Encrypt a message for a recipient
 */
export async function encryptMessage(
  plaintext: string,
  recipientPublicKey: CryptoKey | string,
  senderPrivateKey: CryptoKey
): Promise<EncryptedMessage> {
  // Handle string public key
  const recipientKey = typeof recipientPublicKey === 'string'
    ? await importPublicKey(recipientPublicKey)
    : recipientPublicKey;

  // Generate ephemeral key pair for perfect forward secrecy
  const ephemeralKeyPair = await generateKeyPair();

  // Derive shared secret
  const sharedKey = await deriveSharedKey(ephemeralKeyPair.privateKey, recipientKey);

  // Generate nonce
  const nonce = generateNonce();

  // Encrypt the message
  const encoder = new TextEncoder();
  const plaintextBuffer = encoder.encode(plaintext);

  // Create a copy of the nonce as ArrayBuffer to satisfy TypeScript
  const nonceArrayBuffer = new ArrayBuffer(nonce.byteLength);
  new Uint8Array(nonceArrayBuffer).set(nonce);
  
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: nonceArrayBuffer,
    },
    sharedKey,
    plaintextBuffer
  );

  // Export ephemeral public key
  const ephemeralPublicKeyBuffer = await window.crypto.subtle.exportKey(
    'spki',
    ephemeralKeyPair.publicKey
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertextBuffer),
    nonce: arrayBufferToBase64(nonceArrayBuffer),
    ephemeralPublicKey: arrayBufferToBase64(ephemeralPublicKeyBuffer),
  };
}

/**
 * Decrypt a message from a sender
 */
export async function decryptMessage(
  encrypted: EncryptedMessage,
  recipientPrivateKey: CryptoKey
): Promise<string> {
  // Import ephemeral public key
  const ephemeralPublicKey = await window.crypto.subtle.importKey(
    'spki',
    base64ToArrayBuffer(encrypted.ephemeralPublicKey),
    { name: 'ECDH', namedCurve: ECDH_CURVE },
    false,
    []
  );

  // Derive shared secret
  const sharedKey = await deriveSharedKey(recipientPrivateKey, ephemeralPublicKey);

  // Decrypt the message
  const ciphertextBuffer = base64ToArrayBuffer(encrypted.ciphertext);
  const nonceBuffer = base64ToArrayBuffer(encrypted.nonce);

  const plaintextBuffer = await window.crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: nonceBuffer,
    },
    sharedKey,
    ciphertextBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(plaintextBuffer);
}

/**
 * Encrypt a message with a symmetric key (for group chats)
 */
export async function encryptWithSymmetricKey(
  plaintext: string,
  key: CryptoKey
): Promise<{ ciphertext: string; nonce: string }> {
  const nonce = generateNonce();
  const encoder = new TextEncoder();
  const plaintextBuffer = encoder.encode(plaintext);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: nonce as BufferSource,
    },
    key,
    plaintextBuffer
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertextBuffer),
    nonce: arrayBufferToBase64(nonce.buffer as ArrayBuffer),
  };
}

/**
 * Decrypt a message with a symmetric key (for group chats)
 */
export async function decryptWithSymmetricKey(
  ciphertext: string,
  nonce: string,
  key: CryptoKey
): Promise<string> {
  const ciphertextBuffer = base64ToArrayBuffer(ciphertext);
  const nonceBuffer = new Uint8Array(base64ToArrayBuffer(nonce));

  const plaintextBuffer = await window.crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: nonceBuffer as BufferSource,
    },
    key,
    ciphertextBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(plaintextBuffer);
}

/**
 * Generate a random symmetric key for group encryption
 */
export async function generateSymmetricKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Export a symmetric key to base64
 */
export async function exportSymmetricKey(key: CryptoKey): Promise<string> {
  const keyBuffer = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(keyBuffer);
}

/**
 * Import a symmetric key from base64
 */
export async function importSymmetricKey(keyBase64: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(keyBase64);
  return window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a password-derived key for encrypting the private key
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

// Utility functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Check if Web Crypto API is available
 */
export function isEncryptionSupported(): boolean {
  return !!(
    window.crypto &&
    window.crypto.subtle &&
    typeof window.crypto.subtle.generateKey === 'function'
  );
}

/**
 * Hash a message for integrity verification
 */
export async function hashMessage(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(hashBuffer);
}
