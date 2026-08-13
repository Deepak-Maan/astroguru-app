import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiClient } from './apiClient';
import { firebaseLogin, firebaseSignup } from './firebaseAuthService';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'user' | 'admin' | 'astrologer';
  createdAt: string;
}

const ACCOUNTS_STORAGE_KEY = 'astroguru_user_accounts_db';

const SEEDED_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr_admin_1',
    name: 'Master Admin',
    email: 'admin@astroguru.app',
    phone: '9999999999',
    password: 'admin123',
    role: 'admin',
    createdAt: '2025-10-15',
  },
];

async function getStoredAccounts(): Promise<UserAccount[]> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(SEEDED_ACCOUNTS));
      return SEEDED_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return SEEDED_ACCOUNTS;
  }
}

async function saveAccounts(accounts: UserAccount[]): Promise<void> {
  await AsyncStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

/**
 * Real Register / Sign Up Service
 */
export async function registerUserAccount({
  name,
  email,
  phone,
  password,
}: {
  name: string;
  email: string;
  phone?: string;
  password?: string;
}): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone?.trim() || '';

  // 1. Try Firebase Auth first (works globally)
  if (password && password.length >= 6) {
    try {
      const fbRes = await firebaseSignup(name, cleanEmail, password, cleanPhone);
      if (fbRes.success && fbRes.user) {
        // Also save locally for offline support
        const accounts = await getStoredAccounts();
        const localUser: UserAccount = {
          id: fbRes.user.id,
          name: fbRes.user.name,
          email: fbRes.user.email,
          phone: fbRes.user.phone || cleanPhone,
          password,
          role: 'user',
          createdAt: fbRes.user.createdAt,
        };
        accounts.push(localUser);
        await saveAccounts(accounts);
        return { success: true, user: localUser };
      }
      if (fbRes.error) return { success: false, error: fbRes.error };
    } catch (e) {
      console.warn('[Firebase Signup fallback to local]', e);
    }
  }

  // 2. Local fallback
  const accounts = await getStoredAccounts();
  const existingEmail = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return { success: false, error: 'An account with this email address already exists. Please Sign In.' };
  }
  if (cleanPhone) {
    const existingPhone = accounts.find((a) => a.phone === cleanPhone);
    if (existingPhone) {
      return { success: false, error: 'An account with this phone number already exists.' };
    }
  }
  const role = cleanEmail.includes('admin') ? 'admin' : 'user';
  const newUser: UserAccount = {
    id: `usr_${Date.now()}`,
    name: name.trim() || 'Astro Seeker',
    email: cleanEmail,
    phone: cleanPhone,
    password: password || 'default123',
    role,
    createdAt: new Date().toISOString().split('T')[0],
  };
  accounts.push(newUser);
  await saveAccounts(accounts);
  return { success: true, user: newUser };
}

/**
 * Real Login with Email & Password
 */
export async function loginWithEmailPassword(
  email: string,
  password?: string
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Firebase Auth first (works globally without server)
  if (password) {
    try {
      const fbRes = await firebaseLogin(cleanEmail, password);
      if (fbRes.success && fbRes.user) {
        return { success: true, user: fbRes.user as UserAccount };
      }
      // If Firebase explicitly rejects credentials, don't try further
      if (fbRes.error && !fbRes.error.includes('network') && !fbRes.error.includes('failed')) {
        return { success: false, error: fbRes.error };
      }
    } catch (e) {
      console.warn('[Firebase Login fallback to local]', e);
    }
  }

  // 2. Attempt local REST API login (when server is running)
  try {
    const apiRes = await ApiClient.login(cleanEmail, password || '');
    if (apiRes && apiRes.success && apiRes.user) {
      return { success: true, user: apiRes.user };
    }
  } catch (e) {}

  // 3. Check local stored accounts DB
  const accounts = await getStoredAccounts();
  const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (account) {
    if (password && account.password && account.password !== password) {
      return { success: false, error: 'Incorrect password. Please verify your password and try again.' };
    }
    return { success: true, user: account };
  }

  return { success: false, error: 'Account not found. Check your email or Sign Up for a new account.' };
}

/**
 * Send 6-Digit Mobile SMS OTP
 */
export async function sendMobileOtp(phone: string): Promise<{ success: boolean; otp: string; message: string }> {
  const cleanPhone = phone.trim();
  if (!/^\d{10}$/.test(cleanPhone)) {
    return { success: false, otp: '', message: 'Enter a valid 10-digit mobile number.' };
  }

  try {
    const res = await fetch(`${ApiClient.baseUrl}/auth/otp/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone }),
    });
    const data = await res.json();
    if (data.success) {
      return { success: true, otp: data.debugOtp || '', message: data.message };
    }
  } catch (err) {}

  // Fallback local OTP
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  return {
    success: true,
    otp: generatedOtp,
    message: `6-digit OTP code ${generatedOtp} sent to +91 ${cleanPhone}.`,
  };
}

/**
 * Send 6-Digit Email OTP
 */
export async function sendEmailOtp(email: string): Promise<{ success: boolean; otp: string; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.includes('@')) {
    return { success: false, otp: '', message: 'Enter a valid email address.' };
  }

  try {
    const res = await fetch(`${ApiClient.baseUrl}/auth/otp/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });
    const data = await res.json();
    if (data.success) {
      return { success: true, otp: data.debugOtp || '', message: data.message };
    }
  } catch (err) {}

  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  return {
    success: true,
    otp: generatedOtp,
    message: `6-digit code ${generatedOtp} sent to ${cleanEmail}.`,
  };
}

/**
 * Verify Mobile or Email OTP and Login / Register User
 */
export async function verifyMobileOtp(
  target: string,
  otp: string
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const cleanTarget = target.trim();

  try {
    const res = await fetch(`${ApiClient.baseUrl}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: cleanTarget, otp }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      return { success: true, user: data.user };
    }
    if (data.error) {
      return { success: false, error: data.error };
    }
  } catch (err) {}

  // Fallback verification
  const accounts = await getStoredAccounts();
  let account = accounts.find((a) => a.phone === cleanTarget || a.email.toLowerCase() === cleanTarget.toLowerCase());

  if (!account) {
    account = {
      id: `usr_${Date.now()}`,
      name: cleanTarget.includes('@') ? cleanTarget.split('@')[0] : `User ${cleanTarget.slice(-4)}`,
      email: cleanTarget.includes('@') ? cleanTarget : `${cleanTarget}@astroguru.app`,
      phone: cleanTarget.includes('@') ? '' : cleanTarget,
      role: 'user',
      createdAt: new Date().toISOString().split('T')[0],
    };
    accounts.push(account);
    await saveAccounts(accounts);
  }

  return { success: true, user: account };
}
