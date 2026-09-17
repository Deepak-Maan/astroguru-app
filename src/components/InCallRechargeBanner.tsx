import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, typography } from '../theme';

interface InCallRechargeBannerProps {
  secondsRemaining?: number;
  pricePerMin: number;
  onQuickRecharge: () => void;
  style?: any;
}

export function InCallRechargeBanner({
  secondsRemaining,
  pricePerMin,
  onQuickRecharge,
  style,
}: InCallRechargeBannerProps) {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    }
    onQuickRecharge();
  };

  const fiveMinCost = Math.max(99, Math.round(pricePerMin * 5));

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['rgba(30, 27, 75, 0.95)', 'rgba(49, 46, 129, 0.95)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.leftCol}>
          <View style={styles.timeTag}>
            <Text style={styles.pulseDot}>⏳</Text>
            <Text style={styles.timeTagText}>
              {secondsRemaining !== undefined && secondsRemaining > 0
                ? `${secondsRemaining}s remaining`
                : 'Session running low'}
            </Text>
          </View>
          <Text style={styles.subText}>Avoid disconnection · Keep talking</Text>
        </View>

        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.rechargeBtn,
            pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
          ]}
        >
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.rechargeBtnText}>+5 Mins (₹{fiveMinCost})</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  leftCol: {
    flex: 1,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pulseDot: {
    fontSize: 13,
  },
  timeTagText: {
    ...typography.small,
    color: '#FDE68A',
    fontWeight: '800',
    fontSize: 13,
  },
  subText: {
    ...typography.tiny,
    color: '#CBD5E1',
    fontWeight: '500',
    fontSize: 11,
    marginTop: 2,
  },
  rechargeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  rechargeBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12.5,
    letterSpacing: 0.3,
  },
});
