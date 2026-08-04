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
        <LinearGradient colors={['#1B1438', '#0F0926']} style={StyleSheet.absoluteFill} />

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
                style={({ pressed }) => [styles.keyBtn, styles.keyBtnAction, pressed && { opacity: 0.6 }]}
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
              style={({ pressed }) => [styles.keyBtn, styles.keyBtnAction, pressed && { opacity: 0.6 }]}
            >
              <Text style={{ fontSize: 22, color: colors.white }}>⌫</Text>
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
    backgroundColor: '#1B1438',
  },
  header: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xl },
  title: { ...typography.h1, color: colors.white, fontSize: 22, fontWeight: '800' },
  subtitle: { ...typography.small, color: 'rgba(255,255,255,0.7)', fontSize: 13 },

  dotsRow: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.lg },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: colors.saffron,
    borderColor: colors.saffron,
  },
  dotError: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(231,76,60,0.3)',
  },

  errorText: { ...typography.tiny, color: colors.danger, fontWeight: '800', marginBottom: spacing.md },

  keypad: { gap: spacing.md, marginVertical: spacing.md },
  keypadRow: { flexDirection: 'row', gap: spacing.lg },
  keyBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyBtnPressed: { backgroundColor: colors.saffron, borderColor: colors.saffron },
  keyBtnEmpty: { width: 72, height: 72 },
  keyBtnAction: { backgroundColor: 'rgba(255,255,255,0.04)' },
  keyText: { ...typography.h1, color: colors.white, fontSize: 26, fontWeight: '800' },

  securityNote: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.5)',
    marginTop: spacing.xxl,
    textAlign: 'center',
  },
});
