import React from 'react';
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
import { radius, spacing } from '../../theme';

export function AstrotalkFortuneWheelBanner() {
  const router = useRouter();

  const handlePress = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}
    router.push('/fortune-wheel');
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.95, transform: [{ scale: 0.985 }] },
      ]}
    >
      <LinearGradient
        colors={['#78350F', '#B45309', '#D97706']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Specular Edge */}
      <View style={styles.specularTopEdge} />

      {/* Left Icon Animated Dial */}
      <View style={styles.wheelDial}>
        <Text style={{ fontSize: 32 }}>🎡</Text>
      </View>

      {/* Middle Text Details */}
      <View style={styles.textWrap}>
        <View style={styles.badgeRow}>
          <View style={styles.dailyBadge}>
            <Text style={styles.dailyBadgeText}>🔥 DAILY FREE SPIN</Text>
          </View>
          <Text style={styles.jackpotText}>Win Up to ₹100</Text>
        </View>

        <Text style={styles.titleText}>Cosmic Fortune Wheel</Text>
        <Text style={styles.subText}>
          Spin daily to win real wallet cash, free calls & VIP passes!
        </Text>
      </View>

      {/* Right Action Button */}
      <View style={styles.spinCta}>
        <LinearGradient
          colors={['#FFC107', '#F59E0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.spinCtaText}>SPIN</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    position: 'relative',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  specularTopEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    zIndex: 2,
  },
  wheelDial: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dailyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
  },
  dailyBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  jackpotText: {
    color: '#FDE68A',
    fontSize: 9.5,
    fontWeight: '800',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subText: {
    fontSize: 10,
    color: '#FEF3C7',
    fontWeight: '600',
  },
  spinCta: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  spinCtaText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
});
