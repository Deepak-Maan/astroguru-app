import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../../src/components/GradientBackground';
import { Card } from '../../src/components/Card';
import { Chip } from '../../src/components/Chip';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SectionHeader } from '../../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../../src/theme';
import { HoroscopePeriod } from '../../src/types';
import { RASHIS } from '../../src/data/rashis';
import { getHoroscope } from '../../src/services/horoscope';
import { DailyCosmicDirectiveCard } from '../../src/components/cosmic/DailyCosmicDirectiveCard';
import { ShareableCosmicStoryModal } from '../../src/components/cosmic/ShareableCosmicStoryModal';
import { useUserStore } from '../../src/store/userStore';
import { useAuthStore } from '../../src/store/authStore';

const PERIODS: { id: HoroscopePeriod; label: string; icon: string }[] = [
  { id: 'daily', label: 'Daily', icon: '\u2600\ufe0f' },
  { id: 'weekly', label: 'Weekly', icon: '\ud83d\udcc5' },
  { id: 'monthly', label: 'Monthly', icon: '\ud83c\udf19' },
];

const TRANSITS = [
  { planet: '\u2609 Sun', from: 'Karka (Cancer)', to: 'Simha (Leo)', date: '17 Aug 2026', effect: 'Boosts leadership & authority in all charts', urgent: false },
  { planet: '\u263d Moon', from: 'Mesha', to: 'Vrishabha', date: '10 Aug 2026', effect: 'Emotional sensitivity peaks — advise clients caution', urgent: false },
  { planet: '\u2642 Mars', from: 'Mithuna', to: 'Karka', date: '01 Sep 2026', effect: 'Aggression & property disputes. Acharya alert!', urgent: true },
  { planet: '\u2643 Jupiter', from: 'Mithuna', to: 'Karka', date: '14 Oct 2026', effect: 'Grand Guru Transit — highly auspicious consultations', urgent: false },
  { planet: '\u2644 Saturn', from: 'Kumbha (Rx)', to: 'Direct', date: '15 Nov 2026', effect: 'Saturn stations direct — major life changes', urgent: true },
  { planet: '\u2648 Rahu', from: 'Meena', to: 'Kumbha', date: '22 Dec 2026', effect: 'Karmic axis shift — destiny consultations increase', urgent: false },
];

const RETRO = [
  { planet: 'Saturn \u2644', period: '29 Jun – 15 Nov 2026', status: 'Retrograde', impact: 'Delays, karma, karmic debt clients' },
  { planet: 'Jupiter \u2643', period: '09 Oct – 02 Feb 2027', status: 'Retrograde', impact: 'Guru wisdom retreat — introspection' },
  { planet: 'Mercury \u263f', period: '25 Aug – 17 Sep 2026', status: 'Retrograde', impact: 'Communication issues — advise delay' },
];

function AcharyaTransits() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent'>('all');
  const filtered = activeFilter === 'urgent' ? TRANSITS.filter((t) => t.urgent) : TRANSITS;

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Planetary Transits" subtitle="Acharya astro-intelligence feed" />
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }} showsVerticalScrollIndicator={false}>

          {/* Filter Pills */}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {(['all', 'urgent'] as const).map((f) => (
              <Pressable
                key={f}
                onPress={() => setActiveFilter(f)}
                style={{
                  paddingHorizontal: 18, paddingVertical: 8, borderRadius: radius.pill,
                  backgroundColor: activeFilter === f ? colors.teal : '#FFFFFF',
                  borderWidth: 1.5, borderColor: activeFilter === f ? colors.teal : 'rgba(191,219,254,0.6)',
                }}
              >
                <Text style={{ color: activeFilter === f ? '#FFFFFF' : colors.textMuted, fontWeight: '700', fontSize: 13 }}>
                  {f === 'all' ? '\ud83c\udf0d All Transits' : '\u26a1 Urgent Alerts'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Today's Key Alert */}
          <View style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', borderRadius: radius.lg, padding: spacing.md, borderLeftWidth: 4, borderLeftColor: '#818CF8', borderWidth: 1, borderColor: 'rgba(129, 140, 248, 0.3)' }}>
            <Text style={{ color: '#818CF8', fontWeight: '800', fontSize: 14 }}>⚡ Acharya Intelligence Alert</Text>
            <Text style={{ color: '#EEF2FF', fontSize: 13, marginTop: 4, fontWeight: '600', lineHeight: 18 }}>Mars transiting Karka from 1 Sep — prepare clients in houses 1, 4, 7, 10 for major life changes. Update consultation notes now.</Text>
          </View>

          {/* Transit Table */}
          <SectionHeader title="🪐 Upcoming Major Transits" subtitle="Affects your consultation guidance" />
          {filtered.map((t, i) => (
            <View
              key={i}
              style={{
                backgroundColor: 'rgba(26, 33, 64, 0.78)',
                borderRadius: radius.md,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: t.urgent ? 'rgba(239, 68, 68, 0.4)' : 'rgba(129, 140, 248, 0.25)',
                borderLeftWidth: 4,
                borderLeftColor: t.urgent ? '#EF4444' : colors.teal,
                gap: 4,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#EEF2FF' }}>{t.planet}</Text>
                {t.urgent && (
                  <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.35)' }}>
                    <Text style={{ color: '#F87171', fontSize: 11, fontWeight: '800' }}>⚡ URGENT</Text>
                  </View>
                )}
              </View>
              <Text style={{ ...typography.tiny, color: colors.teal, fontWeight: '700' }}>{t.from} → {t.to} · {t.date}</Text>
              <Text style={{ ...typography.small, color: '#A5B4FC', lineHeight: 18 }}>{t.effect}</Text>
            </View>
          ))}

          {/* Retrograde Table */}
          <SectionHeader title="\u21a9\ufe0f Active Retrogrades" subtitle="Planet stations affecting readings" />
          <Card padded={false}>
            {RETRO.map((r, i) => (
              <View
                key={i}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: spacing.md, borderBottomWidth: i < RETRO.length - 1 ? 1 : 0, borderColor: 'rgba(191,219,254,0.4)', gap: spacing.sm }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ ...typography.body, color: colors.text, fontWeight: '800' }}>{r.planet}</Text>
                  <Text style={{ ...typography.tiny, color: colors.textMuted }}>{r.period}</Text>
                  <Text style={{ ...typography.tiny, color: colors.textMuted, marginTop: 2 }}>{r.impact}</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(6,182,212,0.1)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)' }}>
                  <Text style={{ color: '#0891B2', fontSize: 11, fontWeight: '800' }}>↩ {r.status}</Text>
                </View>
              </View>
            ))}
          </Card>

          {/* Panchang Today */}
          <Card padded>
            <Text style={{ ...typography.h3, color: colors.text, fontWeight: '800', marginBottom: spacing.sm }}>\ud83d\uddd3\ufe0f Today's Panchang</Text>
            {[
              ['Tithi', '\ud83c\udf15 Purnima (Full Moon)'],
              ['Nakshatra', '\u2b50 Shravana'],
              ['Yoga', 'Vriddhi (Growth)'],
              ['Karana', 'Bava'],
              ['Vara', 'Saturday (Shaniwar)'],
            ].map(([k, v]) => (
              <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderColor: 'rgba(191,219,254,0.4)' }}>
                <Text style={{ ...typography.body, color: colors.textMuted }}>{k}</Text>
                <Text style={{ ...typography.body, color: colors.text, fontWeight: '700' }}>{v}</Text>
              </View>
            ))}
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

export default function Horoscope() {
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated || !authUser) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  if (authUser?.role === 'astrologer') return <AcharyaTransits />;

  const kundli = useUserStore((s) => s.kundli);
  const [sign, setSign] = useState(kundli?.moonRashiIndex ?? 0);
  const [period, setPeriod] = useState<HoroscopePeriod>('daily');
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<1 | 1.25>(1);

  const reading = useMemo(() => getHoroscope(sign, period), [sign, period]);
  const rashi = RASHIS[sign];

  const handleToggleVoiceAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const text = `Namaste! Here is your ${period} Rashifal for ${rashi.sanskrit}, ${rashi.english}. ${reading.summary}. Love Guidance: ${reading.love}. Career & Finance: ${reading.career}. Health advice: ${reading.health}. Your lucky color for today is ${reading.luckyColor}, and lucky number is ${reading.luckyNumber}. Har Har Mahadev!`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } else {
      setIsSpeaking(!isSpeaking);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Horoscope" subtitle="Rashifal for all 12 signs" showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Sign selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.signStrip}
          >
            {RASHIS.map((r) => {
              const active = r.index === sign;
              return (
                <Pressable
                  key={r.index}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch (_) {}
                    }
                    setSign(r.index);
                  }}
                  style={({ pressed }) => [
                    styles.signCell,
                    active && styles.signCellActive,
                    pressed && styles.signCellPressed,
                  ]}
                >
                  {active && (
                    <LinearGradient
                      colors={['#A78BFA', '#7C3AED']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <Text style={[styles.signGlyph, active && { color: colors.white }]}>
                    {r.glyph}
                  </Text>
                  <Text style={[styles.signName, active && { color: colors.white, fontWeight: '800' }]}>
                    {r.sanskrit}
                  </Text>
                  {r.index === kundli?.moonRashiIndex && (
                    <View style={styles.yourDot} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Period tabs */}
          <View style={styles.periodRow}>
            {PERIODS.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch (_) {}
                  }
                  setPeriod(p.id);
                }}
                style={({ pressed }) => [
                  styles.period,
                  period === p.id && styles.periodActive,
                  pressed && { transform: [{ translateY: 1.5 }], opacity: 0.85 },
                ]}
              >
                {period === p.id && (
                  <LinearGradient
                    colors={['#F472B6', '#DB2777']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text style={styles.periodIcon}>{p.icon}</Text>
                <Text style={[styles.periodText, period === p.id && styles.periodTextActive]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 🎙️ AI VOICE HOROSCOPE AUDIO READER BANNER */}
          <Pressable onPress={handleToggleVoiceAudio} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
            <LinearGradient
              colors={isSpeaking ? ['#F472B6', '#DB2777'] : ['#7C3AED', '#5B21B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                marginHorizontal: spacing.lg,
                borderRadius: radius.xl,
                padding: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                borderWidth: 1.5,
                borderColor: isSpeaking ? '#FF3366' : 'rgba(99,102,241,0.4)',
                shadowColor: isSpeaking ? '#FF3366' : colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 22 }}>{isSpeaking ? '🔊' : '🎙️'}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ ...typography.h3, color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>
                  {isSpeaking ? 'Reading Audio Rashifal…' : `Listen to ${rashi.sanskrit} Voice Audio`}
                </Text>
                <Text style={{ ...typography.tiny, color: 'rgba(255,255,255,0.75)', marginTop: 2, fontWeight: '600' }}>
                  {isSpeaking ? 'Tap to Pause Speech Engine' : 'AI Voice Reader · 1-Tap Rashifal Synthesis'}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: radius.pill,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.3)',
                }}
              >
                <Text style={{ ...typography.tiny, color: '#FFFFFF', fontWeight: '800' }}>
                  {isSpeaking ? 'PAUSE' : 'PLAY ▶'}
                </Text>
              </View>
            </LinearGradient>
          </Pressable>

          {/* Share Story Card CTA Button */}
          <View style={{ paddingHorizontal: spacing.lg }}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch (_) {}
                }
                setShowStoryModal(true);
              }}
              style={({ pressed }) => [
                styles.shareStoryBanner,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={['rgba(236, 72, 153, 0.25)', 'rgba(99, 102, 241, 0.25)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 20 }}>📸</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.shareStoryTitle}>Share Daily Story Card</Text>
                <Text style={styles.shareStorySub}>Export 9:16 Instagram & WhatsApp Status</Text>
              </View>
              <View style={styles.shareStoryPill}>
                <Text style={styles.shareStoryPillText}>Share ⚡</Text>
              </View>
            </Pressable>
          </View>

          {/* If Daily period: Cosmic Directives (Do's & Don'ts & Power Matrix) */}
          {period === 'daily' && (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <DailyCosmicDirectiveCard
                rashiId={rashi.english.toLowerCase()}
                rashiName={rashi.english}
                onOpenShareModal={() => setShowStoryModal(true)}
              />
            </View>
          )}

          {/* Main reading card */}
          <Card>
            <View style={styles.readingHead}>
              <View style={styles.readingGlyphCircle}>
                <Text style={styles.readingGlyph}>{rashi.glyph}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.readingSign}>
                  {rashi.sanskrit}
                  <Text style={{ color: colors.textMuted, fontWeight: '600' }}> · {rashi.english}</Text>
                </Text>
                <Text style={styles.readingMeta}>
                  {rashi.element} · {rashi.quality} · Lord {rashi.lord}
                </Text>
              </View>
              <View style={styles.moodCircle}>
                <Text style={styles.moodValue}>{reading.mood}</Text>
                <Text style={styles.moodPct}>%</Text>
              </View>
            </View>

            <Text style={styles.summary}>{reading.summary}</Text>

            {/* Mood bar */}
            <View style={styles.moodBarTrack}>
              <LinearGradient
                colors={['#6366F1', '#FF3366']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.moodBarFill, { width: `${reading.mood}%` }]}
              />
            </View>
            <Text style={styles.moodCaption}>Overall {period} mood · {reading.mood}%</Text>
          </Card>

          {/* Life areas */}
          {(
            [
              ['❤️', 'Love & Relationships', reading.love],
              ['💼', 'Career & Work', reading.career],
              ['🌿', 'Health & Wellbeing', reading.health],
            ] as [string, string, string][]
          ).map(([icon, title, text]) => (
            <View key={title} style={styles.areaCard}>
              <View style={styles.areaIconCircle}>
                <Text style={styles.areaIcon}>{icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.areaTitle}>{title}</Text>
                <Text style={styles.areaText}>{text}</Text>
              </View>
            </View>
          ))}

          {/* Lucky factors */}
          <Card style={{ marginHorizontal: spacing.lg }}>
            <Text style={styles.luckyTitle}>Lucky Factors</Text>
            <View style={styles.luckyRow}>
              {[
                { label: 'Number', value: String(reading.luckyNumber), color: '#06B6D4' },
                { label: 'Colour', value: reading.luckyColor, color: '#6366F1' },
                { label: 'Gem', value: rashi.luckyColor, color: '#8B5CF6' },
              ].map(({ label, value, color }) => (
                <View key={label} style={styles.luckyCell}>
                  <Text style={styles.luckyLabel}>{label}</Text>
                  <Text style={[styles.luckyValue, { color }]}>{value}</Text>
                </View>
              ))}
            </View>
            <View style={styles.traitRow}>
              <Chip label={rashi.traits} tone="teal" />
            </View>
          </Card>
        </ScrollView>

        {/* 9:16 Shareable Cosmic Story Modal */}
        <ShareableCosmicStoryModal
          visible={showStoryModal}
          rashiId={rashi.english.toLowerCase()}
          onClose={() => setShowStoryModal(false)}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxl, gap: spacing.lg },

  signStrip: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: spacing.xs },
  signCell: {
    width: 72,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    marginRight: spacing.sm,
    overflow: 'hidden',
    gap: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  signCellActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.32)',
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.7)',
    shadowColor: '#6366F1',
    shadowOpacity: 0.35,
  },
  signCellPressed: {
    transform: [{ translateY: 2 }],
    opacity: 0.85,
  },
  signGlyph: { fontSize: 24, color: '#818CF8' },
  signName: { ...typography.tiny, fontSize: 10, color: '#EEF2FF', fontWeight: '700' },
  yourDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    borderWidth: 1.5,
    borderColor: '#0A0C16',
  },

  periodRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderRadius: radius.pill,
    padding: 4,
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    gap: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  period: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  periodActive: {},
  periodIcon: { fontSize: 14 },
  periodText: { ...typography.small, color: '#A5B4FC', fontWeight: '700', fontSize: 13 },
  periodTextActive: { color: colors.white, fontWeight: '800' },

  readingHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  readingGlyphCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readingGlyph: { fontSize: 28, color: '#EEF2FF' },
  readingSign: { ...typography.h2, color: '#EEF2FF', fontWeight: '800' },
  readingMeta: { ...typography.tiny, color: '#A5B4FC', marginTop: 2, textTransform: 'capitalize', fontWeight: '600' },
  moodCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(236, 72, 153, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodValue: { ...typography.h3, fontSize: 15, color: '#F472B6', lineHeight: 18, fontWeight: '800' },
  moodPct: { ...typography.tiny, fontSize: 9.5, color: '#F472B6', fontWeight: '800' },

  summary: { ...typography.body, color: '#EEF2FF', lineHeight: 22, fontWeight: '600' },
  moodBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  moodBarFill: { height: '100%', borderRadius: 4 },
  moodCaption: { ...typography.tiny, color: '#A5B4FC', marginTop: 6, fontWeight: '700' },

  areaCard: {
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderRadius: radius.xl,
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    padding: spacing.lg,
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  areaIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.4)',
  },
  areaIcon: { fontSize: 18 },
  areaTitle: { ...typography.h3, fontSize: 15, color: '#EEF2FF', fontWeight: '800' },
  areaText: { ...typography.small, color: '#A5B4FC', marginTop: 4, lineHeight: 19, fontWeight: '600' },

  luckyTitle: { ...typography.h3, color: '#EEF2FF', marginBottom: spacing.md, fontWeight: '800' },
  luckyRow: { flexDirection: 'row', gap: spacing.sm },
  luckyCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  luckyLabel: { ...typography.tiny, color: '#A5B4FC', fontWeight: '700' },
  luckyValue: { ...typography.h3, fontSize: 13, fontWeight: '800' },
  traitRow: { flexDirection: 'row', marginTop: spacing.md },

  /* Share Story Card CTA */
  shareStoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    borderRadius: radius.xl,
    padding: spacing.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderWidth: 1.2,
    borderColor: 'rgba(236, 72, 153, 0.35)',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  shareStoryTitle: {
    ...typography.h3,
    color: '#EEF2FF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  shareStorySub: {
    ...typography.tiny,
    color: '#F472B6',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 1,
  },
  shareStoryPill: {
    backgroundColor: '#DB2777',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  shareStoryPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
