import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { seededRandom } from '../utils';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle;
  interactive?: boolean;
  scrollProgress?: number;
  enableFloatingGlass?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Fixed seed starfield for soft background twinkling */
function useCelestialStars(count = 40) {
  return useMemo(() => {
    const rnd = seededRandom(20260824);
    return Array.from({ length: count }, (_, i) => ({
      id: `bg-star-${i}`,
      top: `${rnd() * 100}%`,
      left: `${rnd() * 100}%`,
      size: rnd() < 0.3 ? 2.5 : rnd() < 0.6 ? 1.8 : 1.2,
      opacity: 0.15 + rnd() * 0.35,
      color: rnd() < 0.4 ? '#D4AF37' : rnd() < 0.7 ? '#818CF8' : '#38BDF8',
    }));
  }, [count]);
}

/**
 * 🌌 ScrollDrivenCelestialBackground
 * ----------------------------------------------------
 * Ultra-Clean Luxury Ethereal Ambient Celestial Background
 * - Soft flowing nebular light caustics (Dawn Gold, Mystic Lavender, Celestial Sky)
 * - Subtle, delicate stardust twinkling nodes deep in the background
 * - Faint watermark-style dashed astrological orbits
 * - 100% crystal-clear foreground text & UI readability
 */
export function ScrollDrivenCelestialBackground({
  children,
  style,
}: Props) {
  const stars = useCelestialStars();

  // Smooth Ambient Drift & Twinkle Animations
  const driftAnim1 = useRef(new Animated.Value(0)).current;
  const driftAnim2 = useRef(new Animated.Value(0)).current;
  const rotateOrbit1 = useRef(new Animated.Value(0)).current;
  const rotateOrbit2 = useRef(new Animated.Value(1)).current;
  const starTwinkle = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // 1. Soft Nebular Drift Loop 1 (10s)
    const drift1 = Animated.loop(
      Animated.sequence([
        Animated.timing(driftAnim1, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(driftAnim1, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Soft Nebular Drift Loop 2 (12s)
    const drift2 = Animated.loop(
      Animated.sequence([
        Animated.timing(driftAnim2, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(driftAnim2, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Faint Astrological Ring 1 Rotation (60s)
    const orbit1 = Animated.loop(
      Animated.timing(rotateOrbit1, {
        toValue: 1,
        duration: 60000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 4. Faint Astrological Ring 2 Rotation (50s)
    const orbit2 = Animated.loop(
      Animated.timing(rotateOrbit2, {
        toValue: 0,
        duration: 50000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 5. Starlight Twinkling Loop (3s)
    const twinkle = Animated.loop(
      Animated.sequence([
        Animated.timing(starTwinkle, {
          toValue: 0.85,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(starTwinkle, {
          toValue: 0.35,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    drift1.start();
    drift2.start();
    orbit1.start();
    orbit2.start();
    twinkle.start();

    return () => {
      drift1.stop();
      drift2.stop();
      orbit1.stop();
      orbit2.stop();
      twinkle.stop();
    };
  }, []);

  const spin1 = rotateOrbit1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spin2 = rotateOrbit2.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shiftY1 = driftAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const shiftX1 = driftAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const shiftY2 = driftAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 25],
  });

  const shiftX2 = driftAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  return (
    <View style={[styles.container, style]}>
      {/* ── 1. Base Ethereal Silk Canvas Gradient ── */}
      <LinearGradient
        colors={['#FDFBF7', '#F8FAFC', '#F1F5F9', '#EFF6FF']}
        locations={[0, 0.35, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── 2. Atmospheric Luminous Ambient Light Clouds ── */}
      <Animated.View
        style={[
          styles.ambientOrb,
          styles.orbGold,
          {
            transform: [{ translateX: shiftX1 }, { translateY: shiftY1 }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.ambientOrb,
          styles.orbLavender,
          {
            transform: [{ translateX: shiftX2 }, { translateY: shiftY2 }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.ambientOrb,
          styles.orbCyan,
          {
            transform: [{ translateY: shiftY1 }],
          },
        ]}
      />

      {/* ── 3. Subtle Faint Astrological Watermark Orbit Rings (Zero-Clutter) ── */}
      <Animated.View
        style={[
          styles.watermarkOrbit1,
          {
            transform: [{ rotate: spin1 }],
          },
        ]}
        pointerEvents="none"
      />

      <Animated.View
        style={[
          styles.watermarkOrbit2,
          {
            transform: [{ rotate: spin2 }],
          },
        ]}
        pointerEvents="none"
      />

      {/* ── 4. Delicate Deep Stardust Particles ── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: starTwinkle }]}
        pointerEvents="none"
      >
        {stars.map((s) => (
          <View
            key={s.id}
            style={[
              styles.starPoint,
              {
                top: s.top as any,
                left: s.left as any,
                width: s.size,
                height: s.size,
                borderRadius: s.size / 2,
                backgroundColor: s.color,
                opacity: s.opacity,
                shadowColor: s.color,
                shadowOpacity: 0.6,
                shadowRadius: s.size * 2,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* ── 5. Foreground Content Layer ── */}
      <View style={styles.contentLayer}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  contentLayer: {
    flex: 1,
    zIndex: 1,
  },

  /* Atmospheric Light Clouds */
  ambientOrb: {
    position: 'absolute',
    borderRadius: 9999,
    filter: Platform.OS === 'web' ? 'blur(90px)' : undefined,
  },
  orbGold: {
    width: Math.min(SCREEN_WIDTH * 0.9, 440),
    height: Math.min(SCREEN_WIDTH * 0.9, 440),
    top: -80,
    left: -60,
    backgroundColor: 'rgba(253, 230, 138, 0.25)',
  },
  orbLavender: {
    width: Math.min(SCREEN_WIDTH * 0.95, 460),
    height: Math.min(SCREEN_WIDTH * 0.95, 460),
    bottom: -90,
    right: -70,
    backgroundColor: 'rgba(233, 213, 255, 0.22)',
  },
  orbCyan: {
    width: Math.min(SCREEN_WIDTH * 0.8, 380),
    height: Math.min(SCREEN_WIDTH * 0.8, 380),
    top: '38%',
    left: '20%',
    backgroundColor: 'rgba(186, 230, 253, 0.18)',
  },

  /* Watermark Astrological Orbit Rings */
  watermarkOrbit1: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 260,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.08)',
    borderStyle: 'dashed',
    top: '35%',
    left: '50%',
    marginTop: -260,
    marginLeft: -260,
  },
  watermarkOrbit2: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    borderWidth: 0.9,
    borderColor: 'rgba(139, 92, 246, 0.07)',
    borderStyle: 'dashed',
    top: '35%',
    left: '50%',
    marginTop: -190,
    marginLeft: -190,
    transform: [{ rotate: '30deg' }],
  },

  /* Star Points */
  starPoint: {
    position: 'absolute',
  },
});
