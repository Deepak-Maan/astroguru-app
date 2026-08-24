import React, { useEffect, useMemo, useRef } from 'react';
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
import { seededRandom } from '../../utils';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function useAuthStars(count = 45) {
  return useMemo(() => {
    const rnd = seededRandom(108108);
    return Array.from({ length: count }, (_, i) => ({
      id: `auth-star-${i}`,
      top: `${rnd() * 100}%`,
      left: `${rnd() * 100}%`,
      size: rnd() < 0.2 ? 3.5 : rnd() < 0.5 ? 2.4 : 1.5,
      opacity: 0.25 + rnd() * 0.5,
      color: rnd() < 0.4 ? '#D4AF37' : rnd() < 0.7 ? '#818CF8' : '#F59E0B',
      twinkleDelay: rnd() * 2000,
    }));
  }, [count]);
}

export function AuthCosmicBackground({ children, style }: Props) {
  const stars = useAuthStars();

  // Native Animation Loops
  const rotateRing1 = useRef(new Animated.Value(0)).current;
  const rotateRing2 = useRef(new Animated.Value(1)).current;
  const floatOrb1 = useRef(new Animated.Value(0)).current;
  const floatOrb2 = useRef(new Animated.Value(0)).current;
  const pulseTwinkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Clockwise Ring 1 (45s slow majestic cosmic rotation)
    const ring1Loop = Animated.loop(
      Animated.timing(rotateRing1, {
        toValue: 1,
        duration: 45000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 2. Counter-Clockwise Ring 2 (38s)
    const ring2Loop = Animated.loop(
      Animated.timing(rotateRing2, {
        toValue: 0,
        duration: 38000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 3. Floating Orb 1 Drift
    const orb1Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatOrb1, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatOrb1, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 4. Floating Orb 2 Drift
    const orb2Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatOrb2, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatOrb2, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 5. Starfield Twinkle Breathing
    const twinkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseTwinkle, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseTwinkle, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    ring1Loop.start();
    ring2Loop.start();
    orb1Loop.start();
    orb2Loop.start();
    twinkleLoop.start();

    return () => {
      ring1Loop.stop();
      ring2Loop.stop();
      orb1Loop.stop();
      orb2Loop.stop();
      twinkleLoop.stop();
    };
  }, []);

  const spin1Deg = rotateRing1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spin2Deg = rotateRing2.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const orb1TranslateY = floatOrb1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -35],
  });

  const orb1TranslateX = floatOrb1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 25],
  });

  const orb2TranslateY = floatOrb2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });

  const orb2TranslateX = floatOrb2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const starOpacity = pulseTwinkle.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.95],
  });

  return (
    <View style={[styles.container, style]}>
      {/* Base Cosmic Canvas Gradient */}
      <LinearGradient
        colors={['#FDFBF7', '#F8FAFC', '#F1F5F9', '#EFF6FF']}
        locations={[0, 0.35, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Atmospheric Ambient Glowing Orbs */}
      <Animated.View
        style={[
          styles.ambientOrb,
          styles.orbGold,
          {
            transform: [{ translateX: orb1TranslateX }, { translateY: orb1TranslateY }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.ambientOrb,
          styles.orbLavender,
          {
            transform: [{ translateX: orb2TranslateX }, { translateY: orb2TranslateY }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.ambientOrb,
          styles.orbCyan,
          {
            transform: [{ translateY: orb1TranslateY }],
          },
        ]}
      />

      {/* Rotating Sacred Dashed Astrological Rings */}
      <Animated.View
        style={[
          styles.mandalaRingOuter,
          {
            transform: [{ rotate: spin1Deg }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.mandalaRingInner,
          {
            transform: [{ rotate: spin2Deg }],
          },
        ]}
      />

      {/* Twinkling Stardust Nodes */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: starOpacity }]} pointerEvents="none">
        {stars.map((star) => (
          <View
            key={star.id}
            style={[
              styles.starDot,
              {
                top: star.top as any,
                left: star.left as any,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                backgroundColor: star.color,
                shadowColor: star.color,
                shadowOpacity: 0.8,
                shadowRadius: star.size * 2,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Children Layer */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  ambientOrb: {
    position: 'absolute',
    borderRadius: 9999,
    filter: Platform.OS === 'web' ? 'blur(70px)' : undefined,
  },
  orbGold: {
    width: Math.min(SCREEN_WIDTH * 0.85, 420),
    height: Math.min(SCREEN_WIDTH * 0.85, 420),
    top: -60,
    left: -40,
    backgroundColor: 'rgba(253, 230, 138, 0.40)',
  },
  orbLavender: {
    width: Math.min(SCREEN_WIDTH * 0.9, 450),
    height: Math.min(SCREEN_WIDTH * 0.9, 450),
    bottom: -80,
    right: -50,
    backgroundColor: 'rgba(233, 213, 255, 0.38)',
  },
  orbCyan: {
    width: Math.min(SCREEN_WIDTH * 0.75, 360),
    height: Math.min(SCREEN_WIDTH * 0.75, 360),
    top: '35%',
    left: '20%',
    backgroundColor: 'rgba(186, 230, 253, 0.30)',
  },
  mandalaRingOuter: {
    position: 'absolute',
    width: 620,
    height: 620,
    borderRadius: 310,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.18)',
    borderStyle: 'dashed',
    top: '50%',
    left: '50%',
    marginTop: -310,
    marginLeft: -310,
    pointerEvents: 'none' as any,
  },
  mandalaRingInner: {
    position: 'absolute',
    width: 440,
    height: 440,
    borderRadius: 220,
    borderWidth: 1.2,
    borderColor: 'rgba(139, 92, 246, 0.16)',
    borderStyle: 'dashed',
    top: '50%',
    left: '50%',
    marginTop: -220,
    marginLeft: -220,
    pointerEvents: 'none' as any,
  },
  starDot: {
    position: 'absolute',
  },
});
