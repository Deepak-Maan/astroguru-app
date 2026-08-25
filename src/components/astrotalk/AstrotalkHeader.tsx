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
import { useWalletStore } from '../../store/walletStore';
import { useNotificationStore } from '../../store/notificationStore';

interface Props {
  onOpenRecharge?: () => void;
}

export function AstrotalkHeader({ onOpenRecharge }: Props) {
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance ?? 100);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const handleWalletPress = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    if (onOpenRecharge) {
      onOpenRecharge();
    } else {
      router.push('/wallet');
    }
  };

  const handleNotificationPress = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    router.push('/notifications');
  };

  return (
    <View style={styles.headerContainer}>
      {/* Top Specular Glass Reflection Edge */}
      <View style={styles.specularTopEdge} />

      {/* Brand Identity: AstroGuru */}
      <Pressable
        onPress={() => router.push('/(tabs)')}
        style={({ pressed }) => [styles.logoSection, pressed && { opacity: 0.85 }]}
      >
        <View style={styles.logoBadge}>
          <LinearGradient
            colors={['#D4AF37', '#F5D77F', '#C59B27']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.logoIcon}>🌟</Text>
        </View>

        <View>
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandTitle}>AstroGuru</Text>
            <View style={styles.verifiedDot}>
              <Text style={styles.verifiedCheck}>✓</Text>
            </View>
          </View>
          <Text style={styles.brandSubtitle}>Vedic Astrology & Horoscope</Text>
        </View>
      </Pressable>

      {/* Right Action Tools Cluster */}
      <View style={styles.rightActions}>
        {/* Language Selector Pill */}
        <View style={styles.langPill}>
          <Text style={styles.langText}>EN</Text>
          <Text style={styles.langDivider}>|</Text>
          <Text style={styles.langTextInactive}>HI</Text>
        </View>

        {/* Imperial Gold Wallet Pill */}
        <Pressable
          onPress={handleWalletPress}
          style={({ pressed }) => [
            styles.walletPill,
            pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] },
          ]}
        >
          <LinearGradient
            colors={['#FFFBEB', '#FEF3C7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.walletIcon}>💰</Text>
          <Text style={styles.walletAmount}>₹{Number(balance || 0).toFixed(0)}</Text>
          <View style={styles.plusBtn}>
            <LinearGradient
              colors={['#D4AF37', '#F59E0B']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.plusText}>+</Text>
          </View>
        </Pressable>

        {/* Glassmorphic Notification Bell */}
        <Pressable
          onPress={handleNotificationPress}
          style={({ pressed }) => [
            styles.bellBtn,
            pressed && { opacity: 0.75, transform: [{ scale: 0.94 }] },
          ]}
        >
          <Text style={styles.bellIcon}>🔔</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadDot}>
              <Text style={styles.unreadText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.22)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
  },
  specularTopEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  logoIcon: {
    fontSize: 20,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  verifiedDot: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCheck: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    lineHeight: 10,
  },
  brandSubtitle: {
    fontSize: 9.5,
    color: '#D97706',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.pill,
    gap: 4,
  },
  langText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#D97706',
  },
  langDivider: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  langTextInactive: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1.2,
    borderColor: '#FDE68A',
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: radius.pill,
    gap: 5,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  walletIcon: {
    fontSize: 13,
  },
  walletAmount: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  plusBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  plusText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1A1A1A',
    lineHeight: 15,
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 15,
  },
  unreadDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  unreadText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
