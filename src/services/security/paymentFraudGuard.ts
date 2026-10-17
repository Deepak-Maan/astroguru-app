import AsyncStorage from '@react-native-async-storage/async-storage';
import { sha256 } from './cryptoUtils';

const UTR_LEDGER_STORAGE_KEY = '@astroguru_sec_utr_ledger';
const ATTEMPT_TRACKER_KEY = '@astroguru_sec_utr_attempts';

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export interface FraudCheckResult {
  allowed: boolean;
  isDuplicateUtr: boolean;
  isLockedOut: boolean;
  lockoutRemainingMinutes?: number;
  message?: string;
}

interface AttemptRecord {
  failedCount: number;
  lastAttemptAt: number;
  lockedUntil: number;
}

/**
 * Validates UTR against rate limits (velocity) and duplicate ledger.
 */
export async function validateUtrSubmission(utr: string, userId: string): Promise<FraudCheckResult> {
  const cleanUtr = utr.trim();
  const utrHash = sha256(`UTR-SALT-2026-${cleanUtr}`);
  const now = Date.now();

  // 1. Check Rate-Limit Lockout
  try {
    const rawAttempts = await AsyncStorage.getItem(ATTEMPT_TRACKER_KEY);
    const attempts: Record<string, AttemptRecord> = rawAttempts ? JSON.parse(rawAttempts) : {};
    const userAttempt = attempts[userId];

    if (userAttempt && userAttempt.lockedUntil > now) {
      const remainingMins = Math.ceil((userAttempt.lockedUntil - now) / 60000);
      return {
        allowed: false,
        isDuplicateUtr: false,
        isLockedOut: true,
        lockoutRemainingMinutes: remainingMins,
        message: `Too many payment verification attempts. Please wait ${remainingMins} min before retrying.`,
      };
    }
  } catch {}

  // 2. Check for Duplicate UTR Reuse
  try {
    const rawLedger = await AsyncStorage.getItem(UTR_LEDGER_STORAGE_KEY);
    const ledger: Record<string, { userId: string; verifiedAt: number }> = rawLedger
      ? JSON.parse(rawLedger)
      : {};

    if (ledger[utrHash]) {
      return {
        allowed: false,
        isDuplicateUtr: true,
        isLockedOut: false,
        message: 'This Bank Reference Number (UTR) has already been claimed and credited.',
      };
    }
  } catch {}

  return {
    allowed: true,
    isDuplicateUtr: false,
    isLockedOut: false,
  };
}

/**
 * Records a successful UTR in the ledger so it can never be redeemed again.
 */
export async function recordVerifiedUtr(utr: string, userId: string): Promise<void> {
  const utrHash = sha256(`UTR-SALT-2026-${utr.trim()}`);
  try {
    const rawLedger = await AsyncStorage.getItem(UTR_LEDGER_STORAGE_KEY);
    const ledger: Record<string, { userId: string; verifiedAt: number }> = rawLedger
      ? JSON.parse(rawLedger)
      : {};

    ledger[utrHash] = {
      userId,
      verifiedAt: Date.now(),
    };

    await AsyncStorage.setItem(UTR_LEDGER_STORAGE_KEY, JSON.stringify(ledger));

    // Reset failed attempts on success
    const rawAttempts = await AsyncStorage.getItem(ATTEMPT_TRACKER_KEY);
    if (rawAttempts) {
      const attempts = JSON.parse(rawAttempts);
      delete attempts[userId];
      await AsyncStorage.setItem(ATTEMPT_TRACKER_KEY, JSON.stringify(attempts));
    }
  } catch (err) {
    console.error('Failed to record UTR in ledger', err);
  }
}

/**
 * Records a failed verification attempt and triggers lockout if threshold reached.
 */
export async function recordFailedUtrAttempt(userId: string): Promise<void> {
  try {
    const rawAttempts = await AsyncStorage.getItem(ATTEMPT_TRACKER_KEY);
    const attempts: Record<string, AttemptRecord> = rawAttempts ? JSON.parse(rawAttempts) : {};
    const now = Date.now();

    const record = attempts[userId] || { failedCount: 0, lastAttemptAt: now, lockedUntil: 0 };
    record.failedCount += 1;
    record.lastAttemptAt = now;

    if (record.failedCount >= MAX_FAILED_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_DURATION_MS;
      record.failedCount = 0; // reset counter after locking
    }

    attempts[userId] = record;
    await AsyncStorage.setItem(ATTEMPT_TRACKER_KEY, JSON.stringify(attempts));
  } catch (err) {
    console.error('Failed to update UTR attempt tracker', err);
  }
}
