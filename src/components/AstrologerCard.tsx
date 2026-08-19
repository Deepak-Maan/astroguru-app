import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
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
  const triggerAudioPreview = (e: any) => {
    e.stopPropagation();
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
  };

  /* ── Compact (Horizontal Top Carousel) ── */
  if (compact) {
    const formattedTitle = a.name.startsWith('Dr.')
      ? `Dr. ${a.name.split(' ').slice(-1)[0]}`
      : a.name.startsWith('Acharya')
      ? `Acharya ${a.name.split(' ').slice(-1)[0]}`
      : a.name.startsWith('Pandit')
      ? `Pt. ${a.name.split(' ').slice(-1)[0]}`
      : a.name.split(' ').slice(-1)[0];

    const mainSpecialty = a.specialties[0] || 'Vedic';

    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.compact,
          pressed && { opacity: 0.82, transform: [{ scale: 0.96 }] },
        ]}
      >
        <View style={styles.compactAvatarWrap}>
          <Avatar uri={a.avatar} name={a.name} size={54} online={a.online} showStatus />
        </View>

        <Text style={styles.compactName} numberOfLines={1}>
          {formattedTitle}
        </Text>

        <View style={styles.compactSpecialtyPill}>
          <Text style={styles.compactSpecialtyText} numberOfLines={1}>
            {mainSpecialty}
          </Text>
        </View>

        <View style={styles.compactRatingRow}>
          <Text style={styles.compactRatingStar}>★</Text>
          <Text style={styles.compactRatingText}>{a.rating.toFixed(1)}</Text>
        </View>

        <View style={styles.compactPriceBadge}>
          <Text style={styles.compactPriceText}>{formatCurrency(a.pricePerMin)}/m</Text>
        </View>
      </Pressable>
    );
  }

  /* ── Full Premium Card ── */
  const originalPrice = Math.round(a.pricePerMin * 1.35);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.90, transform: [{ scale: 0.985 }] },
      ]}
    >
      {/* Top Row: Avatar + Name + Rating */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarWrap}>
          <Avatar uri={a.avatar} name={a.name} size={56} online={a.online} showStatus />
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {a.name}
            </Text>
            <View style={styles.ratingPill}>
              <Text style={styles.ratingStar}>★</Text>
              <Text style={styles.ratingText}>{a.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({a.reviews > 999 ? `${(a.reviews / 1000).toFixed(1)}k` : a.reviews})</Text>
            </View>
          </View>

          {/* Badges Row */}
          <View style={styles.badgeRow}>
            <View style={styles.verifiedTag}>
              <Text style={styles.verifiedTagText}>👑 VERIFIED</Text>
            </View>
            <View style={[styles.queueTag, !a.online && styles.queueTagBusy]}>
              <Text style={[styles.queueTagText, !a.online && styles.queueTagTextBusy]}>
                {a.online ? '⚡ Available Now' : '⏱️ ~2m wait'}
              </Text>
            </View>
            <View style={styles.experienceTag}>
              <Text style={styles.experienceTagText}>📜 {a.experienceYears}y exp</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Specialties Chips Row */}
      <View style={styles.specialtiesWrap}>
        {a.specialties.slice(0, 3).map((spec) => (
          <View key={spec} style={styles.specChip}>
            <Text style={styles.specChipText}>{spec}</Text>
          </View>
        ))}
      </View>

      {/* Languages & Consultations Meta */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText} numberOfLines={1}>
          🗣️ {a.languages.slice(0, 2).join(', ')} · 🔮 {(a.consultations || 4200).toLocaleString()}+ Consultations
        </Text>

        <Pressable onPress={triggerAudioPreview} style={styles.audioIntroPill}>
          <Text style={styles.audioIntroText}>▶ 0:10 Intro</Text>
        </Pressable>
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Footer: Price + Instant Consult Action Button */}
      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceCurrent}>{formatCurrency(a.pricePerMin)}</Text>
            <Text style={styles.priceOriginal}>{formatCurrency(originalPrice)}</Text>
            <Text style={styles.perMin}>/min</Text>
          </View>
          <View style={styles.offerBadge}>
            <Text style={styles.offerBadgeText}>⚡ SAVE 25%</Text>
          </View>
        </View>

        <View style={styles.actionButtonsRow}>
          <View style={styles.consultBtn}>
            <LinearGradient
              colors={a.online ? ['#059669', '#047857'] : ['#D97706', '#B45309']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.consultBtnText}>
              {a.online ? '💬 Consult Now' : '📞 Join Queue'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /* ── Compact Carousel Card ── */
  compact: {
    width: 112,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
    gap: 4,
  },
  compactAvatarWrap: {
    marginBottom: 2,
  },
  compactName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E1B4B',
    textAlign: 'center',
  },
  compactSpecialtyPill: {
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  compactSpecialtyText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  compactRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  compactRatingStar: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '900',
  },
  compactRatingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  compactPriceBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 2,
  },
  compactPriceText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#D97706',
  },

  /* ── Full Astrologer Card ── */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 4,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    borderRadius: 32,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
    flex: 1,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  ratingStar: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '900',
  },
  ratingText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#B45309',
  },
  reviewCount: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#92400E',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  verifiedTag: {
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#D97706',
    letterSpacing: 0.4,
  },
  queueTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
  },
  queueTagBusy: {
    backgroundColor: '#FFFBEB',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  queueTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  queueTagTextBusy: {
    color: '#D97706',
  },
  experienceTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  experienceTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },

  /* Specialties */
  specialtiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specChip: {
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  specChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },

  /* Meta */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    flex: 1,
  },
  audioIntroPill: {
    backgroundColor: '#FFFBEB',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  audioIntroText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },

  /* Divider */
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },

  /* Footer */
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    gap: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceCurrent: {
    fontSize: 18,
    fontWeight: '900',
    color: '#D97706',
  },
  priceOriginal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  perMin: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  offerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  offerBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 0.4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  consultBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  consultBtnText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
