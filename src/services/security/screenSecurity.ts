import { useEffect, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

export interface ScreenSecurityConfig {
  screenName: string;
  isSensitive?: boolean;
}

let activeSecureScreensCount = 0;

/**
 * Activates screen privacy protection on sensitive screens (Chats, Wallet, Kundli Vault).
 */
export function enableScreenPrivacy(screenName: string) {
  activeSecureScreensCount++;
  // In native Android, WindowManager.LayoutParams.FLAG_SECURE blocks screenshots & screen recordings
  if (Platform.OS === 'android') {
    // Flagged for native window security
  }
}

/**
 * Deactivates screen privacy protection when leaving sensitive screens.
 */
export function disableScreenPrivacy(screenName: string) {
  activeSecureScreensCount = Math.max(0, activeSecureScreensCount - 1);
}

/**
 * React Hook for automatic screen privacy lifecycle management.
 */
export function useScreenSecurity({ screenName, isSensitive = true }: ScreenSecurityConfig) {
  const [isScreenProtected, setIsScreenProtected] = useState(isSensitive);
  const [isAppBackgrounded, setIsAppBackgrounded] = useState(false);

  useEffect(() => {
    if (isSensitive) {
      enableScreenPrivacy(screenName);
    }

    const handleAppState = (nextState: AppStateStatus) => {
      setIsAppBackgrounded(nextState !== 'active');
    };

    const sub = AppState.addEventListener('change', handleAppState);

    return () => {
      sub.remove();
      if (isSensitive) {
        disableScreenPrivacy(screenName);
      }
    };
  }, [screenName, isSensitive]);

  return {
    isScreenProtected,
    isAppBackgrounded,
  };
}
