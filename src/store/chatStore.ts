import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ChatMessage } from '../types';

/** Per-astrologer consult session state. */
interface Session {
  messages: ChatMessage[];
  startedAt: number | null;
  minutesBilled: number;
  costSoFar: number;
  ended: boolean;
}

interface ChatState {
  sessions: Record<string, Session>;
  /** AI astrologer conversation (separate from paid consults). */
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
      sessions: {},
      aiMessages: [],

      startSession: (id) =>
        set((s) => ({
          sessions: {
            ...s.sessions,
            [id]: {
              ...(s.sessions[id] ?? emptySession()),
              startedAt: Date.now(),
              ended: false,
            },
          },
        })),

      endSession: (id) =>
        set((s) => ({
          sessions: {
            ...s.sessions,
            [id]: { ...(s.sessions[id] ?? emptySession()), ended: true, startedAt: null },
          },
        })),

      addMessage: (id, msg) =>
        set((s) => {
          const prev = s.sessions[id] ?? emptySession();
          return {
            sessions: {
              ...s.sessions,
              [id]: { ...prev, messages: [...prev.messages, msg] },
            },
          };
        }),

      billMinute: (id, pricePerMin) =>
        set((s) => {
          const prev = s.sessions[id] ?? emptySession();
          return {
            sessions: {
              ...s.sessions,
              [id]: {
                ...prev,
                minutesBilled: prev.minutesBilled + 1,
                costSoFar: prev.costSoFar + pricePerMin,
              },
            },
          };
        }),

      getSession: (id) => get().sessions[id] ?? emptySession(),

      addAiMessage: (msg) => set((s) => ({ aiMessages: [...s.aiMessages, msg] })),

      replaceAiMessage: (id, patch) =>
        set((s) => ({
          aiMessages: s.aiMessages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),

      clearAiChat: () => set({ aiMessages: [] }),
    }),
    {
      name: 'astroguru-chat',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ sessions: s.sessions, aiMessages: s.aiMessages }),
    },
  ),
);
