import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import gsap from 'gsap';
import { colors } from '../theme';
import { seededRandom } from '../utils';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle;
  /** Show the decorative starfield (default true). */
  stars?: boolean;
}

/** Fixed star/constellation dots for light theme. */
function useStars(count = 35) {
  return useMemo(() => {
    const rnd = seededRandom(20260729);
    return Array.from({ length: count }, (_, i) => ({
      id: `star-${i}`,
      top: `${rnd() * 100}%`,
      left: `${rnd() * 100}%`,
      size: rnd() < 0.3 ? 3.5 : 2,
      opacity: 0.18 + rnd() * 0.35,
    }));
  }, [count]);
}

/** Nordic Frost Neumorphic Light Background: GSAP 60FPS Web Animations + Native Fallback. */
export function GradientBackground({ children, style, stars = true }: Props) {
  const starList = useStars();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const twinkleAnim = useRef(new Animated.Value(0)).current;

  // Refs for GSAP Web Targets
  const glowTopRef = useRef<any>(null);
  const glowBottomRef = useRef<any>(null);
  const mandalaRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const topEl = glowTopRef.current;
      const bottomEl = glowBottomRef.current;
      const mandalaEl = mandalaRef.current;

      const ctx = gsap.context(() => {
        if (topEl) {
          gsap.to(topEl, {
            scale: 1.25,
            opacity: 0.1,
            duration: 6,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }

        if (bottomEl) {
          gsap.to(bottomEl, {
            scale: 1.2,
            opacity: 0.08,
            duration: 8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }

        if (mandalaEl) {
          gsap.to(mandalaEl, {
            rotation: 360,
            duration: 35,
            repeat: -1,
            ease: 'none',
          });
        }
      });

      return () => ctx.revert();
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(twinkleAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 35000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, [pulseAnim, rotateAnim, twinkleAnim]);

  const glowScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] });
  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const starOpacityMult = twinkleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] });

  return (
    <View style={[styles.root, style]}>
      {/* Base Nordic Frost Ice Blue Slate Gradient */}
      <LinearGradient
        colors={['#F4F9FF', '#EFF6FF', '#E2E8F0']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Glow Orb Top-Right (Sacred Emerald Teal) */}
      <Animated.View
        ref={glowTopRef}
        pointerEvents="none"
        style={[
          styles.glowTop,
          Platform.OS !== 'web' && { transform: [{ scale: glowScale }] },
        ]}
      />

      {/* Glow Orb Bottom-Left (Solar Amber Gold) */}
      <Animated.View
        ref={glowBottomRef}
        pointerEvents="none"
        style={[
          styles.glowBottom,
          Platform.OS !== 'web' && { transform: [{ scale: glowScale }] },
        ]}
      />

      {/* 360° Rotating Sacred Geometry Ring */}
      <Animated.View
        ref={mandalaRef}
        pointerEvents="none"
        style={[
          styles.mandalaRing,
          Platform.OS !== 'web' && { transform: [{ rotate: spin }] },
        ]}
      />

      {/* Constellation Stars for Light Mode */}
      {stars && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {starList.map((s, i) => (
            <Animated.View
              key={s.id}
              style={{
                position: 'absolute',
                top: s.top as unknown as number,
                left: s.left as unknown as number,
                width: s.size,
                height: s.size,
                borderRadius: s.size,
                backgroundColor: i % 2 === 0 ? colors.teal : colors.gold,
                opacity: Animated.multiply(s.opacity, starOpacityMult),
              }}
            />
          ))}
        </View>
      )}

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EFF6FF', overflow: 'hidden' },
  content: { flex: 1 },

  glowTop: {
    position: 'absolute',
    top: -140,
    right: -80,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#059669',
    opacity: 0.08,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -150,
    left: -90,
    width: 390,
    height: 390,
    borderRadius: 195,
    backgroundColor: '#F59E0B',
    opacity: 0.07,
  },

  mandalaRing: {
    position: 'absolute',
    top: '18%',
    left: '-12%',
    width: 520,
    height: 520,
    borderRadius: 260,
    borderWidth: 1.5,
    borderColor: 'rgba(5,150,105,0.14)',
    borderStyle: 'dashed',
    opacity: 0.6,
  },
});
