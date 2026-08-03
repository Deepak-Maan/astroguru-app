import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  /* ── Compact (horizontal scroll) ── */
  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.compact, pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] }]}
      >
        <LinearGradient
          colors={a.online ? ['rgba(245,158,11,0.08)', 'rgba(109,40,217,0.03)'] : ['#FFFFFF', '#F8FAFC']}
          style={StyleSheet.absoluteFill}
        />
        <Avatar uri={a.avatar} name={a.name} size={62} online={a.online} showStatus />
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
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        a.rating >= 4.8 && styles.cardVerifiedBorder,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      {/* Background Gold-Leaf Metallic Gradient */}
      <LinearGradient
        colors={['rgba(255,255,255,1)', 'rgba(250,245,255,0.70)']}
        style={StyleSheet.absoluteFill}
      />

      {/* Left: Avatar */}
      <View style={styles.avatarCol}>
        <Avatar uri={a.avatar} name={a.name} size={68} online={a.online} showStatus />
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

        {/* Verified Badge */}
        {a.rating >= 4.8 && (
          <View style={styles.verifiedTag}>
            <Text style={styles.verifiedTagText}>👑 VERIFIED JYOTISHI</Text>
          </View>
        )}

        {/* Specialties */}
        <Text style={styles.specialties} numberOfLines={1}>
          {a.specialties.slice(0, 3).join(' · ')}
        </Text>

        {/* Meta */}
        <Text style={styles.meta} numberOfLines={1}>
          🗣️ {a.languages.slice(0, 2).join(', ')} · 📜 {a.experienceYears} yrs exp
        </Text>

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
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: 'rgba(148,163,184,0.35)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 4,
  },
  cardVerifiedBorder: {
    borderColor: 'rgba(217,119,6,0.35)',
    shadowColor: 'rgba(217,119,6,0.20)',
  },
  avatarCol: {},
  body: { flex: 1, gap: 3 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: { ...typography.h3, color: colors.text, flex: 1, fontSize: 16, fontWeight: '800' },

  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
  },
  ratingText: { ...typography.tiny, color: colors.saffron, fontWeight: '800', fontSize: 11 },

  verifiedTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
    marginVertical: 1,
  },
  verifiedTagText: { ...typography.tiny, color: colors.saffron, fontWeight: '800', fontSize: 9.5 },

  specialties: {
    ...typography.small,
    color: colors.auroraA,
    fontWeight: '700',
    fontSize: 12,
  },
  meta: {
    ...typography.small,
    color: colors.textMuted,
    fontSize: 11.5,
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  priceValue: { ...typography.h3, color: colors.saffron, fontSize: 17, fontWeight: '900' },
  perMin: { ...typography.tiny, color: colors.textMuted, fontSize: 11, fontWeight: '600' },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  statusOnline: {
    backgroundColor: 'rgba(16,185,129,0.10)',
    borderColor: 'rgba(16,185,129,0.35)',
  },
  statusOffline: {
    backgroundColor: 'rgba(148,163,184,0.10)',
    borderColor: 'rgba(148,163,184,0.3)',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { ...typography.tiny, fontWeight: '800', fontSize: 11 },

  /* ── Compact card ── */
  compact: {
    width: 108,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: spacing.md,
    overflow: 'hidden',
    gap: 4,
    shadowColor: 'rgba(148,163,184,0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
  },
  compactName: {
    ...typography.small,
    color: colors.text,
    fontWeight: '800',
    marginTop: 4,
    fontSize: 12,
  },
  compactRating: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  compactRatingText: { ...typography.tiny, color: colors.saffron, fontWeight: '800', fontSize: 10 },
  compactPrice: { ...typography.tiny, color: colors.textMuted, fontSize: 10, fontWeight: '600' },
});
