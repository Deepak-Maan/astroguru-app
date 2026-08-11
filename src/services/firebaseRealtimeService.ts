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
