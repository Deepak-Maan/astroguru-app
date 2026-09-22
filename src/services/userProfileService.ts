/**
 * AstroGuru User Profile Service
 * Manages full user profile editing, Kundli recomputation,
 * and immediate cloud synchronization with Firebase Realtime Database.
 */
import { ref, set, get } from 'firebase/database';
import { firebaseDb } from './firebaseConfig';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';
import { computeKundli } from './astrology';
import { City, BirthProfile, Kundli } from '../types';

export interface UserProfileUpdateParams {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  avatar?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  place?: City;
  gotra?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'separated' | 'other';
  isApproxTime?: boolean;
}

export interface StoredCloudProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  placeDetails?: City;
  gotra?: string;
  maritalStatus?: string;
  role: string;
  wallet?: number;
  kundliSummary?: {
    lagnaIndex: number;
    moonRashiIndex: number;
    moonNakshatraIndex: number;
    sunRashiIndex: number;
    mangalDosha: boolean;
  };
  updatedAt: number;
}

/**
 * Updates user profile locally and syncs immediately to Firebase Realtime Database
 */
export async function syncUserProfileToDatabase(
  params: UserProfileUpdateParams
): Promise<{ success: boolean; profile?: StoredCloudProfile; error?: string }> {
  if (!params.userId) {
    return { success: false, error: 'User ID is required to sync profile.' };
  }

  try {
    const currentUser = useAuthStore.getState().user;
    let computedKundli: Kundli | null = null;

    // 1. Recompute Kundli if complete birth details are present
    if (params.date && params.time && params.place) {
      const birthProfile: BirthProfile = {
        name: params.name.trim(),
        gender: params.gender || 'male',
        date: params.date,
        time: params.time,
        place: params.place,
        isApproxTime: params.isApproxTime,
      };

      try {
        computedKundli = computeKundli(birthProfile);
        useUserStore.getState().setProfile(birthProfile);
      } catch (e) {
        console.warn('[Kundli Recomputation Note]', e);
      }
    }

    // 2. Update local Auth session
    if (currentUser) {
      useAuthStore.getState().setUserSession({
        ...currentUser,
        name: params.name.trim(),
        email: params.email || currentUser.email,
        phone: params.phone || currentUser.phone,
      });
    }

    // 3. Prepare cloud database payload
    const cloudPayload: StoredCloudProfile = {
      id: params.userId,
      name: params.name.trim(),
      email: params.email || currentUser?.email || '',
      phone: params.phone || currentUser?.phone || '',
      gender: params.gender || 'male',
      avatar: params.avatar || '',
      dateOfBirth: params.date || '',
      timeOfBirth: params.time || '',
      placeOfBirth: params.place?.name || '',
      placeDetails: params.place || undefined,
      gotra: params.gotra?.trim() || '',
      maritalStatus: params.maritalStatus || 'single',
      role: currentUser?.role || 'user',
      wallet: useWalletStore.getState().balance || 0,
      kundliSummary: computedKundli
        ? {
            lagnaIndex: computedKundli.lagnaIndex,
            moonRashiIndex: computedKundli.moonRashiIndex,
            moonNakshatraIndex: computedKundli.moonNakshatraIndex,
            sunRashiIndex: computedKundli.sunRashiIndex,
            mangalDosha: computedKundli.mangalDosha,
          }
        : undefined,
      updatedAt: Date.now(),
    };

    // 4. Save to Firebase Realtime Database (/users and /seekers)
    try {
      const userRef = ref(firebaseDb, `users/${params.userId}`);
      const seekerRef = ref(firebaseDb, `seekers/${params.userId}`);

      await set(userRef, cloudPayload);
      await set(seekerRef, cloudPayload);

      console.log(`[Firebase Database] User profile successfully synced to /users/${params.userId} and /seekers/${params.userId}`);
    } catch (dbErr: any) {
      console.warn('[Firebase Database Write Warning]', dbErr?.message || dbErr);
    }

    // 5. Non-blocking sync to REST backend server if running
    try {
      fetch('http://localhost:5000/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cloudPayload),
      }).catch(() => {});
    } catch (_) {}

    return { success: true, profile: cloudPayload };
  } catch (err: any) {
    console.error('[syncUserProfileToDatabase Error]', err);
    return { success: false, error: err?.message || 'Failed to update profile in database.' };
  }
}

/**
 * Fetches the latest user profile from Firebase Realtime Database
 */
export async function fetchUserProfileFromDatabase(
  userId: string
): Promise<StoredCloudProfile | null> {
  if (!userId) return null;

  try {
    let snap = await get(ref(firebaseDb, `users/${userId}`));
    if (!snap.exists()) {
      snap = await get(ref(firebaseDb, `seekers/${userId}`));
    }

    if (snap.exists()) {
      const cloudData = snap.val() as StoredCloudProfile;

      // Sync back into local stores if details are present
      if (cloudData.dateOfBirth && cloudData.timeOfBirth && cloudData.placeDetails) {
        useUserStore.getState().setProfile({
          name: cloudData.name,
          gender: cloudData.gender || 'male',
          date: cloudData.dateOfBirth,
          time: cloudData.timeOfBirth,
          place: cloudData.placeDetails,
        });
      }

      return cloudData;
    }
  } catch (e) {
    console.warn('[FetchCloudProfile Warning]', e);
  }

  return null;
}
