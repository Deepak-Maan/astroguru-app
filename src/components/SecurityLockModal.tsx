import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../theme';
import { useSecurityStore } from '../store/securityStore';

export function SecurityLockModal() {
  const { isPinEnabled, isLocked, isBiometricEnabled, verifyPin, unlockApp } = useSecurityStore();

  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isPinEnabled || !isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (enteredPin.length >= 4) return;
    const next = enteredPin + num;
    setEnteredPin(next);
    setErrorMsg('');

    if (next.length === 4) {
      if (verifyPin(next)) {
        setTimeout(() => {
          setEnteredPin('');
          unlockApp();
        }, 150);
      } else {
        setTimeout(() => {
          setErrorMsg('❌ Incorrect PIN. Try again.');
          setEnteredPin('');
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleBiometricClick = () => {
    // Simulated Touch ID / Face ID scan
    setTimeout(() => {
      unlockApp();
    }, 400);
  };

  return (
    <Modal visible={isPinEnabled && isLocked} animationType="fade" transparent={false}>
      <View style={styles.container}>
        <LinearGradient colors={['#FFFFFF', '#F8FAFC', '#F1F5F9']} style={StyleSheet.absoluteFill} />

        {/* Security Shield Header */}
        <View style={styles.header}>
          <Text style={{ fontSize: 52 }}>🔒</Text>
          <Text style={styles.title}>AstroGuru Protected</Text>
          <Text style={styles.subtitle}>Enter 4-Digit Passcode to Access App</Text>
        </View>

        {/* PIN Dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((idx) => {
            const filled = enteredPin.length > idx;
            return (
              <View
                key={idx}
                style={[styles.dot, filled && styles.dotFilled, errorMsg ? styles.dotError : null]}
              />
            );
          })}
        </View>

        {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

        {/* Numeric Keypad Grid */}
        <View style={styles.keypad}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
          ].map((row, rIdx) => (
            <View key={rIdx} style={styles.keypadRow}>
              {row.map((digit) => (
                <Pressable
                  key={digit}
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
                onPress={handleBiometricClick}
                style={({ pressed }) => [styles.keyBtn, styles.keyBtnAction, pressed && styles.keyBtnPressed]}
              >
                <Text style={{ fontSize: 24 }}>👆</Text>
              </Pressable>
            ) : (
              <View style={styles.keyBtnEmpty} />
            )}

            <Pressable
              onPress={() => handleKeyPress('0')}
              style={({ pressed }) => [styles.keyBtn, pressed && styles.keyBtnPressed]}
            >
              <Text style={styles.keyText}>0</Text>
            </Pressable>

            <Pressable
              onPress={handleBackspace}
              style={({ pressed }) => [styles.keyBtn, styles.keyBtnAction, pressed && styles.keyBtnPressed]}
            >
              <Text style={{ fontSize: 22, color: colors.text }}>⌫</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.securityNote}>
          🛡️ End-to-End Encrypted Astro Vault · 256-bit Security
        </Text>
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
  header: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xl },
  title: { ...typography.h1, color: '#EEF2FF', fontSize: 22, fontWeight: '800' },
  subtitle: { ...typography.small, color: '#A5B4FC', fontSize: 13, fontWeight: '600' },

  dotsRow: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.lg },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(129, 140, 248, 0.4)',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  dotError: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(244, 63, 94, 0.4)',
  },

  errorText: { ...typography.tiny, color: colors.danger, fontWeight: '800', marginBottom: spacing.md },

  keypad: { gap: spacing.md, marginVertical: spacing.md },
  keypadRow: { flexDirection: 'row', gap: spacing.lg },
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
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  keyBtnPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 1.5,
    backgroundColor: 'rgba(34, 43, 80, 0.95)',
  },
  keyBtnEmpty: { width: 72, height: 72 },
  keyBtnAction: {
    backgroundColor: 'rgba(26, 33, 64, 0.65)',
    borderBottomColor: 'rgba(10, 12, 28, 0.85)',
  },
  keyText: { ...typography.h1, color: '#EEF2FF', fontSize: 26, fontWeight: '800' },

  securityNote: {
    ...typography.tiny,
    color: '#818CF8',
    marginTop: spacing.xxl,
    textAlign: 'center',
    fontWeight: '600',
  },
});
