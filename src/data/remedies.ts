export interface GemstoneRemedy {
  id: string;
  name: string;
  sanskritName: string;
  planet: string;
  planetIcon: string;
  price: number;
  rating: number;
  reviewsCount: number;
  benefits: string[];
  recommendedFor: string;
  finger: string;
  metal: string;
  image: string;
}

export const GEMSTONES_CATALOG: GemstoneRemedy[] = [
  {
    id: 'yellow-sapphire',
    name: 'Natural Yellow Sapphire',
    sanskritName: 'Pukhraj (पुखराज)',
    planet: 'Jupiter (Guru)',
    planetIcon: '🪐',
    price: 4999,
    rating: 4.9,
    reviewsCount: 128,
    benefits: ['Brings wealth, wisdom and marital harmony', 'Strengthens Jupiter in 1st, 5th & 9th house', 'Enhances academic and career success'],
    recommendedFor: 'Sagittarius & Pisces Lagna / Weak Jupiter',
    finger: 'Index Finger (Right Hand)',
    metal: 'Yellow Gold or Brass',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'emerald',
    name: 'Certified Zambian Emerald',
    sanskritName: 'Panna (पन्ना)',
    planet: 'Mercury (Budh)',
    planetIcon: '✨',
    price: 3499,
    rating: 4.8,
    reviewsCount: 94,
    benefits: ['Boosts communication, memory and business acumen', 'Relieves mental stress and anxiety', 'Attracts financial prosperity'],
    recommendedFor: 'Gemini & Virgo Lagna / Weak Mercury',
    finger: 'Little Finger (Right Hand)',
    metal: 'Gold or Silver',
    image: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'blue-sapphire',
    name: 'Ceylon Blue Sapphire',
    sanskritName: 'Neelam (नीलम)',
    planet: 'Saturn (Shani)',
    planetIcon: '🪐',
    price: 7999,
    rating: 4.9,
    reviewsCount: 210,
    benefits: ['Instant rise in career, status and authority', 'Protection from Shani Sade Sati & Rahu effects', 'Clears chronic obstacles'],
    recommendedFor: 'Capricorn & Aquarius Lagna',
    finger: 'Middle Finger (Right Hand)',
    metal: 'Silver or Panchdhatu',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'ruby',
    name: 'Burmese Natural Ruby',
    sanskritName: 'Manik (माणिक्य)',
    planet: 'Sun (Surya)',
    planetIcon: '☀️',
    price: 5999,
    rating: 4.9,
    reviewsCount: 156,
    benefits: ['Enhances leadership, confidence and vital energy', 'Favorable for government jobs & administration', 'Strengthens heart and bones'],
    recommendedFor: 'Leo Lagna / Weak Sun',
    finger: 'Ring Finger (Right Hand)',
    metal: 'Copper or Gold',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'pearl',
    name: 'South Sea Natural Pearl',
    sanskritName: 'Moti (मोती)',
    planet: 'Moon (Chandra)',
    planetIcon: '🌙',
    price: 2499,
    rating: 4.7,
    reviewsCount: 88,
    benefits: ['Instills deep emotional peace and calmness', 'Cures mood swings and improves sleep quality', 'Harmonizes mother-child relationship'],
    recommendedFor: 'Cancer Lagna / Afflicted Moon',
    finger: 'Little Finger (Right Hand)',
    metal: 'Pure Silver',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=400',
  },
];
