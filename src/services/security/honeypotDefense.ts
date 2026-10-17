import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceFingerprint } from './deviceFingerprint';

const BLACKLIST_KEY = '@astroguru_sec_blacklisted';

export const HONEYPOT_TRAP_ENDPOINTS = [
  '/api/v1/admin/dump-users',
  '/api/v1/wallet/bypass-check',
  '/.env',
  '/wp-admin',
  '/debug/grant-unlimited-coins',
];

/**
 * Checks if current device has been blacklisted for malicious tampering.
 */
export async function isDeviceBlacklisted(): Promise<boolean> {
  try {
    const isFlagged = await AsyncStorage.getItem(BLACKLIST_KEY);
    return isFlagged === 'true';
  } catch {
    return false;
  }
}

/**
 * Triggers instant blacklisting when an unauthorized honeypot endpoint is probed.
 */
export async function triggerHoneypotTrap(endpointHit: string): Promise<void> {
  const deviceId = await getDeviceFingerprint();
  console.warn(`[SECURITY CRITICAL] Honeypot trap triggered on ${endpointHit} by device ${deviceId}!`);

  try {
    await AsyncStorage.setItem(BLACKLIST_KEY, 'true');
  } catch {}
}
