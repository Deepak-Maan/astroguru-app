import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useWalletStore } from './walletStore';

export interface TarotCard {
  id: string;
  name: string;
  arcana: string;
  imageEmoji: string;
  keyword: string;
  meaning: string;
  affirmation: string;
  luckyColor: string;
  luckyStone: string;
  luckyNumber: number;
  rulingPlanet: string;
}

export interface RemedyItem {
  id: string;
  title: string;
  category: 'mantra' | 'gemstone' | 'charity' | 'puja' | 'routine';
  timing: string;
  completed: boolean;
  streak: number;
  lastCompletedDate?: string;
}

export interface RewardState {
  streakCount: number;
  lastCheckInDate: string | null;
  hasCheckedInToday: boolean;
  astroCoins: number;
  lastSpinDate: string | null;
  hasSpunToday: boolean;
  dailyTarotCard: TarotCard | null;
  tarotFlipped: boolean;
  tarotDate: string | null;
  remedies: RemedyItem[];

  addCoins: (amount: number) => void;
  checkInToday: () => { success: boolean; coinsAwarded: number; newStreak: number };
  spinChakra: () => { prize: string; coins?: number; cash?: number; voucher?: string };
  drawDailyTarot: () => TarotCard;
  toggleRemedy: (id: string) => void;
  addRemedy: (title: string, category: RemedyItem['category'], timing: string) => void;
  deleteRemedy: (id: string) => void;
}

const TAROT_DECK: TarotCard[] = [
  {
    id: 'sun',
    name: 'The Sun (Surya Dev)',
    arcana: 'Major Arcana XIX',
    imageEmoji: '☀️',
    keyword: 'Radiance, Vitality & Success',
    meaning: 'Surya Dev illuminates your 10th house of career and vitality today. Expect breakthroughs in stagnant work, public recognition, and positive energy.',
    affirmation: 'I radiate cosmic confidence and attract golden opportunities with ease.',
    luckyColor: '#F59E0B',
    luckyStone: 'Natural Ruby (Manikya)',
    luckyNumber: 1,
    rulingPlanet: 'Sun (Surya)',
  },
  {
    id: 'moon',
    name: 'The High Priestess (Chandra)',
    arcana: 'Major Arcana II',
    imageEmoji: '🌙',
    keyword: 'Intuition, Calm & Mysticism',
    meaning: 'Chandra blesses your mind with profound emotional clarity and psychic intuition. Trust your inner voice when making relationship decisions today.',
    affirmation: 'My intuition is sharp, clear, and guided by celestial wisdom.',
    luckyColor: '#E2E8F0',
    luckyStone: 'South Sea Pearl (Moti)',
    luckyNumber: 2,
    rulingPlanet: 'Moon (Chandra)',
  },
  {
    id: 'wheel',
    name: 'Wheel of Fortune (Kala Chakra)',
    arcana: 'Major Arcana X',
    imageEmoji: '☸️',
    keyword: 'Destiny, Luck & Karma',
    meaning: 'A sudden shift in karmic cycles brings unexpected financial gains or auspicious connections. Favorable for starting new projects.',
    affirmation: 'The cosmic wheel turns in my favor; I welcome positive destiny.',
    luckyColor: '#10B981',
    luckyStone: 'Emerald (Panna)',
    luckyNumber: 5,
    rulingPlanet: 'Mercury (Budha)',
  },
  {
    id: 'empress',
    name: 'The Empress (Shukra)',
    arcana: 'Major Arcana III',
    imageEmoji: '👑',
    keyword: 'Abundance, Love & Luxury',
    meaning: 'Venus (Shukra) bestows harmony in love and material luxury. A wonderful day for creative expression, romance, and artistic ventures.',
    affirmation: 'Abundance flows to me naturally through love, peace, and beauty.',
    luckyColor: '#EC4899',
    luckyStone: 'Diamond or Opal',
    luckyNumber: 6,
    rulingPlanet: 'Venus (Shukra)',
  },
  {
    id: 'star',
    name: 'The Star (Brihaspati)',
    arcana: 'Major Arcana XVII',
    imageEmoji: '⭐',
    keyword: 'Hope, Blessings & Spiritual Growth',
    meaning: 'Jupiter (Guru) pours divine grace into your chart. Doubts dissolve, and a major wish is on the verge of manifestation.',
    affirmation: 'I am spiritually aligned with higher divine wisdom and boundless peace.',
    luckyColor: '#EAB308',
    luckyStone: 'Yellow Sapphire (Pukhraj)',
    luckyNumber: 3,
    rulingPlanet: 'Jupiter (Guru)',
  },
  {
    id: 'magician',
    name: 'The Magician (Buddhi Yoga)',
    arcana: 'Major Arcana I',
    imageEmoji: '🪄',
    keyword: 'Manifestation, Intellect & Power',
    meaning: 'You have all the four elements and tools required to accomplish your goals today. Take decisive action in business and negotiations.',
    affirmation: 'I have the cosmic power to transform my intentions into reality.',
    luckyColor: '#6366F1',
    luckyStone: 'Blue Topaz',
    luckyNumber: 7,
    rulingPlanet: 'Mercury (Budha)',
  },
];

const DEFAULT_REMEDIES: RemedyItem[] = [
  {
    id: 'rem-1',
    title: 'Chant Maha Mrityunjaya Mantra (11 or 108 times)',
    category: 'mantra',
    timing: 'Morning (Sunrise)',
    completed: false,
    streak: 3,
  },
  {
    id: 'rem-2',
    title: 'Offer water with red sandalwood to Surya Dev',
    category: 'routine',
    timing: '7:00 AM - 8:30 AM',
    completed: true,
    streak: 5,
  },
  {
    id: 'rem-3',
    title: 'Feed green grass or green gram to cows / birds',
    category: 'charity',
    timing: 'Wednesday / Daily',
    completed: false,
    streak: 2,
  },
  {
    id: 'rem-4',
    title: 'Light Sesame Oil Diya under Peepal Tree',
    category: 'puja',
    timing: 'Saturday Evening',
    completed: false,
    streak: 1,
  },
];

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

export const useRewardsStore = create<RewardState>()(
  persist(
    (set, get) => ({
      streakCount: 3,
      lastCheckInDate: null,
      hasCheckedInToday: false,
      astroCoins: 150,
      lastSpinDate: null,
      hasSpunToday: false,
      dailyTarotCard: TAROT_DECK[0],
      tarotFlipped: false,
      tarotDate: null,
      remedies: DEFAULT_REMEDIES,

      addCoins: (amount) => {
        set((s) => ({ astroCoins: s.astroCoins + (amount || 0) }));
      },

      checkInToday: () => {
        const today = getTodayDateStr();
        const { lastCheckInDate, streakCount, astroCoins } = get();

        if (lastCheckInDate === today) {
          return { success: false, coinsAwarded: 0, newStreak: streakCount };
        }

        let newStreak = 1;
        if (lastCheckInDate) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yStr = yesterday.toISOString().split('T')[0];
          if (lastCheckInDate === yStr) {
            newStreak = streakCount + 1;
          }
        }

        const coinsAwarded = 20 + newStreak * 5;
        const updatedCoins = astroCoins + coinsAwarded;

        set({
          lastCheckInDate: today,
          hasCheckedInToday: true,
          streakCount: newStreak,
          astroCoins: updatedCoins,
        });

        return { success: true, coinsAwarded, newStreak };
      },

      spinChakra: () => {
        const today = getTodayDateStr();
        const prizes = [
          { prize: '₹25 Wallet Cash', cash: 25 },
          { prize: '50 Astro-Coins', coins: 50 },
          { prize: '₹50 Consult Voucher', voucher: 'VOUCHER50' },
          { prize: '100 Astro-Coins', coins: 100 },
          { prize: '₹10 Wallet Cash', cash: 10 },
          { prize: 'Free Kundli Gun Milan', voucher: 'GUNMILAN_FREE' },
        ];

        const randomPick = prizes[Math.floor(Math.random() * prizes.length)];

        if (randomPick.cash) {
          useWalletStore.getState().topup(randomPick.cash, `Cosmic Spin & Win Prize (₹${randomPick.cash})`);
        }

        if (randomPick.coins) {
          set((s) => ({ astroCoins: s.astroCoins + (randomPick.coins || 0) }));
        }

        set({
          lastSpinDate: today,
          hasSpunToday: true,
        });

        return randomPick;
      },

      drawDailyTarot: () => {
        const today = getTodayDateStr();
        const { tarotDate, dailyTarotCard } = get();

        if (tarotDate === today && dailyTarotCard) {
          return dailyTarotCard;
        }

        const dayOfYear = Math.floor(
          (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
        );
        const cardIndex = dayOfYear % TAROT_DECK.length;
        const picked = TAROT_DECK[cardIndex];

        set({
          dailyTarotCard: picked,
          tarotDate: today,
          tarotFlipped: true,
        });

        return picked;
      },

      toggleRemedy: (id: string) => {
        const today = getTodayDateStr();
        set((s) => {
          const updated = s.remedies.map((rem) => {
            if (rem.id === id) {
              const isNowCompleted = !rem.completed;
              return {
                ...rem,
                completed: isNowCompleted,
                streak: isNowCompleted ? rem.streak + 1 : Math.max(0, rem.streak - 1),
                lastCompletedDate: isNowCompleted ? today : rem.lastCompletedDate,
              };
            }
            return rem;
          });

          return {
            remedies: updated,
            astroCoins: s.astroCoins + 15,
          };
        });
      },

      addRemedy: (title: string, category: RemedyItem['category'], timing: string) => {
        const newRem: RemedyItem = {
          id: `rem-${Date.now()}`,
          title,
          category,
          timing,
          completed: false,
          streak: 0,
        };
        set((s) => ({ remedies: [newRem, ...s.remedies] }));
      },

      deleteRemedy: (id: string) => {
        set((s) => ({ remedies: s.remedies.filter((r) => r.id !== id) }));
      },
    }),
    {
      name: 'astroguru_rewards_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);