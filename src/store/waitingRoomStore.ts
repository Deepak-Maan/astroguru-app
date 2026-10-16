import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface QueueEntry {
  astrologerId: string;
  astrologerName: string;
  astrologerAvatar?: string;
  astrologerSpecialty?: string;
  astrologerRate: number;
  consultType: 'chat' | 'call' | 'video';
  position: number;
  totalInQueue: number;
  estimatedWaitMinutes: number;
  joinedAt: number;
  status: 'waiting' | 'almost_ready' | 'ready' | 'connected' | 'cancelled';
}

interface WaitingRoomState {
  currentQueue: QueueEntry | null;
  joinQueue: (
    astrologer: {
      id: string;
      name: string;
      avatar?: string;
      specialty?: string;
      rate?: number;
    },
    consultType?: 'chat' | 'call' | 'video'
  ) => void;
  leaveQueue: () => void;
  advanceQueue: () => void;
  markReady: () => void;
  clearQueue: () => void;
}

export const useWaitingRoomStore = create<WaitingRoomState>()(
  persist(
    (set, get) => ({
      currentQueue: null,

      joinQueue: (astrologer, consultType = 'chat') => {
        const initialPosition = Math.floor(Math.random() * 2) + 2; // e.g. position 2 or 3
        const waitMinutes = initialPosition * 3;

        set({
          currentQueue: {
            astrologerId: astrologer.id,
            astrologerName: astrologer.name,
            astrologerAvatar: astrologer.avatar,
            astrologerSpecialty: astrologer.specialty || 'Vedic Astrology',
            astrologerRate: astrologer.rate ?? 25,
            consultType,
            position: initialPosition,
            totalInQueue: initialPosition + 1,
            estimatedWaitMinutes: waitMinutes,
            joinedAt: Date.now(),
            status: 'waiting',
          },
        });
      },

      leaveQueue: () => {
        const cur = get().currentQueue;
        if (cur) {
          set({ currentQueue: { ...cur, status: 'cancelled' } });
          setTimeout(() => {
            set({ currentQueue: null });
          }, 300);
        }
      },

      advanceQueue: () => {
        const cur = get().currentQueue;
        if (!cur || cur.status !== 'waiting') return;

        if (cur.position <= 1) {
          set({
            currentQueue: {
              ...cur,
              position: 0,
              estimatedWaitMinutes: 0,
              status: 'ready',
            },
          });
        } else {
          const nextPos = cur.position - 1;
          set({
            currentQueue: {
              ...cur,
              position: nextPos,
              estimatedWaitMinutes: Math.max(1, nextPos * 3),
              status: nextPos === 1 ? 'almost_ready' : 'waiting',
            },
          });
        }
      },

      markReady: () => {
        const cur = get().currentQueue;
        if (!cur) return;
        set({
          currentQueue: {
            ...cur,
            position: 0,
            estimatedWaitMinutes: 0,
            status: 'ready',
          },
        });
      },

      clearQueue: () => {
        set({ currentQueue: null });
      },
    }),
    {
      name: 'astroguru-waiting-room-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
