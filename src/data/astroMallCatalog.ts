/**
 * AstroGuru Sacred E-Puja & Consecrated Remedy Catalog (AstroMall)
 * Connected with Kundli doshas (Sade Sati, Manglik, Rahu-Ketu, Pitra Dosha).
 */

export interface AstroMallItem {
  id: string;
  name: string;
  sanskritName?: string;
  category: 'puja' | 'rudraksha' | 'gemstone' | 'yantra';
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  templeOrOrigin: string;
  consecration: string;
  doshaTarget: string; // Used for auto-prescriptions
  benefits: string[];
  certification: string;
  inStock: boolean;
  prashadIncluded?: boolean;
}

export const ASTROMALL_CATALOG: AstroMallItem[] = [
  // ─── SACRED TEMPLE PUJAS ───
  {
    id: 'puja_kashi_rudrabhishek',
    name: 'Maha Rudrabhishek with Bilva Archana',
    sanskritName: 'रुद्राभिषेक महापूजा',
    category: 'puja',
    price: 1100,
    originalPrice: 2100,
    rating: 4.9,
    reviews: 1420,
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80',
    templeOrOrigin: 'Kashi Vishwanath Jyotirlinga, Varanasi',
    consecration: 'Performed by 5 Dikshit Vedic Pandits with individual Sankalp',
    doshaTarget: 'Shani Sade Sati & Mental Stress',
    benefits: [
      'Destroys deep-rooted negative planetary afflictions and Shani obstacles.',
      'Grants radiant health, psychological serenity, and long life.',
      'Special personal Gotra and Nakshatra Sankalp performed before Jyotirlinga.',
    ],
    certification: 'Live Video Proof & Temple Certificate Dispatched',
    inStock: true,
    prashadIncluded: true,
  },
  {
    id: 'puja_mahakal_bhasma',
    name: 'Special Bhasma Aarti & Maha Mrityunjaya Sankalp',
    sanskritName: 'भस्म आरती महाकाल पूजा',
    category: 'puja',
    price: 2100,
    originalPrice: 3500,
    rating: 5.0,
    reviews: 2180,
    image: 'https://images.unsplash.com/photo-1545232979-fbf592320b9a?auto=format&fit=crop&w=600&q=80',
    templeOrOrigin: 'Mahakaleshwar Jyotirlinga, Ujjain',
    consecration: 'Consecrated during Brahma Muhurat Bhasma Aarti',
    doshaTarget: 'Untimely Death Fear, Rahu & Ketu Afflictions',
    benefits: [
      'Powerful shield against accidents, occult negativities, and terminal fear.',
      'Sankalp performed in the inner Sanctum Sanctorum (Garbhagriha).',
      'Original sacred Mahakal Bhasma, Rudraksha, and Dry Fruit Prasad delivered.',
    ],
    certification: 'Temple Trust Authorized Purohit Receipt & Video Snippet',
    inStock: true,
    prashadIncluded: true,
  },
  {
    id: 'puja_kalsarp_trimbak',
    name: 'Vedic Kalsarp & Rahu-Ketu Shanti Puja',
    sanskritName: 'कालसर्प दोष निवारण शांति',
    category: 'puja',
    price: 2500,
    originalPrice: 4200,
    rating: 4.8,
    reviews: 980,
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=600&q=80',
    templeOrOrigin: 'Trimbakeshwar Jyotirlinga, Nashik',
    consecration: 'Performed on Godavari Sangam by Tamrapatra Acharyas',
    doshaTarget: 'Kalsarp Dosha & Career Stagnation',
    benefits: [
      'Breaks repetitive career stagnation, business loss, and sudden downfalls.',
      'Resolves severe marriage delays and chronic family disputes.',
      'Silver Nag-Nagin yantra energized during ritual and sent to seeker.',
    ],
    certification: 'Trimbak Purohit Sangh Certified Video Proof',
    inStock: true,
    prashadIncluded: true,
  },
  {
    id: 'puja_mangal_ujjain',
    name: 'Bhat Puja for Mangal Dosha Shanti',
    sanskritName: 'भात पूजा मंगल दोष शांति',
    category: 'puja',
    price: 1500,
    originalPrice: 2800,
    rating: 4.9,
    reviews: 1340,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    templeOrOrigin: 'Mangalnath Temple, Ujjain (Birthplace of Mars)',
    consecration: 'Vedic Cooked Rice (Bhat) Abhishek on Mars Core Meridian',
    doshaTarget: 'Manglik Dosha & Relationship Friction',
    benefits: [
      'Pacifies aggressive Mars energy causing marital turbulence and divorce threats.',
      'Accelerates prospective marriage proposals and matchmaking compatibility.',
      'Restores peaceful communication between spouses.',
    ],
    certification: 'Mangalnath Teerth Video & Consecrated Raksha Sutra',
    inStock: true,
    prashadIncluded: true,
  },

  // ─── CONSECRATED RUDRAKSHAS ───
  {
    id: 'rudraksha_7_mukhi',
    name: 'Original 7-Mukhi Nepali Rudraksha',
    sanskritName: 'सप्तमुखी महालक्ष्मी रुद्राक्ष',
    category: 'rudraksha',
    price: 850,
    originalPrice: 1600,
    rating: 4.9,
    reviews: 3120,
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80',
    templeOrOrigin: 'Pashupatinath Consecrated (Nepal Hills)',
    consecration: '108 Mahalakshmi & Shani Gayatri Mantras Prana Pratishtha',
    doshaTarget: 'Shani Sade Sati & Debt Recovery',
    benefits: [
      'Governed by Goddess Mahalakshmi; magnetizes steady wealth and business income.',
      'Neutralizes Saturnian malefic effects (Sade Sati, Dhayya, Panoti).',
      'Shields wearer from sudden financial catastrophes and legal losses.',
    ],
    certification: 'Govt. Accredited Gemological Laboratory Certified with X-Ray',
    inStock: true,
  },
  {
    id: 'rudraksha_5_mukhi_mala',
    name: '108+1 Consecrated 5-Mukhi Japa Mala',
    sanskritName: 'पंचमुखी शिव रुद्राक्ष माला',
    category: 'rudraksha',
    price: 450,
    originalPrice: 900,
    rating: 4.8,
    reviews: 4890,
    image: 'https://images.unsplash.com/photo-1599818490384-cb98fe717e17?auto=format&fit=crop&w=600&q=80',
    templeOrOrigin: 'Haridwar Sacred Ganga Ghat Consecration',
    consecration: 'Ganga Snan and Rudra Gayatri Abhimantrit',
    doshaTarget: 'Brihaspati Weakness & Anxiety',
    benefits: [
      'Stabilizes blood pressure, clears mental clutter, and deepens concentration.',
      'Ideal sacred tool for daily Gayatri, Shiva, or Mahamrityunjaya Japa.',
      'Promotes peace of mind and family harmony.',
    ],
    certification: '100% Authentic Natural Himalayan Seeds Verified',
    inStock: true,
  },
  {
    id: 'rudraksha_gauri_shankar',
    name: 'Sacred Gauri Shankar Rudraksha',
    sanskritName: 'गौरी शंकर रुद्राक्ष',
    category: 'rudraksha',
    price: 2400,
    originalPrice: 4500,
    rating: 5.0,
    reviews: 840,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    templeOrOrigin: 'Mount Kailash Foothills (Nepal)',
    consecration: 'Uma-Maheshwara Sampoorna Vivah Mantra Abhimantrit',
    doshaTarget: 'Marriage Delays & Marital Discord',
    benefits: [
      'Two naturally joined beads symbolizing Lord Shiva and Goddess Parvati.',
      'Premier spiritual remedy for attracting ideal soulmate and preventing divorce.',
      'Infuses lifelong affectionate unity and understanding between partners.',
    ],
    certification: 'International Gem Testing Laboratory (IGTL) Certificate',
    inStock: true,
  },

  // ─── CERTIFIED NATURAL GEMSTONES ───
  {
    id: 'gem_blue_sapphire',
    name: 'Natural Certified Blue Sapphire (Neelam)',
    sanskritName: 'प्राकृतिक नीलम रत्न',
    category: 'gemstone',
    price: 4500,
    originalPrice: 8000,
    rating: 4.9,
    reviews: 620,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    templeOrOrigin: 'Ceylon (Sri Lanka) Earth-Mined',
    consecration: 'Shani Shanti Vedic Havan Energized on Saturday Dawn',
    doshaTarget: 'Shani Sade Sati & Sluggish Career',
    benefits: [
      'Most potent gem of Saturn; brings lightning-fast breakthrough and career catapult.',
      'Enhances mental discipline, focus, strategic vision, and political clout.',
      'Unlocks frozen inheritance and resolves stalled litigation.',
    ],
    certification: 'Govt. ISO 9001:2015 Certified Gemological Lab Card',
    inStock: true,
  },
  {
    id: 'gem_yellow_sapphire',
    name: 'Vedic Untreated Yellow Sapphire (Pukhraj)',
    sanskritName: 'बृहस्पति पुखराज रत्न',
    category: 'gemstone',
    price: 3800,
    originalPrice: 6500,
    rating: 4.9,
    reviews: 1120,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    templeOrOrigin: 'Ratnapura Mines, Sri Lanka',
    consecration: 'Brihaspati Beej Mantra 19,000 chants energization',
    doshaTarget: 'Brihaspati Affliction, Marriage & Child Guidance',
    benefits: [
      'Magnifies higher wisdom, spiritual prosperity, wealth, and marriage prospects.',
      'Protects legal reputation, boosts academic and administrative exams.',
      'Grants blessing of progeny and harmonious domestic bliss.',
    ],
    certification: 'Gemological Institute of India (GII) Lab Card with QR Code',
    inStock: true,
  },
  {
    id: 'gem_red_coral',
    name: 'Triangular Natural Italian Red Coral (Moonga)',
    sanskritName: 'त्रिकोणीय लाल मूंगा रत्न',
    category: 'gemstone',
    price: 1800,
    originalPrice: 3200,
    rating: 4.8,
    reviews: 940,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    templeOrOrigin: 'Mediterranean Sea, Italy',
    consecration: 'Hanumanji Sindoor and Mangal Gayatri Sanctified',
    doshaTarget: 'Manglik Dosha, Lethargy & Blood Purity',
    benefits: [
      'Channels Mars courage, removes hesitation, fear of competition, and debt.',
      'Crucial protective talisman for real estate, engineering, and sports ventures.',
      'Mitigates hot-tempered outbursts and stabilizes physical energy.',
    ],
    certification: 'National Gemological Laboratory Certified',
    inStock: true,
  },

  // ─── SACRED ENERGIZED YANTRAS ───
  {
    id: 'yantra_sri_chakra',
    name: '24K Gold-Plated Meru Sri Yantra',
    sanskritName: '२४ कैरेट स्वर्ण लेपित श्री यन्त्र',
    category: 'yantra',
    price: 1200,
    originalPrice: 2400,
    rating: 5.0,
    reviews: 2410,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    templeOrOrigin: 'Kamakshi Amman Temple Sanctum (Kanchipuram)',
    consecration: 'Sri Suktam & Lalita Sahasranama 1,008 Archana',
    doshaTarget: 'Poverty Yoga, Vastu Dosha & Stagnant Income',
    benefits: [
      'Supreme geometric representation of cosmic mother Lalita Tripurasundari.',
      'Clears negative Vastu vortices from homes, offices, and cash drawers.',
      'Draws permanent magnetic wealth, auspiciousness, and spiritual enlightenment.',
    ],
    certification: 'Consecration Certificate with Sacred Temple Kumkum',
    inStock: true,
  },
  {
    id: 'yantra_kuber_wealth',
    name: 'Heavy Brass Kuber Dhan Prapti Yantra',
    sanskritName: 'कुबेर धन प्राप्ति यन्त्र',
    category: 'yantra',
    price: 750,
    originalPrice: 1500,
    rating: 4.8,
    reviews: 1820,
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
    templeOrOrigin: 'Alandi Teerth Sanctified',
    consecration: 'Kuber Ashta-Lakshmi Mantra Abhimantrit',
    doshaTarget: 'Debt Traps & Blocked Business Cashflow',
    benefits: [
      'Lord Kuber guards divine celestial treasures; opens unexpected cash channels.',
      'Unlocks recovery of stuck business payments and borrowed capital.',
      'Brings financial protection against reckless fiscal losses.',
    ],
    certification: 'Vedic Energization Seal Included',
    inStock: true,
  },
];

/**
 * Helper to get recommended remedies based on active Kundli doshas
 */
export function getRecommendedRemedies(doshas?: string[]): AstroMallItem[] {
  const cleanDoshas = (doshas || []).map((d) => d.toLowerCase());

  // Shani Sade Sati or Saturn affliction
  if (cleanDoshas.some((d) => d.includes('sade') || d.includes('shani') || d.includes('saturn'))) {
    return ASTROMALL_CATALOG.filter((item) =>
      item.doshaTarget.toLowerCase().includes('shani') ||
      item.id === 'rudraksha_7_mukhi' ||
      item.id === 'puja_kashi_rudrabhishek'
    );
  }

  // Manglik Dosha
  if (cleanDoshas.some((d) => d.includes('mangal') || d.includes('manglik') || d.includes('mars'))) {
    return ASTROMALL_CATALOG.filter((item) =>
      item.doshaTarget.toLowerCase().includes('mangal') ||
      item.id === 'gem_red_coral' ||
      item.id === 'puja_mangal_ujjain'
    );
  }

  // Rahu / Kalsarp
  if (cleanDoshas.some((d) => d.includes('kalsarp') || d.includes('rahu') || d.includes('ketu'))) {
    return ASTROMALL_CATALOG.filter((item) =>
      item.doshaTarget.toLowerCase().includes('kalsarp') ||
      item.id === 'puja_kalsarp_trimbak' ||
      item.id === 'puja_mahakal_bhasma'
    );
  }

  // Default top recommendations
  return [
    ASTROMALL_CATALOG[0], // Kashi Rudrabhishek
    ASTROMALL_CATALOG[4], // 7-Mukhi Rudraksha
    ASTROMALL_CATALOG[10], // 24K Sri Yantra
    ASTROMALL_CATALOG[1], // Mahakal Bhasma
  ];
}
