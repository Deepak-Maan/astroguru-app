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

  const currentYearData = numerology.futureForecast.find((f) => f.year === selectedYear) || numerology.futureForecast[0];

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Vedic Numerology & Timeline" subtitle="Past Life Karma & 2026-2030 Future Predictions" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* User Input Card */}
          <Card style={{ gap: spacing.md }}>
            <SectionHeader title="Your Cosmic Name & Birth Details" subtitle="Enter details to generate your numerology grid" />

            <View style={styles.fieldRow}>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Full Official Name:</Text>
                <TextInput
                  style={styles.input}
                  value={inputName}
                  onChangeText={setInputName}
                  placeholder="Full Name"
                />
              </View>

              <View style={styles.inputWrap}>
                <Text style={styles.label}>Date of Birth:</Text>
                <TextInput
                  style={styles.input}
                  value={dob}
                  onChangeText={setDob}
                  placeholder="DD-MM-YYYY"
                />
              </View>
            </View>
          </Card>

          {/* 4 Core Vibrational Numbers Grid */}
          <SectionHeader title="Core Numerology Profile" subtitle="Your 4 Master Vibrational Frequencies" />

          <View style={styles.grid4}>
            {[
              { label: 'Life Path Number', val: numerology.lifePathNumber, sub: 'Birth Purpose & Destiny Path' },
              { label: 'Destiny Number', val: numerology.destinyNumber, sub: 'Name Energy & Expression' },
              { label: 'Soul Urge Number', val: numerology.soulUrgeNumber, sub: 'Heart Inner Desires' },
              { label: 'Personality Number', val: numerology.personalityNumber, sub: 'Outer Public Persona' },
            ].map((item, idx) => (
              <View key={idx} style={styles.coreCard}>
                <LinearGradient
                  colors={['rgba(230,126,34,0.12)', 'rgba(125,60,152,0.04)']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.coreVal}>{item.val}</Text>
                <Text style={styles.coreLabel}>{item.label}</Text>
                <Text style={styles.coreSub}>{item.sub}</Text>
              </View>
            ))}
          </View>

          {/* 📜 Past Life & Karmic Insights */}
          <Card style={{ gap: spacing.md }}>
            <SectionHeader title="📜 Past Life & Karmic Debt Analysis" subtitle="Vedic insights into past incarnations & soul lessons" />

            <View style={styles.pastLifeBox}>
              <LinearGradient
                colors={['rgba(125,60,152,0.14)', 'rgba(230,126,34,0.04)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Text style={{ fontSize: 36 }}>🏛️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pastLifeTitle}>Past Life Incarnation</Text>
                  <Text style={styles.pastLifeRole}>{numerology.pastLifeInsight.pastLifeRole}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>• Karmic Debt:</Text>
                <Text style={styles.detailVal}>{numerology.pastLifeInsight.karmicDebt}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>• Soul Lesson:</Text>
                <Text style={styles.detailVal}>{numerology.pastLifeInsight.karmicLesson}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>• Spiritual Gift:</Text>
                <Text style={[styles.detailVal, { color: colors.teal }]}>{numerology.pastLifeInsight.spiritualGift}</Text>
              </View>
            </View>
          </Card>

          {/* 🔮 5-Year Future Forecast Timeline */}
          <View style={{ gap: spacing.md }}>
            <SectionHeader title="🔮 5-Year Future Predictions (2026 - 2030)" subtitle="Year-by-Year Career, Love & Wealth Forecast" />

            {/* Timeline Year Tabs */}
            <View style={styles.yearTabRow}>
              {[2026, 2027, 2028, 2029, 2030].map((yr) => {
                const active = selectedYear === yr;
                return (
                  <Pressable
                    key={yr}
                    onPress={() => setSelectedYear(yr)}
                    style={[styles.yearTab, active && styles.yearTabActive]}
                  >
                    {active && (
                      <LinearGradient
                        colors={[colors.saffron, colors.gold]}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <Text style={[styles.yearTabText, active && styles.yearTabTextActive]}>{yr}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Forecast Detail Card */}
            <Card style={styles.forecastCard}>
              <LinearGradient
                colors={['rgba(230,126,34,0.08)', 'rgba(212,172,13,0.02)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.forecastHeader}>
                <Chip label={`Personal Year ${currentYearData.personalYear}`} tone="gold" />
                <Text style={styles.forecastTitle}>{currentYearData.year} Forecast</Text>
              </View>
              <Text style={styles.forecastSubtitle}>{currentYearData.title}</Text>

              <View style={styles.predictBox}>
                <Text style={styles.predictHeader}>💼 Career & Business:</Text>
                <Text style={styles.predictText}>{currentYearData.careerPredict}</Text>
              </View>

              <View style={styles.predictBox}>
                <Text style={styles.predictHeader}>❤️ Love & Relationships:</Text>
                <Text style={styles.predictText}>{currentYearData.lovePredict}</Text>
              </View>

              <View style={styles.predictBox}>
                <Text style={styles.predictHeader}>💰 Wealth & Financial Returns:</Text>
                <Text style={styles.predictText}>{currentYearData.wealthPredict}</Text>
              </View>
            </Card>
          </View>

          {/* Lucky Phone & Vehicle Number Compatibility */}
          <SectionHeader title="Mobile & Vehicle Number Vibration" subtitle="Verify if your numbers attract fortune" />

          <Card style={{ gap: spacing.md }}>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>📱 Mobile Number:</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="numeric"
                placeholder="Enter 10-digit mobile number"
              />
              <View style={styles.resRow}>
                <Chip label={`Total: ${phoneSum}`} tone="gold" />
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
              />
              <View style={styles.resRow}>
                <Chip label={`Total: ${vehicleSum}`} tone="teal" />
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

  fieldRow: { gap: spacing.sm },
  inputWrap: { gap: 4, flex: 1 },
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

  grid4: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  coreCard: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    alignItems: 'center',
    gap: 2,
    overflow: 'hidden',
    shadowColor: 'rgba(160,175,205,0.25)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  coreVal: { ...typography.display, fontSize: 36, color: colors.saffron, fontWeight: '900' },
  coreLabel: { ...typography.h3, fontSize: 13, color: colors.text, textAlign: 'center', fontWeight: '800' },
  coreSub: { ...typography.tiny, color: colors.textMuted, fontSize: 10, textAlign: 'center', fontWeight: '600' },

  pastLifeBox: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    gap: spacing.sm,
  },
  pastLifeTitle: { ...typography.tiny, color: colors.saffron, fontWeight: '800' },
  pastLifeRole: { ...typography.h2, color: colors.text, fontSize: 16, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#E3E8F3', marginVertical: 4 },
  detailRow: { gap: 2 },
  detailLabel: { ...typography.tiny, color: colors.saffron, fontWeight: '800' },
  detailVal: { ...typography.small, color: colors.text, lineHeight: 18, fontWeight: '600' },

  yearTabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E3E8F3',
  },
  yearTab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.pill, overflow: 'hidden' },
  yearTabActive: {},
  yearTabText: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  yearTabTextActive: { color: colors.white, fontWeight: '900' },

  forecastCard: { gap: spacing.md, padding: spacing.xl },
  forecastHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  forecastTitle: { ...typography.h2, color: colors.text, fontWeight: '800' },
  forecastSubtitle: { ...typography.h3, color: colors.saffron, fontSize: 15, fontWeight: '800' },

  predictBox: {
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    gap: 3,
  },
  predictHeader: { ...typography.tiny, color: colors.saffron, fontWeight: '800' },
  predictText: { ...typography.small, color: colors.text, lineHeight: 19, fontWeight: '600' },

  resRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  resText: { ...typography.tiny, color: colors.textMuted, fontWeight: '700', flex: 1 },
});
