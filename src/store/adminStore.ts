import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface KycApprovalItem {
  id: string;
  astrologerId: string;
  astrologerName: string;
  docType: 'aadhaar_front' | 'aadhaar_back' | 'pan_card' | 'jyotish_degree' | 'passport';
  docNumberMasked: string;
  securityHash: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface PayoutRequest {
  id: string;
  astrologerId: string;
  astrologerName: string;
  amount: number;
  payoutMethod: 'UPI' | 'IMPS_BANK';
  payoutDetails: string; // e.g. "devsharma@okhdfcbank" or "HDFC 501002948291 IFSC: HDFC0001234"
  requestedAt: string;
  status: 'pending' | 'processed' | 'rejected';
  utrNumber?: string;
}

export interface PromoCoupon {
  code: string;
  title: string;
  discountType: 'percentage' | 'flat';
  discountValue: number; // e.g. 50 (%) or 100 (₹)
  minRecharge: number;
  maxUsage: number;
  redeemedCount: number;
  expiresAt: string;
  active: boolean;
}

export interface LiveSessionMonitor {
  id: string;
  seekerName: string;
  astrologerName: string;
  channel: 'Audio Call' | 'Live Video' | 'Direct Chat';
  durationMins: number;
  billedAmount: number;
  status: 'active' | 'completed' | 'disputed' | 'refunded';
  disputeReason?: string;
  toxicityScore: number; // 0 - 100 (0 = clean, 90 = toxic)
  startedAt: string;
}

export interface SecurityIncident {
  id: string;
  threatType: 'ROOT_JAILBREAK' | 'DUPLICATE_NONCE_REPLAY' | 'MITM_PROXY_ATTEMPT' | 'MEMORY_HOOK_FRIDA';
  deviceFingerprint: string;
  ipAddress: string;
  timestamp: string;
  actionTaken: 'BLOCKED' | 'RESTRICTED' | 'BANNED';
}

export interface AdminState {
  // KYC Desk
  kycQueue: KycApprovalItem[];
  // Payouts Desk
  payoutQueue: PayoutRequest[];
  // Promo Coupons
  coupons: PromoCoupon[];
  // Live Sessions & Disputes
  liveSessions: LiveSessionMonitor[];
  // Security Incidents
  securityIncidents: SecurityIncident[];
  bannedFingerprints: string[];
  // Global Pricing & Commission
  platformFeePercent: number; // e.g. 20 = 20%
  vipMonthlyPrice: number; // ₹299
  vipAnnualPrice: number; // ₹1,999

  // Actions
  approveKyc: (id: string) => void;
  rejectKyc: (id: string, reason: string) => void;

  approvePayout: (id: string) => void;
  rejectPayout: (id: string) => void;

  createCoupon: (coupon: Omit<PromoCoupon, 'redeemedCount'>) => void;
  toggleCouponActive: (code: string) => void;
  deleteCoupon: (code: string) => void;

  refundConsultation: (sessionId: string) => void;
  terminateSession: (sessionId: string) => void;

  banDevice: (fingerprint: string) => void;
  unbanDevice: (fingerprint: string) => void;

  updatePlatformFee: (fee: number) => void;
  updateVipPricing: (monthly: number, annual: number) => void;
}

const DEFAULT_KYC: KycApprovalItem[] = [
  {
    id: 'kyc-1',
    astrologerId: 'astro-1',
    astrologerName: 'Acharya Dev Sharma',
    docType: 'jyotish_degree',
    docNumberMasked: 'BVB-JYOTISH-2012-482',
    securityHash: 'AGY-SHA256-8A3F',
    submittedAt: '2026-08-20 14:15 IST',
    status: 'pending',
  },
  {
    id: 'kyc-2',
    astrologerId: 'astro-2',
    astrologerName: 'Dr. Radhika Veda',
    docType: 'aadhaar_front',
    docNumberMasked: 'XXXX-XXXX-9182',
    securityHash: 'AGY-SHA256-1B9C',
    submittedAt: '2026-08-20 16:30 IST',
    status: 'approved',
  },
  {
    id: 'kyc-3',
    astrologerId: 'astro-3',
    astrologerName: 'Pandit Krishna Shastri',
    docType: 'pan_card',
    docNumberMasked: '•••••4819K',
    securityHash: 'AGY-SHA256-4D2A',
    submittedAt: '2026-08-21 09:10 IST',
    status: 'pending',
  },
];

const DEFAULT_PAYOUTS: PayoutRequest[] = [
  {
    id: 'pay-1',
    astrologerId: 'astro-1',
    astrologerName: 'Acharya Dev Sharma',
    amount: 14250,
    payoutMethod: 'UPI',
    payoutDetails: 'devsharma@okhdfcbank',
    requestedAt: '2026-08-21 11:20 IST',
    status: 'pending',
  },
  {
    id: 'pay-2',
    astrologerId: 'astro-2',
    astrologerName: 'Dr. Radhika Veda',
    amount: 8600,
    payoutMethod: 'IMPS_BANK',
    payoutDetails: 'HDFC A/C: 50100482910 IFSC: HDFC0000128',
    requestedAt: '2026-08-20 18:45 IST',
    status: 'processed',
    utrNumber: 'UTR-20260820-884920194',
  },
  {
    id: 'pay-3',
    astrologerId: 'astro-4',
    astrologerName: 'Guru Ananya Nair',
    amount: 22100,
    payoutMethod: 'UPI',
    payoutDetails: 'ananyanair@icici',
    requestedAt: '2026-08-21 13:00 IST',
    status: 'pending',
  },
];

const DEFAULT_COUPONS: PromoCoupon[] = [
  {
    code: 'FIRSTCALLFREE',
    title: '100% Cashback on First Consultation',
    discountType: 'percentage',
    discountValue: 100,
    minRecharge: 200,
    maxUsage: 5000,
    redeemedCount: 1420,
    expiresAt: '2026-12-31',
    active: true,
  },
  {
    code: 'DIWALI50',
    title: 'Flat 50% Off On All Vedic Remedies & Spells',
    discountType: 'percentage',
    discountValue: 50,
    minRecharge: 500,
    maxUsage: 10000,
    redeemedCount: 3840,
    expiresAt: '2026-11-15',
    active: true,
  },
  {
    code: 'KUNDLI100',
    title: 'Flat ₹100 Off on 10-Page Kundli PDF Report',
    discountType: 'flat',
    discountValue: 100,
    minRecharge: 100,
    maxUsage: 2000,
    redeemedCount: 890,
    expiresAt: '2026-10-30',
    active: true,
  },
];

const DEFAULT_SESSIONS: LiveSessionMonitor[] = [
  {
    id: 'sess-101',
    seekerName: 'Amitabh Sen',
    astrologerName: 'Acharya Dev Sharma',
    channel: 'Audio Call',
    durationMins: 14,
    billedAmount: 350,
    status: 'active',
    toxicityScore: 0,
    startedAt: '15 mins ago',
  },
  {
    id: 'sess-102',
    seekerName: 'Pooja Hegde',
    astrologerName: 'Dr. Radhika Veda',
    channel: 'Live Video',
    durationMins: 22,
    billedAmount: 440,
    status: 'active',
    toxicityScore: 2,
    startedAt: '23 mins ago',
  },
  {
    id: 'sess-103',
    seekerName: 'Rahul Verma',
    astrologerName: 'Pandit Krishna Shastri',
    channel: 'Direct Chat',
    durationMins: 18,
    billedAmount: 270,
    status: 'disputed',
    disputeReason: 'Astrologer disconnected abruptly after 3 minutes due to network lag.',
    toxicityScore: 12,
    startedAt: '1 hour ago',
  },
];

const DEFAULT_INCIDENTS: SecurityIncident[] = [
  {
    id: 'inc-1',
    threatType: 'DUPLICATE_NONCE_REPLAY',
    deviceFingerprint: 'AGY-FP-8E1A-49F2',
    ipAddress: '103.21.144.82',
    timestamp: '2026-08-21 14:32 IST',
    actionTaken: 'BLOCKED',
  },
  {
    id: 'inc-2',
    threatType: 'ROOT_JAILBREAK',
    deviceFingerprint: 'AGY-FP-7B9C-11D0',
    ipAddress: '49.207.218.14',
    timestamp: '2026-08-21 15:10 IST',
    actionTaken: 'RESTRICTED',
  },
  {
    id: 'inc-3',
    threatType: 'MITM_PROXY_ATTEMPT',
    deviceFingerprint: 'AGY-FP-3A4E-99C1',
    ipAddress: '182.74.19.122',
    timestamp: '2026-08-21 15:45 IST',
    actionTaken: 'BANNED',
  },
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      kycQueue: DEFAULT_KYC,
      payoutQueue: DEFAULT_PAYOUTS,
      coupons: DEFAULT_COUPONS,
      liveSessions: DEFAULT_SESSIONS,
      securityIncidents: DEFAULT_INCIDENTS,
      bannedFingerprints: ['AGY-FP-3A4E-99C1'],
      platformFeePercent: 20,
      vipMonthlyPrice: 299,
      vipAnnualPrice: 1999,

      approveKyc: (id) => {
        set((state) => ({
          kycQueue: state.kycQueue.map((k) =>
            k.id === id ? { ...k, status: 'approved' } : k
          ),
        }));
      },

      rejectKyc: (id, reason) => {
        set((state) => ({
          kycQueue: state.kycQueue.map((k) =>
            k.id === id ? { ...k, status: 'rejected', rejectionReason: reason } : k
          ),
        }));
      },

      approvePayout: (id) => {
        const utr = `UTR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100000000 + Math.random() * 900000000)}`;
        set((state) => ({
          payoutQueue: state.payoutQueue.map((p) =>
            p.id === id ? { ...p, status: 'processed', utrNumber: utr } : p
          ),
        }));
      },

      rejectPayout: (id) => {
        set((state) => ({
          payoutQueue: state.payoutQueue.map((p) =>
            p.id === id ? { ...p, status: 'rejected' } : p
          ),
        }));
      },

      createCoupon: (couponData) => {
        const newCoupon: PromoCoupon = {
          ...couponData,
          redeemedCount: 0,
        };
        set((state) => ({
          coupons: [newCoupon, ...state.coupons.filter((c) => c.code !== couponData.code)],
        }));
      },

      toggleCouponActive: (code) => {
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.code === code ? { ...c, active: !c.active } : c
          ),
        }));
      },

      deleteCoupon: (code) => {
        set((state) => ({
          coupons: state.coupons.filter((c) => c.code !== code),
        }));
      },

      refundConsultation: (sessionId) => {
        set((state) => ({
          liveSessions: state.liveSessions.map((s) =>
            s.id === sessionId ? { ...s, status: 'refunded' } : s
          ),
        }));
      },

      terminateSession: (sessionId) => {
        set((state) => ({
          liveSessions: state.liveSessions.map((s) =>
            s.id === sessionId ? { ...s, status: 'completed' } : s
          ),
        }));
      },

      banDevice: (fingerprint) => {
        set((state) => ({
          bannedFingerprints: Array.from(new Set([...state.bannedFingerprints, fingerprint])),
        }));
      },

      unbanDevice: (fingerprint) => {
        set((state) => ({
          bannedFingerprints: state.bannedFingerprints.filter((f) => f !== fingerprint),
        }));
      },

      updatePlatformFee: (fee) => {
        set({ platformFeePercent: fee });
      },

      updateVipPricing: (monthly, annual) => {
        set({ vipMonthlyPrice: monthly, vipAnnualPrice: annual });
      },
    }),
    {
      name: 'astroguru_admin_expanded_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
