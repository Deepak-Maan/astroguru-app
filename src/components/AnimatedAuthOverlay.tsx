import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../theme';

interface OverlayProps {
  visible: boolean;
  type: 'login' | 'signup' | 'logout';
  message?: string;
  onFinished?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function AnimatedAuthOverlay({ visible, type, message, onFinished }: OverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const rotateRing1 = useRef(new Animated.Value(0)).current;
  const rotateRing2 = useRef(new Animated.Value(1)).current;
  const rotateRays = useRef(new Animated.Value(0)).current;
  const pulseCenter = useRef(new Animated.Value(0.85)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.75);
      rotateRing1.setValue(0);
      rotateRing2.setValue(1);
      rotateRays.setValue(0);
      pulseCenter.setValue(0.85);
      progressWidth.setValue(0);
      shimmerAnim.setValue(0);

      // 1. Outer Ring Spin (Continuous)
      const ring1Loop = Animated.loop(
        Animated.timing(rotateRing1, {
          toValue: 1,
          duration: 3500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      // 2. Inner Ring Reverse Spin
      const ring2Loop = Animated.loop(
        Animated.timing(rotateRing2, {
          toValue: 0,
          duration: 2800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      // 3. Radial Golden Rays Rotation
      const raysLoop = Animated.loop(
        Animated.timing(rotateRays, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      // 4. Center Core Breathing Expansion
      const centerPulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseCenter, {
            toValue: 1.15,
            duration: 450,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseCenter, {
            toValue: 0.95,
            duration: 450,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // 5. Shimmer Wave
      const shimmerLoop = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      ring1Loop.start();
      ring2Loop.start();
      raysLoop.start();
      centerPulseLoop.start();
      shimmerLoop.start();

      // 6. Progress Fill
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 950,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      // 7. Modal Spring Entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();

      // 8. Exit Dissolve
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.08,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          ring1Loop.stop();
          ring2Loop.stop();
          raysLoop.stop();
          centerPulseLoop.stop();
          shimmerLoop.stop();
          onFinished?.();
        });
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [visible, type]);

  if (!visible) return null;

  const spin1Deg = rotateRing1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spin2Deg = rotateRing2.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const raysDeg = rotateRays.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressPercent = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const getEmblem = () => {
    if (type === 'logout') return '🛡️';
    if (type === 'signup') return '👑';
    return '🕉️';
  };

  const getTitle = () => {
    if (type === 'logout') return 'Session Secured 🙏';
    if (type === 'signup') return 'Welcome to the Sanctuary ✨';
    return 'Cosmic Alignment Complete ✨';
  };

  const getSubtitle = () => {
    if (type === 'logout') return 'Clearing credentials & locking sacred vault...';
    if (type === 'signup') return 'Generating your 12-house Vedic birth chart...';
    return 'Harmonizing your Grahas & Navamsha Kundli...';
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Specular Edge */}
          <View style={styles.specularTop} />

          {/* Central Sacred Mandala Portal */}
          <View style={styles.mandalaWrapper}>
            {/* Ambient Radial Golden Ray Halo */}
            <Animated.View
              style={[
                styles.raysHalo,
                {
                  transform: [{ rotate: raysDeg }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(212, 175, 55, 0.45)', 'rgba(245, 158, 11, 0.2)', 'transparent']}
                start={{ x: 0.5, y: 0.5 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {/* Outer Astrological Dashed Orbit Ring */}
            <Animated.View
              style={[
                styles.mandalaRing1,
                {
                  transform: [{ rotate: spin1Deg }],
                },
              ]}
            />

            {/* Middle Planetary Dashed Ring */}
            <Animated.View
              style={[
                styles.mandalaRing2,
                {
                  transform: [{ rotate: spin2Deg }],
                },
              ]}
            />

            {/* Inner Sacred Center Core */}
            <Animated.View
              style={[
                styles.mandalaCore,
                {
                  transform: [{ scale: pulseCenter }],
                },
              ]}
            >
              <LinearGradient
                colors={['#FDE68A', '#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.emblemText}>{getEmblem()}</Text>
            </Animated.View>
          </View>

          {/* Status Badge */}
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>VEDIC SANCTUARY AUTHENTICATED</Text>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.titleText}>{getTitle()}</Text>
          <Text style={styles.messageText}>{message || getSubtitle()}</Text>

          {/* Shimmering Progress Bar */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressPercent }]}>
              <LinearGradient
                colors={['#D4AF37', '#F5D77F', '#B8902A', '#EA580C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 10, 18, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  specularTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  mandalaWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 14,
  },
  raysHalo: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    overflow: 'hidden',
  },
  mandalaRing1: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.8,
    borderColor: '#D4AF37',
    borderStyle: 'dashed',
  },
  mandalaRing2: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
  },
  mandalaCore: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  emblemText: {
    fontSize: 30,
  },
  badgePill: {
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.40)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#B8902A',
    letterSpacing: 1,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'web' ? 'Marcellus, Cinzel, Georgia, serif' : undefined,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  progressTrack: {
    width: 160,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
