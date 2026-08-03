import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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

export default function ChoghadiyaScreen() {
  const [activeTab, setActiveTab] = useState<'day' | 'night'>('day');

  const DAY_CHOGHADIYA = [
    { time: '06:00 AM - 07:30 AM', name: 'Amrit (अमृत)', quality: 'Best', tone: 'teal', desc: 'Auspicious for all major works & starting journeys' },
    { time: '07:30 AM - 09:00 AM', name: 'Kaal (काल)', quality: 'Inauspicious', tone: 'rose', desc: 'Avoid financial deals or new contracts' },
    { time: '09:00 AM - 10:30 AM', name: 'Shubh (शुभ)', quality: 'Auspicious', tone: 'gold', desc: 'Ideal for worship, buying gold & office tasks' },
    { time: '10:30 AM - 12:00 PM', name: 'Rog (रोग)', quality: 'Inauspicious', tone: 'rose', desc: 'Take care of health and avoid arguments' },
    { time: '12:00 PM - 01:30 PM', name: 'Udeg (उद्वेग)', quality: 'Inauspicious', tone: 'rose', desc: 'Causes mental stress & delays' },
    { time: '01:30 PM - 03:00 PM', name: 'Chhar (चर)', quality: 'Neutral', tone: 'teal', desc: 'Good for travel and movement' },
    { time: '03:00 PM - 04:30 PM', name: 'Labh (लाभ)', quality: 'High Gain', tone: 'gold', desc: 'Best for business, profit & signing agreements' },
    { time: '04:30 PM - 06:00 PM', name: 'Amrit (अमृत)', quality: 'Best', tone: 'teal', desc: 'Most propitious time slot of late afternoon' },
  ];

  const UPCOMING_VRATS = [
    { date: '04 Aug 2026', name: 'Sravana Putra Ekadashi Vrat', significance: 'Grants offspring, wisdom & liberation' },
    { date: '06 Aug 2026', name: 'Pradosh Vrat (Shukla Paksha)', significance: 'Lord Shiva blessing for removing all sins' },
    { date: '09 Aug 2026', name: 'Shravan Purnima / Raksha Bandhan', significance: 'Sacred thread festival & full moon bath' },
    { date: '17 Aug 2026', name: 'Nag Panchami Vrat', significance: 'Protects from Rahu-Ketu dosha & snake fear' },
  ];

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Choghadiya & Vrat Calendar" subtitle="Auspicious Muhurats & Fasting Dates" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Day / Night Selector */}
          <View style={styles.tabRow}>
            <Pressable
              onPress={() => setActiveTab('day')}
              style={[styles.tabCell, activeTab === 'day' && styles.tabCellActive]}
            >
              {activeTab === 'day' && <LinearGradient colors={['#E67E22', '#D4AC0D']} style={StyleSheet.absoluteFill} />}
              <Text style={[styles.tabText, activeTab === 'day' && styles.tabTextActive]}>☀️ Day Choghadiya</Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('night')}
              style={[styles.tabCell, activeTab === 'night' && styles.tabCellActive]}
            >
              {activeTab === 'night' && <LinearGradient colors={['#7D3C98', '#331F6B']} style={StyleSheet.absoluteFill} />}
              <Text style={[styles.tabText, activeTab === 'night' && styles.tabTextActive]}>🌙 Night Choghadiya</Text>
            </Pressable>
          </View>

          {/* Choghadiya Timings List */}
          <SectionHeader title="Today's Time Windows" subtitle="New Delhi (IST)" />

          {DAY_CHOGHADIYA.map((slot) => (
            <Card key={slot.time} style={styles.slotCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.slotTime}>{slot.time}</Text>
                <Chip label={`${slot.name} · ${slot.quality}`} tone={slot.tone as 'gold' | 'teal' | 'rose'} />
              </View>
              <Text style={styles.slotDesc}>{slot.desc}</Text>
            </Card>
          ))}

          {/* Upcoming Vrat Calendar */}
          <SectionHeader title="Upcoming Vrats & Festivals" subtitle="August 2026 Fasting Dates" />

          {UPCOMING_VRATS.map((vrat) => (
            <Card key={vrat.name} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.vratName}>{vrat.name}</Text>
                <Chip label={vrat.date} tone="gold" />
              </View>
              <Text style={styles.vratSignificance}>{vrat.significance}</Text>
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  tabRow: { flexDirection: 'row', gap: spacing.sm, height: 42 },
  tabCell: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    overflow: 'hidden',
  },
  tabCellActive: { borderColor: 'transparent' },
  tabText: { ...typography.small, color: colors.textMuted, fontWeight: '800' },
  tabTextActive: { color: colors.white },

  slotCard: { gap: 4 },
  slotTime: { ...typography.h3, color: colors.text, fontSize: 14, fontWeight: '800' },
  slotDesc: { ...typography.small, color: colors.textMuted, fontSize: 12 },

  vratName: { ...typography.h3, color: colors.text, fontSize: 15, fontWeight: '800' },
  vratSignificance: { ...typography.small, color: colors.textMuted, fontSize: 12.5 },
});
