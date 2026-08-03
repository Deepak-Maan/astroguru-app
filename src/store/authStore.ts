import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { UserAccount } from '../services/authService';

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
      user: {
        id: 'usr_demo_1',
        name: 'Demo Seeker',
        email: 'seeker@astroguru.app',
        phone: '9876543210',
        role: 'user',
        createdAt: '2026-01-01',
      },
      isAuthenticated: true,
      hydrated: false,

      setUserSession: (user: UserAccount) => {
        set({
          user,
          isAuthenticated: true,
        });
      },

      logout: () => set({ user: null, isAuthenticated: false }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'astroguru-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
