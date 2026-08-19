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
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { GradientBackground } from '../src/components/GradientBackground';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { useUserStore } from '../src/store/userStore';
import { useAuthStore } from '../src/store/authStore';
import { computeNumerologyDetails } from '../src/services/numerologyPrediction';

export default function NumerologyScreen() {
  const profile = useUserStore((s) => s.profile);
  const authUser = useAuthStore((s) => s.user);

  const [inputName, setInputName] = useState(authUser?.name || profile?.name || 'Deepak Sharma');
  const [dob, setDob] = useState(profile?.date || '15-08-1998');
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [vehicleNumber, setVehicleNumber] = useState('DL 01 AB 1234');
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const numerology = computeNumerologyDetails(inputName, dob);

  const phoneDigits = phoneNumber.replace(/\D/g, '').split('');
  const phoneSum = phoneDigits.reduce((a, b) => a + parseInt(b, 10), 0) % 9 || 9;

  const vehicleDigits = vehicleNumber.replace(/\D/g, '').split('');
  const vehicleSum = vehicleDigits.reduce((a, b) => a + parseInt(b, 10), 0) % 9 || 9;

  const currentYearData =
    numerology.futureForecast.find((f) => f.year === selectedYear) ||
    numerology.futureForecast[0];

  const handleYearSelect = (yr: number) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    setSelectedYear(yr);
  };

  const coreCards = [
    {
      num: numerology.lifePathNumber,
      label: 'Life Path',
      sub: 'Birth Purpose & Destiny',
      planet: '☿ Mercury',
      gradient: ['#FEF3C7', '#FDE68A'],
      textColor: '#B45309',
      borderColor: 'rgba(245, 158, 11, 0.4)',
    },
    {
      num: numerology.destinyNumber,
      label: 'Destiny Number',
      sub: 'Name Energy & Expression',
      planet: '☊ Rahu',
      gradient: ['#ECFDF5', '#A7F3D0'],
      textColor: '#047857',
      borderColor: 'rgba(5, 150, 105, 0.4)',
    },
    {
      num: numerology.soulUrgeNumber,
      label: 'Soul Urge',
      sub: 'Heart Inner Desires',
      planet: '♀ Venus',
      gradient: ['#F3E8FF', '#E9D5FF'],
      textColor: '#7C3AED',
      borderColor: 'rgba(124, 58, 237, 0.35)',
    },
    {
      num: numerology.personalityNumber,
      label: 'Personality',
      sub: 'Outer Public Persona',
      planet: '☋ Ketu',
      gradient: ['#E0F2FE', '#BAE6FD'],
      textColor: '#0284C7',
      borderColor: 'rgba(2, 132, 199, 0.35)',
    },
  ];

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Screen Header without title truncation */}
        <ScreenHeader
          title="Vedic Numerology"
          subtitle="Karma & 2026-2030 Predictions"
          showBack
          showWallet
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* User Input Card */}
          <View style={styles.inputCard}>
            <View style={styles.inputCardHeader}>
              <Text style={styles.inputCardTitle}>✨ Cosmic Name & Birth Details</Text>
              <Text style={styles.inputCardSub}>Vedic grid recalculates in real-time</Text>
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>FULL NAME</Text>
                <TextInput
                  style={styles.input}
                  value={inputName}
                  onChangeText={setInputName}
                  placeholder="Full Name"
                />
              </View>

              <View style={styles.inputWrap}>
                <Text style={styles.label}>DATE OF BIRTH</Text>
                <TextInput
                  style={styles.input}
                  value={dob}
                  onChangeText={setDob}
                  placeholder="DD-MM-YYYY"
                />
              </View>
            </View>
          </View>

          {/* 4 Core Vibrational Numbers Grid */}
          <View>
            <SectionHeader
              title="🔢 Core Numerology Profile"
              subtitle="Your 4 Master Vibrational Frequencies"
            />

            <View style={styles.grid4}>
              {coreCards.map((item, idx) => (
                <View
                  key={idx}
                  style={[styles.coreCard, { borderColor: item.borderColor }]}
                >
                  <View style={styles.coreNumAura}>
                    <LinearGradient
                      colors={item.gradient as [string, string]}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={[styles.coreVal, { color: item.textColor }]}>
                      {item.num}
                    </Text>
                  </View>

                  <Text style={styles.coreLabel}>{item.label}</Text>
                  <Text style={styles.coreSub} numberOfLines={1}>
                    {item.sub}
                  </Text>

                  <View style={styles.planetTag}>
                    <Text style={styles.planetTagText}>{item.planet}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 📜 Past Life & Karmic Insights */}
          <View style={styles.pastLifeCard}>
            <View style={styles.pastLifeHeader}>
              <View style={styles.templeIconBox}>
                <Text style={{ fontSize: 24 }}>🏛️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pastLifeEyebrow}>PAST LIFE INCARNATION</Text>
                <Text style={styles.pastLifeRole}>
                  {numerology.pastLifeInsight.pastLifeRole}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Structured Badges */}
            <View style={styles.karmicItemsList}>
              <View style={styles.karmicBlock}>
                <View style={styles.karmicTagAmber}>
                  <Text style={styles.karmicTagAmberText}>📜 KARMIC DEBT</Text>
                </View>
                <Text style={styles.karmicDesc}>
                  {numerology.pastLifeInsight.karmicDebt}
                </Text>
              </View>

              <View style={styles.karmicBlock}>
                <View style={styles.karmicTagPurple}>
                  <Text style={styles.karmicTagPurpleText}>🪔 SOUL LESSON</Text>
                </View>
                <Text style={styles.karmicDesc}>
                  {numerology.pastLifeInsight.karmicLesson}
                </Text>
              </View>

              <View style={styles.karmicBlock}>
                <View style={styles.karmicTagGreen}>
                  <Text style={styles.karmicTagGreenText}>✨ SPIRITUAL GIFT</Text>
                </View>
                <Text style={[styles.karmicDesc, { color: '#059669', fontWeight: '700' }]}>
                  {numerology.pastLifeInsight.spiritualGift}
                </Text>
              </View>
            </View>
          </View>

          {/* 🔮 5-Year Future Forecast Timeline */}
          <View style={{ gap: spacing.md }}>
            <SectionHeader
              title="🔮 5-Year Future Predictions (2026 - 2030)"
              subtitle="Year-by-Year Career, Love & Wealth Forecast"
            />

            {/* Timeline Year Tabs */}
            <View style={styles.yearTabRow}>
              {[2026, 2027, 2028, 2029, 2030].map((yr) => {
                const active = selectedYear === yr;
                return (
                  <Pressable
                    key={yr}
                    onPress={() => handleYearSelect(yr)}
                    style={[styles.yearTab, active && styles.yearTabActive]}
                  >
                    {active && (
                      <LinearGradient
                        colors={['#D97706', '#E67E22']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <Text style={[styles.yearTabText, active && styles.yearTabTextActive]}>
                      {yr}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Forecast Detail Card */}
            <View style={styles.forecastCard}>
              <View style={styles.forecastHeader}>
                <View style={styles.personalYearBadge}>
                  <Text style={styles.personalYearBadgeText}>
                    Personal Year {currentYearData.personalYear}
                  </Text>
                </View>
                <Text style={styles.forecastTitle}>{currentYearData.year} Forecast</Text>
              </View>

              <Text style={styles.forecastSubtitle}>{currentYearData.title}</Text>

              <View style={styles.predictBox}>
                <Text style={styles.predictHeader}>💼 Career & Business</Text>
                <Text style={styles.predictText}>{currentYearData.careerPredict}</Text>
              </View>

              <View style={styles.predictBox}>
                <Text style={[styles.predictHeader, { color: '#7C3AED' }]}>
                  ❤️ Love & Relationships
                </Text>
                <Text style={styles.predictText}>{currentYearData.lovePredict}</Text>
              </View>

              <View style={styles.predictBox}>
                <Text style={[styles.predictHeader, { color: '#059669' }]}>
                  💰 Wealth & Financial Returns
                </Text>
                <Text style={styles.predictText}>{currentYearData.wealthPredict}</Text>
              </View>
            </View>
          </View>

          {/* Lucky Phone & Vehicle Number Compatibility */}
          <View>
            <SectionHeader
              title="🔢 Lucky Vibration Checker"
              subtitle="Verify if your phone & plate attract fortune"
            />

            <View style={styles.checkerCard}>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>📱 MOBILE NUMBER</Text>
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="numeric"
                  placeholder="Enter 10-digit mobile number"
                />
                <View style={styles.resRow}>
                  <View style={styles.totalBadge}>
                    <Text style={styles.totalBadgeText}>Total: {phoneSum}</Text>
                  </View>
                  <Text style={styles.resText}>
                    {phoneSum === 1 || phoneSum === 3 || phoneSum === 5 || phoneSum === 6
                      ? 'Auspicious & Prosperous ✅'
                      : 'Neutral Frequency'}
                  </Text>
                </View>
              </View>

              <View style={styles.inputWrap}>
                <Text style={styles.label}>🚗 VEHICLE PLATE NUMBER</Text>
                <TextInput
                  style={styles.input}
                  value={vehicleNumber}
                  onChangeText={setVehicleNumber}
                  placeholder="e.g. DL 01 AB 1234"
                />
                <View style={styles.resRow}>
                  <View style={[styles.totalBadge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                    <Text style={[styles.totalBadgeText, { color: '#047857' }]}>
                      Total: {vehicleSum}
                    </Text>
                  </View>
                  <Text style={styles.resText}>
                    {vehicleSum === 9 || vehicleSum === 5 || vehicleSum === 3
                      ? 'Harmonious Plate Number ✅'
                      : 'Neutral Vehicle Frequency'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },

  /* Input Card */
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
    gap: spacing.sm,
  },
  inputCardHeader: {
    gap: 2,
  },
  inputCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  inputCardSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputWrap: {
    gap: 4,
    flex: 1,
  },
  label: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    fontSize: 13,
    color: '#1E1B4B',
    fontWeight: '700',
  },

  /* 4 Core Numerology Cards */
  grid4: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: spacing.xs,
  },
  coreCard: {
    width: '48.4%',
    padding: 14,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  coreNumAura: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 2,
  },
  coreVal: {
    fontSize: 26,
    fontWeight: '900',
  },
  coreLabel: {
    fontSize: 13,
    color: '#1E1B4B',
    fontWeight: '800',
    textAlign: 'center',
  },
  coreSub: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  planetTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  planetTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
  },

  /* Past Life Card */
  pastLifeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
    gap: spacing.sm,
  },
  pastLifeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  templeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(217, 119, 6, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastLifeEyebrow: {
    fontSize: 9.5,
    color: '#D97706',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pastLifeRole: {
    fontSize: 15,
    color: '#1E1B4B',
    fontWeight: '800',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },
  karmicItemsList: {
    gap: 10,
  },
  karmicBlock: {
    gap: 3,
  },
  karmicTagAmber: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  karmicTagAmberText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#B45309',
  },
  karmicTagPurple: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  karmicTagPurpleText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#7C3AED',
  },
  karmicTagGreen: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  karmicTagGreenText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#047857',
  },
  karmicDesc: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
    fontWeight: '500',
  },

  /* Year Tabs */
  yearTabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  yearTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  yearTabActive: {},
  yearTabText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  yearTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  /* Forecast Card */
  forecastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
    gap: 10,
  },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  personalYearBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  personalYearBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B45309',
  },
  forecastTitle: {
    fontSize: 15,
    color: '#1E1B4B',
    fontWeight: '800',
  },
  forecastSubtitle: {
    fontSize: 13,
    color: '#D97706',
    fontWeight: '800',
  },
  predictBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 3,
  },
  predictHeader: {
    fontSize: 10.5,
    color: '#D97706',
    fontWeight: '900',
  },
  predictText: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
    fontWeight: '500',
  },

  /* Checker Card */
  checkerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
    gap: spacing.md,
  },
  resRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  totalBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  totalBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#B45309',
  },
  resText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '700',
    flex: 1,
  },
});
