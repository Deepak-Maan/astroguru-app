import { hmacSha256, generateSecureNonce } from './cryptoUtils';

const CLIENT_API_SIGNING_SECRET = 'AstroGuru_Mobile_Prod_SignKey_2026_V3';
const MAX_ALLOWED_SKEW_MS = 300 * 1000; // 5 minutes

// In-memory cache of used nonces to detect replay attempts
const SEEN_NONCES = new Map<string, number>();

export interface SignedHeaders {
  'X-Astro-Signature': string;
  'X-Astro-Timestamp': string;
  'X-Astro-Nonce': string;
  'X-Astro-Device-ID': string;
}

/**
 * Signs an outgoing API request with HMAC-SHA256, timestamp, and unique nonce.
 */
export function signApiRequest({
  method,
  endpoint,
  payload,
  deviceId,
}: {
  method: string;
  endpoint: string;
  payload?: any;
  deviceId: string;
}): SignedHeaders {
  const timestamp = Date.now().toString();
  const nonce = generateSecureNonce();
  const serializedBody = payload ? (typeof payload === 'string' ? payload : JSON.stringify(payload)) : '';

  const canonicalString = `${method.toUpperCase()}:${endpoint}:${timestamp}:${nonce}:${serializedBody}:${deviceId}`;
  const signature = hmacSha256(CLIENT_API_SIGNING_SECRET, canonicalString);

  return {
    'X-Astro-Signature': signature,
    'X-Astro-Timestamp': timestamp,
    'X-Astro-Nonce': nonce,
    'X-Astro-Device-ID': deviceId,
  };
}

/**
 * Validates incoming request signature (Used in backend and simulated client verification).
 */
export function verifyRequestSignature({
  method,
  endpoint,
  payload,
  headers,
}: {
  method: string;
  endpoint: string;
  payload?: any;
  headers: Record<string, string | undefined>;
}): { valid: boolean; reason?: string } {
  const signature = headers['X-Astro-Signature'] || headers['x-astro-signature'];
  const timestampStr = headers['X-Astro-Timestamp'] || headers['x-astro-timestamp'];
  const nonce = headers['X-Astro-Nonce'] || headers['x-astro-nonce'];
  const deviceId = headers['X-Astro-Device-ID'] || headers['x-astro-device-id'] || 'unknown';

  if (!signature || !timestampStr || !nonce) {
    return { valid: false, reason: 'Missing required cryptographic security headers' };
  }

  // 1. Anti-Replay: Timestamp Skew Check
  const reqTime = parseInt(timestampStr, 10);
  const now = Date.now();
  if (isNaN(reqTime) || Math.abs(now - reqTime) > MAX_ALLOWED_SKEW_MS) {
    return { valid: false, reason: 'Request timestamp expired or skewed (> 300s)' };
  }

  // 2. Anti-Replay: Nonce Uniqueness Check
  if (SEEN_NONCES.has(nonce)) {
    return { valid: false, reason: 'Replay attack detected: duplicate single-use nonce' };
  }

  // Prune old nonces from cache
  const cutoff = now - MAX_ALLOWED_SKEW_MS;
  for (const [n, ts] of SEEN_NONCES.entries()) {
    if (ts < cutoff) SEEN_NONCES.delete(n);
  }
  SEEN_NONCES.set(nonce, now);

  // 3. Signature verification
  const serializedBody = payload ? (typeof payload === 'string' ? payload : JSON.stringify(payload)) : '';
  const canonicalString = `${method.toUpperCase()}:${endpoint}:${timestampStr}:${nonce}:${serializedBody}:${deviceId}`;
  const expectedSig = hmacSha256(CLIENT_API_SIGNING_SECRET, canonicalString);

  if (signature !== expectedSig) {
    return { valid: false, reason: 'HMAC signature mismatch: request payload or headers tampered' };
  }

  return { valid: true };
}
