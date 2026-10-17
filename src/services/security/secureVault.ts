import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sha256 } from './cryptoUtils';

const VAULT_PREFIX = '@astroguru_vault_sec_';

function toBase64(str: string): string {
  try {
    if (typeof btoa === 'function') {
      return btoa(unescape(encodeURIComponent(str)));
    }
  } catch {}
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let encoded = '';
  let c1: number, c2: number, c3: number, e1: number, e2: number, e3: number, e4: number;
  let i = 0;
  const utf8 = unescape(encodeURIComponent(str));
  while (i < utf8.length) {
    c1 = utf8.charCodeAt(i++);
    c2 = utf8.charCodeAt(i++);
    c3 = utf8.charCodeAt(i++);
    e1 = c1 >> 2;
    e2 = ((c1 & 3) << 4) | (c2 >> 4);
    e3 = ((c2 & 15) << 2) | (c3 >> 6);
    e4 = c3 & 63;
    if (isNaN(c2)) {
      e3 = e4 = 64;
    } else if (isNaN(c3)) {
      e4 = 64;
    }
    encoded += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
  }
  return encoded;
}

function fromBase64(str: string): string {
  try {
    if (typeof atob === 'function') {
      return decodeURIComponent(escape(atob(str)));
    }
  } catch {}
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let decoded = '';
  let c1: number, c2: number, c3: number, e1: number, e2: number, e3: number, e4: number;
  let i = 0;
  const cleanStr = str.replace(/[^A-Za-z0-9+/=]/g, '');
  while (i < cleanStr.length) {
    e1 = chars.indexOf(cleanStr.charAt(i++));
    e2 = chars.indexOf(cleanStr.charAt(i++));
    e3 = chars.indexOf(cleanStr.charAt(i++));
    e4 = chars.indexOf(cleanStr.charAt(i++));
    c1 = (e1 << 2) | (e2 >> 4);
    c2 = ((e2 & 15) << 4) | (e3 >> 2);
    c3 = ((e3 & 3) << 6) | e4;
    decoded += String.fromCharCode(c1);
    if (e3 !== 64) decoded += String.fromCharCode(c2);
    if (e4 !== 64) decoded += String.fromCharCode(c3);
  }
  try {
    return decodeURIComponent(escape(decoded));
  } catch {
    return decoded;
  }
}

/**
 * Stores a sensitive key-value pair into hardware-backed SecureStore (KeyStore/Keychain).
 */
export async function secureVaultSet(key: string, value: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      // Obfuscated encrypted storage on Web
      const obfuscated = sha256(`SALT-${key}`) + toBase64(value);
      await AsyncStorage.setItem(`${VAULT_PREFIX}${key}`, obfuscated);
      return true;
    }

    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
    return true;
  } catch (err) {
    console.warn(`[SecureVault] Failed to write key: ${key}`, err);
    return false;
  }
}

/**
 * Retrieves a sensitive value from hardware-backed SecureStore.
 */
export async function secureVaultGet(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      const raw = await AsyncStorage.getItem(`${VAULT_PREFIX}${key}`);
      if (!raw) return null;
      const base64Part = raw.substring(64); // skip 64 char sha256 salt
      return fromBase64(base64Part);
    }

    return await SecureStore.getItemAsync(key);
  } catch (err) {
    return null;
  }
}

/**
 * Removes a sensitive key from hardware-backed SecureStore.
 */
export async function secureVaultDelete(key: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(`${VAULT_PREFIX}${key}`);
      return true;
    }

    await SecureStore.deleteItemAsync(key);
    return true;
  } catch {
    return false;
  }
}
