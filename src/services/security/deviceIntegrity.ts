import { Platform } from 'react-native';
import { sha256 } from './cryptoUtils';

export interface DeviceIntegrityReport {
  isRooted: boolean;
  isEmulator: boolean;
  isHookDetected: boolean;
  isTampered: boolean;
  threatLevel: 'CLEAN' | 'WARNING' | 'CRITICAL';
  details: string[];
  fingerprintHash: string;
  timestamp: number;
}

// Suspicious filesystem indicators on rooted Android or jailbroken iOS
const SUSPICIOUS_PATHS = [
  '/system/app/Superuser.apk',
  '/sbin/su',
  '/system/bin/su',
  '/system/xbin/su',
  '/data/local/xbin/su',
  '/data/local/bin/su',
  '/system/sd/xbin/su',
  '/system/bin/failsafe/su',
  '/data/local/su',
  '/su/bin/su',
  '/Applications/Cydia.app',
  '/Library/MobileSubstrate/MobileSubstrate.dylib',
  '/bin/bash',
  '/usr/sbin/sshd',
  '/etc/apt',
  '/private/var/lib/apt/',
];

// Suspicious packages and Frida/Xposed runtime artifacts
const SUSPICIOUS_ARTIFACTS = [
  'com.topjohnwu.magisk',
  'eu.chainfire.supersu',
  'com.koushikdutta.superuser',
  'com.thirdparty.superuser',
  'de.robv.android.xposed.installer',
  're.frida.server',
  'frida-agent',
  'frida-gadget',
];

export async function checkDeviceIntegrity(): Promise<DeviceIntegrityReport> {
  const details: string[] = [];
  let isRooted = false;
  let isEmulator = false;
  let isHookDetected = false;
  let isTampered = false;

  const now = Date.now();

  if (Platform.OS === 'web') {
    // Check for web scrapers, automation frameworks (Puppeteer, Selenium, Headless Chrome)
    if (typeof window !== 'undefined') {
      const nav = window.navigator as any;
      if (nav.webdriver) {
        details.push('Automated WebDriver / Bot detected (navigator.webdriver=true)');
        isTampered = true;
      }
      if (
        window.document.documentElement.getAttribute('webdriver') ||
        (window as any)._phantom ||
        (window as any).__nightmare ||
        (window as any).callPhantom
      ) {
        details.push('Headless browser automation artifact detected');
        isTampered = true;
      }
    }
  } else {
    // Native checks (Android / iOS)
    // 1. Check for test-keys or emulator indicators in user agent or runtime
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || '';
      if (/generic|google_sdk|emulator|sdk_gphone|qemu/i.test(ua)) {
        isEmulator = true;
        details.push('Emulator runtime signature identified');
      }
    }

    // 2. Check for Frida / Hooking objects in global scope
    const globalObj = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
    if (globalObj) {
      if (
        globalObj._frida ||
        globalObj.frida ||
        globalObj.__frida ||
        globalObj.Module?.findExportByName ||
        globalObj.Interceptor
      ) {
        isHookDetected = true;
        details.push('Frida hooking / dynamic instrumentation framework detected in memory');
      }
    }

    // 3. Check for debug / development build flags in production
    if (!__DEV__) {
      // In production builds, verify bundle tampering
      const devFlags = (globalThis as any).__DEV__;
      if (devFlags === true) {
        isTampered = true;
        details.push('Runtime __DEV__ mismatch: production binary running in hooked debug mode');
      }
    }
  }

  // Calculate Threat Level
  let threatLevel: 'CLEAN' | 'WARNING' | 'CRITICAL' = 'CLEAN';
  if (isHookDetected || (isRooted && isTampered)) {
    threatLevel = 'CRITICAL';
  } else if (isRooted || isEmulator || isTampered) {
    threatLevel = 'WARNING';
  }

  const fingerprintHash = sha256(
    `ASTRO-${Platform.OS}-${isRooted}-${isEmulator}-${isHookDetected}-${now.toString().slice(0, 6)}`
  );

  return {
    isRooted,
    isEmulator,
    isHookDetected,
    isTampered,
    threatLevel,
    details,
    fingerprintHash,
    timestamp: now,
  };
}
