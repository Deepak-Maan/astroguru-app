import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';
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
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.75);
      rotateAnim.setValue(0);

      // Spin animation loop
      const spinAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();

      // Entrance spring & fade
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close after delay
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          spinAnimation.stop();
          onFinished?.();
        });
      }, 1100);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getEmoji = () => {
    if (type === 'login') return '✨';
    if (type === 'signup') return '🎉';
    return '🔒';
  };

  const getTitle = () => {
    if (type === 'login') return 'Welcome Back!';
    if (type === 'signup') return 'Account Created!';
    return 'Securing Session';
  };

  const getDefaultSubtitle = () => {
    if (type === 'login') return 'Opening your cosmic workspace...';
    if (type === 'signup') return 'Preparing your birth chart & Grahas...';
    return 'Signing out safely...';
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          {/* Luminous Pulsing Outer Ring */}
          <Animated.View style={[styles.ringOuter, { transform: [{ rotate: spin }] }]}>
            <LinearGradient
              colors={[colors.teal, colors.gold, colors.saffron, colors.teal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          <View style={styles.cardInner}>
            <Text style={styles.emoji}>{getEmoji()}</Text>
            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.subtitle}>{message || getDefaultSubtitle()}</Text>
            <View style={styles.pulseBarWrap}>
              <LinearGradient
                colors={[colors.teal, colors.gold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.pulseBar}
              />
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 28,
    padding: 3,
    position: 'relative',
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  ringOuter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    overflow: 'hidden',
  },
  cardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  emoji: {
    fontSize: 44,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1B4B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  pulseBarWrap: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  pulseBar: {
    height: '100%',
    width: '100%',
    borderRadius: 2,
  },
});
