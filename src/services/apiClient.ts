/**
 * AstroGuru Production REST API Client
 * Automatically connects to local REST server in dev, and production backend URL in live builds.
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
  // Base Config
  baseUrl: BASE_URL,

  // Health
  checkHealth: async () => request<{ status: string; features: string[] }>('/health'),

  // Auth & JWT
  login: async (email: string, password: string) => {
    const res = await request<{ success: boolean; user?: any; token?: string; error?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res?.token) setAuthToken(res.token);
    return res;
  },

  sendOtp: async (phone: string) =>
    request<{ success: boolean; message: string }>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: async (phone: string, otp: string) => {
    const res = await request<{ success: boolean; user?: any; token?: string; error?: string }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
    if (res?.token) setAuthToken(res.token);
    return res;
  },

  // Payment Webhooks
  processPaymentWebhook: async (paymentData: { paymentId?: string; amount: number; userId?: string }) =>
    request<{ success: boolean; message: string; payment: any }>('/webhooks/payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),

  // File Uploads
  uploadFile: async (fileName: string, base64Data: string) =>
    request<{ success: boolean; message: string; file: any }>('/upload', {
      method: 'POST',
      body: JSON.stringify({ fileName, base64Data }),
    }),

  // Cron Scheduler
  triggerCronJob: async (jobName: string) =>
    request<{ success: boolean; message: string; log: any }>('/cron/trigger', {
      method: 'POST',
      body: JSON.stringify({ jobName }),
    }),

  // Consultation Session Billing
  processLiveSessionBilling: async (astrologerId: string, userId: string, minutes: number) =>
    request<{ success: boolean; session: any; error?: string }>('/consultations/live-session', {
      method: 'POST',
      body: JSON.stringify({ astrologerId, userId, minutes }),
    }),

  // Astrologers
  getAstrologers: async () => request<{ success: boolean; astrologers: any[] }>('/astrologers'),
  updateAstrologer: async (id: string, updates: Record<string, any>) =>
    request<{ success: boolean; astrologer: any }>(`/astrologers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Remedies & Inventory
  getRemedies: async () => request<{ success: boolean; inventory: any[] }>('/remedies'),
  updateRemedyItem: async (id: string, updates: Record<string, any>) =>
    request<{ success: boolean; item: any }>(`/remedies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Spells
  getSpells: async () => request<{ success: boolean; spells: any[]; spellOrders: any[] }>('/spells'),
  placeSpellOrder: async (orderData: Record<string, any>) =>
    request<{ success: boolean; order: any }>('/spells/order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  // Orders
  getOrders: async () => request<{ success: boolean; orders: any[] }>('/orders'),
  placeOrder: async (orderData: Record<string, any>) =>
    request<{ success: boolean; order: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  // Updates
  checkUpdates: async () => request<{ success: boolean; updates: any }>('/updates/check'),
  broadcastUpdate: async (version: string, notes: string[], isMandatory: boolean) =>
    request<{ success: boolean; updates: any }>('/updates/broadcast', {
      method: 'POST',
      body: JSON.stringify({ version, notes, isMandatory }),
    }),
};
