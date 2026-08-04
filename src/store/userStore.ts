import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BirthProfile, Kundli } from '../types';
import { computeKundli } from '../services/astrology';

interface UserState {
  profile: BirthProfile | null;
  kundli: Kundli | null;
  onboarded: boolean;
  hydrated: boolean;
  setProfile: (profile: BirthProfile) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      kundli: null,
      onboarded: false,
      hydrated: false,
      setProfile: (profile) => {
        const kundli = computeKundli(profile);
        set({ profile, kundli, onboarded: true });
      },
      clear: () => set({ profile: null, kundli: null, onboarded: false }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'astroguru-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ profile: s.profile, kundli: s.kundli, onboarded: s.onboarded }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
