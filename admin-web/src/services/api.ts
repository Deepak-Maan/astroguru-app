import {
  AdminAuditLog,
  AstrologerProfile,
  BannedEntity,
  LiveConsultationSession,
  OrderItem,
  SecurityIncident,
  SystemHealthConfig,
  UserRecord,
} from '../types';

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
    isFeatured: true,
    boostRank: 1,
    strikesCount: 0,
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
    isFeatured: false,
    boostRank: 3,
    strikesCount: 0,
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
    isFeatured: true,
    boostRank: 2,
    strikesCount: 0,
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
    isFeatured: false,
    boostRank: 5,
    strikesCount: 1,
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

export async function fetchWebsiteConfigApi() {
  try {
    const res = await fetch('/api/website/config');
    const data = await res.json();
    return data.config || null;
  } catch (_) {
    return null;
  }
}

export async function saveWebsiteConfigApi(config: any) {
  try {
    const res = await fetch('/api/website/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// -------------------------------------------------------------
// Live Sessions, Rank Boost, Audit Trail & System Health Models
// -------------------------------------------------------------

export const INITIAL_LIVE_SESSIONS: LiveConsultationSession[] = [
  {
    id: 'LIVE-SES-701',
    type: 'audio_call',
    astrologerId: 'astro_1001',
    astrologerName: 'Acharya Dev Sharma',
    astrologerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    userId: 'usr_201',
    userName: 'Aakash Verma',
    userPhone: '+91 98112 44321',
    startedAt: new Date(Date.now() - 480 * 1000).toISOString(),
    ratePerMin: 25,
    durationSeconds: 480,
    totalBilled: 200,
    status: 'active',
  },
  {
    id: 'LIVE-SES-702',
    type: 'chat',
    astrologerId: 'astro-2',
    astrologerName: 'Dr. Radhika Veda',
    astrologerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    userId: 'usr_202',
    userName: 'Megha Singhania',
    userPhone: '+91 99201 88312',
    startedAt: new Date(Date.now() - 310 * 1000).toISOString(),
    ratePerMin: 20,
    durationSeconds: 310,
    totalBilled: 103,
    status: 'active',
  },
  {
    id: 'LIVE-SES-703',
    type: 'video_call',
    astrologerId: 'astro_1786457216977',
    astrologerName: 'Vivek Kumar',
    astrologerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    userId: 'usr_203',
    userName: 'Rohit Khandelwal',
    userPhone: '+91 97112 00192',
    startedAt: new Date(Date.now() - 720 * 1000).toISOString(),
    ratePerMin: 25,
    durationSeconds: 720,
    totalBilled: 300,
    status: 'active',
    flaggedReason: 'Rapid message counter exceeded threshold - potential phone number exchange',
  },
];

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'AUD-8801',
    timestamp: 'Today, 12:45 PM',
    adminName: 'Master Admin',
    action: 'ASTRO_BOOST_UPDATED',
    targetEntity: 'Acharya Dev Sharma (astro_1001)',
    details: 'Pinned to mobile slot #1 with priority boost score 10',
    severity: 'info',
    ipAddress: '223.185.59.145',
  },
  {
    id: 'AUD-8802',
    timestamp: 'Today, 11:20 AM',
    adminName: 'Master Admin',
    action: 'WALLET_MANUAL_CREDIT',
    targetEntity: 'User: Deepak Maan (+91 74968 50133)',
    details: 'Credited ₹500 (V3.0.0 Welcome Bonus)',
    severity: 'info',
    ipAddress: '223.185.59.145',
  },
  {
    id: 'AUD-8803',
    timestamp: 'Today, 09:15 AM',
    adminName: 'Master Admin',
    action: 'UNIVERSAL_BAN_HAMMER',
    targetEntity: 'Device: UUID-8891-AA02-9999',
    details: 'Permanently banned device for multi-account free chat exploit',
    severity: 'critical',
    ipAddress: '223.185.59.145',
  },
  {
    id: 'AUD-8804',
    timestamp: 'Yesterday, 06:30 PM',
    adminName: 'Security Ops',
    action: 'EMERGENCY_SESSION_KILL',
    targetEntity: 'Session: LIVE-SES-694',
    details: 'Terminated session due to direct WhatsApp solicitation. Auto-refunded user.',
    severity: 'warning',
    ipAddress: '192.168.31.252',
  },
];

export const INITIAL_SYSTEM_HEALTH: SystemHealthConfig = {
  maintenanceMode: false,
  maintenanceNotice: 'AstroGuru is undergoing scheduled Vedic planetary alignment and platform optimization. We will be back online in a few minutes!',
  estimatedDowntime: '15 mins',
  allowAdminsBypass: true,
  lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export async function fetchLiveSessionsApi(): Promise<LiveConsultationSession[]> {
  try {
    const res = await fetch('/api/admin/live-sessions');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.sessions) return data.sessions;
    }
  } catch (_) {}
  return INITIAL_LIVE_SESSIONS;
}

export async function terminateLiveSessionApi(sessionId: string, reason: string, adminName: string) {
  try {
    const res = await fetch(`/api/admin/live-sessions/${sessionId}/terminate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, adminName }),
    });
    return await res.json();
  } catch (_) {
    return { success: true };
  }
}

export async function toggleAstrologerBoostApi(id: string, isFeatured: boolean, boostRank: number) {
  try {
    const res = await fetch(`/api/admin/astrologers/${id}/boost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured, boostRank }),
    });
    return await res.json();
  } catch (_) {
    return { success: true };
  }
}

export async function issueAstrologerStrikeApi(id: string, reason: string, adminName: string) {
  try {
    const res = await fetch(`/api/admin/astrologers/${id}/strike`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, adminName }),
    });
    return await res.json();
  } catch (_) {
    return { success: true };
  }
}

export async function fetchAuditLogsApi(): Promise<AdminAuditLog[]> {
  try {
    const res = await fetch('/api/admin/audit-logs');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.logs) return data.logs;
    }
  } catch (_) {}
  return INITIAL_AUDIT_LOGS;
}

export async function recordAuditLogApi(entry: Omit<AdminAuditLog, 'id' | 'timestamp'>) {
  try {
    const res = await fetch('/api/admin/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    return await res.json();
  } catch (_) {
    return { success: true };
  }
}

export async function fetchSystemHealthApi(): Promise<SystemHealthConfig> {
  try {
    const res = await fetch('/api/system/maintenance');
    if (res.ok) {
      const data = await res.json();
      if (data.config) return data.config;
    }
  } catch (_) {}
  return INITIAL_SYSTEM_HEALTH;
}

export async function saveSystemHealthApi(config: SystemHealthConfig) {
  try {
    const res = await fetch('/api/system/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}


