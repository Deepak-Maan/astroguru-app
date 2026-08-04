import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ChatMessage } from '../types';
import { useAuthStore } from './authStore';

/** Per-astrologer consult session state. */
export interface Session {
  messages: ChatMessage[];
  startedAt: number | null;
  minutesBilled: number;
  costSoFar: number;
  ended: boolean;
}

interface ChatState {
  // Nested dictionary storing sessions per user: userSessions[userId][astrologerId]
  userSessions: Record<string, Record<string, Session>>;

  // User-isolated AI messages dictionary: userAiMessages[userId]
  userAiMessages: Record<string, ChatMessage[]>;

  getActiveUserId: () => string;

  // Compatibility getters & actions
  sessions: Record<string, Session>;
  aiMessages: ChatMessage[];

  startSession: (astrologerId: string) => void;
  endSession: (astrologerId: string) => void;
  addMessage: (astrologerId: string, msg: ChatMessage) => void;
  billMinute: (astrologerId: string, pricePerMin: number) => void;
  getSession: (astrologerId: string) => Session;

  addAiMessage: (msg: ChatMessage) => void;
  replaceAiMessage: (id: string, patch: Partial<ChatMessage>) => void;
  clearAiChat: () => void;
}

const emptySession = (): Session => ({
  messages: [],
  startedAt: null,
  minutesBilled: 0,
  costSoFar: 0,
  ended: false,
});

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      userSessions: {},
      userAiMessages: {},

      getActiveUserId: () => {
        try {
          const authUser = useAuthStore.getState()?.user;
          if (authUser?.id) return authUser.id.toString();
          if (authUser?.email) return authUser.email.toLowerCase().trim();
        } catch (e) {}
        return 'guest_seeker';
      },

      // Fallback getter for backward compatibility
      get sessions() {
        const userId = get().getActiveUserId();
        return get().userSessions?.[userId] || {};
      },

      get aiMessages() {
        const userId = get().getActiveUserId();
        return get().userAiMessages?.[userId] || [];
      },

      startSession: (astrologerId) =>
        set((s) => {
          const userId = s.getActiveUserId();
          const userDict = s.userSessions[userId] || {};
          const currentSession = userDict[astrologerId] || emptySession();

          return {
            userSessions: {
              ...s.userSessions,
              [userId]: {
                ...userDict,
                [astrologerId]: {
                  ...currentSession,
                  startedAt: Date.now(),
                  ended: false,
                },
              },
            },
          };
        }),

      endSession: (astrologerId) =>
        set((s) => {
          const userId = s.getActiveUserId();
          const userDict = s.userSessions[userId] || {};
          const currentSession = userDict[astrologerId] || emptySession();

          return {
            userSessions: {
              ...s.userSessions,
              [userId]: {
                ...userDict,
                [astrologerId]: {
                  ...currentSession,
                  ended: true,
                  startedAt: null,
                },
              },
            },
          };
        }),

      addMessage: (astrologerId, msg) =>
        set((s) => {
          const userId = s.getActiveUserId();
          const userDict = s.userSessions[userId] || {};
          const prev = userDict[astrologerId] || emptySession();

          return {
            userSessions: {
              ...s.userSessions,
              [userId]: {
                ...userDict,
                [astrologerId]: {
                  ...prev,
                  messages: [...prev.messages, msg],
                },
              },
            },
          };
        }),

      billMinute: (astrologerId, pricePerMin) =>
        set((s) => {
          const userId = s.getActiveUserId();
          const userDict = s.userSessions[userId] || {};
          const prev = userDict[astrologerId] || emptySession();

          return {
            userSessions: {
              ...s.userSessions,
              [userId]: {
                ...userDict,
                [astrologerId]: {
                  ...prev,
                  minutesBilled: prev.minutesBilled + 1,
                  costSoFar: prev.costSoFar + pricePerMin,
                },
              },
            },
          };
        }),

      getSession: (astrologerId) => {
        const userId = get().getActiveUserId();
        return get().userSessions?.[userId]?.[astrologerId] || emptySession();
      },

      addAiMessage: (msg) =>
        set((s) => {
          const userId = s.getActiveUserId();
          const currentAi = s.userAiMessages[userId] || [];
          return {
            userAiMessages: {
              ...s.userAiMessages,
              [userId]: [...currentAi, msg],
            },
          };
        }),

      replaceAiMessage: (id, patch) =>
        set((s) => {
          const userId = s.getActiveUserId();
          const currentAi = s.userAiMessages[userId] || [];
          return {
            userAiMessages: {
              ...s.userAiMessages,
              [userId]: currentAi.map((m) => (m.id === id ? { ...m, ...patch } : m)),
            },
          };
        }),

      clearAiChat: () =>
        set((s) => {
          const userId = s.getActiveUserId();
          return {
            userAiMessages: {
              ...s.userAiMessages,
              [userId]: [],
            },
          };
        }),
    }),
    {
      name: 'astroguru-multi-user-chat',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
