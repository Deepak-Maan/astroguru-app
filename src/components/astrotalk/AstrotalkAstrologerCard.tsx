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
import { radius } from '../../theme';
import { Astrologer } from '../../types';

interface Props {
  astrologer: Astrologer;
  compact?: boolean;
}

export function AstrotalkAstrologerCard({ astrologer, compact = false }: Props) {
  const router = useRouter();

  if (!astrologer) return null;

  const chatPrice = astrologer.pricing?.chatPerMin ?? (astrologer as any).pricePerMin ?? 25;
  const callPrice = astrologer.pricing?.callPerMin ?? ((astrologer as any).pricePerMin ? (astrologer as any).pricePerMin + 5 : 30);
  const expYears = astrologer.experience ?? (astrologer as any).experienceYears ?? 10;
  const totalOrders = astrologer.consultationsCount ?? (astrologer as any).consultations ?? (astrologer as any).reviews ?? 1400;
  const ratingValue = Number(astrologer.rating || 4.9).toFixed(1);
  const originalPrice = Math.round(chatPrice * 1.75);

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
            {(astrologer.specialties || ['Vedic Astrology']).join(', ')}
          </Text>

          {/* Languages */}
          <Text style={styles.languagesText} numberOfLines={1}>
            🗣️ {(astrologer.languages || ['Hindi', 'English']).slice(0, 3).join(', ')}
          </Text>

          {/* Experience & Orders */}
          <View style={styles.statsRow}>
            <Text style={styles.expText}>📜 {expYears} yrs exp</Text>
            <Text style={styles.statDot}>•</Text>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingText}>{ratingValue}</Text>
              <Text style={styles.ordersText}>({totalOrders > 999 ? `${(totalOrders / 1000).toFixed(1)}k` : totalOrders})</Text>
            </View>
          </View>

          {/* Pricing Row with FREE 1st Deal */}
          <View style={styles.priceRow}>
            <Text style={styles.priceCurrent}>₹{chatPrice}/min</Text>
            <Text style={styles.priceOriginal}>₹{originalPrice}/min</Text>
            <View style={styles.freeDealBadge}>
              <Text style={styles.freeDealText}>🎁 FREE 1st Min</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Action Buttons: Chat & Call or Notify Me */}
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
          <Text style={styles.chatBtnText}>💬 Chat (FREE)</Text>
        </Pressable>

        {astrologer.online ? (
          <Pressable
            onPress={handleCall}
            style={({ pressed }) => [styles.callBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.callBtnText}>📞 Call (₹{callPrice}/m)</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {
              try {
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              } catch (_) {}
              alert(`🔔 Notification Alert Set!\nWe will notify you immediately when ${astrologer.name} is online.`);
            }}
            style={({ pressed }) => [styles.notifyBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.notifyBtnText}>🔔 Notify When Free</Text>
          </Pressable>
        )}
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
  freeDealBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  freeDealText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#059669',
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
    fontSize: 12.5,
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
    borderColor: '#059669',
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#059669',
  },
  notifyBtn: {
    flex: 1,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1.2,
    borderColor: '#F59E0B',
  },
  notifyBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#D97706',
  },
});
