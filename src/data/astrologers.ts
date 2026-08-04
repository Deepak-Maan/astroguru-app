import { Astrologer } from '../types';

/**
 * Mock astrologer directory. In production this would come from a backend
 * (Firebase/Firestore). Avatars use pravatar placeholder faces.
 */
export const ASTROLOGERS: Astrologer[] = [
  {
    id: 'a1', name: 'Pandit Raghav Sharma', avatar: 'https://i.pravatar.cc/200?img=12',
    specialties: ['Vedic', 'Kundli', 'Marriage'], languages: ['Hindi', 'English'],
    experienceYears: 18, rating: 4.9, reviews: 12480, pricePerMin: 35, online: true,
    about: 'Third-generation Vedic astrologer specialising in kundli matching and marriage timing. Guided over 50,000 seekers.',
    consultations: 61200,
  },
  {
    id: 'a2', name: 'Acharya Meera Joshi', avatar: 'https://i.pravatar.cc/200?img=45',
    specialties: ['Tarot', 'Love', 'Career'], languages: ['Hindi', 'English', 'Marathi'],
    experienceYears: 11, rating: 4.8, reviews: 8340, pricePerMin: 28, online: true,
    about: 'Tarot and Vedic reader focused on love, relationships and career clarity with a compassionate approach.',
    consultations: 39000,
  },
  {
    id: 'a3', name: 'Dr. Suresh Iyer', avatar: 'https://i.pravatar.cc/200?img=68',
    specialties: ['Numerology', 'Vastu', 'Remedies'], languages: ['English', 'Tamil', 'Telugu'],
    experienceYears: 22, rating: 4.9, reviews: 15600, pricePerMin: 42, online: false,
    about: 'PhD in Vedic sciences. Expert in numerology, vastu correction and practical planetary remedies.',
    consultations: 74500,
  },
  {
    id: 'a4', name: 'Guru Ananya Nair', avatar: 'https://i.pravatar.cc/200?img=32',
    specialties: ['Palmistry', 'Face Reading', 'Health'], languages: ['English', 'Malayalam', 'Hindi'],
    experienceYears: 9, rating: 4.7, reviews: 5210, pricePerMin: 22, online: true,
    about: 'Palmist and face-reading specialist. Known for direct, honest and remedy-oriented guidance.',
    consultations: 21800,
  },
  {
    id: 'a5', name: 'Shastri Vikram Rao', avatar: 'https://i.pravatar.cc/200?img=13',
    specialties: ['KP System', 'Prashna', 'Finance'], languages: ['Hindi', 'Kannada', 'English'],
    experienceYears: 15, rating: 4.8, reviews: 9870, pricePerMin: 38, online: true,
    about: 'KP and Prashna astrologer trusted for precise financial and career predictions.',
    consultations: 48300,
  },
  {
    id: 'a6', name: 'Jyotishi Radha Menon', avatar: 'https://i.pravatar.cc/200?img=47',
    specialties: ['Vedic', 'Child', 'Education'], languages: ['English', 'Hindi'],
    experienceYears: 13, rating: 4.9, reviews: 7020, pricePerMin: 30, online: false,
    about: 'Specialises in children’s horoscopes, education and naming (namkaran) as per Vedic principles.',
    consultations: 33400,
  },
  {
    id: 'a7', name: 'Pandit Deepak Trivedi', avatar: 'https://i.pravatar.cc/200?img=15',
    specialties: ['Muhurat', 'Gemstones', 'Puja'], languages: ['Hindi', 'Gujarati'],
    experienceYears: 27, rating: 5.0, reviews: 21050, pricePerMin: 55, online: true,
    about: 'Veteran astrologer for auspicious timings (muhurat), gemstone recommendation and remedial pujas.',
    consultations: 98700,
  },
  {
    id: 'a8', name: 'Sadhika Priya Verma', avatar: 'https://i.pravatar.cc/200?img=44',
    specialties: ['Tarot', 'Psychic', 'Love'], languages: ['English', 'Hindi', 'Punjabi'],
    experienceYears: 7, rating: 4.6, reviews: 3980, pricePerMin: 20, online: true,
    about: 'Intuitive tarot and psychic reader helping with love, breakups and emotional healing.',
    consultations: 15600,
  },
  {
    id: 'a9', name: 'Acharya Mohan Das', avatar: 'https://i.pravatar.cc/200?img=52',
    specialties: ['Vedic', 'Dosha', 'Kaal Sarp'], languages: ['Hindi', 'Bengali', 'English'],
    experienceYears: 20, rating: 4.8, reviews: 11200, pricePerMin: 40, online: true,
    about: 'Authority on doshas — Mangal, Kaal Sarp and Pitra — with time-tested remedies.',
    consultations: 55900,
  },
  {
    id: 'a10', name: 'Jyotish Kavya Reddy', avatar: 'https://i.pravatar.cc/200?img=48',
    specialties: ['Numerology', 'Career', 'Business'], languages: ['English', 'Telugu', 'Hindi'],
    experienceYears: 10, rating: 4.7, reviews: 6140, pricePerMin: 26, online: false,
    about: 'Numerologist for career switches, business names and brand luck alignment.',
    consultations: 27300,
  },
  {
    id: 'a11', name: 'Pandit Harish Chandra', avatar: 'https://i.pravatar.cc/200?img=51',
    specialties: ['Vedic', 'Health', 'Longevity'], languages: ['Hindi', 'Sanskrit'],
    experienceYears: 31, rating: 4.9, reviews: 18900, pricePerMin: 60, online: true,
    about: 'Classical Vedic scholar focusing on health, longevity (ayush) and spiritual growth.',
    consultations: 87600,
  },
  {
    id: 'a12', name: 'Tarot Isha Kapoor', avatar: 'https://i.pravatar.cc/200?img=30',
    specialties: ['Tarot', 'Angel', 'Manifestation'], languages: ['English', 'Hindi'],
    experienceYears: 6, rating: 4.6, reviews: 2980, pricePerMin: 18, online: true,
    about: 'Angel card and manifestation coach blending tarot with practical life guidance.',
    consultations: 11200,
  },
];

export const astrologerById = (id: string): Astrologer | undefined =>
  ASTROLOGERS.find((a) => a.id === id);
