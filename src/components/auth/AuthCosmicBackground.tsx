import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Ellipse, G, Line, Path } from 'react-native-svg';
import { seededRandom } from '../../utils';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function usePlanetariumStars(count = 50) {
  return useMemo(() => {
    const rnd = seededRandom(888999);
    return Array.from({ length: count }, (_, i) => ({
      id: `p-star-${i}`,
      top: `${rnd() * 100}%`,
      left: `${rnd() * 100}%`,
      size: rnd() < 0.2 ? 3.6 : rnd() < 0.5 ? 2.4 : 1.4,
      color: rnd() < 0.35 ? '#D4AF37' : rnd() < 0.65 ? '#818CF8' : '#38BDF8',
      opacity: 0.25 + rnd() * 0.55,
      delay: rnd() * 3000,
    }));
  }, [count]);
}

export function AuthCosmicBackground({ children, style }: Props) {
  const stars = usePlanetariumStars();

  // Animation Loop Values
  const orbit1Anim = useRef(new Animated.Value(0)).current;
  const orbit2Anim = useRef(new Animated.Value(0)).current;
  const orbit3Anim = useRef(new Animated.Value(0)).current;
  const sunPulse = useRef(new Animated.Value(0.9)).current;
  const auraWave = useRef(new Animated.Value(0)).current;
  const starlightTwinkle = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // 1. Inner Orbit Revolution (14s)
    const orbit1Loop = Animated.loop(
      Animated.timing(orbit1Anim, {
        toValue: 1,
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 2. Middle Orbit Revolution (22s)
    const orbit2Loop = Animated.loop(
      Animated.timing(orbit2Anim, {
        toValue: 1,
        duration: 22000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 3. Outer Orbit Revolution (32s)
    const orbit3Loop = Animated.loop(
      Animated.timing(orbit3Anim, {
        toValue: 1,
        duration: 32000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 4. Central Golden Sun Breathing Corona (4s)
    const sunLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sunPulse, {
          toValue: 1.15,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sunPulse, {
          toValue: 0.9,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 5. Harmonic Aurora Wave (8s)
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(auraWave, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(auraWave, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 6. Starlight Breathing
    const twinkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(starlightTwinkle, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(starlightTwinkle, {
          toValue: 0.35,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    orbit1Loop.start();
    orbit2Loop.start();
    orbit3Loop.start();
    sunLoop.start();
    auraLoop.start();
    twinkleLoop.start();

    return () => {
      orbit1Loop.stop();
      orbit2Loop.stop();
      orbit3Loop.stop();
      sunLoop.stop();
      auraLoop.stop();
      twinkleLoop.stop();
    };
  }, []);

  // Orbit Rotation Angles
  const orbit1Deg = orbit1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const orbit2Deg = orbit2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const orbit3Deg = orbit3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const auraShiftY = auraWave.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -35],
  });

  const auraShiftX = auraWave.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 25],
  });

  return (
    <View style={[styles.container, style]}>
      {/* ── Base Celestial Canvas Gradient ── */}
      <LinearGradient
        colors={['#FCFAF6', '#F8FAFC', '#F1F5F9', '#EFF6FF']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Layer 1: Ambient Luminous Cosmic Nebula Clouds ── */}
      <Animated.View
        style={[
          styles.nebulaCloud,
          styles.cloudGold,
          {
            transform: [{ translateX: auraShiftX }, { translateY: auraShiftY }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.nebulaCloud,
          styles.cloudAmethyst,
          {
            transform: [{ translateX: auraShiftY }, { translateY: auraShiftX }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.nebulaCloud,
          styles.cloudCyan,
          {
            transform: [{ translateY: auraShiftY }],
          },
        ]}
      />

      {/* ── Layer 2: Central Sacred Sun Planetarium Core ── */}
      <View style={styles.planetariumCenter} pointerEvents="none">
        {/* Sun Corona Outer Flare */}
        <Animated.View
          style={[
            styles.sunCoronaOuter,
            {
              transform: [{ scale: sunPulse }],
            },
          ]}
        />

        {/* Sun Corona Inner Core */}
        <Animated.View
          style={[
            styles.sunCoreGlow,
            {
              transform: [{ scale: sunPulse }],
            },
          ]}
        >
          <LinearGradient
            colors={['#FDE68A', '#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.sunSymbol}>☀️</Text>
        </Animated.View>

        {/* ── Layer 3: Orbit 1 (Inner Gold Orbit with Moon & Mercury) ── */}
        <View style={[styles.orbitTrack, styles.orbit1Track]} />
        <Animated.View
          style={[
            styles.orbitRevolvingContainer,
            styles.orbit1Container,
            {
              transform: [{ rotate: orbit1Deg }],
            },
          ]}
        >
          {/* Planet 1: Golden Chandra Moon */}
          <View style={[styles.planetOrb, styles.planetMoon]}>
            <LinearGradient
              colors={['#FDE68A', '#F59E0B']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.planetIcon}>🌙</Text>
          </View>
        </Animated.View>

        {/* ── Layer 4: Orbit 2 (Middle Tilted Periwinkle Orbit with Venus & Jupiter) ── */}
        <View style={[styles.orbitTrack, styles.orbit2Track]} />
        <Animated.View
          style={[
            styles.orbitRevolvingContainer,
            styles.orbit2Container,
            {
              transform: [{ rotate: orbit2Deg }],
            },
          ]}
        >
          {/* Planet 2: Amethyst Shukra Venus */}
          <View style={[styles.planetOrb, styles.planetVenus]}>
            <LinearGradient
              colors={['#C084FC', '#7C3AED']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.planetIcon}>✨</Text>
          </View>

          {/* Planet 3: Golden Guru Jupiter */}
          <View style={[styles.planetOrb, styles.planetJupiter]}>
            <LinearGradient
              colors={['#FCD34D', '#D97706']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.planetIcon}>🪐</Text>
          </View>
        </Animated.View>

        {/* ── Layer 5: Orbit 3 (Outer Cosmic Sapphire Orbit with Saturn) ── */}
        <View style={[styles.orbitTrack, styles.orbit3Track]} />
        <Animated.View
          style={[
            styles.orbitRevolvingContainer,
            styles.orbit3Container,
            {
              transform: [{ rotate: orbit3Deg }],
            },
          ]}
        >
          {/* Planet 4: Sapphire Shani Saturn */}
          <View style={[styles.planetOrb, styles.planetSaturn]}>
            <LinearGradient
              colors={['#38BDF8', '#0284C7']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.planetIcon}>⭐</Text>
          </View>
        </Animated.View>
      </View>

      {/* ── Layer 6: Sparkling Micro-Stardust Galaxy ── */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: starlightTwinkle }]} pointerEvents="none">
        {stars.map((s) => (
          <View
            key={s.id}
            style={[
              styles.starNode,
              {
                top: s.top as any,
                left: s.left as any,
                width: s.size,
                height: s.size,
                borderRadius: s.size / 2,
                backgroundColor: s.color,
                shadowColor: s.color,
                shadowOpacity: 0.9,
                shadowRadius: s.size * 2.5,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Form Content Layer */}
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

  /* Nebula Light Clouds */
  nebulaCloud: {
    position: 'absolute',
    borderRadius: 9999,
    filter: Platform.OS === 'web' ? 'blur(80px)' : undefined,
  },
  cloudGold: {
    width: Math.min(SCREEN_WIDTH * 0.95, 460),
    height: Math.min(SCREEN_WIDTH * 0.95, 460),
    top: -90,
    left: -70,
    backgroundColor: 'rgba(253, 230, 138, 0.40)',
  },
  cloudAmethyst: {
    width: Math.min(SCREEN_WIDTH * 0.95, 480),
    height: Math.min(SCREEN_WIDTH * 0.95, 480),
    bottom: -100,
    right: -80,
    backgroundColor: 'rgba(221, 214, 254, 0.40)',
  },
  cloudCyan: {
    width: Math.min(SCREEN_WIDTH * 0.8, 380),
    height: Math.min(SCREEN_WIDTH * 0.8, 380),
    top: '38%',
    left: '20%',
    backgroundColor: 'rgba(186, 230, 253, 0.30)',
  },

  /* Planetarium Center Container */
  planetariumCenter: {
    position: 'absolute',
    width: 660,
    height: 660,
    top: '50%',
    left: '50%',
    marginTop: -330,
    marginLeft: -330,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Sun Core */
  sunCoronaOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(253, 230, 138, 0.35)',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  sunCoreGlow: {
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 8,
    zIndex: 10,
  },
  sunSymbol: {
    fontSize: 28,
  },

  /* Orbit Tracks */
  orbitTrack: {
    position: 'absolute',
    borderRadius: 9999,
    borderStyle: 'dashed',
  },
  orbit1Track: {
    width: 260,
    height: 260,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.22)',
  },
  orbit2Track: {
    width: 440,
    height: 440,
    borderWidth: 1.3,
    borderColor: 'rgba(139, 92, 246, 0.20)',
    transform: [{ rotate: '25deg' }],
  },
  orbit3Track: {
    width: 620,
    height: 620,
    borderWidth: 1.2,
    borderColor: 'rgba(56, 189, 248, 0.18)',
    transform: [{ rotate: '-15deg' }],
  },

  /* Revolving Orbit Containers */
  orbitRevolvingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbit1Container: {
    width: 260,
    height: 260,
  },
  orbit2Container: {
    width: 440,
    height: 440,
    transform: [{ rotate: '25deg' }],
  },
  orbit3Container: {
    width: 620,
    height: 620,
    transform: [{ rotate: '-15deg' }],
  },

  /* Planet Orbs */
  planetOrb: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  planetMoon: {
    width: 32,
    height: 32,
    top: -16,
    shadowColor: '#F59E0B',
  },
  planetVenus: {
    width: 28,
    height: 28,
    top: -14,
    shadowColor: '#8B5CF6',
  },
  planetJupiter: {
    width: 38,
    height: 38,
    bottom: -19,
    shadowColor: '#D97706',
  },
  planetSaturn: {
    width: 30,
    height: 30,
    right: -15,
    shadowColor: '#0284C7',
  },
  planetIcon: {
    fontSize: 14,
  },

  /* Stardust Points */
  starNode: {
    position: 'absolute',
  },
});
