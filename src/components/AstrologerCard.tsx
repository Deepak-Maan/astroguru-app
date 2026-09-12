import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Astrologer } from '../types';
import { Avatar } from './Avatar';
import { colors, radius, spacing, typography } from '../theme';
import { formatCurrency } from '../utils';

interface Props {
  astrologer: Astrologer;
  onPress?: () => void;
  compact?: boolean;
}

export function AstrologerCard({ astrologer: a, onPress, compact = false }: Props) {
  const handlePress = () => {
    if (onPress) {
      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (_) {}
      }
      onPress();
    }
  };

  /* ── Compact (horizontal scroll) ── */
  if (compact) {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.compact, pressed && styles.compactPressed]}
      >
        <Avatar uri={a.avatar} name={a.name} size={50} online={a.online} showStatus />
        <Text style={styles.compactName} numberOfLines={1}>
          {a.name.split(' ').slice(-1)[0]}
        </Text>
        <View style={styles.compactRating}>
          <Text style={styles.compactRatingText}>⭐ {a.rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.compactPrice}>{formatCurrency(a.pricePerMin)}/min</Text>
      </Pressable>
    );
  }

  /* ── Full card ── */
  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        a.rating >= 4.8 && styles.cardVerifiedBorder,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Left: Avatar with Glowing Halo */}
      <View style={styles.avatarCol}>
        <View style={[styles.avatarRing, a.online && styles.avatarRingOnline]}>
          <Avatar uri={a.avatar} name={a.name} size={52} online={a.online} showStatus />
        </View>
      </View>

      {/* Right: Details */}
      <View style={styles.body}>
        {/* Name + rating */}
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{a.name}</Text>
          <View style={styles.ratingPill}>
            <Text style={styles.ratingText}>⭐ {a.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Verified Badge + Queue Time Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 2 }}>
          {a.rating >= 4.8 && (
            <View style={styles.verifiedTag}>
              <Text style={styles.verifiedTagText}>👑 VERIFIED</Text>
            </View>
          )}
          <View style={styles.queueTag}>
            <Text style={styles.queueTagText}>
              {a.online ? '⚡ Available Now' : '⏱️ ~3m wait'}
            </Text>
          </View>
        </View>

        {/* Specialties */}
        <Text style={styles.specialties} numberOfLines={1}>
          {a.specialties.slice(0, 3).join(' · ')}
        </Text>

        {/* Meta & Audio Intro Row */}
        <View style={styles.metaRow}>
          <Text style={styles.meta} numberOfLines={1}>
            🗣️ {a.languages.slice(0, 2).join(', ')} · 📜 {a.experienceYears} yrs
          </Text>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              // trigger haptic feedback
            }}
            style={styles.audioIntroPill}
          >
            <Text style={styles.audioIntroText}>▶ 0:10 Intro</Text>
          </Pressable>
        </View>

        {/* Footer: price + status */}
        <View style={styles.footer}>
          <View style={styles.priceBadge}>
            <Text style={styles.priceValue}>{formatCurrency(a.pricePerMin)}</Text>
            <Text style={styles.perMin}>/min</Text>
          </View>

          <View style={[styles.statusBadge, a.online ? styles.statusOnline : styles.statusOffline]}>
            <View style={[styles.statusDot, { backgroundColor: a.online ? colors.online : colors.offline }]} />
            <Text style={[styles.statusText, { color: a.online ? colors.online : colors.offline }]}>
              {a.online ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /* ── Full card ── */
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.85)',
    borderRightWidth: 1.2,
    borderRightColor: '#E2E8F0',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    marginBottom: spacing.sm + 2,
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ translateY: 2 }, { scale: 0.99 }],
    borderBottomWidth: 1.5,
    opacity: 0.92,
  },
  cardVerifiedBorder: {
    borderBottomColor: '#4338CA',
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
  },
  avatarCol: {},
  body: { flex: 1, gap: 2 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: { ...typography.h3, color: colors.text, flex: 1, fontSize: 15, fontWeight: '800' },

  avatarRing: {
    borderRadius: 30,
    padding: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  avatarRingOnline: {
    borderColor: '#059669',
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
  },

  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6,182,212,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.30)',
  },
  ratingText: { ...typography.tiny, color: colors.cyan, fontWeight: '800', fontSize: 10.5 },

  verifiedTag: {
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.30)',
  },
  verifiedTagText: { ...typography.tiny, color: colors.primary, fontWeight: '800', fontSize: 8.5 },

  queueTag: {
    backgroundColor: '#ECFDF5',
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  queueTagText: { ...typography.tiny, color: '#10B981', fontWeight: '800', fontSize: 8.5 },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  audioIntroPill: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  audioIntroText: { fontSize: 9.5, fontWeight: '800', color: colors.primary },

  specialties: {
    ...typography.small,
    color: colors.teal,
    fontWeight: '700',
    fontSize: 11.5,
  },
  meta: {
    ...typography.small,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  priceValue: { ...typography.h3, color: colors.gold, fontSize: 15.5, fontWeight: '900' },
  perMin: { ...typography.tiny, color: colors.textMuted, fontSize: 10.5, fontWeight: '600' },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  statusOnline: {
    backgroundColor: 'rgba(5,150,105,0.12)',
    borderColor: 'rgba(5,150,105,0.35)',
  },
  statusOffline: {
    backgroundColor: 'rgba(148,163,184,0.15)',
    borderColor: 'rgba(148,163,184,0.35)',
  },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { ...typography.tiny, fontWeight: '800', fontSize: 10 },

  /* ── Compact card ── */
  compact: {
    width: 104,
    alignItems: 'center',
    padding: spacing.sm + 2,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.85)',
    borderRightWidth: 1.2,
    borderRightColor: '#E2E8F0',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    marginRight: spacing.sm + 2,
    overflow: 'hidden',
    gap: 3,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  compactPressed: {
    transform: [{ translateY: 2 }, { scale: 0.98 }],
    borderBottomWidth: 1.5,
    opacity: 0.9,
  },
  compactName: {
    ...typography.small,
    color: colors.text,
    fontWeight: '800',
    marginTop: 2,
    fontSize: 11.5,
  },
  compactRating: {
    backgroundColor: 'rgba(6,182,212,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  compactRatingText: { ...typography.tiny, color: colors.cyan, fontWeight: '800', fontSize: 9.5 },
  compactPrice: { ...typography.tiny, color: colors.textMuted, fontSize: 9.5, fontWeight: '600' },
});
