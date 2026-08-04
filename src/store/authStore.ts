import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { UserAccount } from '../services/authService';
import { useSubscriptionStore } from './subscriptionStore';
import { useUserStore } from './userStore';
import { useWalletStore } from './walletStore';

interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  setUserSession: (user: UserAccount) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hydrated: false,

      setUserSession: (user: UserAccount) => {
        set({
          user,
          isAuthenticated: true,
        });
        try {
          useWalletStore.getState().syncUserSessionWallet();
        } catch (e) {}
      },

      logout: () => {
        try {
          useSubscriptionStore.getState().cancel();
          useUserStore.getState().clear();
        } catch (e) {}

        set({ user: null, isAuthenticated: false });

        try {
          useWalletStore.getState().syncUserSessionWallet();
        } catch (e) {}
      },

      setHydrated: () => {
        set({ hydrated: true });
        try {
          useWalletStore.getState().syncUserSessionWallet();
        } catch (e) {}
      },
    }),
    {
      name: 'astroguru-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
