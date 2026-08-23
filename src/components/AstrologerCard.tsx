import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const barAnims = useRef(Array.from({ length: 5 }, () => new Animated.Value(4))).current;

  const triggerAudioPreview = (e: any) => {
    e.stopPropagation();
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}

    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      barAnims.forEach((anim) => anim.setValue(4));
    } else {
      setIsPlayingAudio(true);
      const loops = barAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 12 + (i % 3) * 4, duration: 180 + i * 50, useNativeDriver: false }),
            Animated.timing(anim, { toValue: 3 + (i % 2) * 3, duration: 180 + i * 50, useNativeDriver: false }),
          ])
        )
      );
      loops.forEach((l) => l.start());

      setTimeout(() => {
        setIsPlayingAudio(false);
        loops.forEach((l) => l.stop());
        barAnims.forEach((anim) => anim.setValue(4));
      }, 5000);
    }
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
  const isTopMaster = a.rating >= 4.9;

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
            {isTopMaster && (
              <View style={styles.topMasterTag}>
                <Text style={styles.topMasterTagText}>🏆 TOP 1% MASTER</Text>
              </View>
            )}
            <View style={styles.verifiedTag}>
              <Text style={styles.verifiedTagText}>👑 VERIFIED</Text>
            </View>
            <View style={[styles.queueTag, !a.online && styles.queueTagBusy]}>
              <Text style={[styles.queueTagText, !a.online && styles.queueTagTextBusy]}>
                {a.online ? '⚡ 0m Wait' : '⏱️ ~2m wait'}
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
          🗣️ {a.languages.slice(0, 2).join(', ')} · 🔮 {(a.consultations || 4200).toLocaleString()}+
        </Text>

        {/* Animated Waveform Voice Bio Button */}
        <Pressable onPress={triggerAudioPreview} style={[styles.audioIntroPill, isPlayingAudio && styles.audioIntroPillActive]}>
          <Text style={[styles.audioIntroText, isPlayingAudio && { color: '#059669' }]}>
            {isPlayingAudio ? '⏸ Playing' : '▶ 0:10 Intro'}
          </Text>
          <View style={styles.waveformBars}>
            {barAnims.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveformBar,
                  { height: anim, backgroundColor: isPlayingAudio ? '#059669' : '#94A3B8' },
                ]}
              />
            ))}
          </View>
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
    width: 108,
    backgroundColor: 'rgba(18, 20, 42, 0.85)',
    borderRadius: 18,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 3,
    gap: 4,
    backdropFilter: 'blur(12px)' as any,
  },
  compactAvatarWrap: {
    marginBottom: 2,
  },
  compactName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  compactSpecialtyPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
  },
  compactSpecialtyText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  compactRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  compactRatingStar: {
    fontSize: 10,
    color: '#F5D77F',
  },
  compactRatingText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  compactPriceBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginTop: 2,
  },
  compactPriceText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#F5D77F',
  },

  /* ── Full Astrologer Card ── */
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.22)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    gap: 10,
    backdropFilter: 'blur(16px)' as any,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    flex: 1,
    letterSpacing: 0.2,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: radius.pill,
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
    fontSize: 10,
    color: '#92400E',
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 5,
  },
  topMasterTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  topMasterTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.3,
  },
  verifiedTag: {
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.3,
  },
  queueTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  queueTagBusy: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  queueTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
  },
  queueTagTextBusy: {
    color: '#D97706',
  },
  experienceTag: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  experienceTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
  },
  specialtiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specChip: {
    backgroundColor: 'rgba(241, 245, 249, 0.85)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
  },
  specChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    flex: 1,
  },
  audioIntroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(241, 245, 249, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: radius.pill,
  },
  audioIntroPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  audioIntroText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 12,
  },
  waveformBar: {
    width: 2,
    borderRadius: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
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
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  priceOriginal: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  perMin: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  offerBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  offerBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.3,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  consultBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.pill,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  consultBtnText: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '900',
  },
});
