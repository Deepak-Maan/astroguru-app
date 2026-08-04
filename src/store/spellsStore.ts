import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SpellItem {
  id: string;
  title: string;
  sanskritName: string;
  category: string;
  price: number;
  icon: string;
  image: string;
  description: string;
  benefits: string[];
  available: boolean;
}

export interface SpellOrderRecord {
  id: string;
  spellId: string;
  spellTitle: string;
  price: number;
  userName: string;
  targetName: string;
  dob: string;
  intention: string;
  paymentMethod: 'wallet' | 'upi' | 'card';
  date: string;
  status: 'Ritual Scheduled' | 'Casting in Progress' | 'Ritual Completed';
}

interface SpellsState {
  spells: SpellItem[];
  spellOrders: SpellOrderRecord[];
  updateSpellPrice: (spellId: string, newPrice: number) => void;
  toggleSpellAvailable: (spellId: string) => void;
  placeSpellOrder: (order: Omit<SpellOrderRecord, 'id' | 'date' | 'status'>) => SpellOrderRecord;
  updateSpellOrderStatus: (orderId: string, newStatus: SpellOrderRecord['status']) => void;
}

const DEFAULT_SPELLS: SpellItem[] = [
  {
    id: 'love_attraction',
    title: 'Love & Soulmate Attraction Spell',
    sanskritName: 'Kamadeva Vashikaran Mantra',
    category: 'Love & Relationships',
    price: 1100,
    icon: '💘',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80',
    description: 'Ancient Vedic attraction ritual to ignite deep affection, resolve partner conflicts & pull your soulmate closer.',
    benefits: ['Harmonizes emotional vibrations', 'Removes third-party friction', 'Deepens commitment & passion'],
    available: true,
  },
  {
    id: 'wealth_abundance',
    title: 'Wealth & Abundance Manifestation Spell',
    sanskritName: 'Mahalakshmi Kuber Potli Ritual',
    category: 'Money & Success',
    price: 1100,
    icon: '💰',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    description: 'Sacred money manifestation ritual to unblock financial stagnation, attract new income streams & multiply business profits.',
    benefits: ['Removes financial blocks', 'Attracts high-value business deals', 'Protects against debt & losses'],
    available: true,
  },
  {
    id: 'evil_eye_removal',
    title: 'Evil Eye & Protection Spell',
    sanskritName: 'Nazar Dosh & Rahu Kawach',
    category: 'Protection',
    price: 1100,
    icon: '🛡️',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    description: 'Powerful aura cleansing spell to shield your home, health, and family from jealousy, black magic & negative energy.',
    benefits: ['Creates psychic protective shield', 'Cleanses home & workplace aura', 'Relieves sudden unexplained anxiety'],
    available: true,
  },
  {
    id: 'job_growth',
    title: 'Career & Business Growth Spell',
    sanskritName: 'Karya Siddhi & Vyapar Sangathan',
    category: 'Career & Business',
    price: 1100,
    icon: '💼',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    description: 'Auspicious ritual designed to secure job promotions, pass competitive exams & win pending legal or office battles.',
    benefits: ['Boosts authority & leadership standing', 'Clears hurdles in promotions', 'Attracts recognition from superiors'],
    available: true,
  },
  {
    id: 'marriage_healing',
    title: 'Marriage & Relationship Healing Spell',
    sanskritName: 'Gauri Shankar Vivah Remedy',
    category: 'Love & Marriage',
    price: 1100,
    icon: '🕊️',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
    description: 'Sacred marital harmony ritual to remove obstacles in marriage proposal acceptance & restore peace between spouses.',
    benefits: ['Speeds up marriage proposal acceptance', 'Restores trust & bonding', 'Neutralizes Manglik tension'],
    available: true,
  },
  {
    id: 'academic_focus',
    title: 'Focus & Academic Excellence Spell',
    sanskritName: 'Saraswati Vidya & Buddhi Bandhan',
    category: 'Education & Mind',
    price: 1100,
    icon: '🧠',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    description: 'Enhances memory retention, mental sharpness, and examination performance for students and researchers.',
    benefits: ['Sharpen memory retention', 'Removes exam stress & fear', 'Boosts concentration power'],
    available: true,
  },
];

const INITIAL_DEMO_SPELL_ORDERS: SpellOrderRecord[] = [
  {
    id: 'SPELL-48219',
    spellId: 'love_attraction',
    spellTitle: 'Love & Soulmate Attraction Spell',
    price: 1100,
    userName: 'Demo Seeker',
    targetName: 'Priyanka & Demo',
    dob: '01-07-2003',
    intention: 'Manifest mutual love, trust and marriage commitment.',
    paymentMethod: 'wallet',
    date: '2026-08-01 12:15',
    status: 'Casting in Progress',
  },
];

export const useSpellsStore = create<SpellsState>()(
  persist(
    (set, get) => ({
      spells: DEFAULT_SPELLS,
      spellOrders: INITIAL_DEMO_SPELL_ORDERS,

      updateSpellPrice: (spellId, newPrice) => {
        set((state) => ({
          spells: state.spells.map((s) => (s.id === spellId ? { ...s, price: newPrice } : s)),
        }));
      },

      toggleSpellAvailable: (spellId) => {
        set((state) => ({
          spells: state.spells.map((s) => (s.id === spellId ? { ...s, available: !s.available } : s)),
        }));
      },

      placeSpellOrder: (orderData) => {
        const orderId = `SPELL-${Math.floor(10000 + Math.random() * 90000)}`;
        const now = new Date();
        const dateStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const newOrder: SpellOrderRecord = {
          ...orderData,
          id: orderId,
          date: dateStr,
          status: 'Ritual Scheduled',
        };

        set((state) => ({
          spellOrders: [newOrder, ...state.spellOrders],
        }));

        return newOrder;
      },

      updateSpellOrderStatus: (orderId, newStatus) => {
        set((state) => ({
          spellOrders: state.spellOrders.map((ord) =>
            ord.id === orderId ? { ...ord, status: newStatus } : ord
          ),
        }));
      },
    }),
    {
      name: 'astroguru_spells_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
