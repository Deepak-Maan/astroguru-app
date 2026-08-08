/**
 * liveChatStore — Real bidirectional Seeker ↔ Acharya chat.
 *
 * Architecture:
 * - Each "room" is keyed by `${seekerId}__${astrologerId}`.
 * - Both seeker and acharya write messages into the same room.
 * - The Acharya's active queue is tracked with `acharyaActiveRooms`.
 * - In production this would be backed by Firebase Realtime DB / Socket.io.
 *   Here we use a shared Zustand store (in-memory, persisted locally)
 *   which gives real cross-screen reactivity within the same app session.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type MessageRole = 'seeker' | 'acharya' | 'system';

export interface LiveMessage {
  id: string;
  role: MessageRole;
  senderName: string;
  text: string;
  at: number;
  read: boolean;
}

export interface LiveRoom {
  roomId: string;
  seekerId: string;
  seekerName: string;
  astrologerId: string;
  astrologerName: string;
  topic: string;
  ratePerMin: number;
  startedAt: number | null;
  endedAt: number | null;
  minutesBilled: number;
  messages: LiveMessage[];
  status: 'waiting' | 'active' | 'ended';
  /** Unread count from seeker's perspective */
  unreadForSeeker: number;
  /** Unread count from acharya's perspective */
  unreadForAcharya: number;
}

interface LiveChatState {
  rooms: Record<string, LiveRoom>;

  /** Create or re-open a room */
  createRoom: (params: {
    seekerId: string;
    seekerName: string;
    astrologerId: string;
    astrologerName: string;
    topic: string;
    ratePerMin: number;
  }) => string;

  /** Send a message into a room */
  sendMessage: (roomId: string, role: MessageRole, senderName: string, text: string) => void;

  /** Mark all messages as read for a role */
  markRead: (roomId: string, role: MessageRole) => void;

  /** Acharya accepts a session */
  acceptRoom: (roomId: string) => void;

  /** End a session */
  endRoom: (roomId: string) => void;

  /** Bill a minute */
  billRoomMinute: (roomId: string) => void;

  /** Get all active rooms for an acharya */
  getAcharyaRooms: (astrologerId: string) => LiveRoom[];

  /** Get room by ID */
  getRoom: (roomId: string) => LiveRoom | null;

  /** Get the live room for a seeker + acharya pair */
  getRoomByPair: (seekerId: string, astrologerId: string) => LiveRoom | null;
}

let msgCounter = 0;
const newMsgId = () => `lm-${Date.now()}-${++msgCounter}`;

export const useLiveChatStore = create<LiveChatState>()(
  persist(
    (set, get) => ({
      rooms: {},

      createRoom: ({ seekerId, seekerName, astrologerId, astrologerName, topic, ratePerMin }) => {
        const roomId = `${seekerId}__${astrologerId}`;
        const existing = get().rooms[roomId];
        if (existing && existing.status !== 'ended') return roomId;

        const room: LiveRoom = {
          roomId,
          seekerId,
          seekerName,
          astrologerId,
          astrologerName,
          topic,
          ratePerMin,
          startedAt: null,
          endedAt: null,
          minutesBilled: 0,
          messages: [
            {
              id: newMsgId(),
              role: 'system',
              senderName: 'System',
              text: `🔔 Consultation request from ${seekerName} · Topic: "${topic}" · Rate: ₹${ratePerMin}/min`,
              at: Date.now(),
              read: false,
            },
          ],
          status: 'waiting',
          unreadForSeeker: 0,
          unreadForAcharya: 1,
        };

        set((s) => ({ rooms: { ...s.rooms, [roomId]: room } }));
        return roomId;
      },

      sendMessage: (roomId, role, senderName, text) =>
        set((s) => {
          const room = s.rooms[roomId];
          if (!room) return s;

          const msg: LiveMessage = {
            id: newMsgId(),
            role,
            senderName,
            text,
            at: Date.now(),
            read: false,
          };

          return {
            rooms: {
              ...s.rooms,
              [roomId]: {
                ...room,
                messages: [...room.messages, msg],
                unreadForSeeker: role === 'acharya' ? room.unreadForSeeker + 1 : room.unreadForSeeker,
                unreadForAcharya: role === 'seeker' ? room.unreadForAcharya + 1 : room.unreadForAcharya,
              },
            },
          };
        }),

      markRead: (roomId, role) =>
        set((s) => {
          const room = s.rooms[roomId];
          if (!room) return s;
          return {
            rooms: {
              ...s.rooms,
              [roomId]: {
                ...room,
                messages: room.messages.map((m) =>
                  !m.read && m.role !== role ? { ...m, read: true } : m
                ),
                unreadForSeeker: role === 'seeker' ? 0 : room.unreadForSeeker,
                unreadForAcharya: role === 'acharya' ? 0 : room.unreadForAcharya,
              },
            },
          };
        }),

      acceptRoom: (roomId) =>
        set((s) => {
          const room = s.rooms[roomId];
          if (!room) return s;
          const systemMsg: LiveMessage = {
            id: newMsgId(),
            role: 'system',
            senderName: 'System',
            text: `✅ ${room.astrologerName} has accepted your consultation. Session started.`,
            at: Date.now(),
            read: false,
          };
          return {
            rooms: {
              ...s.rooms,
              [roomId]: {
                ...room,
                status: 'active',
                startedAt: Date.now(),
                messages: [...room.messages, systemMsg],
                unreadForSeeker: room.unreadForSeeker + 1,
              },
            },
          };
        }),

      endRoom: (roomId) =>
        set((s) => {
          const room = s.rooms[roomId];
          if (!room) return s;
          const mins = room.minutesBilled;
          const cost = mins * room.ratePerMin;
          const systemMsg: LiveMessage = {
            id: newMsgId(),
            role: 'system',
            senderName: 'System',
            text: `🔚 Session ended · Duration: ${mins} min · Total charged: ₹${cost}. Namaste 🙏`,
            at: Date.now(),
            read: false,
          };
          return {
            rooms: {
              ...s.rooms,
              [roomId]: {
                ...room,
                status: 'ended',
                endedAt: Date.now(),
                messages: [...room.messages, systemMsg],
                unreadForSeeker: room.unreadForSeeker + 1,
                unreadForAcharya: room.unreadForAcharya + 1,
              },
            },
          };
        }),

      billRoomMinute: (roomId) =>
        set((s) => {
          const room = s.rooms[roomId];
          if (!room) return s;
          return {
            rooms: {
              ...s.rooms,
              [roomId]: {
                ...room,
                minutesBilled: room.minutesBilled + 1,
              },
            },
          };
        }),

      getAcharyaRooms: (astrologerId) => {
        return Object.values(get().rooms).filter((r) => r.astrologerId === astrologerId);
      },

      getRoom: (roomId) => get().rooms[roomId] ?? null,

      getRoomByPair: (seekerId, astrologerId) => {
        const roomId = `${seekerId}__${astrologerId}`;
        return get().rooms[roomId] ?? null;
      },
    }),
    {
      name: 'astroguru-live-chat-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
