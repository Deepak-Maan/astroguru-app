/**
 * AstroGuru Production REST API Client
 * Interacts with Node.js Express REST Backend running on http://localhost:5000/api
 */

import { Platform } from 'react-native';

const LOCAL_WEB_URL  = 'http://localhost:5000/api';
// Your machine's Wi-Fi LAN IP — Android/iOS on the same network will hit this
const LOCAL_LAN_URL  = 'http://192.168.31.252:5000/api';
const PROD_URL       = 'https://astroguru-backend-api.onrender.com/api';

// Web browser → localhost. Native app → LAN IP. Production → Render.
const BASE_URL =
  typeof __DEV__ !== 'undefined' && __DEV__
    ? Platform.OS === 'web'
      ? LOCAL_WEB_URL
      : LOCAL_LAN_URL
    : PROD_URL;

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[API Client] Connection to backend ${endpoint} failed. Using local fallback.`);
    return null;
  }
}

export const ApiClient = {
  baseUrl: BASE_URL,

  // Health
  checkHealth: async () => request<{ status: string; features: string[] }>('/health'),

  // Expert Auth
  expertLogin: async (email: string, password: string) => {
    const res = await request<{ success: boolean; expert?: any; token?: string; error?: string }>('/auth/expert/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res?.token) setAuthToken(res.token);
    return res;
  },

  expertSignup: async (expertData: Record<string, any>) => {
    const res = await request<{ success: boolean; expert?: any; message?: string; error?: string }>('/auth/expert/signup', {
      method: 'POST',
      body: JSON.stringify(expertData),
    });
    return res;
  },

  // Auth & JWT
  login: async (email: string, password: string) => {
    const res = await request<{ success: boolean; user?: any; token?: string; error?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res?.token) setAuthToken(res.token);
    return res;
  },

  // Astrologers
  getAstrologers: async () => request<{ success: boolean; astrologers: any[] }>('/astrologers'),
  checkUpdates: async () => request<{ success: boolean; updates: any }>('/updates/check'),
};
