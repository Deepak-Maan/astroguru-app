import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DocType = 'aadhaar_front' | 'aadhaar_back' | 'pan_card' | 'jyotish_degree' | 'passport';
export type VerificationStatus = 'unverified' | 'pending_review' | 'verified' | 'rejected';

export interface KycDocument {
  id: string;
  docType: DocType;
  docNumberMasked: string; // e.g. "•••• •••• 4589"
  holderName: string;
  uploadedAt: string;
  watermarkText: string;
  securityHash: string; // e.g. "AGY-SHA256-88F4"
  status: VerificationStatus;
  notes?: string;
}

export interface KycState {
  documents: KycDocument[];
  overallStatus: VerificationStatus;
  trustScore: number; // 0 - 100
  maskAadhaarDigits: boolean;
  customWatermarkNote: string;
  watermarkOpacity: number;

  // Actions
  uploadDocument: (doc: Omit<KycDocument, 'id' | 'uploadedAt' | 'securityHash'>) => void;
  removeDocument: (id: string) => void;
  toggleMaskAadhaar: () => void;
  setCustomWatermarkNote: (note: string) => void;
  setWatermarkOpacity: (opacity: number) => void;
  submitKycForReview: () => void;
  resetKyc: () => void;
}

const DEFAULT_DOCS: KycDocument[] = [
  {
    id: 'doc-aadhaar-1',
    docType: 'aadhaar_front',
    docNumberMasked: 'XXXX-XXXX-4819',
    holderName: 'Pandit Deepak Sharma',
    uploadedAt: '2026-08-15 10:30 IST',
    watermarkText: 'FOR ASTROGURU VERIFICATION ONLY - 2026/08/15',
    securityHash: 'AGY-SHA256-7E9B',
    status: 'verified',
    notes: 'UIDAI Aadhaar Verified & Digitally Masked',
  },
  {
    id: 'doc-pan-1',
    docType: 'pan_card',
    docNumberMasked: '•••••9482Q',
    holderName: 'Pandit Deepak Sharma',
    uploadedAt: '2026-08-15 10:35 IST',
    watermarkText: 'FOR ASTROGURU VERIFICATION ONLY - 2026/08/15',
    securityHash: 'AGY-SHA256-2A4C',
    status: 'verified',
    notes: 'Income Tax Dept NSDL PAN Verified',
  },
  {
    id: 'doc-degree-1',
    docType: 'jyotish_degree',
    docNumberMasked: 'ICAS-JYOTISH-2015-882',
    holderName: 'Pandit Deepak Sharma',
    uploadedAt: '2026-08-18 14:20 IST',
    watermarkText: 'FOR ASTROGURU VERIFICATION ONLY - 2026/08/18',
    securityHash: 'AGY-SHA256-91D0',
    status: 'pending_review',
    notes: 'ICAS Indian Council of Astrological Sciences Degree',
  },
];

export const useKycStore = create<KycState>()(
  persist(
    (set, get) => ({
      documents: DEFAULT_DOCS,
      overallStatus: 'verified',
      trustScore: 94,
      maskAadhaarDigits: true,
      customWatermarkNote: 'FOR ASTROGURU VERIFICATION ONLY',
      watermarkOpacity: 0.35,

      uploadDocument: (docData) => {
        const hash = 'AGY-SHA256-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const now = new Date();
        const formattedDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} IST`;

        const newDoc: KycDocument = {
          ...docData,
          id: 'doc-' + Date.now(),
          uploadedAt: formattedDate,
          securityHash: hash,
          watermarkText: `${get().customWatermarkNote} - ${formattedDate}`,
          status: 'pending_review',
        };

        set((state) => {
          const updated = [...state.documents.filter((d) => d.docType !== docData.docType), newDoc];
          return {
            documents: updated,
            overallStatus: 'pending_review',
            trustScore: Math.min(98, state.trustScore + 8),
          };
        });
      },

      removeDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        }));
      },

      toggleMaskAadhaar: () => {
        set((state) => ({ maskAadhaarDigits: !state.maskAadhaarDigits }));
      },

      setCustomWatermarkNote: (note) => {
        set({ customWatermarkNote: note });
      },

      setWatermarkOpacity: (opacity) => {
        set({ watermarkOpacity: opacity });
      },

      submitKycForReview: () => {
        set({ overallStatus: 'pending_review' });
      },

      resetKyc: () => {
        set({
          documents: [],
          overallStatus: 'unverified',
          trustScore: 20,
        });
      },
    }),
    {
      name: 'astroguru_kyc_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
