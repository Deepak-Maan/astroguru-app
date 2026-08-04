import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface SubscriptionPlan {
  id: 'monthly' | 'yearly';
  name: string;
  price: number;
  period: string;
  savings?: string;
  perks: string[];
}

export const VIP_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'AstroVIP Monthly',
    price: 199,
    period: '/ month',
    perks: [
      '15% OFF all astrologer chat & calls',
      'Unlimited AI Jyotishi questions',
      'Daily Panchang & Auspicious Muhurat alerts',
      'Priority astrologer consultation queue',
      'Exclusive AstroVIP gold profile badge',
    ],
  },
  {
    id: 'yearly',
    name: 'AstroVIP Annual Pass',
    price: 1499,
    period: '/ year',
    savings: 'SAVE 37%',
    perks: [
      'Everything in Monthly Pass',
      '2 free 10-minute video consultation calls',
      'Personalized 5-Year Vedic Career & Love report',
      'VIP Concierge support',
    ],
  },
];

interface SubscriptionState {
  isVip: boolean;
  planId: 'monthly' | 'yearly' | null;
  expiresAt: string | null;
  discountRate: number; // 0.15 = 15% off
  subscribe: (planId: 'monthly' | 'yearly') => void;
  cancel: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      isVip: false,
      planId: null,
      expiresAt: null,
      discountRate: 0.15,

      subscribe: (planId) => {
        const months = planId === 'yearly' ? 12 : 1;
        const exp = new Date();
        exp.setMonth(exp.getMonth() + months);
        set({
          isVip: true,
          planId,
          expiresAt: exp.toISOString().split('T')[0],
        });
      },

      cancel: () => set({ isVip: false, planId: null, expiresAt: null }),
    }),
    {
      name: 'astroguru-vip',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
