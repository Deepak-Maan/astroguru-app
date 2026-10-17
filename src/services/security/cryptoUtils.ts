/**
 * Pure TypeScript cryptographic utilities for AstroGuru Anti-Hacking & Security Suite.
 * Fully compatible with React Native, Expo, Web, and Node without native dependencies.
 * Implements FIPS 180-4 SHA-256 and RFC 2104 HMAC-SHA256.
 */

function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

const K: number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

export function sha256Bytes(ascii: string | Uint8Array): Uint8Array {
  let bytes: number[];
  if (typeof ascii === 'string') {
    bytes = [];
    for (let i = 0; i < ascii.length; i++) {
      const code = ascii.charCodeAt(i);
      if (code < 0x80) {
        bytes.push(code);
      } else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      } else {
        bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      }
    }
  } else {
    bytes = Array.from(ascii);
  }

  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) {
    bytes.push(0);
  }

  // Append length in bits as 64-bit big-endian integer
  for (let i = 7; i >= 0; i--) {
    bytes.push(i >= 4 ? 0 : (bitLength >>> (i * 8)) & 0xff);
  }

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Array(64);

  for (let i = 0; i < bytes.length; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] =
        (bytes[i + j * 4] << 24) |
        (bytes[i + j * 4 + 1] << 16) |
        (bytes[i + j * 4 + 2] << 8) |
        bytes[i + j * 4 + 3];
    }
    for (let j = 16; j < 64; j++) {
      const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let j = 0; j < 64; j++) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + K[j] + w[j]) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const result = new Uint8Array(32);
  const words = [h0, h1, h2, h3, h4, h5, h6, h7];
  for (let i = 0; i < 8; i++) {
    result[i * 4] = (words[i] >>> 24) & 0xff;
    result[i * 4 + 1] = (words[i] >>> 16) & 0xff;
    result[i * 4 + 2] = (words[i] >>> 8) & 0xff;
    result[i * 4 + 3] = words[i] & 0xff;
  }
  return result;
}

export function sha256(text: string): string {
  const bytes = sha256Bytes(text);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hmacSha256(key: string, message: string): string {
  const blockSize = 64; // 512 bits
  let keyBytes: number[] = [];
  for (let i = 0; i < key.length; i++) {
    keyBytes.push(key.charCodeAt(i) & 0xff);
  }

  if (keyBytes.length > blockSize) {
    keyBytes = Array.from(sha256Bytes(new Uint8Array(keyBytes)));
  }
  while (keyBytes.length < blockSize) {
    keyBytes.push(0);
  }

  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = keyBytes[i] ^ 0x5c;
    iKeyPad[i] = keyBytes[i] ^ 0x36;
  }

  // Inner hash: H(iKeyPad || message)
  const innerMsg = new Uint8Array(blockSize + message.length);
  innerMsg.set(iKeyPad, 0);
  for (let i = 0; i < message.length; i++) {
    innerMsg[blockSize + i] = message.charCodeAt(i) & 0xff;
  }
  const innerHash = sha256Bytes(innerMsg);

  // Outer hash: H(oKeyPad || innerHash)
  const outerMsg = new Uint8Array(blockSize + 32);
  outerMsg.set(oKeyPad, 0);
  outerMsg.set(innerHash, blockSize);
  const outerHash = sha256Bytes(outerMsg);

  return Array.from(outerHash)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateSecureNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  const now = Date.now().toString(36);
  for (let i = 0; i < 24; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${now}-${nonce}`;
}
