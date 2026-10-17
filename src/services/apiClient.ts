/**
 * AstroGuru Production REST API Client
 * Interacts with Node.js Express REST Backend running on http://localhost:5000/api
 */

import { Platform } from 'react-native';
import {
  validateTlsConnection,
  signApiRequest,
  getDeviceFingerprint,
  isDeviceBlacklisted,
  triggerHoneypotTrap,
  HONEYPOT_TRAP_ENDPOINTS,
} from './security';

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
    // 1. Honeypot check
    if (HONEYPOT_TRAP_ENDPOINTS.includes(endpoint)) {
      await triggerHoneypotTrap(endpoint);
      return null;
    }

    // 2. Blacklist check
    if (await isDeviceBlacklisted()) {
      console.warn('[Security Guard] Request blocked: device is quarantined.');
      return null;
    }

    const targetUrl = `${BASE_URL}${endpoint}`;

    // 3. SSL Pinning / Proxy loopback validation
    const tlsCheck = validateTlsConnection(targetUrl);
    if (!tlsCheck.isSecure) {
      console.warn(`[Security Alert] MITM Proxy detected: ${tlsCheck.details}`);
      return null;
    }

    // 4. Cryptographic Request Signing with Dynamic Nonce & Device ID
    const deviceId = await getDeviceFingerprint();
    const method = options?.method || 'GET';
    const signedHeaders = signApiRequest({
      method,
      endpoint,
      payload: options?.body,
      deviceId,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...signedHeaders,
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(targetUrl, {
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

  // User Profile
  updateUserProfile: async (profileData: Record<string, any>) => {
    return request<{ success: boolean; user?: any; message?: string; error?: string }>('/user/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },
  getUserProfile: async (userId: string) => {
    return request<{ success: boolean; user?: any }>(`/user/profile/${userId}`);
  },

  // Astrologer Profile
  updateAstrologerProfile: async (profileData: Record<string, any>) => {
    return request<{ success: boolean; astrologer?: any; message?: string; error?: string }>('/astrologer/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },
  getAstrologerProfile: async (astroId: string) => {
    return request<{ success: boolean; astrologer?: any }>(`/astrologer/profile/${astroId}`);
  },
};
