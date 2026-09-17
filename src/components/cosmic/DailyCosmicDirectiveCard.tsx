import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../../theme';
import { DailyDirective, getDailyDirective } from '../../data/dailyDirectives';

interface Props {
  rashiId?: string;
  rashiName?: string;
  onOpenShareModal: () => void;
}

export function DailyCosmicDirectiveCard({ rashiId, rashiName, onOpenShareModal }: Props) {
  const [activeTab, setActiveTab] = useState<'embrace' | 'avoid' | 'power'>('embrace');
  const directive: DailyDirective = getDailyDirective(rashiId);

  return (
    <View style={styles.container}>
      {/* Frosted Specular Border Highlight */}
      <View style={styles.specularBorder} />

      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.badgeGlow}>
            <Text style={styles.badgeIcon}>🪐</Text>
          </View>
          <View>
            <View style={styles.titleBadgeRow}>
              <Text style={styles.title}>Today's Guide</Text>
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Today</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>
              {directive.rashiName} ({directive.sanskritName}) · {directive.rulingPlanet}
            </Text>
          </View>
        </View>

        {/* 1-Tap Share Button */}
        <Pressable
          onPress={onOpenShareModal}
          style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] }]}
        >
          <LinearGradient
            colors={['#6366F1', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.shareBtnIcon}>📸</Text>
          <Text style={styles.shareBtnText}>Share Story</Text>
        </Pressable>
      </View>

      {/* Transit Brief */}
      <Text style={styles.transitSummary} numberOfLines={2}>
        {directive.transitSummary}
      </Text>

      {/* Interactive Tabs */}
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => setActiveTab('embrace')}
          style={[styles.tab, activeTab === 'embrace' && styles.tabActiveEmbrace]}
        >
          <Text style={[styles.tabText, activeTab === 'embrace' && styles.tabTextActiveEmbrace]}>
            🟢 Good to Do
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('avoid')}
          style={[styles.tab, activeTab === 'avoid' && styles.tabActiveAvoid]}
        >
          <Text style={[styles.tabText, activeTab === 'avoid' && styles.tabTextActiveAvoid]}>
            🔴 What to Avoid
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('power')}
          style={[styles.tab, activeTab === 'power' && styles.tabActivePower]}
        >
          <Text style={[styles.tabText, activeTab === 'power' && styles.tabTextActivePower]}>
            ⚡ Lucky Factors
          </Text>
        </Pressable>
      </View>

      {/* Tab Content */}
      <View style={styles.contentBox}>
        {activeTab === 'embrace' && (
          <View style={styles.listWrap}>
            {directive.embrace.map((item, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'avoid' && (
          <View style={styles.listWrap}>
            {directive.avoid.map((item, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'power' && (
          <View style={styles.powerGrid}>
            <View style={styles.powerPill}>
              <Text style={styles.powerLabel}>Lucky Color</Text>
              <View style={styles.colorRow}>
                <View style={[styles.colorSwatch, { backgroundColor: directive.powerMatrix.luckyColorHex }]} />
                <Text style={styles.powerVal}>{directive.powerMatrix.luckyColor}</Text>
              </View>
            </View>

            <View style={styles.powerPill}>
              <Text style={styles.powerLabel}>Lucky Number</Text>
              <Text style={[styles.powerVal, { color: '#FCD34D' }]}>
                {directive.powerMatrix.luckyNumber}
              </Text>
            </View>

            <View style={styles.powerPill}>
              <Text style={styles.powerLabel}>Lucky Direction</Text>
              <Text style={styles.powerVal}>{directive.powerMatrix.luckyDirection}</Text>
            </View>

            <View style={styles.powerPill}>
              <Text style={styles.powerLabel}>Best Time Today</Text>
              <Text style={[styles.powerVal, { color: '#38BDF8', fontSize: 11 }]}>
                {directive.powerMatrix.abhijitMuhurat}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Daily Affirmation Footer */}
      <View style={styles.affirmationFooter}>
        <Text style={styles.affirmationQuote}>“{directive.affirmation}”</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.28)',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
    marginVertical: spacing.md,
  },
  specularBorder: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  badgeGlow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 20,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#EEF2FF',
    letterSpacing: 0.2,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
    borderWidth: 0.8,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 12,
    color: '#A5B4FC',
    fontWeight: '500',
    marginTop: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  shareBtnIcon: {
    fontSize: 12,
  },
  shareBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  transitSummary: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 12, 22, 0.65)',
    borderRadius: radius.md,
    padding: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.15)',
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  tabActiveEmbrace: {
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  tabActiveAvoid: {
    backgroundColor: 'rgba(239, 68, 68, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  tabActivePower: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.45)',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActiveEmbrace: {
    color: '#34D399',
    fontWeight: '700',
  },
  tabTextActiveAvoid: {
    color: '#F87171',
    fontWeight: '700',
  },
  tabTextActivePower: {
    color: '#EEF2FF',
    fontWeight: '700',
  },
  contentBox: {
    backgroundColor: 'rgba(15, 20, 42, 0.55)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 0.8,
    borderColor: 'rgba(129, 140, 248, 0.18)',
    minHeight: 90,
    justifyContent: 'center',
  },
  listWrap: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: '#EEF2FF',
    lineHeight: 17,
    fontWeight: '500',
  },
  powerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  powerPill: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(26, 33, 64, 0.65)',
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 0.8,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  powerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A5B4FC',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  powerVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EEF2FF',
  },
  affirmationFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 0.8,
    borderTopColor: 'rgba(129, 140, 248, 0.15)',
    alignItems: 'center',
  },
  affirmationQuote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#FCD34D',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
});
