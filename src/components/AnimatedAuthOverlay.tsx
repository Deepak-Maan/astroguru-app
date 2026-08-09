import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../theme';

interface OverlayProps {
  visible: boolean;
  type: 'login' | 'signup' | 'logout';
  message?: string;
  onFinished?: () => void;
}

export function AnimatedAuthOverlay({ visible, type, message, onFinished }: OverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const rotateCw = useRef(new Animated.Value(0)).current;
  const rotateCcw = useRef(new Animated.Value(1)).current;
  const pulseIcon = useRef(new Animated.Value(0.7)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const twistLogout = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(type === 'logout' ? 1.1 : 0.4);
      rotateCw.setValue(0);
      rotateCcw.setValue(1);
      pulseIcon.setValue(0.7);
      progressWidth.setValue(0);
      twistLogout.setValue(0);

      // 1. Clockwise outer ring spin
      const spinCw = Animated.loop(
        Animated.timing(rotateCw, {
          toValue: 1,
          duration: type === 'logout' ? 1200 : 1600,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      // 2. Counter-clockwise inner ring spin
      const spinCcw = Animated.loop(
        Animated.timing(rotateCcw, {
          toValue: 0,
          duration: type === 'logout' ? 1000 : 1400,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      spinCw.start();
      spinCcw.start();

      // 3. Icon Breathing Pulse
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseIcon, {
            toValue: 1.25,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseIcon, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      // 4. Progress bar fill
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: type === 'logout' ? 900 : 1100,
        useNativeDriver: false,
      }).start();

      // 5. Entrance / Exit Animations
      if (type === 'logout') {
        // Logout: Implosion twist dissolve animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.05,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.85,
              duration: 750,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(twistLogout, {
            toValue: 1,
            duration: 950,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Login / Signup: Cosmic Spring Entrance
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 90,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Auto finish after delay
      const displayDuration = type === 'logout' ? 1050 : 1250;
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start(() => {
          spinCw.stop();
          spinCcw.stop();
          pulseLoop.stop();
          onFinished?.();
        });
      }, displayDuration);

      return () => clearTimeout(timer);
    }
  }, [visible, type]);

  if (!visible) return null;

  const spinCwDeg = rotateCw.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinCcwDeg = rotateCcw.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const logoutRotate = twistLogout.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-18deg'],
  });

  const getEmoji = () => {
    if (type === 'login') return '✨';
    if (type === 'signup') return '🌟';
    return '🛡️';
  };

  const getTitle = () => {
    if (type === 'login') return 'Cosmic Welcome!';
    if (type === 'signup') return 'Lagna Chart Ready!';
    return 'Session Secured';
  };

  const getDefaultSubtitle = () => {
    if (type === 'login') return 'Aligning your birth chart & Grahas...';
    if (type === 'signup') return 'Generating your 12-house natal chart...';
    return 'Clearing credentials & locking vault...';
  };

  const getGradientColors = (): [string, string, string, string] => {
    if (type === 'login') return [colors.teal, colors.gold, '#3B0764', colors.teal];
    if (type === 'signup') return [colors.saffron, '#8B5CF6', colors.gold, colors.saffron];
    return ['#EF4444', '#8B5CF6', '#3B0764', '#EF4444'];
  };

  const getReversedGradientColors = (): [string, string, string, string] => {
    if (type === 'login') return [colors.teal, '#3B0764', colors.gold, colors.teal];
    if (type === 'signup') return [colors.saffron, colors.gold, '#8B5CF6', colors.saffron];
    return ['#EF4444', '#3B0764', '#8B5CF6', '#EF4444'];
  };

  const progressPercent = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
            backgroundColor: type === 'logout' ? 'rgba(15, 23, 42, 0.82)' : 'rgba(15, 23, 42, 0.65)',
          },
        ]}
      >
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { scale: scaleAnim },
                { rotate: type === 'logout' ? logoutRotate : '0deg' },
              ],
            },
          ]}
        >
          {/* Dual Counter-Rotating Ring 1: Clockwise Outer */}
          <Animated.View style={[styles.ringOuter, { transform: [{ rotate: spinCwDeg }] }]}>
            <LinearGradient
              colors={getGradientColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Dual Counter-Rotating Ring 2: Counter-Clockwise Inner */}
          <Animated.View style={[styles.ringInner, { transform: [{ rotate: spinCcwDeg }] }]}>
            <LinearGradient
              colors={getReversedGradientColors()}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          <View style={styles.cardInner}>
            {/* Animated Pulsing Central Icon */}
            <Animated.View style={[styles.emojiWrap, { transform: [{ scale: pulseIcon }] }]}>
              <Text style={styles.emoji}>{getEmoji()}</Text>
            </Animated.View>

            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.subtitle}>{message || getDefaultSubtitle()}</Text>

            {/* Glowing Shimmer Progress Bar */}
            <View style={styles.pulseBarWrap}>
              <Animated.View style={[styles.pulseBar, { width: progressPercent }]}>
                <LinearGradient
                  colors={
                    type === 'logout'
                      ? ['#EF4444', '#8B5CF6']
                      : type === 'signup'
                      ? [colors.saffron, colors.gold]
                      : [colors.teal, colors.gold]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 32,
    padding: 4,
    position: 'relative',
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  ringOuter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    overflow: 'hidden',
  },
  ringInner: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 30,
    overflow: 'hidden',
    opacity: 0.85,
  },
  cardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: spacing.xl + 4,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  emojiWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(191, 219, 254, 0.8)',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
  },
  emoji: {
    fontSize: 34,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E1B4B',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.xs,
  },
  pulseBarWrap: {
    width: 140,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  pulseBar: {
    height: '100%',
    borderRadius: 3,
  },
});
