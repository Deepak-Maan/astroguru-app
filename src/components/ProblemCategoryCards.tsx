import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, typography } from '../theme';

export interface ProblemCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: [string, string];
  specialtyFilter: string;
  urgencyTag: string;
}

export const PROBLEM_CATEGORIES: ProblemCategory[] = [
  {
    id: 'love',
    title: 'Love & Breakup',
    subtitle: 'Will my partner return? Patchup yog',
    icon: '💔',
    gradient: ['#EC4899', '#BE185D'],
    specialtyFilter: 'Love Compatibility',
    urgencyTag: 'High Demand',
  },
  {
    id: 'marriage',
    title: 'Marriage & Rishta',
    subtitle: 'Delayed marriage & Manglik dosha',
    icon: '💍',
    gradient: ['#F59E0B', '#B45309'],
    specialtyFilter: 'Kundli Matching',
    urgencyTag: 'Kundli Milan',
  },
  {
    id: 'career',
    title: 'Job & Govt Exams',
    subtitle: 'Promotion, transfer & career change',
    icon: '💼',
    gradient: ['#3B82F6', '#1D4ED8'],
    specialtyFilter: 'Vedic Astrology',
    urgencyTag: 'Govt Job Yog',
  },
  {
    id: 'finance',
    title: 'Money & Debt Relief',
    subtitle: 'Clear financial blockages & loans',
    icon: '💰',
    gradient: ['#10B981', '#047857'],
    specialtyFilter: 'Numerology',
    urgencyTag: 'Dhan Labh',
  },
  {
    id: 'nazar',
    title: 'Evil Eye & Nazar',
    subtitle: 'Remove negative energy & home peace',
    icon: '🧿',
    gradient: ['#8B5CF6', '#6D28D9'],
    specialtyFilter: 'Lal Kitab',
    urgencyTag: 'Instant Upay',
  },
];

export const ProblemCategoryCards: React.FC = () => {
  const router = useRouter();

  const handleSelectProblem = (cat: ProblemCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push({
      pathname: '/(tabs)/consult',
      params: { filterSpecialty: cat.specialtyFilter, concernTitle: cat.title },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>🎯 What's On Your Mind Today?</Text>
          <Text style={styles.subheading}>Instant answers tailored to your life concern</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {PROBLEM_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => handleSelectProblem(cat)}
            style={({ pressed }) => [styles.cardPressable, pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 }]}
          >
            <LinearGradient
              colors={cat.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.topRow}>
                <Text style={styles.icon}>{cat.icon}</Text>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{cat.urgencyTag}</Text>
                </View>
              </View>

              <View style={styles.bottomContent}>
                <Text style={styles.title}>{cat.title}</Text>
                <Text style={styles.subtitle} numberOfLines={2}>
                  {cat.subtitle}
                </Text>
                <View style={styles.actionRow}>
                  <Text style={styles.actionText}>Ask Acharya</Text>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  headerRow: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  heading: {
    ...typography.h3,
    color: '#EEF2FF',
    fontWeight: '800',
    fontSize: 17,
  },
  subheading: {
    ...typography.small,
    color: '#A5B4FC',
    marginTop: 2,
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: 12,
  },
  cardPressable: {
    width: 175,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    padding: 14,
    minHeight: 145,
    justifyContent: 'space-between',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
  },
  tagBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  tagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  bottomContent: {
    marginTop: 10,
    gap: 2,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14.5,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
