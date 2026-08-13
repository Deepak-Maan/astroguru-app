import { firebaseDb } from './firebaseConfig';
import { ref, set, onValue, push, serverTimestamp, off, get } from 'firebase/database';

export interface FirebaseChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'seeker' | 'acharya' | 'system';
  text: string;
  timestamp: number;
}

export interface FirebaseLiveRoom {
  roomId: string;
  seekerId: string;
  seekerName: string;
  astrologerId: string;
  astrologerName: string;
  status: 'waiting' | 'active' | 'ended';
  startedAt?: number;
  ratePerMin: number;
  minutesBilled: number;
  lastMessage?: string;
  updatedAt: number;
}

/**
 * Sync Live Chat Message to Firebase Realtime Database
 */
export async function pushMessageToFirebase(roomId: string, msg: { id?: string; senderId?: string; senderName?: string; senderRole?: 'seeker' | 'acharya' | 'system'; text: string }) {
  if (!roomId || !msg.text) return;
  const cleanRoomId = String(roomId).replace(/[.#$\[\]\/]/g, '_');
  try {
    const msgId = msg.id || push(ref(firebaseDb, `rooms/${cleanRoomId}/messages`)).key || `msg_${Date.now()}`;
    const targetMsgRef = ref(firebaseDb, `rooms/${cleanRoomId}/messages/${msgId}`);
    const cleanMsg: FirebaseChatMessage = {
      id: msgId,
      senderId: msg.senderId || 'user',
      senderName: msg.senderName || 'User',
      senderRole: msg.senderRole || 'seeker',
      text: msg.text || '',
      timestamp: Date.now(),
    };
    await set(targetMsgRef, cleanMsg);

    // Update room metadata
    const roomRef = ref(firebaseDb, `rooms/${cleanRoomId}/lastMessage`);
    await set(roomRef, cleanMsg.text);
  } catch (e: any) {
    console.warn('[Firebase Realtime Push Warning]', e?.message || e);
  }
}

/**
 * Subscribe to Live Room Chat Messages in Real Time
 */
export function subscribeToFirebaseRoomMessages(roomId: string, callback: (messages: FirebaseChatMessage[]) => void) {
  if (!roomId) {
    callback([]);
    return () => {};
  }
  const cleanRoomId = String(roomId).replace(/[.#$\[\]\/]/g, '_');
  const messagesRef = ref(firebaseDb, `rooms/${cleanRoomId}/messages`);
  
  onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const msgs: FirebaseChatMessage[] = Object.values(data);
    msgs.sort((a, b) => a.timestamp - b.timestamp);
    callback(msgs);
  });

  return () => off(messagesRef);
}

/**
 * Set Astrologer Live On Duty Presence in Firebase
 */
export async function setAstrologerDutyStatus(astrologerId: string, isOnDuty: boolean, name: string) {
  try {
    const dutyRef = ref(firebaseDb, `astrologers/${astrologerId}/presence`);
    await set(dutyRef, {
      isOnDuty,
      name,
      lastSeen: Date.now(),
    });
  } catch (e) {
    console.warn('[Firebase Presence Update Error]', e);
  }
}

/**
 * Subscribe to Astrologer Presence
 */
export function subscribeToAstrologerPresence(astrologerId: string, callback: (status: { isOnDuty: boolean; lastSeen: number }) => void) {
  const presenceRef = ref(firebaseDb, `astrologers/${astrologerId}/presence`);
  onValue(presenceRef, (snapshot) => {
    const val = snapshot.val();
    callback(val || { isOnDuty: true, lastSeen: Date.now() });
  });
  return () => off(presenceRef);
}

/**
 * Sync Seeker Account Data to Firebase Cloud Database
 */
export async function syncUserToFirebase(user: { id: string; name: string; email?: string; phone?: string; role: string; wallet?: number }) {
  if (!user || !user.id) return;
  try {
    const userRef = ref(firebaseDb, `users/${user.id}`);
    const seekerRef = ref(firebaseDb, `seekers/${user.id}`);
    const payload = {
      ...user,
      updatedAt: Date.now(),
    };
    await set(userRef, payload);
    await set(seekerRef, payload);
    console.log(`[Firebase Cloud Sync] User ${user.name} synced to Firebase /users and /seekers!`);
  } catch (e) {
    console.warn('[Firebase User Sync Warning]', e);
  }
}

/**
 * Sync Certified Jyotishi Profile to Firebase Cloud Database
 */
export async function syncAstrologerToFirebase(astro: {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  pricePerMin?: number;
  rating?: number;
  specialties?: string[];
  languages?: string[];
  online?: boolean;
  about?: string;
}) {
  if (!astro || !astro.id) return;
  try {
    const astroRef = ref(firebaseDb, `astrologers/${astro.id}`);
    const jyotishiRef = ref(firebaseDb, `jyotishis/${astro.id}`);
    const payload = {
      ...astro,
      role: 'astrologer',
      updatedAt: Date.now(),
    };
    await set(astroRef, payload);
    await set(jyotishiRef, payload);
    console.log(`[Firebase Cloud Sync] Jyotishi ${astro.name} synced to Firebase /astrologers and /jyotishis!`);
  } catch (e) {
    console.warn('[Firebase Jyotishi Sync Warning]', e);
  }
}

/**
 * Seed all default Seekers & Astrologers into Firebase Cloud Database
 */
export async function seedAllUsersAndAstrologersToFirebase(astrologersList: any[]) {
  try {
    // Seed default Seekers
    await syncUserToFirebase({
      id: 'usr_demo_1',
      name: 'Demo Seeker',
      email: 'user@astroguru.app',
      phone: '9876543210',
      role: 'user',
      wallet: 310,
    });

    await syncUserToFirebase({
      id: 'usr_admin_1',
      name: 'Master Admin',
      email: 'admin@astroguru.app',
      phone: '9999999999',
      role: 'admin',
      wallet: 9999,
    });

    // Seed Astrologers
    await syncAstrologerToFirebase({
      id: 'astro-1',
      name: 'Acharya Dev Sharma',
      email: 'acharya@astroguru.app',
      phone: '9876543211',
      pricePerMin: 25,
      rating: 4.9,
      specialties: ['Vedic Astrology', 'Kundli Prashna'],
      languages: ['Hindi', 'English'],
      online: true,
      about: 'Senior Vedic scholar specializing in planetary remedies.',
    });

    await syncAstrologerToFirebase({
      id: 'astro_1786457216977',
      name: 'Vivek Kumar',
      email: 'vivek@gmail.com',
      phone: '8950512977',
      pricePerMin: 25,
      rating: 5.0,
      specialties: ['Vedic Astrology', 'Kundli Prashna'],
      languages: ['Hindi', 'English'],
      online: true,
      about: 'Certified Vedic Jyotish Expert',
    });

    if (Array.isArray(astrologersList)) {
      for (const a of astrologersList) {
        await syncAstrologerToFirebase(a);
      }
    }
  } catch (e) {
    console.warn('[Firebase Seed Warning]', e);
  }
}

/**
 * Sync Live Room Metadata to Firebase Realtime Database
 */
export async function syncRoomMetadataToFirebase(room: {
  roomId: string;
  seekerId: string;
  seekerName: string;
  astrologerId: string;
  astrologerName: string;
  topic?: string;
  ratePerMin?: number;
  status: string;
  lastMessage?: string;
}) {
  if (!room || !room.roomId || !room.astrologerId) return;

  const cleanRoomId = String(room.roomId).replace(/[.#$\[\]\/]/g, '_');
  const cleanAstrologerId = String(room.astrologerId).replace(/[.#$\[\]\/]/g, '_');

  const payload = {
    roomId: cleanRoomId,
    seekerId: room.seekerId || 'usr_seeker',
    seekerName: room.seekerName || 'Seeker',
    astrologerId: cleanAstrologerId,
    astrologerName: room.astrologerName || 'Acharya',
    topic: room.topic || 'Vedic Astrology Consultation',
    ratePerMin: Number(room.ratePerMin) || 25,
    status: room.status || 'waiting',
    lastMessage: room.lastMessage || 'New consultation request',
    updatedAt: Date.now(),
  };

  try {
    const roomInfoRef = ref(firebaseDb, `rooms/${cleanRoomId}/info`);
    await set(roomInfoRef, payload);

    // Index under /astrologer_rooms/{astrologerId}/{roomId}
    const indexRef = ref(firebaseDb, `astrologer_rooms/${cleanAstrologerId}/${cleanRoomId}`);
    await set(indexRef, {
      roomId: cleanRoomId,
      seekerId: payload.seekerId,
      seekerName: payload.seekerName,
      status: payload.status,
      lastMessage: payload.lastMessage,
      updatedAt: Date.now(),
    });
  } catch (e: any) {
    console.warn('[Firebase Room Metadata Sync Warning]', e?.message || e);
  }
}

/**
 * Subscribe to Acharya's Incoming Consultation Rooms in Real Time
 */
export function subscribeToAcharyaRoomsInFirebase(astrologerId: string, callback: (rooms: any[]) => void) {
  const cleanAstrologerId = String(astrologerId).replace(/[.#$\[\]\/]/g, '_');
  const acharyaRoomsRef = ref(firebaseDb, `astrologer_rooms/${cleanAstrologerId}`);
  onValue(acharyaRoomsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const roomsList = Object.values(data);
    roomsList.sort((a: any, b: any) => (b.updatedAt || 0) - (a.updatedAt || 0));
    callback(roomsList);
  });
  return () => off(acharyaRoomsRef);
}

/**
 * Initiate an Audio or Video Call in Firebase Realtime Database
 */
export async function initiateCallInFirebase(callData: {
  callId: string;
  seekerId: string;
  seekerName: string;
  astrologerId: string;
  astrologerName: string;
  type: 'audio' | 'video';
  ratePerMin: number;
}) {
  if (!callData || !callData.callId || !callData.astrologerId) return;

  const cleanCallId = String(callData.callId).replace(/[.#$\[\]\/]/g, '_');
  const cleanAstrologerId = String(callData.astrologerId).replace(/[.#$\[\]\/]/g, '_');

  const payload = {
    callId: cleanCallId,
    seekerId: callData.seekerId || 'usr_seeker',
    seekerName: callData.seekerName || 'Seeker',
    astrologerId: cleanAstrologerId,
    astrologerName: callData.astrologerName || 'Acharya',
    type: callData.type || 'audio',
    ratePerMin: Number(callData.ratePerMin) || 25,
    status: 'ringing',
    startedAt: Date.now(),
    updatedAt: Date.now(),
  };

  try {
    const callRef = ref(firebaseDb, `calls/${cleanCallId}`);
    await set(callRef, payload);

    const astroCallRef = ref(firebaseDb, `astrologer_calls/${cleanAstrologerId}/${cleanCallId}`);
    await set(astroCallRef, payload);
  } catch (e: any) {
    console.warn('[Firebase Call Initiate Warning]', e?.message || e);
  }
}

/**
 * Update Call Status in Firebase (e.g. 'connected', 'ended', 'declined')
 */
export async function updateCallStatusInFirebase(
  callId: string,
  astrologerId: string,
  status: 'ringing' | 'connected' | 'ended' | 'declined'
) {
  if (!callId) return;
  const cleanCallId = String(callId).replace(/[.#$\[\]\/]/g, '_');
  const cleanAstrologerId = String(astrologerId || '').replace(/[.#$\[\]\/]/g, '_');

  try {
    const callStatusRef = ref(firebaseDb, `calls/${cleanCallId}/status`);
    await set(callStatusRef, status);

    if (cleanAstrologerId) {
      const astroCallStatusRef = ref(firebaseDb, `astrologer_calls/${cleanAstrologerId}/${cleanCallId}/status`);
      await set(astroCallStatusRef, status);
    }
  } catch (e: any) {
    console.warn('[Firebase Call Status Update Warning]', e?.message || e);
  }
}

/**
 * Subscribe to Incoming Calls for an Acharya in Real Time
 */
export function subscribeToIncomingCallsInFirebase(
  astrologerId: string,
  callback: (calls: any[]) => void
) {
  if (!astrologerId) {
    callback([]);
    return () => {};
  }
  const cleanAstrologerId = String(astrologerId).replace(/[.#$\[\]\/]/g, '_');
  const astroCallsRef = ref(firebaseDb, `astrologer_calls/${cleanAstrologerId}`);

  onValue(astroCallsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const callsList = Object.values(data);
    callsList.sort((a: any, b: any) => (b.startedAt || 0) - (a.startedAt || 0));
    callback(callsList);
  });

  return () => off(astroCallsRef);
}

/**
 * Sync Latest Release Version Metadata to Firebase Realtime Database
 */
export async function syncLatestAppVersionToFirebase(version: string, notes: string[]) {
  try {
    const metaRef = ref(firebaseDb, 'app_meta');
    await set(metaRef, {
      latestVersion: version,
      releaseNotes: notes,
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.warn('[Firebase App Meta Sync Warning]', e);
  }
}

/**
 * Get Latest Release Version Metadata from Firebase Realtime Database
 */
export async function getAppVersionFromFirebase(): Promise<{ latestVersion: string; releaseNotes: string[] } | null> {
  try {
    const metaRef = ref(firebaseDb, 'app_meta');
    const snap = await get(metaRef);
    if (snap.exists()) {
      return snap.val();
    }
    return null;
  } catch (e) {
    return null;
  }
}



