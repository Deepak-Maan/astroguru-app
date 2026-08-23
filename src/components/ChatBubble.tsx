import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { ChatMessage } from '../types';
import { clockTime } from '../utils';

interface Props {
  message: ChatMessage;
  /** Label shown above assistant bubbles (astrologer name / "AI Jyotishi"). */
  authorLabel?: string;
  onRemedyPress?: (type: 'gemstone' | 'puja' | 'remedy') => void;
}

export function ChatBubble({ message, authorLabel, onRemedyPress }: Props) {
  const router = useRouter();
  const isUser = message.role === 'user';

  // Smooth entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  // Typing dots animation
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  const triggerHaptic = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Pulsing 3-dot typing animation
  useEffect(() => {
    if (message.pending) {
      const animateDot = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.3, duration: 250, useNativeDriver: true }),
          ])
        );
      };

      const a1 = animateDot(dot1, 0);
      const a2 = animateDot(dot2, 150);
      const a3 = animateDot(dot3, 300);

      a1.start();
      a2.start();
      a3.start();

      return () => {
        a1.stop();
        a2.stop();
        a3.stop();
      };
    }
  }, [message.pending]);

  // Detect embedded action recommendations
  const msgLower = (message.text || '').toLowerCase();
  const hasGemstone = msgLower.includes('gemstone') || msgLower.includes('sapphire') || msgLower.includes('emerald') || msgLower.includes('panna') || msgLower.includes('pukhraj');
  const hasPuja = msgLower.includes('puja') || msgLower.includes('shanti') || msgLower.includes('jaap') || msgLower.includes('mrityunjaya') || msgLower.includes('hanuman');

  return (
    <Animated.View
      style={[
        styles.row,
        isUser ? styles.rowRight : styles.rowLeft,
        { opacity: fadeAnim, transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.bubble, isUser ? styles.user : styles.assistant]}>
        {!isUser && (
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        {isUser && (
          <LinearGradient
            colors={['#D97706', '#E67E22']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        {!isUser && !!authorLabel && (
          <View style={styles.authorRow}>
            <View style={styles.authorBeacon} />
            <Text style={styles.author}>{authorLabel}</Text>
          </View>
        )}

        {message.pending ? (
          <View style={styles.typingRow}>
            <Text style={styles.typingText}>Analyzing your Janam Kundli</Text>
            <View style={styles.dotsContainer}>
              <Animated.View style={[styles.dot, { opacity: dot1 }]} />
              <Animated.View style={[styles.dot, { opacity: dot2 }]} />
              <Animated.View style={[styles.dot, { opacity: dot3 }]} />
            </View>
          </View>
        ) : (
          <Text style={[styles.text, isUser && { color: '#FFFFFF' }]}>
            {message.text}
          </Text>
        )}

        {/* Interactive In-Chat Remedy Action Card */}
        {!isUser && !message.pending && (hasGemstone || hasPuja) && (
          <View style={styles.actionCardWrap}>
            {hasGemstone && (
              <Pressable
                onPress={() => {
                  triggerHaptic();
                  if (onRemedyPress) onRemedyPress('gemstone');
                  else router.push('/(tabs)/kundli');
                }}
                style={({ pressed }) => [styles.actionChip, pressed && { opacity: 0.8 }]}
              >
                <Text style={{ fontSize: 13 }}>💎</Text>
                <Text style={styles.actionChipText}>View Recommended Gemstone ›</Text>
              </Pressable>
            )}
            {hasPuja && (
              <Pressable
                onPress={() => {
                  triggerHaptic();
                  if (onRemedyPress) onRemedyPress('puja');
                  else router.push('/(tabs)/kundli');
                }}
                style={({ pressed }) => [styles.actionChip, pressed && { opacity: 0.8 }]}
              >
                <Text style={{ fontSize: 13 }}>🪔</Text>
                <Text style={styles.actionChipText}>Book Vedic Shanti Puja ›</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Timestamp & Double Ticks */}
        {!message.pending && (
          <View style={styles.footerRow}>
            <Text style={[styles.time, isUser && styles.timeUser]}>
              {clockTime(message.at)}
            </Text>
            {isUser && <Text style={styles.doubleTick}>✓✓</Text>}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  rowLeft: {
    justifyContent: 'flex-start',
    paddingRight: 44,
  },
  rowRight: {
    justifyContent: 'flex-end',
    paddingLeft: 44,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  assistant: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  user: {
    backgroundColor: '#D97706',
    borderTopRightRadius: 4,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  authorBeacon: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  author: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 13.5,
    color: '#1E1B4B',
    lineHeight: 20,
    fontWeight: '500',
  },

  /* In-Chat Action Cards */
  actionCardWrap: {
    marginTop: 10,
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  actionChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },

  /* Footer */
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  time: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '700',
  },
  timeUser: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  doubleTick: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '900',
  },

  /* Typing */
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  typingText: {
    fontSize: 12.5,
    color: '#64748B',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
});
