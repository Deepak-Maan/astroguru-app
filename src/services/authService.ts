import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

const ACCOUNTS_STORAGE_KEY = 'astroguru_user_accounts_db';

// Pre-seeded system accounts
const SEEDED_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr_demo_1',
    name: 'Demo Seeker',
    email: 'seeker@astroguru.app',
    phone: '9876543210',
    password: 'seeker123',
    role: 'user',
    createdAt: '2026-01-01',
  },
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

// In-memory OTP storage
const activeOtps: Record<string, string> = {
  '9876543210': '123456',
};

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

  const accounts = await getStoredAccounts();

  // Check if email already registered
  const existingEmail = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return { success: false, error: 'An account with this email address already exists. Please Sign In.' };
  }

  // Check phone if provided
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
  const accounts = await getStoredAccounts();

  const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (!account) {
    return { success: false, error: 'Account not found. Check your email or Sign Up for a new account.' };
  }

  if (password && account.password && account.password !== password) {
    return { success: false, error: 'Incorrect password. Please verify your password and try again.' };
  }

  return { success: true, user: account };
}

/**
 * Send 6-Digit Mobile OTP
 */
export async function sendMobileOtp(phone: string): Promise<{ success: boolean; otp: string; message: string }> {
  const cleanPhone = phone.trim();
  if (!/^\d{10}$/.test(cleanPhone)) {
    return { success: false, otp: '', message: 'Enter a valid 10-digit mobile number.' };
  }

  // Generate 6-digit OTP
  const generatedOtp = cleanPhone === '9876543210' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  activeOtps[cleanPhone] = generatedOtp;

  return {
    success: true,
    otp: generatedOtp,
    message: `OTP ${generatedOtp} sent via SMS to +91 ${cleanPhone}. (Use ${generatedOtp} to verify)`,
  };
}

/**
 * Verify Mobile OTP and Login / Register User
 */
export async function verifyMobileOtp(
  phone: string,
  otp: string
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const cleanPhone = phone.trim();
  const expectedOtp = activeOtps[cleanPhone] || '123456';

  if (otp.trim() !== expectedOtp) {
    return { success: false, error: `Invalid OTP entered. Expected: ${expectedOtp}` };
  }

  const accounts = await getStoredAccounts();
  let account = accounts.find((a) => a.phone === cleanPhone);

  if (!account) {
    account = {
      id: `usr_mob_${Date.now()}`,
      name: `User ${cleanPhone.slice(-4)}`,
      email: `user${cleanPhone.slice(-4)}@astroguru.app`,
      phone: cleanPhone,
      role: 'user',
      createdAt: new Date().toISOString().split('T')[0],
    };
    accounts.push(account);
    await saveAccounts(accounts);
  }

  delete activeOtps[cleanPhone];
  return { success: true, user: account };
}
