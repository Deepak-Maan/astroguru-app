import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AstrotalkHeader } from '../src/components/astrotalk/AstrotalkHeader';
import { AstrotalkRechargeModal } from '../src/components/astrotalk/AstrotalkRechargeModal';
import { radius, spacing } from '../src/theme';
import { RASHIS } from '../src/data/rashis';

export default function LoveMeterScreen() {
  const router = useRouter();
  const [myRashiIdx, setMyRashiIdx] = useState(4); // Simha / Leo
  const [partnerRashiIdx, setPartnerRashiIdx] = useState(0); // Mesha / Aries
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);

  const mySign = RASHIS[myRashiIdx];
  const partnerSign = RASHIS[partnerRashiIdx];

  // Dynamic compatibility algorithms based on elemental trigonometry (Fire, Earth, Air, Water)
  const diff = Math.abs(myRashiIdx - partnerRashiIdx);
  const isTrine = diff === 4 || diff === 8 || diff === 0; // Same element (120°)
  const isOpposite = diff === 6; // Polarity (180°)
  const isSextile = diff === 2 || diff === 10; // Compatible (60°)

  const overallScore = isTrine ? 94 : isSextile ? 88 : isOpposite ? 82 : 74;
  const emotional = isTrine ? 96 : isSextile ? 85 : 72;
  const physical = isOpposite ? 98 : isTrine ? 92 : 78;
  const communication = isSextile ? 95 : isTrine ? 88 : 70;
  const longevity = isTrine ? 95 : isSextile ? 90 : 76;

  const handleSelectSign = (isPartner: boolean, idx: number) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    if (isPartner) setPartnerRashiIdx(idx);
    else setMyRashiIdx(idx);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <AstrotalkHeader onOpenRecharge={() => setRechargeModalVisible(true)} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Title Box */}
          <View style={styles.titleBox}>
            <Text style={styles.heading}>❤️ Zodiac Love & Chemistry Meter</Text>
            <Text style={styles.subHeading}>
              Calculate 4-pillar Vedic synastry & romantic relationship potential
            </Text>
          </View>

          {/* Dual Sign Pickers */}
          <View style={styles.pickerSection}>
            {/* My Sign */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerTitle}>YOU ({mySign.name})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {RASHIS.map((r, i) => {
                  const active = myRashiIdx === i;
                  return (
                    <Pressable
                      key={r.name}
                      onPress={() => handleSelectSign(false, i)}
                      style={[styles.rashiPill, active && styles.rashiPillActive]}
                    >
                      <Text style={{ fontSize: 16 }}>{r.glyph}</Text>
                      <Text style={[styles.rashiName, active && styles.rashiNameActive]}>
                        {r.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.heartCenter}>
              <Text style={{ fontSize: 24 }}>💞</Text>
            </View>

            {/* Partner Sign */}
            <View style={styles.pickerColumn}>
              <Text style={[styles.pickerTitle, { color: '#E11D48' }]}>PARTNER ({partnerSign.name})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {RASHIS.map((r, i) => {
                  const active = partnerRashiIdx === i;
                  return (
                    <Pressable
                      key={r.name}
                      onPress={() => handleSelectSign(true, i)}
                      style={[styles.rashiPill, active && styles.partnerPillActive]}
                    >
                      <Text style={{ fontSize: 16 }}>{r.glyph}</Text>
                      <Text style={[styles.rashiName, active && styles.partnerNameActive]}>
                        {r.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Score Result Card */}
          <View style={styles.scoreCard}>
            <LinearGradient
              colors={['#FFF1F2', '#FFE4E6']}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.scoreHeader}>
              <View>
                <Text style={styles.pairText}>
                  {mySign.glyph} {mySign.name} + {partnerSign.glyph} {partnerSign.name}
                </Text>
                <Text style={styles.verdictText}>
                  {overallScore >= 90
                    ? '✨ Soulmate Connection!'
                    : overallScore >= 80
                    ? '💖 Highly Auspicious Chemistry'
                    : '💫 Moderate Match with Remedies'}
                </Text>
              </View>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{overallScore}%</Text>
                <Text style={styles.scoreLabel}>Match</Text>
              </View>
            </View>

            {/* 4 Pillars Breakdown */}
            <View style={styles.pillarsGrid}>
              {[
                { label: '💖 Emotional Bond', val: emotional, color: '#E11D48' },
                { label: '🔥 Physical Spark', val: physical, color: '#EA580C' },
                { label: '🧠 Communication', val: communication, color: '#0284C7' },
                { label: '💍 Marriage Potential', val: longevity, color: '#059669' },
              ].map((p) => (
                <View key={p.label} style={styles.pillarItem}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.pillarLabel}>{p.label}</Text>
                    <Text style={[styles.pillarVal, { color: p.color }]}>{p.val}%</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${p.val}%`, backgroundColor: p.color }]} />
                  </View>
                </View>
              ))}
            </View>

            {/* Do's and Don'ts */}
            <View style={styles.dosDontsBox}>
              <Text style={styles.dosTitle}>💡 Relationship Wisdom for {mySign.name} & {partnerSign.name}:</Text>
              <Text style={styles.dosText}>
                • <Text style={{ fontWeight: '800' }}>Strengths:</Text> Mutual natural admiration and immense mutual loyalty. You inspire each other's career ambitions.
              </Text>
              <Text style={styles.dosText}>
                • <Text style={{ fontWeight: '800' }}>Remedy Advice:</Text> Practice active patience during Mercury retrograde periods and wear matching Rose Quartz crystals.
              </Text>
            </View>

            {/* Consult Button */}
            <Pressable
              onPress={() => router.push('/(tabs)/consult')}
              style={({ pressed }) => [styles.consultBtn, pressed && { opacity: 0.88 }]}
            >
              <LinearGradient
                colors={['#FFC107', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.consultBtnText}>
                Consult Relationship Astrologer (FREE 1st Min) ➔
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      <AstrotalkRechargeModal
        visible={rechargeModalVisible}
        onClose={() => setRechargeModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 100,
  },
  titleBox: {
    gap: 3,
  },
  heading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  subHeading: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  pickerSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pickerColumn: {
    gap: 6,
  },
  pickerTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  rashiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  rashiPillActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  partnerPillActive: {
    backgroundColor: '#FFF1F2',
    borderColor: '#E11D48',
  },
  rashiName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  rashiNameActive: {
    color: '#D97706',
    fontWeight: '900',
  },
  partnerNameActive: {
    color: '#E11D48',
    fontWeight: '900',
  },
  heartCenter: {
    alignItems: 'center',
    marginVertical: -2,
  },
  scoreCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    overflow: 'hidden',
    gap: 14,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pairText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  verdictText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E11D48',
    marginTop: 2,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E11D48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFE4E6',
  },
  pillarsGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  pillarItem: {
    gap: 4,
  },
  pillarLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#374151',
  },
  pillarVal: {
    fontSize: 12,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  dosDontsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  dosTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#9F1239',
    marginBottom: 2,
  },
  dosText: {
    fontSize: 11.5,
    color: '#4B5563',
    lineHeight: 16,
  },
  consultBtn: {
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  consultBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1A1A1A',
  },
});
