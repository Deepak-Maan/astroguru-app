import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { WalletTransaction } from '../types';
export type { WalletTransaction as Transaction, WalletTransaction } from '../types';

export interface UserWalletData {
  balance: number;
  transactions: WalletTransaction[];
}

interface WalletState {
  userWallets: Record<string, UserWalletData>;
  balance: number;
  transactions: WalletTransaction[];

  getActiveUserId: () => string;
  topup: (amount: number, label?: string) => void;
  debit: (amount: number, label: string) => boolean;
  syncUserSessionWallet: () => void;
  clearWalletHistory: () => void;
}

const uid = () => `txn_${Date.now()}_${Math.floor(Math.random() * 1e5)}`;
const INITIAL_WELCOME_BALANCE = 100;

function createDefaultWallet(): UserWalletData {
  return {
    balance: INITIAL_WELCOME_BALANCE,
    transactions: [
      {
        id: 'welcome_initial',
        type: 'topup',
        amount: INITIAL_WELCOME_BALANCE,
        label: 'AstroGuru Welcome Bonus Credit',
        at: Date.now(),
      },
    ],
  };
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      userWallets: {},
      balance: INITIAL_WELCOME_BALANCE,
      transactions: [
        {
          id: 'welcome_initial',
          type: 'topup',
          amount: INITIAL_WELCOME_BALANCE,
          label: 'AstroGuru Welcome Bonus Credit',
          at: Date.now(),
        },
      ],

      getActiveUserId: () => {
        try {
          const { useAuthStore } = require('./authStore');
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

        // Sanitize transaction logs (remove nulls, undefineds, or corrupted items)
        const sanitizedTxns = (activeData.transactions || [])
          .filter((t) => t && typeof t.amount === 'number' && t.label)
          .sort((a, b) => (b.at || 0) - (a.at || 0));

        set({
          userWallets: { ...wallets, [userId]: { ...activeData, transactions: sanitizedTxns } },
          balance: Math.max(0, activeData.balance || 0),
          transactions: sanitizedTxns,
        });
      },

      topup: (amount, label = 'Wallet Top-Up') => {
        if (!amount || amount <= 0) return;
        const cleanAmount = Math.round(Number(amount));
        const userId = get().getActiveUserId();
        const wallets = { ...(get().userWallets || {}) };
        const current = wallets[userId] || createDefaultWallet();
        const currentBalance = typeof current?.balance === 'number' ? current.balance : INITIAL_WELCOME_BALANCE;
        const currentTxns = Array.isArray(current?.transactions) ? current.transactions : [];

        const newBalance = currentBalance + cleanAmount;
        const newTxn: WalletTransaction = {
          id: uid(),
          type: 'topup',
          amount: cleanAmount,
          label: label.trim(),
          at: Date.now(),
        };

        const updatedWallet: UserWalletData = {
          balance: newBalance,
          transactions: [newTxn, ...currentTxns],
        };

        wallets[userId] = updatedWallet;

        set({
          userWallets: wallets,
          balance: newBalance,
          transactions: updatedWallet.transactions,
        });
      },

      debit: (amount, label) => {
        if (!amount || amount <= 0) return true;
        const cleanAmount = Math.round(Number(amount));
        const userId = get().getActiveUserId();
        const wallets = { ...(get().userWallets || {}) };
        const current = wallets[userId] || createDefaultWallet();
        const currentBalance = typeof current?.balance === 'number' ? current.balance : INITIAL_WELCOME_BALANCE;
        const currentTxns = Array.isArray(current?.transactions) ? current.transactions : [];

        // Check sufficient balance
        if (currentBalance < cleanAmount) {
          return false;
        }

        // Deduplication Guard: Check if identical debit was registered within last 2.5 seconds
        const now = Date.now();
        const recentDuplicate = currentTxns.find(
          (t) =>
            t.type === 'debit' &&
            t.amount === cleanAmount &&
            t.label === label.trim() &&
            now - (t.at || 0) < 2500
        );

        if (recentDuplicate) {
          console.log('[Wallet Deduplication Guard] Blocked duplicate debit:', label);
          return true; // Already processed
        }

        const newBalance = Math.max(0, currentBalance - cleanAmount);
        const newTxn: WalletTransaction = {
          id: uid(),
          type: 'debit',
          amount: cleanAmount,
          label: label.trim(),
          at: now,
        };

        const updatedWallet: UserWalletData = {
          balance: newBalance,
          transactions: [newTxn, ...currentTxns],
        };

        wallets[userId] = updatedWallet;

        set({
          userWallets: wallets,
          balance: newBalance,
          transactions: updatedWallet.transactions,
        });

        return true;
      },

      clearWalletHistory: () => {
        const userId = get().getActiveUserId();
        const wallets = { ...(get().userWallets || {}) };
        wallets[userId] = {
          balance: INITIAL_WELCOME_BALANCE,
          transactions: [
            {
              id: 'welcome_initial',
              type: 'topup',
              amount: INITIAL_WELCOME_BALANCE,
              label: 'Welcome Bonus Credit',
              at: Date.now(),
            },
          ],
        };
        set({
          userWallets: wallets,
          balance: INITIAL_WELCOME_BALANCE,
          transactions: wallets[userId].transactions,
        });
      },
    }),
    {
      name: 'astroguru-multi-user-wallet-v3',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
