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
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
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
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </Pressable>

        {showWallet && (
          <Pressable
            onPress={() => router.push('/wallet')}
            accessibilityRole="button"
            accessibilityLabel="Open wallet"
            style={({ pressed }) => [styles.walletWrap, pressed && { opacity: 0.75 }]}
          >
            <LinearGradient
              colors={['rgba(217,119,6,0.12)', 'rgba(5,150,105,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.walletIcon}>💰</Text>
            <Text style={styles.walletText}>
              {maskWalletBalance ? '₹***' : formatCurrency(balance)}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Live Panchang Ticker Pill */}
      {showTicker && (
        <View style={styles.tickerPill}>
          <Text style={styles.tickerDot}>🟢</Text>
          <Text style={styles.tickerText} numberOfLines={1}>
            🌅 Sunrise 06:12 AM · <Text style={{ fontWeight: '800', color: colors.gold }}>Abhijit Muhurat 11:45 AM</Text> · Shubh Tithi
          </Text>
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
    gap: spacing.xs,
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
  title: { ...typography.h1, color: colors.text, fontSize: 19, fontWeight: '800' },
  subtitle: { ...typography.small, color: colors.textMuted, marginTop: 1, fontSize: 11.5, fontWeight: '600' },

  bellWrap: {
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
    position: 'relative',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
  },
  bellIcon: { fontSize: 16 },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  unreadBadgeText: { ...typography.tiny, color: colors.white, fontSize: 9.5, fontWeight: '900' },

  walletWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(217,119,6,0.30)',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  walletIcon: { fontSize: 13 },
  walletText: { ...typography.small, color: colors.gold, fontWeight: '800', fontSize: 12 },

  /* Ticker */
  tickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: spacing.md,
    marginTop: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(191, 219, 254, 0.6)',
    borderRightColor: 'rgba(191, 219, 254, 0.6)',
    backgroundColor: '#FFFFFF',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  tickerDot: { fontSize: 8 },
  tickerText: { ...typography.tiny, color: colors.textMuted, fontSize: 10.5, fontWeight: '600' },
});
