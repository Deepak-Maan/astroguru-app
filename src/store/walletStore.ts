import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { WalletTransaction } from '../types';
import { useAuthStore } from './authStore';

export interface UserWalletData {
  balance: number;
  transactions: WalletTransaction[];
}

interface WalletState {
  // Keyed dictionary storing balances & transaction logs per user ID / email
  userWallets: Record<string, UserWalletData>;

  // Direct reactive state properties for active user session
  balance: number;
  transactions: WalletTransaction[];

  getActiveUserId: () => string;
  topup: (amount: number, label?: string) => void;
  debit: (amount: number, label: string) => boolean;
  syncUserSessionWallet: () => void;
}

const uid = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const INITIAL_WELCOME_BALANCE = 100;

function createDefaultWallet(): UserWalletData {
  return {
    balance: INITIAL_WELCOME_BALANCE,
    transactions: [
      { id: 'welcome', type: 'topup', amount: INITIAL_WELCOME_BALANCE, label: 'Welcome bonus', at: Date.now() },
    ],
  };
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      userWallets: {},
      balance: INITIAL_WELCOME_BALANCE,
      transactions: [
        { id: 'welcome', type: 'topup', amount: INITIAL_WELCOME_BALANCE, label: 'Welcome bonus', at: Date.now() },
      ],

      getActiveUserId: () => {
        try {
          const authUser = useAuthStore.getState()?.user;
          if (authUser?.id) return authUser.id.toString();
          if (authUser?.email) return authUser.email.toLowerCase().trim();
        } catch (e) {}
        return 'guest_seeker';
      },

      syncUserSessionWallet: () => {
        const userId = get().getActiveUserId();
        const wallets = get().userWallets || {};
        const activeData = wallets[userId] || createDefaultWallet();

        set({
          userWallets: { ...wallets, [userId]: activeData },
          balance: activeData.balance,
          transactions: activeData.transactions,
        });
      },

      topup: (amount, label = 'Wallet top-up') => {
        const userId = get().getActiveUserId();
        const wallets = { ...(get().userWallets || {}) };
        const current = wallets[userId] || createDefaultWallet();
        const currentBalance = typeof current?.balance === 'number' ? current.balance : INITIAL_WELCOME_BALANCE;
        const currentTxns = Array.isArray(current?.transactions) ? current.transactions : [];

        const updatedWallet: UserWalletData = {
          balance: currentBalance + (amount || 0),
          transactions: [
            { id: uid(), type: 'topup', amount: amount || 0, label, at: Date.now() },
            ...currentTxns,
          ],
        };

        wallets[userId] = updatedWallet;

        set({
          userWallets: wallets,
          balance: updatedWallet.balance,
          transactions: updatedWallet.transactions,
        });
      },

      debit: (amount, label) => {
        const userId = get().getActiveUserId();
        const wallets = { ...(get().userWallets || {}) };
        const current = wallets[userId] || createDefaultWallet();
        const currentBalance = typeof current?.balance === 'number' ? current.balance : INITIAL_WELCOME_BALANCE;
        const currentTxns = Array.isArray(current?.transactions) ? current.transactions : [];

        if (currentBalance < amount) return false;

        const updatedWallet: UserWalletData = {
          balance: currentBalance - amount,
          transactions: [
            { id: uid(), type: 'debit', amount, label, at: Date.now() },
            ...currentTxns,
          ],
        };

        wallets[userId] = updatedWallet;

        set({
          userWallets: wallets,
          balance: updatedWallet.balance,
          transactions: updatedWallet.transactions,
        });
        return true;
      },
    }),
    {
      name: 'astroguru-multi-user-wallet-v2',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
