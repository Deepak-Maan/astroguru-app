import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DocType = 'aadhaar_front' | 'aadhaar_back' | 'pan_card' | 'jyotish_degree' | 'passport';
export type VerificationStatus = 'unverified' | 'pending_review' | 'verified' | 'rejected';

export interface KycDocument {
  id: string;
  docType: DocType;
  docNumber: string; // raw or formatted
  docNumberMasked: string; // e.g. "XXXX-XXXX-4819"
  holderName: string;
  dob?: string;
  gender?: string;
  imageUri?: string;
  uploadedAt: string;
  watermarkText: string;
  watermarkOpacity: number;
  securityHash: string; // e.g. "AGY-SHA256-88F4"
  status: VerificationStatus;
  rejectionReason?: string;
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
  uploadDocument: (doc: Omit<KycDocument, 'id' | 'uploadedAt' | 'securityHash'>) => KycDocument;
  removeDocument: (id: string) => void;
  updateDocStatus: (id: string, status: VerificationStatus, reason?: string) => void;
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
    docNumber: '5829 4819 9182',
    docNumberMasked: 'XXXX-XXXX-9182',
    holderName: 'Pandit Deepak Sharma',
    dob: '15/08/1988',
    gender: 'MALE / पुरुष',
    imageUri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    uploadedAt: '2026-08-15 10:30 IST',
    watermarkText: 'FOR ASTROGURU VERIFICATION ONLY',
    watermarkOpacity: 0.35,
    securityHash: 'AGY-SHA256-7E9B',
    status: 'verified',
    notes: 'UIDAI Aadhaar Verified & Digitally Masked',
  },
  {
    id: 'doc-pan-1',
    docType: 'pan_card',
    docNumber: 'ABCDE9482Q',
    docNumberMasked: '•••••9482Q',
    holderName: 'Pandit Deepak Sharma',
    dob: '15/08/1988',
    gender: 'MALE',
    imageUri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    uploadedAt: '2026-08-15 10:35 IST',
    watermarkText: 'FOR ASTROGURU VERIFICATION ONLY',
    watermarkOpacity: 0.35,
    securityHash: 'AGY-SHA256-2A4C',
    status: 'verified',
    notes: 'Income Tax Dept NSDL PAN Verified',
  },
  {
    id: 'doc-degree-1',
    docType: 'jyotish_degree',
    docNumber: 'ICAS-JYOTISH-2015-882',
    docNumberMasked: 'ICAS-JYOTISH-2015-882',
    holderName: 'Pandit Deepak Sharma',
    dob: '15/08/1988',
    uploadedAt: '2026-08-18 14:20 IST',
    watermarkText: 'FOR ASTROGURU VERIFICATION ONLY',
    watermarkOpacity: 0.35,
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
          watermarkText: docData.watermarkText || get().customWatermarkNote,
          watermarkOpacity: docData.watermarkOpacity || get().watermarkOpacity,
          status: 'pending_review',
        };

        set((state) => {
          const updated = [...state.documents.filter((d) => d.docType !== docData.docType), newDoc];
          const hasPending = updated.some((d) => d.status === 'pending_review');
          const hasRejected = updated.some((d) => d.status === 'rejected');
          const allVerified = updated.length >= 2 && updated.every((d) => d.status === 'verified');

          let newOverall: VerificationStatus = 'pending_review';
          if (allVerified) newOverall = 'verified';
          else if (hasRejected) newOverall = 'rejected';
          else if (hasPending) newOverall = 'pending_review';

          const verifiedCount = updated.filter((d) => d.status === 'verified').length;
          const newScore = Math.min(100, Math.round(50 + verifiedCount * 22));

          return {
            documents: updated,
            overallStatus: newOverall,
            trustScore: newScore,
          };
        });

        return newDoc;
      },

      removeDocument: (id) => {
        set((state) => {
          const updated = state.documents.filter((d) => d.id !== id);
          const verifiedCount = updated.filter((d) => d.status === 'verified').length;
          const newScore = Math.max(30, Math.round(30 + verifiedCount * 22));

          return {
            documents: updated,
            trustScore: newScore,
            overallStatus: updated.length === 0 ? 'unverified' : state.overallStatus,
          };
        });
      },

      updateDocStatus: (id, status, reason) => {
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, status, rejectionReason: reason } : d
          ),
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
        set((state) => ({
          overallStatus: 'pending_review',
          documents: state.documents.map((d) =>
            d.status === 'unverified' ? { ...d, status: 'pending_review' } : d
          ),
        }));
      },

      resetKyc: () => {
        set({
          documents: [],
          overallStatus: 'unverified',
          trustScore: 30,
        });
      },
    }),
    {
      name: 'astroguru_kyc_enhanced_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
