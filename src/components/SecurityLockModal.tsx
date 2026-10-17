import React, { useState, useEffect } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, typography } from '../theme';
import { useSecurityStore } from '../store/securityStore';
import { useScreenSecurity } from '../services/security/screenSecurity';

const MAX_PIN_ATTEMPTS = 3;
const COOLDOWN_DURATION = 30; // 30 seconds

export function SecurityLockModal() {
  const { isPinEnabled, isLocked, isBiometricEnabled, verifyPin, unlockApp } = useSecurityStore();
  useScreenSecurity({ screenName: 'SecurityLockModal', isSensitive: true });

  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          setErrorMsg('');
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  if (!isPinEnabled || !isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (cooldownSeconds > 0) return;
    if (enteredPin.length >= 4) return;
    const next = enteredPin + num;
    setEnteredPin(next);
    setErrorMsg('');

    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }

    if (next.length === 4) {
      if (verifyPin(next)) {
        if (Platform.OS !== 'web') {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (_) {}
        }
        setTimeout(() => {
          setEnteredPin('');
          setFailedAttempts(0);
          unlockApp();
        }, 150);
      } else {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);

        if (Platform.OS !== 'web') {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } catch (_) {}
        }

        if (nextFailed >= MAX_PIN_ATTEMPTS) {
          setCooldownSeconds(COOLDOWN_DURATION);
          setErrorMsg(`⚠️ Too many failed attempts. Security lock active for ${COOLDOWN_DURATION}s.`);
          setEnteredPin('');
        } else {
          setTimeout(() => {
            setErrorMsg(`❌ Incorrect PIN. (${MAX_PIN_ATTEMPTS - nextFailed} attempts remaining)`);
            setEnteredPin('');
          }, 300);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (cooldownSeconds > 0) return;
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleBiometricClick = () => {
    if (cooldownSeconds > 0) return;
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (_) {}
    }
    // Simulated Touch ID / Face ID scan
    setTimeout(() => {
      unlockApp();
    }, 350);
  };

  const isBlocked = cooldownSeconds > 0;

  return (
    <Modal visible={isPinEnabled && isLocked} animationType="fade" transparent={false}>
      <View style={styles.container}>
        <LinearGradient colors={['#0A0C16', '#0F1322', '#0A0C16']} style={StyleSheet.absoluteFill} />

        {/* Security Shield Header */}
        <View style={styles.header}>
          <View style={styles.shieldGlow}>
            <Text style={{ fontSize: 44 }}>🛡️</Text>
          </View>
          <Text style={styles.title}>AstroGuru Protected</Text>
          <Text style={styles.subtitle}>
            {isBlocked
              ? `Keypad Locked: Retry in ${cooldownSeconds}s`
              : 'Enter 4-Digit Passcode to Access App'}
          </Text>
        </View>

        {/* PIN Dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((idx) => {
            const filled = enteredPin.length > idx;
            return (
              <View
                key={idx}
                style={[
                  styles.dot,
                  filled && styles.dotFilled,
                  errorMsg ? styles.dotError : null,
                ]}
              />
            );
          })}
        </View>

        {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

        {/* Numeric Keypad Grid */}
        <View style={[styles.keypad, isBlocked && { opacity: 0.35 }]}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
          ].map((row, rIdx) => (
            <View key={rIdx} style={styles.keypadRow}>
              {row.map((digit) => (
                <Pressable
                  key={digit}
                  disabled={isBlocked}
                  onPress={() => handleKeyPress(digit)}
                  style={({ pressed }) => [styles.keyBtn, pressed && styles.keyBtnPressed]}
                >
                  <Text style={styles.keyText}>{digit}</Text>
                </Pressable>
              ))}
            </View>
          ))}

          {/* Bottom Row: Biometric + 0 + Backspace */}
          <View style={styles.keypadRow}>
            {isBiometricEnabled ? (
              <Pressable
                disabled={isBlocked}
                onPress={handleBiometricClick}
                style={({ pressed }) => [
                  styles.keyBtn,
                  styles.keyBtnAction,
                  pressed && styles.keyBtnPressed,
                ]}
              >
                <Text style={{ fontSize: 24 }}>👆</Text>
              </Pressable>
            ) : (
              <View style={styles.keyBtnEmpty} />
            )}

            <Pressable
              disabled={isBlocked}
              onPress={() => handleKeyPress('0')}
              style={({ pressed }) => [styles.keyBtn, pressed && styles.keyBtnPressed]}
            >
              <Text style={styles.keyText}>0</Text>
            </Pressable>

            <Pressable
              disabled={isBlocked}
              onPress={handleBackspace}
              style={({ pressed }) => [
                styles.keyBtn,
                styles.keyBtnAction,
                pressed && styles.keyBtnPressed,
              ]}
            >
              <Text style={{ fontSize: 22, color: '#EEF2FF' }}>⌫</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.securityPill}>
          <Text style={styles.securityPillText}>
            🔒 Anti-Tamper Checksum · Screen Shielded · FIPS 180-4
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: '#0A0C16',
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  shieldGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    ...typography.h1,
    color: '#EEF2FF',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.small,
    color: '#A5B4FC',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 260,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(129, 140, 248, 0.4)',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#FCD34D',
    borderColor: '#FCD34D',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  dotError: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(244, 63, 94, 0.4)',
  },
  errorText: {
    ...typography.tiny,
    color: '#F43F5E',
    fontWeight: '800',
    marginBottom: spacing.md,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  keypad: {
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  keyBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(129, 140, 248, 0.45)',
    borderLeftColor: 'rgba(129, 140, 248, 0.25)',
    borderRightWidth: 1.2,
    borderRightColor: 'rgba(129, 140, 248, 0.15)',
    borderBottomWidth: 3.5,
    borderBottomColor: 'rgba(10, 12, 28, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  keyBtnPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 1.5,
    backgroundColor: 'rgba(34, 43, 80, 0.95)',
  },
  keyBtnEmpty: {
    width: 72,
    height: 72,
  },
  keyBtnAction: {
    backgroundColor: 'rgba(26, 33, 64, 0.65)',
    borderBottomColor: 'rgba(10, 12, 28, 0.85)',
  },
  keyText: {
    ...typography.h1,
    color: '#EEF2FF',
    fontSize: 26,
    fontWeight: '800',
  },
  securityPill: {
    marginTop: spacing.xl,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(26, 33, 64, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  securityPillText: {
    ...typography.tiny,
    color: '#A5B4FC',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 11,
  },
});
