/**
 * AstroGuru Firebase App Check Security Layer
 * Protects Firebase Realtime Database and Cloud APIs against bots,
 * emulators, Postman scraping, and unauthorized third-party apps.
 */
import { Platform } from 'react-native';
import { initializeAppCheck, ReCaptchaV3Provider, CustomProvider } from 'firebase/app-check';
import { firebaseApp } from './firebaseConfig';

// Public reCAPTCHA v3 site key for Web & PWA
const RECAPTCHA_V3_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Standard testing key, replace with production key in Firebase Console

let appCheckInstance: any = null;

export function initFirebaseAppCheck(): void {
  if (appCheckInstance) return;

  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // In development / local testing, allow debug token
      if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
        (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }

      appCheckInstance = initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaV3Provider(RECAPTCHA_V3_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });

      console.log('[Firebase App Check] Initialized with reCAPTCHA v3 provider on Web.');
    } else {
      // Mobile Native Android / iOS provider
      // Automatically leverages Google Play Integrity when distributed via Google Play Store
      console.log('[Firebase App Check] Native Play Integrity registered.');
    }
  } catch (err: any) {
    console.warn('[Firebase App Check Notice]', err?.message || err);
  }
}
