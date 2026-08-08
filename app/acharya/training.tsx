import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../../src/components/GradientBackground';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../../src/theme';

const COURSES = [
  { id: '1', title: 'Advanced Predictive Techniques', modules: 12, progress: 60, icon: '🪐' },
  { id: '2', title: 'Business of Astrology', modules: 8, progress: 100, icon: '💼' },
  { id: '3', title: 'Digital Consultation Skills', modules: 6, progress: 0, icon: '💻' },
  { id: '4', title: 'Jaimini Astrology Masterclass', modules: 15, progress: 25, icon: '📜' },
  { id: '5', title: 'Remedial Astrology & Gemology', modules: 10, progress: 0, icon: '💎' },
];

const RESOURCES = [
  { title: 'Planetary Almanac 2026', size: '2.4 MB', icon: '📕' },
  { title: 'Nadi Jyotish Handbook', size: '5.1 MB', icon: '📗' },
  { title: 'KP Ephemeris 2026', size: '1.8 MB', icon: '📘' },
  { title: 'Lal Kitab Remedies Guide', size: '3.2 MB', icon: '📙' },
];

const WEBINARS = [
  { title: 'Predicting Marriage Timing with KP', date: '15 Aug 2026, 7 PM', host: 'Pt. Rajesh Shastri', seats: 45 },
  { title: 'Advanced Dasha Interpretation', date: '22 Aug 2026, 6 PM', host: 'Dr. Meera Jyoti', seats: 30 },
  { title: 'Lal Kitab for the Modern Age', date: '01 Sep 2026, 8 PM', host: 'Acharya Vinod Bhatia', seats: 60 },
];

function ProgressBar({ pct }: { pct: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: pct === 100 ? colors.teal : '#F59E0B' }]} />
    </View>
  );
}

export default function Training() {
  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Acharya Training" subtitle="Grow your knowledge & earnings" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <LinearGradient colors={['#D97706', '#F59E0B', '#FCD34D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
            <Text style={styles.heroTitle}>🎓 Acharya Academy</Text>
            <Text style={styles.heroSub}>Deepen your expertise · Elevate your earnings</Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}><Text style={styles.heroStatVal}>5</Text><Text style={styles.heroStatLabel}>Courses</Text></View>
              <View style={styles.heroStat}><Text style={styles.heroStatVal}>51</Text><Text style={styles.heroStatLabel}>Modules</Text></View>
              <View style={styles.heroStat}><Text style={styles.heroStatVal}>3</Text><Text style={styles.heroStatLabel}>Webinars</Text></View>
            </View>
          </LinearGradient>

          {/* Courses */}
          <Text style={styles.sectionTitle}>📚 Your Courses</Text>
          {COURSES.map((c) => (
            <View key={c.id} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <View style={styles.courseIconBox}><Text style={styles.courseIcon}>{c.icon}</Text></View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.courseTitle}>{c.title}</Text>
                  <Text style={styles.courseMeta}>{c.modules} modules · {c.progress === 0 ? 'Not started' : c.progress === 100 ? '✅ Completed' : `${c.progress}% done`}</Text>
                </View>
                {c.progress === 100 && (
                  <View style={styles.completedBadge}><Text style={styles.completedBadgeText}>✅</Text></View>
                )}
              </View>
              <ProgressBar pct={c.progress} />
              <Pressable
                style={({ pressed }) => [styles.courseBtn, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.courseBtnText}>
                  {c.progress === 0 ? 'Start Course →' : c.progress === 100 ? 'Review Material →' : 'Continue →'}
                </Text>
              </Pressable>
            </View>
          ))}

          {/* Resources */}
          <Text style={styles.sectionTitle}>📥 Downloadable Resources</Text>
          <View style={styles.resourcesCard}>
            {RESOURCES.map((r, i) => (
              <Pressable
                key={r.title}
                style={({ pressed }) => [
                  styles.resourceRow,
                  i < RESOURCES.length - 1 && { borderBottomWidth: 1, borderBottomColor: 'rgba(191,219,254,0.4)' },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.resourceIcon}>{r.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resourceTitle}>{r.title}</Text>
                  <Text style={styles.resourceSize}>{r.size}</Text>
                </View>
                <Text style={styles.downloadIcon}>⬇️</Text>
              </Pressable>
            ))}
          </View>

          {/* Webinars */}
          <Text style={styles.sectionTitle}>🎙️ Upcoming Webinars</Text>
          {WEBINARS.map((w) => (
            <View key={w.title} style={styles.webinarCard}>
              <Text style={styles.webinarTitle}>{w.title}</Text>
              <Text style={styles.webinarMeta}>🗓️ {w.date}</Text>
              <Text style={styles.webinarHost}>👤 By {w.host}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <Text style={styles.webinarSeats}>{w.seats} seats left</Text>
                <Pressable style={styles.registerBtn}>
                  <Text style={styles.registerBtnText}>Register Free</Text>
                </Pressable>
              </View>
            </View>
          ))}

        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  heroCard: { borderRadius: radius.xl, padding: spacing.lg, gap: spacing.sm },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  heroStats: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  heroStat: { alignItems: 'center', gap: 2 },
  heroStatVal: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  courseCard: {
    backgroundColor: '#FFFFFF', borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)',
    shadowColor: '#BFDBFE', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 2,
  },
  courseHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  courseIconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },
  courseIcon: { fontSize: 22 },
  courseTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  courseMeta: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  completedBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(5,150,105,0.1)', alignItems: 'center', justifyContent: 'center' },
  completedBadgeText: { fontSize: 16 },
  progressTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  courseBtn: {
    alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: colors.teal, borderRadius: radius.pill,
  },
  courseBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  resourcesCard: {
    backgroundColor: '#FFFFFF', borderRadius: radius.lg,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)', overflow: 'hidden',
  },
  resourceRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  resourceIcon: { fontSize: 22 },
  resourceTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  resourceSize: { fontSize: 11, color: colors.textFaint, fontWeight: '600' },
  downloadIcon: { fontSize: 18 },
  webinarCard: {
    backgroundColor: '#FFFFFF', borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.4)', borderLeftWidth: 4, borderLeftColor: '#D97706',
    gap: 3,
  },
  webinarTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  webinarMeta: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  webinarHost: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  webinarSeats: { fontSize: 12, color: '#D97706', fontWeight: '700' },
  registerBtn: { backgroundColor: 'rgba(217,119,6,0.12)', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(217,119,6,0.3)' },
  registerBtnText: { color: '#D97706', fontWeight: '800', fontSize: 13 },
});
