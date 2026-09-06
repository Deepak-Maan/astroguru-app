import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWalletStore } from './walletStore';

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
  payoutDetails: string;
  requestedAt: string;
  status: 'pending' | 'processed' | 'rejected';
  utrNumber?: string;
}

export interface PromoCoupon {
  code: string;
  title: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
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
  toxicityScore: number;
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

export interface PaymentGatewaySettings {
  upiId: string; // e.g. "astroguru@upi" or admin's personal/merchant VPA
  merchantName: string; // e.g. "AstroGuru Vedic Services"
  qrCodeImageUrl: string; // Custom uploaded QR Scanner Image URL
  bankAccountNumber: string;
  bankIfsc: string;
  bankName: string;
  accountHolderName: string;
  autoApproveUpi: boolean; // Auto-verify vs manual review
  minRechargeAmount: number;
  maxRechargeAmount: number;
  supportPhone: string;
  instructions: string;
  qrPreset: 'custom' | 'gpay' | 'phonepe' | 'paytm' | 'bhim';
}

export interface IncomingPaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  bonus: number;
  totalCredit: number;
  utr: string; // 12-digit bank UTR reference
  paymentMode: 'QR_SCAN' | 'UPI_INTENT' | 'BANK_TRANSFER';
  screenshotUri?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  adminNotes?: string;
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
  platformFeePercent: number;
  vipMonthlyPrice: number;
  vipAnnualPrice: number;

  // Payment Gateway & QR Scanner Hub
  paymentSettings: PaymentGatewaySettings;
  incomingPaymentsQueue: IncomingPaymentRequest[];

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

  // Payment Actions
  updatePaymentSettings: (settings: Partial<PaymentGatewaySettings>) => void;
  approveIncomingPayment: (paymentId: string) => void;
  rejectIncomingPayment: (paymentId: string, reason: string) => void;
  submitPaymentReceipt: (request: Omit<IncomingPaymentRequest, 'id' | 'createdAt' | 'status'>) => string;
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
    payoutDetails: 'ananya.nair@icici',
    requestedAt: '2026-08-21 08:30 IST',
    status: 'pending',
  },
];

const DEFAULT_COUPONS: PromoCoupon[] = [
  {
    code: 'ASTRO50',
    title: '50% Extra Consultation Bonus',
    discountType: 'percentage',
    discountValue: 50,
    minRecharge: 250,
    maxUsage: 1000,
    redeemedCount: 412,
    expiresAt: '2026-12-31',
    active: true,
  },
  {
    code: 'SHUBH100',
    title: '₹100 Flat Free Vedic Cash',
    discountType: 'flat',
    discountValue: 100,
    minRecharge: 500,
    maxUsage: 500,
    redeemedCount: 289,
    expiresAt: '2026-10-31',
    active: true,
  },
  {
    code: 'VIPGOLD',
    title: '20% Off AstroVIP Membership',
    discountType: 'percentage',
    discountValue: 20,
    minRecharge: 1000,
    maxUsage: 250,
    redeemedCount: 178,
    expiresAt: '2026-11-15',
    active: true,
  },
];

const DEFAULT_PAYMENT_SETTINGS: PaymentGatewaySettings = {
  upiId: 'astroguru@upi',
  merchantName: 'AstroGuru Vedic Services',
  qrCodeImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=upi%3A%2F%2Fpay%3Fpa%3Dastroguru%40upi%26pn%3DAstroGuru%2520Vedic%2520Services%26cu%3DINR',
  bankAccountNumber: '50100482910128',
  bankIfsc: 'HDFC0000128',
  bankName: 'HDFC Bank Ltd.',
  accountHolderName: 'AstroGuru Technologies Pvt. Ltd.',
  autoApproveUpi: true,
  minRechargeAmount: 50,
  maxRechargeAmount: 50000,
  supportPhone: '+91 98765 43210',
  instructions: 'Scan QR code using Google Pay, PhonePe, Paytm or BHIM. Enter amount and paste 12-digit UTR below.',
  qrPreset: 'custom',
};

const DEFAULT_INCOMING_PAYMENTS: IncomingPaymentRequest[] = [
  {
    id: 'pay-req-1',
    userId: 'user-101',
    userName: 'Rohan Sharma',
    userEmail: 'rohan.sharma@gmail.com',
    amount: 500,
    bonus: 75,
    totalCredit: 575,
    utr: '423891028391',
    paymentMode: 'QR_SCAN',
    status: 'approved',
    createdAt: '2026-09-06 10:15 IST',
    processedAt: '2026-09-06 10:16 IST',
  },
  {
    id: 'pay-req-2',
    userId: 'user-102',
    userName: 'Pooja Verma',
    userEmail: 'pooja.verma@outlook.com',
    amount: 1000,
    bonus: 200,
    totalCredit: 1200,
    utr: '423892019482',
    paymentMode: 'QR_SCAN',
    status: 'pending',
    createdAt: '2026-09-06 11:30 IST',
  },
  {
    id: 'pay-req-3',
    userId: 'user-103',
    userName: 'Vikram Mehta',
    userEmail: 'vikram.m@techcorp.in',
    amount: 250,
    bonus: 25,
    totalCredit: 275,
    utr: '423899482019',
    paymentMode: 'UPI_INTENT',
    status: 'pending',
    createdAt: '2026-09-06 12:05 IST',
  },
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      kycQueue: DEFAULT_KYC,
      payoutQueue: DEFAULT_PAYOUTS,
      coupons: DEFAULT_COUPONS,
      liveSessions: [
        {
          id: 'sess-1',
          seekerName: 'Priya Mehta',
          astrologerName: 'Acharya Dev Sharma',
          channel: 'Direct Chat',
          durationMins: 14,
          billedAmount: 420,
          status: 'active',
          toxicityScore: 2,
          startedAt: '12:40 PM',
        },
      ],
      securityIncidents: [],
      bannedFingerprints: [],
      platformFeePercent: 20,
      vipMonthlyPrice: 299,
      vipAnnualPrice: 1999,

      paymentSettings: DEFAULT_PAYMENT_SETTINGS,
      incomingPaymentsQueue: DEFAULT_INCOMING_PAYMENTS,

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
        const utr = `UTR-${Date.now().toString().slice(-8)}`;
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

      // Payment Gateway & QR Scanner actions
      updatePaymentSettings: (settings) => {
        set((state) => {
          const updated = { ...state.paymentSettings, ...settings };
          // If UPI ID or merchant name changed, update dynamic QR if custom not provided
          if (settings.upiId || settings.merchantName) {
            const upi = settings.upiId || state.paymentSettings.upiId;
            const name = settings.merchantName || state.paymentSettings.merchantName;
            if (!settings.qrCodeImageUrl) {
              updated.qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=upi%3A%2F%2Fpay%3Fpa%3D${encodeURIComponent(upi)}%26pn%3D${encodeURIComponent(name)}%26cu%3DINR`;
            }
          }
          return { paymentSettings: updated };
        });
      },

      approveIncomingPayment: (paymentId) => {
        const item = get().incomingPaymentsQueue.find((p) => p.id === paymentId);
        if (item) {
          // Top up user wallet
          try {
            useWalletStore.getState().topup(item.totalCredit, `UPI Recharge Verified (UTR: ${item.utr})`);
          } catch (_) {}

          set((state) => ({
            incomingPaymentsQueue: state.incomingPaymentsQueue.map((p) =>
              p.id === paymentId
                ? { ...p, status: 'approved', processedAt: new Date().toLocaleString('en-IN') }
                : p
            ),
          }));
        }
      },

      rejectIncomingPayment: (paymentId, reason) => {
        set((state) => ({
          incomingPaymentsQueue: state.incomingPaymentsQueue.map((p) =>
            p.id === paymentId
              ? {
                  ...p,
                  status: 'rejected',
                  adminNotes: reason || 'Invalid UTR / Payment not received',
                  processedAt: new Date().toLocaleString('en-IN'),
                }
              : p
          ),
        }));
      },

      submitPaymentReceipt: (request) => {
        const id = `pay-req-${Date.now().toString().slice(-6)}`;
        const newReq: IncomingPaymentRequest = {
          ...request,
          id,
          status: get().paymentSettings.autoApproveUpi ? 'approved' : 'pending',
          createdAt: new Date().toLocaleString('en-IN'),
          processedAt: get().paymentSettings.autoApproveUpi ? new Date().toLocaleString('en-IN') : undefined,
        };

        // If auto approve enabled, credit wallet immediately
        if (get().paymentSettings.autoApproveUpi) {
          try {
            useWalletStore.getState().topup(request.totalCredit, `UPI Instant Recharge (UTR: ${request.utr})`);
          } catch (_) {}
        }

        set((state) => ({
          incomingPaymentsQueue: [newReq, ...state.incomingPaymentsQueue],
        }));

        return id;
      },
    }),
    {
      name: 'astroguru_admin_expanded_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
