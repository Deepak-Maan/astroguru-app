/**
 * AstroGuru Production REST API Client
 * Interacts with Node.js Express REST Backend running on http://localhost:5000/api
 */

const LOCAL_URL = 'http://localhost:5000/api';
const PROD_URL = 'https://astroguru-backend-api.onrender.com/api';

const BASE_URL = typeof __DEV__ !== 'undefined' && __DEV__ ? LOCAL_URL : PROD_URL;

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

  // Real Chat System
  getChatMessages: async (astrologerId: string) =>
    request<{ success: boolean; messages: any[] }>(`/chat/messages/${astrologerId}`),

  sendChatMessage: async (astrologerId: string, userId: string, role: string, text: string) =>
    request<{ success: boolean; message: any }>('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ astrologerId, userId, role, text }),
    }),

  // Real Call System
  startCallSession: async (astrologerId: string, userId: string, callType: 'audio' | 'video' = 'audio') =>
    request<{ success: boolean; session: any }>('/consultations/call/start', {
      method: 'POST',
      body: JSON.stringify({ astrologerId, userId, callType }),
    }),

  endCallSession: async (callId: string, durationSeconds: number) =>
    request<{ success: boolean; summary: any }>('/consultations/call/end', {
      method: 'POST',
      body: JSON.stringify({ callId, durationSeconds }),
    }),

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
};
