import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';

function calculateSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = String(num)
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return num;
}

function calculateNameNumber(name: string): number {
  const chaldeanMap: Record<string, number> = {
    A: 1, I: 1, J: 1, Q: 1, Y: 1,
    B: 2, C: 2, G: 2, K: 2,
    C: 3, D: 3, E: 3, H: 3, L: 3,
    M: 4, N: 4,
    E: 5, H: 5, N: 5, X: 5,
    U: 6, V: 6, W: 6,
    O: 7, Z: 7,
    F: 8, P: 8,
  };

  const total = name
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .reduce((sum, char) => sum + (chaldeanMap[char] || 1), 0);

  return calculateSingleDigit(total);
}

export default function NumerologyScreen() {
  const [inputName, setInputName] = useState('Demo Seeker');
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [vehicleNumber, setVehicleNumber] = useState('DL 01 AB 1234');

  const nameNum = calculateNameNumber(inputName);
  const phoneSum = calculateSingleDigit(
    phoneNumber.replace(/\D/g, '').split('').reduce((a, b) => a + parseInt(b, 10), 0)
  );
  const vehicleSum = calculateSingleDigit(
    vehicleNumber.replace(/\D/g, '').split('').reduce((a, b) => a + parseInt(b, 10), 0)
  );

  const NUMEROLOGY_MEANINGS: Record<number, { title: string; desc: string; planet: string; luckyColors: string }> = {
    1: { title: 'The Leader & Pioneer', desc: 'Independent, ambitious, strong-willed, and naturally born to lead.', planet: 'Sun ☀️', luckyColors: 'Gold, Orange, Yellow' },
    2: { title: 'The Diplomat & Peacemaker', desc: 'Intuitive, gentle, cooperative, and highly artistic.', planet: 'Moon 🌙', luckyColors: 'White, Cream, Light Green' },
    3: { title: 'The Creator & Communicator', desc: 'Optimistic, expressive, charismatic, and spiritually inclined.', planet: 'Jupiter 👑', luckyColors: 'Yellow, Saffron, Purple' },
    4: { title: 'The Builder & Strategist', desc: 'Disciplined, practical, hard-working, and grounded.', planet: 'Rahu 🌌', luckyColors: 'Electric Blue, Grey' },
    5: { title: 'The Adventurer & Explorer', desc: 'Versatile, energetic, loves freedom, and highly adaptable.', planet: 'Mercury 🟢', luckyColors: 'Green, Emerald' },
    6: { title: 'The Nurturer & Harmony Seeker', desc: 'Loving, responsible, creative, and family-focused.', planet: 'Venus ✨', luckyColors: 'Pink, White, Light Blue' },
    7: { title: 'The Mystic & Analyst', desc: 'Analytical, introspective, spiritual, and seeks deep truth.', planet: 'Ketu 🔮', luckyColors: 'Violet, Purple, Sea Green' },
    8: { title: 'The Powerhouse & Businessman', desc: 'Authoritative, financially shrewd, disciplined, and resilient.', planet: 'Saturn 🪐', luckyColors: 'Dark Blue, Black' },
    9: { title: 'The Humanitarian & Warrior', desc: 'Courageous, compassionate, energetic, and protective.', planet: 'Mars 🔴', luckyColors: 'Red, Maroon, Crimson' },
  };

  const meaning = NUMEROLOGY_MEANINGS[nameNum] || NUMEROLOGY_MEANINGS[1];

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Name & Mobile Numerology" subtitle="Chaldean Numerology Calculator" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Name Input & Number Card */}
          <Card>
            <SectionHeader title="Name Vibration Analysis" subtitle="Enter full name as used in official documents" />

            <View style={styles.inputWrap}>
              <Text style={styles.label}>Full Name:</Text>
              <TextInput
                style={styles.input}
                value={inputName}
                onChangeText={setInputName}
                placeholder="Enter full name"
                placeholderTextColor={colors.textFaint}
              />
            </View>

            <LinearGradient colors={['#7D3C98', '#E67E22']} style={styles.numHeroCard}>
              <Text style={styles.numDisplay}>{nameNum}</Text>
              <Text style={styles.numTitle}>{meaning.title.toUpperCase()}</Text>
              <Text style={styles.numPlanet}>Ruling Planet: {meaning.planet}</Text>
            </LinearGradient>

            <View style={styles.meaningBox}>
              <Text style={styles.meaningDesc}>{meaning.desc}</Text>
              <Text style={styles.luckyColors}>🎨 Lucky Colors: {meaning.luckyColors}</Text>
            </View>
          </Card>

          {/* Lucky Phone & Vehicle Number Compatibility */}
          <SectionHeader title="Mobile & Vehicle Number Vibration" subtitle="Check if your numbers bring luck" />

          <Card style={{ gap: spacing.md }}>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>📱 Mobile Number:</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="numeric"
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor={colors.textFaint}
              />
              <View style={styles.resRow}>
                <Chip label={`Vibration Total: ${phoneSum}`} tone="gold" />
                <Text style={styles.resText}>
                  {phoneSum === 1 || phoneSum === 3 || phoneSum === 5 || phoneSum === 6
                    ? 'Auspicious & Prosperous Number ✅'
                    : 'Neutral Number'}
                </Text>
              </View>
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.label}>🚗 Vehicle Plate Number:</Text>
              <TextInput
                style={styles.input}
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
                placeholder="e.g. DL 01 AB 1234"
                placeholderTextColor={colors.textFaint}
              />
              <View style={styles.resRow}>
                <Chip label={`Vehicle Total: ${vehicleSum}`} tone="teal" />
                <Text style={styles.resText}>
                  {vehicleSum === 9 || vehicleSum === 5 || vehicleSum === 3
                    ? 'Safe & Harmonious Plate Number ✅'
                    : 'Neutral Vehicle Number'}
                </Text>
              </View>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  inputWrap: { gap: 4 },
  label: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },

  numHeroCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
    shadowColor: 'rgba(125,60,152,0.40)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  numDisplay: { ...typography.display, fontSize: 56, color: colors.white, fontWeight: '900' },
  numTitle: { ...typography.h3, color: colors.white, fontWeight: '800', letterSpacing: 1 },
  numPlanet: { ...typography.tiny, color: 'rgba(255,255,255,0.9)', fontWeight: '700' },

  meaningBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    gap: 4,
  },
  meaningDesc: { ...typography.small, color: colors.text, lineHeight: 20, fontWeight: '600' },
  luckyColors: { ...typography.tiny, color: colors.saffron, fontWeight: '800', marginTop: 2 },

  resRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  resText: { ...typography.tiny, color: colors.textMuted, fontWeight: '700', flex: 1 },
});
