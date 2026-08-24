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
import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';
import { seededRandom } from '../../utils';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ZODIAC_SYMBOLS = [
  { char: '♈', name: 'Aries', x: '12%', y: '18%', color: '#D4AF37', delay: 0 },
  { char: '♉', name: 'Taurus', x: '85%', y: '22%', color: '#818CF8', delay: 400 },
  { char: '♊', name: 'Gemini', x: '18%', y: '45%', color: '#38BDF8', delay: 800 },
  { char: '♋', name: 'Cancer', x: '82%', y: '48%', color: '#F472B6', delay: 1200 },
  { char: '♌', name: 'Leo', x: '10%', y: '72%', color: '#F59E0B', delay: 600 },
  { char: '♍', name: 'Virgo', x: '86%', y: '75%', color: '#34D399', delay: 1000 },
  { char: '♎', name: 'Libra', x: '25%', y: '88%', color: '#D4AF37', delay: 200 },
  { char: '♏', name: 'Scorpio', x: '75%', y: '88%', color: '#A78BFA', delay: 700 },
  { char: '♐', name: 'Sagittarius', x: '50%', y: '12%', color: '#F59E0B', delay: 900 },
  { char: '♑', name: 'Capricorn', x: '50%', y: '92%', color: '#38BDF8', delay: 1100 },
];

function useConstellationStars(count = 36) {
  return useMemo(() => {
    const rnd = seededRandom(777111);
    return Array.from({ length: count }, (_, i) => ({
      id: `c-star-${i}`,
      x: rnd() * 100,
      y: rnd() * 100,
      size: rnd() < 0.25 ? 3.8 : rnd() < 0.6 ? 2.4 : 1.5,
      color: rnd() < 0.4 ? '#D4AF37' : rnd() < 0.7 ? '#818CF8' : '#38BDF8',
      opacity: 0.3 + rnd() * 0.5,
    }));
  }, [count]);
}

export function AuthCosmicBackground({ children, style }: Props) {
  const stars = useConstellationStars();

  // Animation Refs
  const gridRotate = useRef(new Animated.Value(0)).current;
  const gridScale = useRef(new Animated.Value(0.95)).current;
  const floatDrift = useRef(new Animated.Value(0)).current;
  const meteorAnim = useRef(new Animated.Value(0)).current;
  const auroraPulse = useRef(new Animated.Value(0)).current;
  const runePulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Slow Sacred Geometry Grid Rotation (60s)
    const gridRotateLoop = Animated.loop(
      Animated.timing(gridRotate, {
        toValue: 1,
        duration: 60000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 2. Sacred Grid Breathing Scale (8s)
    const gridScaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(gridScale, {
          toValue: 1.06,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(gridScale, {
          toValue: 0.95,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Floating Zodiac Rune Drift (5s)
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatDrift, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatDrift, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 4. Shooting Star Meteor Streaks (every 4.5s)
    const meteorLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(meteorAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(3200),
        Animated.timing(meteorAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // 5. Aurora Harmonic Wave Breathing (7s)
    const auroraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(auroraPulse, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(auroraPulse, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 6. Rune Glow Pulse (2.8s)
    const runeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(runePulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(runePulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    gridRotateLoop.start();
    gridScaleLoop.start();
    floatLoop.start();
    meteorLoop.start();
    auroraLoop.start();
    runeLoop.start();

    return () => {
      gridRotateLoop.stop();
      gridScaleLoop.stop();
      floatLoop.stop();
      meteorLoop.stop();
      auroraLoop.stop();
      runeLoop.stop();
    };
  }, []);

  const gridRotateDeg = gridRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const floatY = floatDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });

  const meteorTranslateX = meteorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, SCREEN_WIDTH + 150],
  });

  const meteorTranslateY = meteorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, SCREEN_HEIGHT * 0.45],
  });

  const meteorOpacity = meteorAnim.interpolate({
    inputRange: [0, 0.15, 0.7, 1],
    outputRange: [0, 0.9, 0.8, 0],
  });

  const auroraScale = auroraPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const runeGlow = runePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  return (
    <View style={[styles.container, style]}>
      {/* ── Layer 1: Ethereal Canvas Gradient ── */}
      <LinearGradient
        colors={['#FCFAF6', '#F8FAFC', '#F0F4F8', '#EFF6FF']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Layer 2: Harmonic Aurora Waves ── */}
      <Animated.View
        style={[
          styles.auroraOrb,
          styles.auroraGold,
          {
            transform: [{ scale: auroraScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.auroraOrb,
          styles.auroraLavender,
          {
            transform: [{ scale: auroraScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.auroraOrb,
          styles.auroraCyan,
          {
            transform: [{ scale: auroraScale }],
          },
        ]}
      />

      {/* ── Layer 3: Sacred Geometric Kundli Astrological Matrix Web ── */}
      <Animated.View
        style={[
          styles.gridContainer,
          {
            transform: [{ rotate: gridRotateDeg }, { scale: gridScale }],
          },
        ]}
        pointerEvents="none"
      >
        <Svg width={640} height={640} viewBox="0 0 640 640" style={styles.svgGrid}>
          {/* Outer Kundli Diamond */}
          <Polygon
            points="320,40 600,320 320,600 40,320"
            fill="none"
            stroke="rgba(212, 175, 55, 0.22)"
            strokeWidth="1.5"
            strokeDasharray="6,6"
          />
          {/* Inner Kundli Cross Lines */}
          <Line
            x1="40"
            y1="320"
            x2="600"
            y2="320"
            stroke="rgba(212, 175, 55, 0.16)"
            strokeWidth="1.2"
          />
          <Line
            x1="320"
            y1="40"
            x2="320"
            y2="600"
            stroke="rgba(212, 175, 55, 0.16)"
            strokeWidth="1.2"
          />
          {/* Diagonal Square */}
          <Rect
            x="140"
            y="140"
            width="360"
            height="360"
            fill="none"
            stroke="rgba(139, 92, 246, 0.18)"
            strokeWidth="1.2"
            strokeDasharray="4,4"
          />
          {/* Sacred Center Concentric Circles */}
          <Circle
            cx="320"
            cy="320"
            r="190"
            fill="none"
            stroke="rgba(212, 175, 55, 0.20)"
            strokeWidth="1.4"
          />
          <Circle
            cx="320"
            cy="320"
            r="110"
            fill="none"
            stroke="rgba(56, 189, 248, 0.22)"
            strokeWidth="1.2"
            strokeDasharray="3,3"
          />
          <Circle
            cx="320"
            cy="320"
            r="45"
            fill="none"
            stroke="rgba(212, 175, 55, 0.35)"
            strokeWidth="1.6"
          />
          {/* Center 8-Ray Star Crosses */}
          <Line
            x1="180"
            y1="180"
            x2="460"
            y2="460"
            stroke="rgba(212, 175, 55, 0.14)"
            strokeWidth="1"
          />
          <Line
            x1="180"
            y1="460"
            x2="460"
            y2="180"
            stroke="rgba(212, 175, 55, 0.14)"
            strokeWidth="1"
          />
        </Svg>
      </Animated.View>

      {/* ── Layer 4: Floating Zodiac Runes with Starlight Aura ── */}
      {ZODIAC_SYMBOLS.map((item, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.runeBadge,
            {
              top: item.y as any,
              left: item.x as any,
              transform: [{ translateY: floatY }],
              opacity: runeGlow,
            },
          ]}
          pointerEvents="none"
        >
          <View
            style={[
              styles.runePill,
              {
                borderColor: `${item.color}55`,
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                shadowColor: item.color,
              },
            ]}
          >
            <Text style={[styles.runeChar, { color: item.color }]}>{item.char}</Text>
          </View>
        </Animated.View>
      ))}

      {/* ── Layer 5: Shooting Star Meteor Streak ── */}
      <Animated.View
        style={[
          styles.meteorWrapper,
          {
            transform: [{ translateX: meteorTranslateX }, { translateY: meteorTranslateY }],
            opacity: meteorOpacity,
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['transparent', 'rgba(212, 175, 55, 0.5)', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.meteorTail}
        />
        <View style={styles.meteorHead} />
      </Animated.View>

      {/* ── Layer 6: Micro Constellation Star Points ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {stars.map((s) => (
          <View
            key={s.id}
            style={[
              styles.constellationDot,
              {
                top: `${s.y}%`,
                left: `${s.x}%`,
                width: s.size,
                height: s.size,
                borderRadius: s.size / 2,
                backgroundColor: s.color,
                opacity: s.opacity,
                shadowColor: s.color,
                shadowOpacity: 0.9,
                shadowRadius: s.size * 2,
              },
            ]}
          />
        ))}
      </View>

      {/* Children Form Layout */}
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

  /* Aurora Orbs */
  auroraOrb: {
    position: 'absolute',
    borderRadius: 9999,
    filter: Platform.OS === 'web' ? 'blur(80px)' : undefined,
  },
  auroraGold: {
    width: Math.min(SCREEN_WIDTH * 0.9, 440),
    height: Math.min(SCREEN_WIDTH * 0.9, 440),
    top: -80,
    left: -60,
    backgroundColor: 'rgba(253, 230, 138, 0.42)',
  },
  auroraLavender: {
    width: Math.min(SCREEN_WIDTH * 0.95, 460),
    height: Math.min(SCREEN_WIDTH * 0.95, 460),
    bottom: -90,
    right: -70,
    backgroundColor: 'rgba(221, 214, 254, 0.42)',
  },
  auroraCyan: {
    width: Math.min(SCREEN_WIDTH * 0.8, 380),
    height: Math.min(SCREEN_WIDTH * 0.8, 380),
    top: '40%',
    left: '25%',
    backgroundColor: 'rgba(186, 230, 253, 0.32)',
  },

  /* Sacred Geometry Matrix Grid */
  gridContainer: {
    position: 'absolute',
    width: 640,
    height: 640,
    top: '50%',
    left: '50%',
    marginTop: -320,
    marginLeft: -320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgGrid: {
    width: 640,
    height: 640,
  },

  /* Floating Zodiac Rune Badges */
  runeBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  runePill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: 'blur(8px)' as any,
  },
  runeChar: {
    fontSize: 16,
    fontWeight: '900',
  },

  /* Shooting Star Meteor */
  meteorWrapper: {
    position: 'absolute',
    width: 140,
    height: 2,
    transform: [{ rotate: '32deg' }],
  },
  meteorTail: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 130,
    height: 2,
    borderRadius: 1,
  },
  meteorHead: {
    position: 'absolute',
    right: 0,
    top: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FDE68A',
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },

  /* Micro Constellation Dots */
  constellationDot: {
    position: 'absolute',
  },
});
