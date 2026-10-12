import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface KarmaRemedy {
  id: string;
  title: string;
  description: string;
  planet: string;
  planetGlyph: string;
  category: 'charity' | 'mantra' | 'nature' | 'discipline';
  points: number;
  completed: boolean;
}

interface KarmaState {
  karmaScore: number;
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  japaCount: number;
  unlockedBadges: string[];
  remedies: KarmaRemedy[];

  // Actions
  completeRemedy: (id: string) => void;
  incrementJapa: () => void;
  resetJapa: () => void;
  checkAndUpdateStreak: () => void;
  claimMilestoneReward: (milestone: number) => { rewardGranted: boolean; message: string };
}

const DEFAULT_REMEDIES: KarmaRemedy[] = [
  {
    id: 'rem-1',
    title: 'Surya Arghya at Sunrise',
    description: 'Offer clean water in a copper vessel to Lord Surya facing East.',
    planet: 'Sun (Surya)',
    planetGlyph: '☀️',
    category: 'nature',
    points: 30,
    completed: false,
  },
  {
    id: 'rem-2',
    title: '11x Gayatri Mantra Recitation',
    description: 'Recite Gayatri Mantra with focus on clarity and intellectual strength.',
    planet: 'Sun & Jupiter',
    planetGlyph: '🪔',
    category: 'mantra',
    points: 25,
    completed: false,
  },
  {
    id: 'rem-3',
    title: 'Feed Birds or Stray Animals',
    description: 'Provide grains or water to birds to pacify Rahu & Ketu influences.',
    planet: 'Rahu / Ketu',
    planetGlyph: '🕊️',
    category: 'charity',
    points: 40,
    completed: false,
  },
  {
    id: 'rem-4',
    title: 'Water the Sacred Tulsi Plant',
    description: 'Water Tulsi while chanting Om Namo Bhagavate Vasudevaya.',
    planet: 'Mercury (Budh)',
    planetGlyph: '🌿',
    category: 'nature',
    points: 20,
    completed: false,
  },
  {
    id: 'rem-5',
    title: '15-Min Mindful Digital Fast',
    description: 'Disconnect from all screens before sleep to pacify afflicted Moon.',
    planet: 'Moon (Chandra)',
    planetGlyph: '🌙',
    category: 'discipline',
    points: 35,
    completed: false,
  },
];

export const useKarmaStore = create<KarmaState>()(
  persist(
    (set, get) => ({
      karmaScore: 420,
      currentStreak: 5,
      bestStreak: 12,
      lastCompletedDate: null,
      japaCount: 27,
      unlockedBadges: ['Bronze Karma Shield', 'Gayatri Initiate'],
      remedies: DEFAULT_REMEDIES,

      completeRemedy: (id: string) => {
        const state = get();
        const remedy = state.remedies.find((r) => r.id === id);
        if (!remedy || remedy.completed) return;

        const updatedRemedies = state.remedies.map((r) =>
          r.id === id ? { ...r, completed: true } : r
        );

        const newScore = Math.min(1000, state.karmaScore + remedy.points);
        const todayStr = new Date().toISOString().split('T')[0];

        let newStreak = state.currentStreak;
        if (state.lastCompletedDate !== todayStr) {
          newStreak = state.currentStreak + 1;
        }

        const newBest = Math.max(state.bestStreak, newStreak);

        // Check badge unlocks
        const newBadges = [...state.unlockedBadges];
        if (newStreak >= 7 && !newBadges.includes('Silver Karma Shield (7-Day Streak)')) {
          newBadges.push('Silver Karma Shield (7-Day Streak)');
        }
        if (newStreak >= 21 && !newBadges.includes('Golden Karma Master (21-Day Streak)')) {
          newBadges.push('Golden Karma Master (21-Day Streak)');
        }
        if (newScore >= 800 && !newBadges.includes('Celestial Aura (800+ Score)')) {
          newBadges.push('Celestial Aura (800+ Score)');
        }

        set({
          remedies: updatedRemedies,
          karmaScore: newScore,
          currentStreak: newStreak,
          bestStreak: newBest,
          lastCompletedDate: todayStr,
          unlockedBadges: newBadges,
        });
      },

      incrementJapa: () => {
        const current = get().japaCount;
        const next = (current + 1) % 109; // 1 to 108 then loops
        const addScore = next === 0 ? 50 : 1; // bonus for full mala
        set((state) => ({
          japaCount: next === 0 ? 1 : next,
          karmaScore: Math.min(1000, state.karmaScore + addScore),
        }));
      },

      resetJapa: () => {
        set({ japaCount: 0 });
      },

      checkAndUpdateStreak: () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const last = get().lastCompletedDate;
        if (!last) return;

        const lastDate = new Date(last).getTime();
        const todayDate = new Date(todayStr).getTime();
        const diffDays = Math.round((todayDate - lastDate) / (1000 * 3600 * 24));

        if (diffDays > 1) {
          // Streak broken
          set({ currentStreak: 1 });
        }
      },

      claimMilestoneReward: (milestone: number) => {
        const state = get();
        if (state.currentStreak < milestone) {
          return { rewardGranted: false, message: `Reach a ${milestone}-day streak first!` };
        }
        return {
          rewardGranted: true,
          message: `✨ Congratulations! ₹50 Remedy Credit added to your AstroGuru wallet.`,
        };
      },
    }),
    {
      name: 'astroguru-karma-ledger',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
