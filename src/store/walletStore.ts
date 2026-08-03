import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { WalletTransaction } from '../types';

interface WalletState {
  balance: number;
  transactions: WalletTransaction[];
  topup: (amount: number, label?: string) => void;
  /** Attempts to debit; returns false if insufficient balance. */
  debit: (amount: number, label: string) => boolean;
}

const uid = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: 100, // welcome bonus
      transactions: [
        { id: 'welcome', type: 'topup', amount: 100, label: 'Welcome bonus', at: Date.now() },
      ],
      topup: (amount, label = 'Wallet top-up') =>
        set((s) => ({
          balance: s.balance + amount,
          transactions: [
            { id: uid(), type: 'topup', amount, label, at: Date.now() },
            ...s.transactions,
          ],
        })),
      debit: (amount, label) => {
        const { balance } = get();
        if (balance < amount) return false;
        set((s) => ({
          balance: s.balance - amount,
          transactions: [
            { id: uid(), type: 'debit', amount, label, at: Date.now() },
            ...s.transactions,
          ],
        }));
        return true;
      },
    }),
    {
      name: 'astroguru-wallet',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
