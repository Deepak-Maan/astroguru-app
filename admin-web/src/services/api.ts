import { AstrologerProfile, BannedEntity, OrderItem, SecurityIncident, UserRecord } from '../types';

export const INITIAL_INCIDENTS: SecurityIncident[] = [
  {
    id: 'inc-901',
    timestamp: 'Just now',
    type: 'DIRECT_CONTACT_LEAK',
    severity: 'critical',
    userId: 'usr-9281',
    userName: 'Rohan Malhotra',
    phone: '9820198201',
    astrologerId: 'astro-1',
    astrologerName: 'Acharya Dev Sharma',
    evidence: 'Seeker sent message: "Call me directly on WhatsApp at 98201-98201, will pay ₹500 via GPay directly"',
    deviceFingerprint: 'UUID-98A1-FE44-88BC',
    status: 'pending',
  },
  {
    id: 'inc-902',
    timestamp: '14m ago',
    type: 'MULTI_ACCOUNT_FREE_CHAT',
    severity: 'high',
    userId: 'usr-9304',
    userName: 'Guest Seeker 88',
    evidence: 'Same hardware fingerprint (UUID-A781-B110) launched 4th consecutive free 5-minute consultation via burner accounts.',
    deviceFingerprint: 'UUID-A781-B110-33CD',
    status: 'pending',
  },
  {
    id: 'inc-903',
    timestamp: '1h 22m ago',
    type: 'PAYMENT_BYPASS_UPI',
    severity: 'critical',
    userId: 'usr-8199',
    userName: 'Vikram Choudhary',
    evidence: 'Intercepted UPI handle leak: "Send payment to devsharma@okhdfcbank to get full horoscope PDF"',
    deviceFingerprint: 'UUID-55C2-9011-EE01',
    status: 'pending',
  },
];

export const INITIAL_BLACKLIST: BannedEntity[] = [
  {
    id: 'ban-101',
    entityType: 'device',
    identifier: 'UUID-8891-AA02-9999',
    name: 'Burner Farm Farm-Node-A',
    reason: 'Multi-Account Free-Chat Farming (12 accounts linked)',
    bannedAt: '12 Sep 2026',
    duration: 'Permanent',
  },
  {
    id: 'ban-102',
    entityType: 'phone',
    identifier: '+91 98112 00011',
    name: 'Ramesh Verma',
    reason: 'Off-Platform WhatsApp bypass solicitation',
    bannedAt: '14 Sep 2026',
    duration: '30 Days',
  },
  {
    id: 'ban-103',
    entityType: 'user',
    identifier: 'usr-fake-991',
    name: 'TarotScammerBot',
    reason: 'Direct UPI diversion scam',
    bannedAt: '15 Sep 2026',
    duration: 'Permanent',
  },
];

export const INITIAL_ASTROLOGERS: AstrologerProfile[] = [
  {
    id: 'astro_1001',
    name: 'Acharya Dev Sharma',
    email: 'acharya@astroguru.app',
    phone: '+91 98765 43211',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    specialties: ['Vedic Astrology', 'Kundli Prashna', 'Nadi Shastra'],
    experienceYears: 18,
    ratePerMin: 25,
    rating: 4.97,
    reviewsCount: 1420,
    totalConsultations: 8520,
    status: 'active',
    commissionRate: 75,
    onDuty: true,
  },
  {
    id: 'astro_1786457216977',
    name: 'Vivek Kumar',
    email: 'vivek@gmail.com',
    phone: '+91 89505 12977',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    specialties: ['Vedic Astrology', 'Kundli Matching', 'Remedies'],
    experienceYears: 10,
    ratePerMin: 25,
    rating: 5.0,
    reviewsCount: 24,
    totalConsultations: 180,
    status: 'active',
    commissionRate: 75,
    onDuty: true,
  },
  {
    id: 'astro-2',
    name: 'Dr. Radhika Veda',
    email: 'radhika@astroguru.app',
    phone: '+91 98201 12345',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    specialties: ['Tarot Cards', 'Love Compatibility', 'Numerology'],
    experienceYears: 12,
    ratePerMin: 20,
    rating: 4.88,
    reviewsCount: 980,
    totalConsultations: 4310,
    status: 'active',
    commissionRate: 70,
    onDuty: true,
  },
  {
    id: 'astro-3',
    name: 'Pt. Rameshwar Shastri',
    email: 'rameshwar@astroguru.app',
    phone: '+91 97111 88822',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    specialties: ['Lal Kitab', 'Vastu Shastra', 'Muhurat'],
    experienceYears: 22,
    ratePerMin: 35,
    rating: 4.95,
    reviewsCount: 2150,
    totalConsultations: 11400,
    status: 'active',
    commissionRate: 80,
    onDuty: false,
  },
];

export const INITIAL_USERS: UserRecord[] = [
  {
    id: 'usr_1001',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@astroguru.app',
    phone: '+91 98765 43210',
    walletBalance: 310,
    totalSpent: 4200,
    kundliCreated: true,
    isVip: true,
    createdAt: '10 Aug 2026',
    status: 'active',
  },
  {
    id: 'usr_1786458873223',
    name: 'Deepak Maan',
    email: '7496850133@astroguru.app',
    phone: '+91 74968 50133',
    walletBalance: 50,
    totalSpent: 1250,
    kundliCreated: true,
    isVip: false,
    createdAt: '11 Aug 2026',
    status: 'active',
  },
  {
    id: 'usr_1002',
    name: 'Pooja Verma',
    email: 'pooja.verma@astroguru.app',
    phone: '+91 97654 11223',
    walletBalance: 420,
    totalSpent: 3150,
    kundliCreated: true,
    isVip: false,
    createdAt: '18 Aug 2026',
    status: 'active',
  },
  {
    id: 'usr_1003',
    name: 'Rajesh Nair',
    email: 'rajesh.nair@astroguru.app',
    phone: '+91 99220 88344',
    walletBalance: 500,
    totalSpent: 2600,
    kundliCreated: true,
    isVip: true,
    createdAt: '01 Sep 2026',
    status: 'active',
  },
];

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ORD-9821',
    customerName: 'Ananya Sharma',
    phone: '+91 98765 43210',
    itemType: 'puja',
    title: 'Maha Mrityunjaya Vedic E-Puja',
    amount: 3501,
    sankalpDetails: 'Gotra: Kashyap · Health & Long-Life Sankalp · Ujjain Mahakal Temple',
    status: 'pandit_assigned',
    trackingNumber: 'PUJA-MAHA-441',
    createdAt: 'Today, 09:30 AM',
  },
  {
    id: 'ORD-9822',
    customerName: 'Deepak Maan',
    phone: '+91 74968 50133',
    itemType: 'rudraksha',
    title: 'Certified 5-Mukhi Nepali Rudraksha Mala',
    amount: 1499,
    status: 'dispatched',
    trackingNumber: 'DTDC-88192039',
    createdAt: 'Yesterday, 04:15 PM',
  },
  {
    id: 'ORD-9823',
    customerName: 'Pooja Verma',
    phone: '+91 97654 11223',
    itemType: 'gemstone',
    title: 'Lab-Certified Yellow Sapphire (Pukhraj) 5.25 Ratti',
    amount: 8999,
    status: 'performed',
    trackingNumber: 'BLUEDART-99281',
    createdAt: '15 Sep 2026',
  },
];

export async function fetchLiveAdminData(): Promise<{
  users?: UserRecord[];
  astrologers?: AstrologerProfile[];
  orders?: OrderItem[];
  incidents?: SecurityIncident[];
  blacklist?: BannedEntity[];
}> {
  try {
    const res = await fetch('/api/admin/data');
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return data;
      }
    }
  } catch (_) {}
  return {
    users: INITIAL_USERS,
    astrologers: INITIAL_ASTROLOGERS,
    orders: INITIAL_ORDERS,
    incidents: INITIAL_INCIDENTS,
    blacklist: INITIAL_BLACKLIST,
  };
}

export async function adjustUserWalletApi(userId: string, delta: number, note: string) {
  try {
    await fetch('/api/admin/users/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, delta, note }),
    });
  } catch (_) {}
}

export async function toggleUserStatusApi(userId: string) {
  try {
    await fetch('/api/admin/users/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  } catch (_) {}
}

export async function toggleAstrologerDutyApi(astrologerId: string) {
  try {
    await fetch('/api/admin/astrologers/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ astrologerId }),
    });
  } catch (_) {}
}

export async function verifyAstrologerApi(astrologerId: string) {
  try {
    await fetch('/api/admin/astrologers/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ astrologerId }),
    });
  } catch (_) {}
}

export async function updateAstrologerRateApi(astrologerId: string, ratePerMin: number) {
  try {
    await fetch('/api/admin/astrologers/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ astrologerId, ratePerMin }),
    });
  } catch (_) {}
}
