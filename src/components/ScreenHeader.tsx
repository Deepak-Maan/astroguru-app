import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radius, spacing, typography } from '../theme';
import { useWalletStore } from '../store/walletStore';
import { useSecurityStore } from '../store/securityStore';
import { useNotificationStore } from '../store/notificationStore';
import { formatCurrency } from '../utils';
import { LanguageSelector } from './LanguageSelector';

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showWallet?: boolean;
  hideLanguage?: boolean;
  showTicker?: boolean;
  right?: React.ReactNode;
}

function BackArrowIcon() {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1E1B4B"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  showWallet = false,
  hideLanguage = false,
  showTicker = false,
  right,
}: Props) {
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance);
  const maskWalletBalance = useSecurityStore((s) => s.maskWalletBalance);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const triggerHaptic = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
  };

  const handleBack = () => {
    triggerHaptic();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Back Button if present */}
        {showBack && (
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          >
            <BackArrowIcon />
          </Pressable>
        )}

        {/* Title & Subtitle Column */}
        <View style={styles.titleCol}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {!!subtitle && (
            <View style={styles.subtitleRow}>
              <View style={styles.subDot} />
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
          )}
        </View>

        {/* Right Actions Cluster */}
        <View style={styles.rightCluster}>
          {!hideLanguage && <LanguageSelector />}

          {right}

          {/* Luxury Notification Bell */}
          <Pressable
            onPress={() => {
              triggerHaptic();
              router.push('/notifications');
            }}
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
            style={({ pressed }) => [styles.bellWrap, pressed && { opacity: 0.8, transform: [{ scale: 0.94 }] }]}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Luxury Metallic Wallet Button */}
          {showWallet && (
            <Pressable
              onPress={() => {
                triggerHaptic();
                router.push('/wallet');
              }}
              accessibilityRole="button"
              accessibilityLabel="Open wallet"
              style={({ pressed }) => [styles.walletWrap, pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] }]}
            >
              <LinearGradient
                colors={['#FEF3C7', '#FDE68A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.walletIcon}>💰</Text>
              <Text style={styles.walletText}>
                {maskWalletBalance ? '₹***' : formatCurrency(balance || 100)}
              </Text>
              <View style={styles.walletPlus}>
                <Text style={styles.walletPlusText}>+</Text>
              </View>
            </Pressable>
          )}
        </View>
      </View>

      {/* Live Panchang Ticker Pill */}
      {showTicker && (
        <View style={styles.tickerPill}>
          <View style={styles.tickerPulseDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tickerText} numberOfLines={1}>
              🌅 Sunrise 06:12 AM · <Text style={{ fontWeight: '800', color: '#D97706' }}>Abhijit Muhurat 11:45 AM</Text>
            </Text>
          </View>
          <View style={styles.shubhBadge}>
            <Text style={styles.shubhText}>✨ Shubh Tithi</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    gap: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  backBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.92 }],
  },
  titleCol: {
    flex: 1,
    paddingRight: 4,
  },
  title: {
    fontSize: 22,
    color: '#1E1B4B',
    fontWeight: '900',
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  subDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  subtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* Right Cluster */
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  /* Notification Bell */
  bellWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    position: 'relative',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 2,
  },
  bellIcon: {
    fontSize: 16,
  },
  unreadBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },

  /* Wallet Button */
  walletWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    overflow: 'hidden',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  walletIcon: {
    fontSize: 13,
  },
  walletText: {
    fontSize: 12.5,
    color: '#92400E',
    fontWeight: '900',
  },
  walletPlus: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(180, 83, 9, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 1,
  },
  walletPlusText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B45309',
    lineHeight: 11,
  },

  /* Ticker */
  tickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginHorizontal: spacing.md,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  tickerPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  tickerText: {
    color: '#475569',
    fontSize: 10.5,
    fontWeight: '600',
  },
  shubhBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.25)',
  },
  shubhText: {
    color: '#059669',
    fontSize: 9.5,
    fontWeight: '800',
  },
});
