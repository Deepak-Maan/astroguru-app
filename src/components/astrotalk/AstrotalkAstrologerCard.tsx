import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../../theme';
import { Astrologer } from '../../types';

interface Props {
  astrologer: Astrologer;
  compact?: boolean;
}

export function AstrotalkAstrologerCard({ astrologer, compact = false }: Props) {
  const router = useRouter();

  const handleChat = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}
    router.push(`/chat/${astrologer.id}` as any);
  };

  const handleCall = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}
    router.push(`/call/${astrologer.id}` as any);
  };

  const handleProfile = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    router.push(`/astrologer/${astrologer.id}` as any);
  };

  const originalPrice = (astrologer.pricing.chatPerMin * 1.8).toFixed(0);

  return (
    <Pressable
      onPress={handleProfile}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={styles.topRow}>
        {/* Left Column: Avatar & Online Badge */}
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: astrologer.avatar }} style={styles.avatar} />
          {astrologer.online ? (
            <View style={styles.onlineBadge}>
              <View style={styles.greenPulseDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          ) : (
            <View style={styles.busyBadge}>
              <Text style={styles.busyText}>Busy</Text>
            </View>
          )}
        </View>

        {/* Middle Column: Details & Credentials */}
        <View style={styles.infoColumn}>
          {/* Name & Verified Badge */}
          <View style={styles.nameRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {astrologer.name}
            </Text>
            <View style={styles.verifiedCheck}>
              <Text style={{ fontSize: 9, color: '#FFFFFF', fontWeight: '900' }}>✓</Text>
            </View>
          </View>

          {/* Specialties */}
          <Text style={styles.specialtiesText} numberOfLines={1}>
            {astrologer.specialties.join(', ')}
          </Text>

          {/* Languages */}
          <Text style={styles.languagesText} numberOfLines={1}>
            🗣️ {astrologer.languages.slice(0, 3).join(', ')}
          </Text>

          {/* Experience & Orders */}
          <View style={styles.statsRow}>
            <Text style={styles.expText}>📜 {astrologer.experience} yrs exp</Text>
            <Text style={styles.statDot}>•</Text>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingText}>{astrologer.rating.toFixed(1)}</Text>
              <Text style={styles.ordersText}>({(astrologer.consultationsCount || 1200) / 1000}k)</Text>
            </View>
          </View>

          {/* Pricing Row */}
          <View style={styles.priceRow}>
            <Text style={styles.priceCurrent}>₹{astrologer.pricing.chatPerMin}/min</Text>
            <Text style={styles.priceOriginal}>₹{originalPrice}/min</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>45% OFF</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Action Buttons: Chat & Call */}
      <View style={styles.actionsFooter}>
        <Pressable
          onPress={handleChat}
          style={({ pressed }) => [styles.chatBtn, pressed && { opacity: 0.85 }]}
        >
          <LinearGradient
            colors={['#FFC107', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.chatBtnText}>💬 Chat</Text>
        </Pressable>

        <Pressable
          onPress={handleCall}
          style={({ pressed }) => [styles.callBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.callBtnText}>📞 Call</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardCompact: {
    width: 280,
    marginHorizontal: 6,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarWrapper: {
    alignItems: 'center',
    width: 76,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginTop: -10,
    gap: 4,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  busyBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginTop: -10,
  },
  busyText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  verifiedCheck: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialtiesText: {
    fontSize: 11.5,
    color: '#4B5563',
    fontWeight: '600',
  },
  languagesText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  expText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '700',
  },
  statDot: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingStar: {
    fontSize: 10,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  ordersText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  priceCurrent: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
  },
  priceOriginal: {
    fontSize: 11.5,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  discountBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#DC2626',
  },
  actionsFooter: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  chatBtn: {
    flex: 1,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  chatBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  callBtn: {
    flex: 1,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  callBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#059669',
  },
});
