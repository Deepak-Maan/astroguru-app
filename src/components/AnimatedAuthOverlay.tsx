import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../theme';

interface OverlayProps {
  visible: boolean;
  type: 'login' | 'signup' | 'logout';
  message?: string;
  onFinished?: () => void;
}

/**
 * AstroGuru Minimalist, Elegant Auth Animation Overlay
 * Simple, fast (~520ms), and 60fps native-accelerated.
 * Replaces noisy multi-ring spins and implosion twists with a serene frosted glass micro-transition.
 */
export function AnimatedAuthOverlay({ visible, type, message, onFinished }: OverlayProps) {
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const cardTranslateY = useRef(new Animated.Value(10)).current;
  const badgeScale = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      backdropAnim.setValue(0);
      cardScale.setValue(0.92);
      cardTranslateY.setValue(10);
      badgeScale.setValue(0.8);
      progressAnim.setValue(0);

      // 1. Smooth entrance (fade + subtle float-up spring)
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.spring(badgeScale, {
          toValue: 1,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 480,
          useNativeDriver: false,
        }),
      ]).start();

      // 2. Snappy, non-blocking auto-finish (total hold ~520ms)
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(backdropAnim, {
            toValue: 0,
            duration: 160,
            useNativeDriver: true,
          }),
          Animated.timing(cardScale, {
            toValue: 0.96,
            duration: 160,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onFinished?.();
        });
      }, 520);

      return () => clearTimeout(timer);
    }
  }, [visible, type]);

  if (!visible) return null;

  const getEmoji = () => {
    if (type === 'login') return '✨';
    if (type === 'signup') return '🌟';
    return '👋';
  };

  const getTitle = () => {
    if (type === 'login') return 'Welcome Back';
    if (type === 'signup') return 'Welcome to AstroGuru';
    return 'Signed Out';
  };

  const getDefaultSubtitle = () => {
    if (type === 'login') return 'Opening your cosmic workspace...';
    if (type === 'signup') return 'Preparing your natal chart...';
    return 'Session securely ended.';
  };

  const getBadgeColors = (): [string, string] => {
    if (type === 'login') return ['rgba(99, 102, 241, 0.22)', 'rgba(129, 140, 248, 0.08)'];
    if (type === 'signup') return ['rgba(245, 158, 11, 0.22)', 'rgba(252, 211, 77, 0.08)'];
    return ['rgba(148, 163, 184, 0.2)', 'rgba(100, 116, 139, 0.08)'];
  };

  const getBadgeBorder = () => {
    if (type === 'login') return 'rgba(129, 140, 248, 0.35)';
    if (type === 'signup') return 'rgba(252, 211, 77, 0.4)';
    return 'rgba(148, 163, 184, 0.3)';
  };

  const getProgressBarGradient = (): [string, string] => {
    if (type === 'login') return ['#6366F1', '#818CF8'];
    if (type === 'signup') return ['#F59E0B', '#FCD34D'];
    return ['#94A3B8', '#64748B'];
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { scale: cardScale },
                { translateY: cardTranslateY },
              ],
            },
          ]}
        >
          {/* Subtle Frosted Specular Border Highlight */}
          <View style={styles.specularBorder} />

          {/* Central Badge */}
          <Animated.View
            style={[
              styles.badgeWrap,
              {
                borderColor: getBadgeBorder(),
                transform: [{ scale: badgeScale }],
              },
            ]}
          >
            <LinearGradient
              colors={getBadgeColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.badgeEmoji}>{getEmoji()}</Text>
          </Animated.View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {message || getDefaultSubtitle()}
          </Text>

          {/* Minimal 2px Smooth Status Bar */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]}>
              <LinearGradient
                colors={getProgressBarGradient()}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 10, 22, 0.72)',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 290,
    backgroundColor: 'rgba(20, 26, 52, 0.94)',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  specularBorder: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  badgeWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  badgeEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#EEF2FF',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#A5B4FC',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.xs,
  },
  progressTrack: {
    width: 100,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
