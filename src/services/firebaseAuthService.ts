/**
 * AstroGuru Firebase Auth + Realtime Database Service
 * Replaces local Express server - works worldwide
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { ref, set, get, onValue, off } from 'firebase/database';
import { firebaseAuth, firebaseDb } from './firebaseConfig';

export interface FirebaseUserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'astrologer';
  wallet?: number;
  avatar?: string;
  createdAt: string;
}

export interface FirebaseJyotishiProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'astrologer';
  pricePerMin: number;
  rating: number;
  reviews: number;
  specialties: string[];
  languages: string[];
  experienceYears: number;
  about: string;
  avatar?: string;
  online: boolean;
  consultations: number;
  createdAt: string;
  updatedAt: number;
}

export async function firebaseSignup(
  name: string,
  email: string,
  password: string,
  phone?: string
): Promise<{ success: boolean; user?: FirebaseUserProfile; error?: string }> {
  try {
    const credential = await createUserWithEmailAndPassword(
      firebaseAuth, email.trim().toLowerCase(), password
    );
    const fbUser = credential.user;
    await updateProfile(fbUser, { displayName: name.trim() });
    const profile: FirebaseUserProfile = {
      id: fbUser.uid,
      name: name.trim(),
      email: fbUser.email || email,
      phone: phone || '',
      role: 'user',
      wallet: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    await set(ref(firebaseDb, 'users/' + fbUser.uid), profile);
    return { success: true, user: profile };
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use')
      return { success: false, error: 'This email is already registered. Please Sign In.' };
    if (err.code === 'auth/weak-password')
      return { success: false, error: 'Password must be at least 6 characters.' };
    if (err.code === 'auth/invalid-email')
      return { success: false, error: 'Please enter a valid email address.' };
    return { success: false, error: err.message || 'Registration failed. Please try again.' };
  }
}

export async function firebaseLogin(
  email: string,
  password: string
): Promise<{ success: boolean; user?: FirebaseUserProfile; error?: string }> {
  try {
    const credential = await signInWithEmailAndPassword(
      firebaseAuth, email.trim().toLowerCase(), password
    );
    const fbUser = credential.user;
    const snap = await get(ref(firebaseDb, 'users/' + fbUser.uid));
    const profile: FirebaseUserProfile = snap.exists()
      ? snap.val()
      : {
          id: fbUser.uid,
          name: fbUser.displayName || 'Seeker',
          email: fbUser.email || email,
          phone: '',
          role: 'user',
          wallet: 0,
          createdAt: new Date().toISOString().split('T')[0],
        };
    if (!snap.exists()) await set(ref(firebaseDb, 'users/' + fbUser.uid), profile);
    return { success: true, user: profile };
  } catch (err: any) {
    if (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/wrong-password'
    )
      return { success: false, error: 'Invalid email or password. Please check and try again.' };
    if (err.code === 'auth/too-many-requests')
      return { success: false, error: 'Too many failed attempts. Please try again later.' };
    return { success: false, error: err.message || 'Sign in failed. Please try again.' };
  }
}

export async function firebaseExpertSignup(expertData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  specialties?: string[];
  languages?: string[];
  experienceYears?: string | number;
  pricePerMin?: string | number;
  about?: string;
}): Promise<{ success: boolean; expert?: FirebaseJyotishiProfile; error?: string }> {
  try {
    const credential = await createUserWithEmailAndPassword(
      firebaseAuth, expertData.email.trim().toLowerCase(), expertData.password
    );
    const fbUser = credential.user;
    await updateProfile(fbUser, { displayName: expertData.name.trim() });
    const profile: FirebaseJyotishiProfile = {
      id: fbUser.uid,
      name: expertData.name.trim(),
      email: fbUser.email || expertData.email,
      phone: expertData.phone || '',
      role: 'astrologer',
      pricePerMin: Number(expertData.pricePerMin) || 25,
      rating: 5.0,
      reviews: 0,
      specialties: expertData.specialties || ['Vedic Astrology'],
      languages: expertData.languages || ['Hindi', 'English'],
      experienceYears: Number(expertData.experienceYears) || 1,
      about: expertData.about || 'Certified Vedic Jyotish Expert',
      avatar:
        'https://ui-avatars.com/api/?name=' +
        encodeURIComponent(expertData.name) +
        '&background=0D8ABC&color=fff&size=200',
      online: true,
      consultations: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: Date.now(),
    };
    await set(ref(firebaseDb, 'jyotishis/' + fbUser.uid), profile);
    await set(ref(firebaseDb, 'astrologers/' + fbUser.uid), profile);
    return { success: true, expert: profile };
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use')
      return { success: false, error: 'This email is already registered. Please use Expert Sign In.' };
    if (err.code === 'auth/weak-password')
      return { success: false, error: 'Password must be at least 6 characters.' };
    return { success: false, error: err.message || 'Expert registration failed. Please try again.' };
  }
}

export async function firebaseExpertLogin(
  email: string,
  password: string
): Promise<{ success: boolean; expert?: FirebaseJyotishiProfile; error?: string }> {
  try {
    const credential = await signInWithEmailAndPassword(
      firebaseAuth, email.trim().toLowerCase(), password
    );
    const fbUser = credential.user;
    let snap = await get(ref(firebaseDb, 'jyotishis/' + fbUser.uid));
    if (!snap.exists()) snap = await get(ref(firebaseDb, 'astrologers/' + fbUser.uid));
    if (snap.exists()) {
      const profile = { ...snap.val(), role: 'astrologer' } as FirebaseJyotishiProfile;
      return { success: true, expert: profile };
    }
    // Auto-create profile if not found
    const autoProfile: FirebaseJyotishiProfile = {
      id: fbUser.uid,
      name: fbUser.displayName || email.split('@')[0],
      email: fbUser.email || email,
      phone: '',
      role: 'astrologer',
      pricePerMin: 25,
      rating: 5.0,
      reviews: 0,
      specialties: ['Vedic Astrology'],
      languages: ['Hindi', 'English'],
      experienceYears: 1,
      about: 'Certified Vedic Jyotish Expert',
      online: true,
      consultations: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: Date.now(),
    };
    await set(ref(firebaseDb, 'jyotishis/' + fbUser.uid), autoProfile);
    return { success: true, expert: autoProfile };
  } catch (err: any) {
    if (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/wrong-password'
    )
      return { success: false, error: 'Invalid email or password. Please check and try again.' };
    if (err.code === 'auth/too-many-requests')
      return { success: false, error: 'Too many failed attempts. Please try again later.' };
    return { success: false, error: err.message || 'Expert sign in failed. Please try again.' };
  }
}

export async function firebaseSignOut(): Promise<void> {
  try {
    await signOut(firebaseAuth);
  } catch (e) {
    console.warn('[Firebase Sign Out Error]', e);
  }
}

export async function fetchJyotishisFromFirebase(): Promise<FirebaseJyotishiProfile[]> {
  try {
    const snap = await get(ref(firebaseDb, 'jyotishis'));
    if (!snap.exists()) return [];
    return Object.values(snap.val()) as FirebaseJyotishiProfile[];
  } catch (err) {
    console.warn('[Firebase Jyotishi Fetch Error]', err);
    return [];
  }
}

export function subscribeToJyotishis(
  callback: (list: FirebaseJyotishiProfile[]) => void
) {
  const jyotishisRef = ref(firebaseDb, 'jyotishis');
  onValue(jyotishisRef, (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }
    callback(Object.values(snap.val()) as FirebaseJyotishiProfile[]);
  });
  return () => off(jyotishisRef);
}

export async function setJyotishiOnlineStatus(uid: string, online: boolean) {
  try {
    await set(ref(firebaseDb, 'jyotishis/' + uid + '/online'), online);
    await set(ref(firebaseDb, 'astrologers/' + uid + '/online'), online);
  } catch (e) {
    console.warn('[Firebase Online Status Error]', e);
  }
}

export async function migrateLocalJyotishisToFirebase(localAstrologers: any[]) {
  for (const a of localAstrologers) {
    if (!a.id || !a.email) continue;
    const profile: FirebaseJyotishiProfile = {
      id: a.id,
      name: a.name || 'Jyotishi',
      email: a.email,
      phone: a.phone || '',
      role: 'astrologer',
      pricePerMin: Number(a.pricePerMin) || 25,
      rating: Number(a.rating) || 5.0,
      reviews: Number(a.reviews) || 0,
      specialties: a.specialties || ['Vedic Astrology'],
      languages: a.languages || ['Hindi', 'English'],
      experienceYears: Number(a.experienceYears) || 1,
      about: a.about || 'Certified Vedic Jyotish Expert',
      avatar: a.avatar || '',
      online: a.online !== false,
      consultations: Number(a.consultations) || 0,
      createdAt: a.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: Date.now(),
    };
    await set(ref(firebaseDb, 'jyotishis/' + a.id), profile);
    await set(ref(firebaseDb, 'astrologers/' + a.id), profile);
    console.log('[Firebase Migration] Seeded Jyotishi: ' + a.name);
  }
}