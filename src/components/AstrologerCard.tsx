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
          colors={a.online ? ['rgba(16,185,129,0.12)', 'rgba(245,158,11,0.04)'] : ['#0E1726', '#060A12']}
          style={StyleSheet.absoluteFill}
        />
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
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        a.rating >= 4.8 && styles.cardVerifiedBorder,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      {/* Background Cyber-Vedic Metallic Dark Gradient */}
      <LinearGradient
        colors={['#0E1726', '#080E1A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Left: Avatar */}
      <View style={styles.avatarCol}>
        <Avatar uri={a.avatar} name={a.name} size={54} online={a.online} showStatus />
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
    padding: spacing.md,
    backgroundColor: '#0E1726',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    marginBottom: spacing.sm + 2,
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.60)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
  },
  cardVerifiedBorder: {
    borderColor: 'rgba(245,158,11,0.45)',
    shadowColor: 'rgba(245,158,11,0.25)',
  },
  avatarCol: {},
  body: { flex: 1, gap: 2 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: { ...typography.h3, color: colors.text, flex: 1, fontSize: 15, fontWeight: '800' },

  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.14)',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.40)',
  },
  ratingText: { ...typography.tiny, color: colors.saffron, fontWeight: '800', fontSize: 10.5 },

  verifiedTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,158,11,0.14)',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.40)',
    marginVertical: 1,
  },
  verifiedTagText: { ...typography.tiny, color: colors.saffron, fontWeight: '800', fontSize: 9 },

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
  priceValue: { ...typography.h3, color: colors.saffron, fontSize: 15.5, fontWeight: '900' },
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
    backgroundColor: 'rgba(16,185,129,0.14)',
    borderColor: 'rgba(16,185,129,0.40)',
  },
  statusOffline: {
    backgroundColor: 'rgba(100,116,139,0.14)',
    borderColor: 'rgba(100,116,139,0.3)',
  },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { ...typography.tiny, fontWeight: '800', fontSize: 10 },

  /* ── Compact card ── */
  compact: {
    width: 98,
    alignItems: 'center',
    padding: spacing.sm + 2,
    backgroundColor: '#0E1726',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    marginRight: spacing.sm + 2,
    overflow: 'hidden',
    gap: 3,
    shadowColor: 'rgba(0,0,0,0.50)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  compactName: {
    ...typography.small,
    color: colors.text,
    fontWeight: '800',
    marginTop: 2,
    fontSize: 11.5,
  },
  compactRating: {
    backgroundColor: 'rgba(245,158,11,0.14)',
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  compactRatingText: { ...typography.tiny, color: colors.saffron, fontWeight: '800', fontSize: 9.5 },
  compactPrice: { ...typography.tiny, color: colors.textMuted, fontSize: 9.5, fontWeight: '600' },
});
