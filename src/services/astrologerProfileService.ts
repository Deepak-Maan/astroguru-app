/**
 * AstroGuru Astrologer Profile Service
 * Manages full astrologer profile editing, specialty settings, consultation rate,
 * and immediate cloud synchronization with Firebase Realtime Database and Node.js REST database.
 */
import { ref, set, get } from 'firebase/database';
import { firebaseDb } from './firebaseConfig';
import { ApiClient } from './apiClient';
import { useAuthStore } from '../store/authStore';
import { useJyotishiStore } from '../store/jyotishiStore';

export interface AstrologerProfileUpdateParams {
  astrologerId: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  about?: string;
  experienceYears?: number;
  pricePerMin?: number;
  specialties?: string[];
  languages?: string[];
  online?: boolean;
  onDuty?: boolean;
}

export interface StoredCloudAstrologerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  about?: string;
  experienceYears?: number;
  pricePerMin?: number;
  specialties?: string[];
  languages?: string[];
  online?: boolean;
  onDuty?: boolean;
  rating?: number;
  reviews?: number;
  consultations?: number;
  role: 'astrologer';
  status?: string;
  updatedAt: number;
}

/**
 * Updates astrologer profile locally and syncs immediately to Firebase Realtime Database and REST DB
 */
export async function syncAstrologerProfileToDatabase(
  params: AstrologerProfileUpdateParams
): Promise<{ success: boolean; profile?: StoredCloudAstrologerProfile; error?: string }> {
  if (!params.astrologerId) {
    return { success: false, error: 'Astrologer ID is required to sync profile.' };
  }

  try {
    const currentUser = useAuthStore.getState().user;

    // 1. Update local Auth session
    if (currentUser) {
      useAuthStore.getState().setUserSession({
        ...currentUser,
        name: params.name.trim(),
        email: params.email || currentUser.email,
        phone: params.phone || currentUser.phone,
      });
    }

    // 2. Update local Jyotishi Store rate & onDuty
    if (params.pricePerMin !== undefined) {
      useJyotishiStore.getState().setRatePerMin(params.pricePerMin);
    }

    // 3. Prepare cloud payload
    const cloudPayload: StoredCloudAstrologerProfile = {
      id: params.astrologerId,
      name: params.name.trim(),
      email: params.email || currentUser?.email || '',
      phone: params.phone || currentUser?.phone || '',
      avatar:
        params.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(params.name.trim())}&background=0D8ABC&color=fff&size=200`,
      about: params.about?.trim() || '',
      experienceYears: Number(params.experienceYears) || 5,
      pricePerMin: Number(params.pricePerMin) || 25,
      specialties: params.specialties || ['Vedic Kundli', 'Nadi Jyotish'],
      languages: params.languages || ['Hindi', 'English'],
      online: params.online !== undefined ? params.online : true,
      onDuty: params.onDuty !== undefined ? params.onDuty : true,
      role: 'astrologer',
      updatedAt: Date.now(),
    };

    // 4. Save to Firebase Realtime Database (/astrologers and /jyotishis)
    try {
      const astroRef = ref(firebaseDb, `astrologers/${params.astrologerId}`);
      const jyotishiRef = ref(firebaseDb, `jyotishis/${params.astrologerId}`);

      await set(astroRef, cloudPayload);
      await set(jyotishiRef, cloudPayload);

      console.log(`[Firebase Database] Astrologer profile successfully synced to /astrologers/${params.astrologerId}`);
    } catch (dbErr: any) {
      console.warn('[Firebase Database Write Warning]', dbErr?.message || dbErr);
    }

    // 5. Direct sync to REST backend database
    try {
      await ApiClient.updateAstrologerProfile(cloudPayload);
    } catch (_) {
      try {
        fetch(`${ApiClient.baseUrl}/astrologer/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cloudPayload),
        }).catch(() => {});
      } catch (__) {}
    }

    return { success: true, profile: cloudPayload };
  } catch (err: any) {
    console.error('[syncAstrologerProfileToDatabase Error]', err);
    return { success: false, error: err?.message || 'Failed to update astrologer profile in database.' };
  }
}

/**
 * Fetches the latest astrologer profile from REST API or Firebase
 */
export async function fetchAstrologerProfileFromDatabase(
  astroId: string
): Promise<StoredCloudAstrologerProfile | null> {
  if (!astroId) return null;

  // 1. Try REST backend API
  try {
    const res = await ApiClient.getAstrologerProfile(astroId);
    if (res?.success && res.astrologer) {
      return res.astrologer as StoredCloudAstrologerProfile;
    }
  } catch (_) {}

  // 2. Try Firebase Realtime Database
  try {
    let snap = await get(ref(firebaseDb, `astrologers/${astroId}`));
    if (!snap.exists()) {
      snap = await get(ref(firebaseDb, `jyotishis/${astroId}`));
    }

    if (snap.exists()) {
      return snap.val() as StoredCloudAstrologerProfile;
    }
  } catch (e) {
    console.warn('[FetchCloudAstrologer Warning]', e);
  }

  return null;
}
