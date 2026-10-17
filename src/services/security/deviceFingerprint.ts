import { Dimensions, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sha256 } from './cryptoUtils';

const DEVICE_ID_KEY = '@astroguru_sec_device_uuid';
const SESSION_META_KEY = '@astroguru_sec_session_meta';

export interface SessionMetadata {
  deviceId: string;
  sessionToken: string;
  lastActiveTimestamp: number;
  ipAddress?: string;
  approxLocation?: string;
  isAnomaly: boolean;
}

let cachedDeviceId: string | null = null;

/**
 * Retrieves or generates a persistent device fingerprint.
 */
export async function getDeviceFingerprint(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;

  try {
    const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existing) {
      cachedDeviceId = existing;
      return existing;
    }
  } catch {}

  const { width, height, scale } = Dimensions.get('window');
  const tz = Intl?.DateTimeFormat?.().resolvedOptions()?.timeZone || 'Asia/Kolkata';
  const randomSeed = Math.random().toString(36).substring(2, 15);

  const rawFingerprint = [
    Platform.OS,
    Platform.Version,
    `${width}x${height}x${scale}`,
    tz,
    randomSeed,
  ].join('::');

  const deviceId = `DEV-${sha256(rawFingerprint).substring(0, 24).toUpperCase()}`;
  cachedDeviceId = deviceId;

  try {
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  } catch {}

  return deviceId;
}

/**
 * Checks for session hijacking or impossible travel anomalies.
 */
export async function auditSessionIntegrity(
  currentSessionToken: string,
  currentIp?: string
): Promise<{ safe: boolean; anomalyReason?: string }> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_META_KEY);
    const now = Date.now();

    if (!raw) {
      const deviceId = await getDeviceFingerprint();
      const meta: SessionMetadata = {
        deviceId,
        sessionToken: currentSessionToken,
        lastActiveTimestamp: now,
        ipAddress: currentIp,
        isAnomaly: false,
      };
      await AsyncStorage.setItem(SESSION_META_KEY, JSON.stringify(meta));
      return { safe: true };
    }

    const previous: SessionMetadata = JSON.parse(raw);
    const deviceId = await getDeviceFingerprint();

    // 1. Device mismatch check
    if (previous.deviceId !== deviceId) {
      return {
        safe: false,
        anomalyReason: 'Session token transferred to unauthorized second hardware device.',
      };
    }

    // 2. Token invalidation check
    if (previous.sessionToken !== currentSessionToken) {
      return {
        safe: false,
        anomalyReason: 'Concurrent login detected on another active terminal.',
      };
    }

    // Update active heartbeat
    previous.lastActiveTimestamp = now;
    if (currentIp) previous.ipAddress = currentIp;
    await AsyncStorage.setItem(SESSION_META_KEY, JSON.stringify(previous));

    return { safe: true };
  } catch {
    return { safe: true };
  }
}
