import AsyncStorage from '@react-native-async-storage/async-storage';
import { hmacSha256 } from './cryptoUtils';

const STATE_SECRET_SALT = 'AstroGuru_StateIntegrity_FIPS_2026_SecureKey';
const INTEGRITY_PREFIX = '@astroguru_sig:';

export interface StateIntegrityResult {
  isValid: boolean;
  tampered: boolean;
  originalKey: string;
}

/**
 * Computes HMAC-SHA256 signature for any persisted JSON payload.
 */
export function computeStateSignature(key: string, data: any): string {
  const serialized = typeof data === 'string' ? data : JSON.stringify(data);
  return hmacSha256(STATE_SECRET_SALT, `${key}:${serialized}`);
}

/**
 * Saves a signed state item to persistent storage.
 */
export async function saveSignedState(key: string, data: any): Promise<void> {
  const serialized = typeof data === 'string' ? data : JSON.stringify(data);
  const sig = computeStateSignature(key, data);
  await AsyncStorage.multiSet([
    [key, serialized],
    [`${INTEGRITY_PREFIX}${key}`, sig],
  ]);
}

/**
 * Reads state and verifies cryptographic signature.
 * Returns null if signature is missing or tampered!
 */
export async function verifyAndLoadSignedState<T>(key: string): Promise<{ data: T | null; isTampered: boolean }> {
  try {
    const [[, serialized], [, storedSig]] = await AsyncStorage.multiGet([
      key,
      `${INTEGRITY_PREFIX}${key}`,
    ]);

    if (!serialized) {
      return { data: null, isTampered: false };
    }

    if (!storedSig) {
      // Missing signature on a protected key indicates external creation
      return { data: null, isTampered: true };
    }

    const expectedSig = hmacSha256(STATE_SECRET_SALT, `${key}:${serialized}`);
    if (storedSig !== expectedSig) {
      console.warn(`[Security Alert] State tampering detected on key: ${key}! Stored signature mismatch.`);
      return { data: null, isTampered: true };
    }

    return { data: JSON.parse(serialized) as T, isTampered: false };
  } catch (err) {
    return { data: null, isTampered: true };
  }
}
