import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {showBack && (
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          >
            <BackArrowIcon />
          </Pressable>
        )}

        <View style={styles.titleCol}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {!!subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {!hideLanguage && <LanguageSelector />}

        {right}

        {/* Notification Bell Icon */}
        <Pressable
          onPress={() => router.push('/notifications')}
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
          style={({ pressed }) => [styles.bellWrap, pressed && { opacity: 0.75 }]}
        >
          <Text style={styles.bellIcon}>🔔</Text>
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : '2'}</Text>
          </View>
        </Pressable>

        {showWallet && (
          <Pressable
            onPress={() => router.push('/wallet')}
            accessibilityRole="button"
            accessibilityLabel="Open wallet"
            style={({ pressed }) => [styles.walletWrap, pressed && { opacity: 0.75 }]}
          >
            <Text style={styles.walletIcon}>💰</Text>
            <Text style={styles.walletText}>
              {maskWalletBalance ? '₹***' : formatCurrency(balance || 100)}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Live Panchang Ticker Pill */}
      {showTicker && (
        <View style={styles.tickerPill}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tickerText} numberOfLines={1}>
              🌅 Sunrise 06:12 AM · <Text style={{ fontWeight: '800', color: colors.gold }}>Abhijit Muhurat 11:45 AM</Text>
            </Text>
          </View>

          {/* Shubh Tithi Badge from design screenshot */}
          <View style={styles.shubhBadge}>
            <Text style={styles.shubhText}>Shubh Tithi</Text>
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
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(191, 219, 254, 0.6)',
    borderRightColor: 'rgba(191, 219, 254, 0.6)',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
    marginRight: 4,
  },
  backBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.92 }],
  },
  titleCol: { flex: 1, paddingRight: spacing.xs },
  title: {
    fontSize: 24,
    color: '#1E1B4B',
    fontWeight: '800',
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  subtitle: {
    ...typography.small,
    color: '#64748B',
    marginTop: 2,
    fontSize: 12.5,
    fontWeight: '600',
  },

  bellWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    position: 'relative',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  bellIcon: { fontSize: 16 },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
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
  unreadBadgeText: { ...typography.tiny, color: colors.white, fontSize: 9.5, fontWeight: '900' },

  walletWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  walletIcon: { fontSize: 13 },
  walletText: { ...typography.small, color: '#92400E', fontWeight: '800', fontSize: 13 },

  /* Ticker */
  tickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginHorizontal: spacing.md,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  tickerText: { ...typography.tiny, color: '#64748B', fontSize: 11, fontWeight: '600' },
  shubhBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  shubhText: { ...typography.tiny, color: '#059669', fontSize: 10.5, fontWeight: '800' },
});t: '600' },
});
