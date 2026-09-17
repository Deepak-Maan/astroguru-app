import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const KEY = 'astroguru_anthropic_key';

/**
 * SecureStore is native-only. On web we fall back to localStorage so the
 * browser preview stays functional during development.
 *
 * NOTE: storing an API key on-device is acceptable for this MVP/testing build
 * only. A production app should proxy Claude calls through your own backend so
 * the key never ships to clients.
 */
async function readKey(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    }
    return await SecureStore.getItemAsync(KEY);
  } catch {
    return null;
  }
}

async function writeKey(value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, value);
      return;
    }
    await SecureStore.setItemAsync(KEY, value);
  } catch (e) {
    console.warn('Could not persist API key', e);
  }
}

async function deleteKey(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY);
      return;
    }
    await SecureStore.deleteItemAsync(KEY);
  } catch {
    /* ignore */
  }
}

interface SettingsState {
  apiKey: string | null;
  loaded: boolean;
  soundEnabled: boolean;
  morningMuhuratPushEnabled: boolean;
  load: () => Promise<void>;
  setApiKey: (key: string) => Promise<void>;
  clearApiKey: () => Promise<void>;
  toggleSound: () => void;
  toggleMorningMuhuratPush: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  apiKey: null,
  loaded: false,
  soundEnabled: true,
  morningMuhuratPushEnabled: true,
  load: async () => {
    const apiKey = await readKey();
    set({ apiKey, loaded: true });
  },
  setApiKey: async (key) => {
    const trimmed = key.trim();
    await writeKey(trimmed);
    set({ apiKey: trimmed || null });
  },
  clearApiKey: async () => {
    await deleteKey();
    set({ apiKey: null });
  },
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleMorningMuhuratPush: () =>
    set((s) => {
      const next = !s.morningMuhuratPushEnabled;
      return { morningMuhuratPushEnabled: next };
    }),
}));
