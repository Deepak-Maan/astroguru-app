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
export async function pushMessageToFirebase(roomId: string, msg: Omit<FirebaseChatMessage, 'id' | 'timestamp'>) {
  try {
    const messagesRef = ref(firebaseDb, `rooms/${roomId}/messages`);
    const newMsgRef = push(messagesRef);
    await set(newMsgRef, {
      ...msg,
      id: newMsgRef.key,
      timestamp: Date.now(),
    });

    // Update room metadata
    const roomRef = ref(firebaseDb, `rooms/${roomId}/lastMessage`);
    await set(roomRef, msg.text);
  } catch (e) {
    console.warn('[Firebase Realtime Push Error]', e);
  }
}

/**
 * Subscribe to Live Room Chat Messages in Real Time
 */
export function subscribeToFirebaseRoomMessages(roomId: string, callback: (messages: FirebaseChatMessage[]) => void) {
  const messagesRef = ref(firebaseDb, `rooms/${roomId}/messages`);
  
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
  try {
    const roomInfoRef = ref(firebaseDb, `rooms/${room.roomId}/info`);
    await set(roomInfoRef, {
      ...room,
      updatedAt: Date.now(),
    });
    // Index under /astrologer_rooms/{astrologerId}/{roomId}
    const indexRef = ref(firebaseDb, `astrologer_rooms/${room.astrologerId}/${room.roomId}`);
    await set(indexRef, {
      roomId: room.roomId,
      seekerId: room.seekerId,
      seekerName: room.seekerName,
      status: room.status,
      lastMessage: room.lastMessage || 'New consultation request',
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.warn('[Firebase Room Metadata Sync Warning]', e);
  }
}

/**
 * Subscribe to Acharya's Incoming Consultation Rooms in Real Time
 */
export function subscribeToAcharyaRoomsInFirebase(astrologerId: string, callback: (rooms: any[]) => void) {
  const acharyaRoomsRef = ref(firebaseDb, `astrologer_rooms/${astrologerId}`);
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

