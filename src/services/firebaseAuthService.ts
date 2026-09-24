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
    try {
      await set(ref(firebaseDb, 'users/' + fbUser.uid), profile);
    } catch (e) {
      console.warn('[Firebase user set profile warning]', e);
    }
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
    let profile: FirebaseUserProfile = {
      id: fbUser.uid,
      name: fbUser.displayName || 'Seeker',
      email: fbUser.email || email,
      phone: '',
      role: 'user',
      wallet: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    try {
      const snap = await get(ref(firebaseDb, 'users/' + fbUser.uid));
      if (snap.exists()) {
        profile = snap.val();
      } else {
        await set(ref(firebaseDb, 'users/' + fbUser.uid), profile);
      }
    } catch (dbErr) {
      console.warn('[Firebase user login read warning]', dbErr);
    }
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
  const cleanEmail = expertData.email.trim().toLowerCase();
  let fbUser: any = null;

  try {
    const credential = await createUserWithEmailAndPassword(
      firebaseAuth, cleanEmail, expertData.password
    );
    fbUser = credential.user;
  } catch (authErr: any) {
    if (authErr.code === 'auth/email-already-in-use') {
      // If user was created previously but database write failed, authenticate and recover!
      try {
        const loginCred = await signInWithEmailAndPassword(firebaseAuth, cleanEmail, expertData.password);
        fbUser = loginCred.user;
      } catch (_) {
        return { success: false, error: 'This email is already registered. Please use Expert Sign In.' };
      }
    } else if (authErr.code === 'auth/weak-password') {
      return { success: false, error: 'Password must be at least 6 characters.' };
    } else if (authErr.code === 'auth/invalid-email') {
      return { success: false, error: 'Please enter a valid email address.' };
    } else {
      return { success: false, error: authErr.message || 'Expert registration failed. Please try again.' };
    }
  }

  if (!fbUser) {
    return { success: false, error: 'Failed to authenticate expert account.' };
  }

  try {
    await updateProfile(fbUser, { displayName: expertData.name.trim() });
  } catch (_) {}

  const profile: FirebaseJyotishiProfile = {
    id: fbUser.uid,
    name: expertData.name.trim(),
    email: fbUser.email || cleanEmail,
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

  // 1. Write to users/${fbUser.uid} (permitted under default Firebase auth.uid === $uid rule)
  try {
    await set(ref(firebaseDb, 'users/' + fbUser.uid), {
      id: fbUser.uid,
      name: expertData.name.trim(),
      email: fbUser.email || cleanEmail,
      phone: expertData.phone || '',
      role: 'astrologer',
      wallet: 0,
      createdAt: new Date().toISOString().split('T')[0],
    });
  } catch (dbErr) {
    console.warn('[Firebase Expert set users node warning]', dbErr);
  }

  // 2. Best-effort write to jyotishis and astrologers (will not crash if RTDB rules restrict custom nodes)
  try {
    await set(ref(firebaseDb, 'jyotishis/' + fbUser.uid), profile);
  } catch (dbErr) {
    console.warn('[Firebase Expert set jyotishis node warning - permission restricted on RTDB]', dbErr);
  }

  try {
    await set(ref(firebaseDb, 'astrologers/' + fbUser.uid), profile);
  } catch (dbErr) {
    console.warn('[Firebase Expert set astrologers node warning - permission restricted on RTDB]', dbErr);
  }

  return { success: true, expert: profile };
}

export async function firebaseExpertLogin(
  email: string,
  password: string
): Promise<{ success: boolean; expert?: FirebaseJyotishiProfile; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const credential = await signInWithEmailAndPassword(
      firebaseAuth, cleanEmail, password
    );
    const fbUser = credential.user;

    let profileData: any = null;

    // 1. Try reading jyotishis
    try {
      const snap = await get(ref(firebaseDb, 'jyotishis/' + fbUser.uid));
      if (snap.exists()) profileData = snap.val();
    } catch (e) {
      console.warn('[Firebase read jyotishis warning]', e);
    }

    // 2. Try reading astrologers
    if (!profileData) {
      try {
        const snap = await get(ref(firebaseDb, 'astrologers/' + fbUser.uid));
        if (snap.exists()) profileData = snap.val();
      } catch (e) {
        console.warn('[Firebase read astrologers warning]', e);
      }
    }

    // 3. Try reading users
    if (!profileData) {
      try {
        const snap = await get(ref(firebaseDb, 'users/' + fbUser.uid));
        if (snap.exists()) profileData = snap.val();
      } catch (e) {
        console.warn('[Firebase read users warning]', e);
      }
    }

    const expertProfile: FirebaseJyotishiProfile = {
      id: fbUser.uid,
      name: profileData?.name || fbUser.displayName || cleanEmail.split('@')[0],
      email: fbUser.email || cleanEmail,
      phone: profileData?.phone || '',
      role: 'astrologer',
      pricePerMin: profileData?.pricePerMin || 25,
      rating: profileData?.rating || 5.0,
      reviews: profileData?.reviews || 0,
      specialties: profileData?.specialties || ['Vedic Astrology'],
      languages: profileData?.languages || ['Hindi', 'English'],
      experienceYears: profileData?.experienceYears || 1,
      about: profileData?.about || 'Certified Vedic Jyotish Expert',
      avatar:
        profileData?.avatar ||
        'https://ui-avatars.com/api/?name=' +
          encodeURIComponent(fbUser.displayName || 'Astrologer') +
          '&background=0D8ABC&color=fff&size=200',
      online: true,
      consultations: profileData?.consultations || 0,
      createdAt: profileData?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: Date.now(),
    };

    // Best-effort write back to jyotishis (silent if permission denied)
    try {
      await set(ref(firebaseDb, 'jyotishis/' + fbUser.uid), expertProfile);
    } catch (_) {}

    return { success: true, expert: expertProfile };
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
  try {
    onValue(
      jyotishisRef,
      (snap) => {
        if (!snap.exists()) {
          callback([]);
          return;
        }
        callback(Object.values(snap.val()) as FirebaseJyotishiProfile[]);
      },
      (err) => {
        console.warn('[Firebase subscribeToJyotishis warning]', err);
        callback([]);
      }
    );
  } catch (err) {
    console.warn('[Firebase subscribeToJyotishis sync error]', err);
    callback([]);
  }
  return () => {
    try {
      off(jyotishisRef);
    } catch (_) {}
  };
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
    try {
      await set(ref(firebaseDb, 'jyotishis/' + a.id), profile);
      await set(ref(firebaseDb, 'astrologers/' + a.id), profile);
      console.log('[Firebase Migration] Seeded Jyotishi: ' + a.name);
    } catch (migErr) {
      console.warn('[Firebase Migration Warning for ' + a.name + ']', migErr);
    }
  }
}

export async function getAstrologerByIdFromFirebase(id: string): Promise<any | null> {
  if (!id) return null;
  try {
    let snap = await get(ref(firebaseDb, 'jyotishis/' + id));
    if (!snap.exists()) {
      snap = await get(ref(firebaseDb, 'astrologers/' + id));
    }
    if (snap.exists()) {
      const a = snap.val();
      return {
        id: a.id || id,
        name: a.name || 'Jyotishi',
        avatar: a.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        rating: Number(a.rating) || 5.0,
        reviews: Number(a.reviews) || 1,
        pricePerMin: Number(a.pricePerMin) || 25,
        experienceYears: Number(a.experienceYears) || 10,
        specialties: a.specialties || ['Vedic Astrology'],
        languages: a.languages || ['Hindi', 'English'],
        consultations: Number(a.consultations) || 0,
        online: a.online ?? true,
        about: a.about || 'Certified Vedic Jyotish Expert',
      };
    }
  } catch (e) {
    console.warn('[Firebase Single Jyotishi Fetch Error]', e);
  }
  return null;
}