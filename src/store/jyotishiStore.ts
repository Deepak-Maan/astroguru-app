import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ClientRequest {
  id: string;
  clientName: string;
  avatar?: string;
  topic: string;
  birthDetails: {
    date: string;
    time: string;
    place: string;
  };
  ratePerMin: number;
  requestedAt: string;
  status: 'pending' | 'active' | 'completed' | 'declined';
}

interface JyotishiState {
  isOnDuty: boolean;
  ratePerMin: number;
  todayEarnings: number;
  completedCount: number;
  rating: number;
  payoutBalance: number;
  clientQueue: ClientRequest[];
  
  toggleDuty: () => void;
  setRatePerMin: (rate: number) => void;
  acceptRequest: (requestId: string) => void;
  declineRequest: (requestId: string) => void;
  withdrawPayout: (amount: number) => boolean;
}

export const useJyotishiStore = create<JyotishiState>()(
  persist(
    (set, get) => ({
      isOnDuty: true,
      ratePerMin: 25,
      todayEarnings: 4850,
      completedCount: 14,
      rating: 4.95,
      payoutBalance: 38400,
      clientQueue: [
        {
          id: 'req-101',
          clientName: 'Rahul Sharma',
          topic: 'Career Transition & Finance 2026',
          birthDetails: {
            date: '14-05-1994',
            time: '08:30 AM',
            place: 'New Delhi, India',
          },
          ratePerMin: 25,
          requestedAt: '2 mins ago',
          status: 'pending',
        },
        {
          id: 'req-102',
          clientName: 'Priya Patel',
          topic: 'Kundli Matching & Marriage Prospects',
          birthDetails: {
            date: '22-11-1997',
            time: '04:15 PM',
            place: 'Ahmedabad, India',
          },
          ratePerMin: 25,
          requestedAt: '7 mins ago',
          status: 'pending',
        },
      ],

      toggleDuty: () => set((state) => ({ isOnDuty: !state.isOnDuty })),

      setRatePerMin: (rate) => set({ ratePerMin: rate }),

      acceptRequest: (requestId) =>
        set((state) => ({
          clientQueue: state.clientQueue.map((req) =>
            req.id === requestId ? { ...req, status: 'active' as const } : req
          ),
        })),

      declineRequest: (requestId) =>
        set((state) => ({
          clientQueue: state.clientQueue.map((req) =>
            req.id === requestId ? { ...req, status: 'declined' as const } : req
          ),
        })),

      withdrawPayout: (amount) => {
        const current = get().payoutBalance;
        if (amount > 0 && current >= amount) {
          set({ payoutBalance: current - amount });
          return true;
        }
        return false;
      },
    }),
    {
      name: 'astroguru-jyotishi-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
