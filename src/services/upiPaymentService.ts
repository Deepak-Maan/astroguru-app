import { AppState, AppStateStatus, Linking, Platform } from 'react-native';

export interface UpiAppProvider {
  id: 'phonepe' | 'gpay' | 'paytm' | 'bhim' | 'cred' | 'generic';
  name: string;
  icon: string;
  scheme: string;
  color: string;
  gradient: [string, string];
}

export const SUPPORTED_UPI_APPS: UpiAppProvider[] = [
  {
    id: 'phonepe',
    name: 'PhonePe',
    icon: '🟣',
    scheme: 'phonepe://pay',
    color: '#6739B7',
    gradient: ['#5F259F', '#7B3DBE'],
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    icon: '🟢',
    scheme: 'tez://upi/pay',
    color: '#0F9D58',
    gradient: ['#1A73E8', '#0F9D58'],
  },
  {
    id: 'paytm',
    name: 'Paytm UPI',
    icon: '🔵',
    scheme: 'paytmmp://pay',
    color: '#00BAF2',
    gradient: ['#002E6E', '#00BAF2'],
  },
  {
    id: 'bhim',
    name: 'BHIM UPI',
    icon: '🇮🇳',
    scheme: 'bhim://upi/pay',
    color: '#FF6D00',
    gradient: ['#E65100', '#FF9100'],
  },
  {
    id: 'cred',
    name: 'CRED Pay',
    icon: '⚪',
    scheme: 'credpay://upi/pay',
    color: '#1C1C1E',
    gradient: ['#232326', '#3A3A3C'],
  },
  {
    id: 'generic',
    name: 'Any UPI App',
    icon: '⚡',
    scheme: 'upi://pay',
    color: '#6366F1',
    gradient: ['#4F46E5', '#6366F1'],
  },
];

const DEFAULT_VPA = 'astroguru.business@axisbank';
const MERCHANT_NAME = 'AstroGuru Vedic Services';

export interface OneTapUpiResult {
  success: boolean;
  txnId: string;
  appUsed: string;
  amount: number;
  message?: string;
}

/**
 * Builds standard NPCI UPI spec query parameters
 */
export function buildUpiUri(
  scheme: string,
  params: {
    pa?: string;
    pn?: string;
    am: number;
    tr: string;
    tn?: string;
    cu?: string;
  }
): string {
  const vpa = params.pa || DEFAULT_VPA;
  const name = params.pn || MERCHANT_NAME;
  const note = params.tn || `AstroGuru Wallet Txn ${params.tr}`;
  const currency = params.cu || 'INR';

  const queryString = `pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}&am=${params.am}&tr=${encodeURIComponent(params.tr)}&tn=${encodeURIComponent(note)}&cu=${currency}`;
  return `${scheme}?${queryString}`;
}

/**
 * Triggers 1-Tap UPI flow with return listener
 */
export async function executeOneTapUpi({
  appId,
  amount,
  txnId,
  onAppReturn,
}: {
  appId: UpiAppProvider['id'];
  amount: number;
  txnId: string;
  onAppReturn?: (txnId: string) => void;
}): Promise<OneTapUpiResult> {
  const provider =
    SUPPORTED_UPI_APPS.find((p) => p.id === appId) ||
    SUPPORTED_UPI_APPS[SUPPORTED_UPI_APPS.length - 1];

  const primaryUri = buildUpiUri(provider.scheme, { am: amount, tr: txnId });
  const universalUri = buildUpiUri('upi://pay', { am: amount, tr: txnId });

  // Listen for user returning back to AstroGuru after completing payment
  let subscription: any = null;
  if (onAppReturn && Platform.OS !== 'web') {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        if (subscription) subscription.remove();
        onAppReturn(txnId);
      }
    };
    subscription = AppState.addEventListener('change', handleAppStateChange);
  }

  try {
    const canOpen = await Linking.canOpenURL(primaryUri).catch(() => false);
    if (canOpen) {
      await Linking.openURL(primaryUri);
      return { success: true, txnId, appUsed: provider.name, amount };
    }

    // Try universal upi://
    await Linking.openURL(universalUri);
    return { success: true, txnId, appUsed: 'Universal UPI', amount };
  } catch (error) {
    // If running in simulator, web, or direct link unsupported, attempt universal
    try {
      await Linking.openURL(universalUri);
      return { success: true, txnId, appUsed: 'Universal UPI', amount };
    } catch (fallbackError) {
      return {
        success: false,
        txnId,
        appUsed: provider.name,
        amount,
        message: 'No supported UPI application found on this device.',
      };
    }
  }
}
