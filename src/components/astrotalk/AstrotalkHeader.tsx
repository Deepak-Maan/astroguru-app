import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, typography } from '../../theme';
import { useWalletStore } from '../../store/walletStore';
import { useLanguageStore } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';

interface Props {
  onOpenRecharge?: () => void;
}

export function AstrotalkHeader({ onOpenRecharge }: Props) {
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance ?? 100);
  const { currentLanguage, setLanguage } = useLanguageStore();
  const authUser = useAuthStore((s) => s.user);

  const [notificationCount] = useState(3);

  const toggleLanguage = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    setLanguage(currentLanguage === 'en' ? 'hi' : 'en');
  };

  const handleWalletPress = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}
    if (onOpenRecharge) {
      onOpenRecharge();
    } else {
      router.push('/(tabs)/profile');
    }
  };

  return (
    <View style={styles.headerContainer}>
      {/* Left: Brand Logo & Title */}
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <LinearGradient
            colors={['#FFC107', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.logoIcon}>🌟</Text>
        </View>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={styles.brandTitle}>Astrotalk</Text>
            <View style={styles.verifiedDot}>
              <Text style={{ fontSize: 9, color: '#FFFFFF', fontWeight: '900' }}>✓</Text>
            </View>
          </View>
          <Text style={styles.brandSubtitle}>India's #1 Astrology App</Text>
        </View>
      </View>

      {/* Right Action Tools: Language, Wallet Pill & Bell */}
      <View style={styles.actionsRow}>
        {/* Language Switcher */}
        <Pressable
          onPress={toggleLanguage}
          style={({ pressed }) => [styles.langPill, pressed && { opacity: 0.75 }]}
        >
          <Text style={styles.langText}>{currentLanguage === 'en' ? 'EN' : 'HI'}</Text>
        </Pressable>

        {/* Astrotalk Golden Wallet Pill */}
        <Pressable
          onPress={handleWalletPress}
          style={({ pressed }) => [styles.walletPill, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
        >
          <View style={styles.walletIconCircle}>
            <Text style={{ fontSize: 11 }}>🪙</Text>
          </View>
          <Text style={styles.walletAmount}>₹{Number(balance || 0).toFixed(0)}</Text>
          <View style={styles.walletAddBtn}>
            <Text style={styles.walletAddText}>+</Text>
          </View>
        </Pressable>

        {/* Notification Bell */}
        <Pressable
          onPress={() => router.push('/notifications' as any)}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.75 }]}
        >
          <Text style={{ fontSize: 18 }}>🔔</Text>
          {notificationCount > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{notificationCount}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  logoIcon: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
    marginTop: -1,
  },
  verifiedDot: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  langText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderWidth: 1.2,
    borderColor: '#FFC107',
    borderRadius: radius.pill,
    paddingLeft: 4,
    paddingRight: 6,
    paddingVertical: 3,
    gap: 5,
  },
  walletIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFE082',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletAmount: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  walletAddBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletAddText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: -1,
  },
  iconBtn: {
    position: 'relative',
    padding: 6,
  },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
