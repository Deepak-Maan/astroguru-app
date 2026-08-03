import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SecurityState {
  isPinEnabled: boolean;
  pinCode: string; // 4-digit PIN e.g. "1234"
  isBiometricEnabled: boolean;
  isLocked: boolean;
  maskWalletBalance: boolean;
  encryptLocalData: boolean;
  autoLockMinutes: number; // 0 = Immediate, 1 = 1 min, 5 = 5 mins

  // Actions
  enablePin: (pin: string) => void;
  disablePin: () => void;
  verifyPin: (inputPin: string) => boolean;
  unlockApp: () => void;
  lockApp: () => void;
  toggleBiometric: () => void;
  toggleMaskWallet: () => void;
  toggleEncryptData: () => void;
  setAutoLockMinutes: (mins: number) => void;
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      isPinEnabled: false,
      pinCode: '1234',
      isBiometricEnabled: false,
      isLocked: false,
      maskWalletBalance: false,
      encryptLocalData: true,
      autoLockMinutes: 0,

      enablePin: (pin) => {
        set({ isPinEnabled: true, pinCode: pin, isLocked: false });
      },

      disablePin: () => {
        set({ isPinEnabled: false, pinCode: '', isLocked: false });
      },

      verifyPin: (inputPin) => {
        const { pinCode } = get();
        return inputPin === pinCode;
      },

      unlockApp: () => {
        set({ isLocked: false });
      },

      lockApp: () => {
        const { isPinEnabled } = get();
        if (isPinEnabled) {
          set({ isLocked: true });
        }
      },

      toggleBiometric: () => {
        set((state) => ({ isBiometricEnabled: !state.isBiometricEnabled }));
      },

      toggleMaskWallet: () => {
        set((state) => ({ maskWalletBalance: !state.maskWalletBalance }));
      },

      toggleEncryptData: () => {
        set((state) => ({ encryptLocalData: !state.encryptLocalData }));
      },

      setAutoLockMinutes: (mins) => {
        set({ autoLockMinutes: mins });
      },
    }),
    {
      name: 'astroguru_security_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
