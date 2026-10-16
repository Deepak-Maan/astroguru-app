import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BirthProfile, Kundli } from '../types';
import { computeKundli } from '../services/astrology';

export type FamilyRelation =
  | 'Self'
  | 'Spouse'
  | 'Child'
  | 'Father'
  | 'Mother'
  | 'Sibling'
  | 'Business'
  | 'Friend';

export interface FamilyProfile {
  id: string;
  name: string;
  relation: FamilyRelation;
  gender: 'male' | 'female' | 'other';
  birthProfile: BirthProfile;
  kundli: Kundli;
  createdAt: number;
}

interface FamilyProfilesState {
  profiles: FamilyProfile[];
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
  addFamilyProfile: (params: {
    name: string;
    relation: FamilyRelation;
    gender: 'male' | 'female' | 'other';
    birthProfile: BirthProfile;
  }) => string;
  removeFamilyProfile: (id: string) => void;
  getActiveProfile: (fallbackUser?: { profile: BirthProfile | null; kundli: Kundli | null }) => {
    profile: BirthProfile | null;
    kundli: Kundli | null;
    relation: FamilyRelation;
    name: string;
  };
}

export const useFamilyProfilesStore = create<FamilyProfilesState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: 'self',

      setActiveProfileId: (id: string) => {
        set({ activeProfileId: id });
      },

      addFamilyProfile: ({ name, relation, gender, birthProfile }) => {
        const id = `fam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const kundli = computeKundli(birthProfile);
        const newEntry: FamilyProfile = {
          id,
          name,
          relation,
          gender,
          birthProfile,
          kundli,
          createdAt: Date.now(),
        };

        set((state) => ({
          profiles: [...state.profiles, newEntry],
          activeProfileId: id,
        }));

        return id;
      },

      removeFamilyProfile: (id: string) => {
        set((state) => {
          const next = state.profiles.filter((p) => p.id !== id);
          return {
            profiles: next,
            activeProfileId: state.activeProfileId === id ? 'self' : state.activeProfileId,
          };
        });
      },

      getActiveProfile: (fallbackUser) => {
        const { profiles, activeProfileId } = get();
        if (activeProfileId !== 'self') {
          const found = profiles.find((p) => p.id === activeProfileId);
          if (found) {
            return {
              profile: found.birthProfile,
              kundli: found.kundli,
              relation: found.relation,
              name: found.name,
            };
          }
        }

        // Return Self fallback
        return {
          profile: fallbackUser?.profile || null,
          kundli: fallbackUser?.kundli || null,
          relation: 'Self',
          name: fallbackUser?.profile?.name || 'Self',
        };
      },
    }),
    {
      name: 'astroguru-family-profiles',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
