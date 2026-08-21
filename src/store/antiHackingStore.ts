import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  securityShieldService,
  SystemAuditReport,
  ThreatLevel,
} from '../services/securityShieldService';
import { apiSignatureService, SignatureLog } from '../services/apiSignatureService';

export interface AntiHackingState {
  // Shield toggles
  blockScreenshots: boolean;
  appSwitcherBlur: boolean;
  strictRootBlock: boolean;
  autoHmacSigning: boolean;
  antiReplayProtection: boolean;

  // Diagnostics & Status
  lastAudit: SystemAuditReport;
  isScanning: boolean;
  deviceFingerprint: string;
  signatureLogs: SignatureLog[];

  // Actions
  runAudit: () => Promise<SystemAuditReport>;
  toggleBlockScreenshots: () => void;
  toggleAppSwitcherBlur: () => void;
  toggleStrictRootBlock: () => void;
  toggleAutoHmacSigning: () => void;
  refreshSignatureLogs: () => void;
}

const initialAudit = securityShieldService.runFullSecurityAudit();

export const useAntiHackingStore = create<AntiHackingState>()(
  persist(
    (set, get) => ({
      blockScreenshots: true,
      appSwitcherBlur: true,
      strictRootBlock: true,
      autoHmacSigning: true,
      antiReplayProtection: true,

      lastAudit: initialAudit,
      isScanning: false,
      deviceFingerprint: securityShieldService.getDeviceFingerprint(),
      signatureLogs: apiSignatureService.getRecentLogs(),

      runAudit: async () => {
        set({ isScanning: true });
        // Simulate deep memory & environment scan delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        const report = securityShieldService.runFullSecurityAudit();
        set({
          lastAudit: report,
          isScanning: false,
          deviceFingerprint: report.deviceFingerprint,
          signatureLogs: apiSignatureService.getRecentLogs(),
        });
        return report;
      },

      toggleBlockScreenshots: () => {
        set((s) => ({ blockScreenshots: !s.blockScreenshots }));
      },

      toggleAppSwitcherBlur: () => {
        set((s) => ({ appSwitcherBlur: !s.appSwitcherBlur }));
      },

      toggleStrictRootBlock: () => {
        set((s) => ({ strictRootBlock: !s.strictRootBlock }));
      },

      toggleAutoHmacSigning: () => {
        set((s) => ({ autoHmacSigning: !s.autoHmacSigning }));
      },

      refreshSignatureLogs: () => {
        set({ signatureLogs: apiSignatureService.getRecentLogs() });
      },
    }),
    {
      name: 'astroguru_anti_hacking_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
