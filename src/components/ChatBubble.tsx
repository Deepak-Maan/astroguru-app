import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { ChatMessage } from '../types';
import { clockTime } from '../utils';

interface Props {
  message: ChatMessage;
  /** Label shown above assistant bubbles (astrologer name / "AI Jyotishi"). */
  authorLabel?: string;
}

export function ChatBubble({ message, authorLabel }: Props) {
  const isUser = message.role === 'user';

  // Smooth entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  // Typing dots animation
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
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

  return (
    <Animated.View
      style={[
        styles.row,
        isUser ? styles.rowRight : styles.rowLeft,
        { opacity: fadeAnim, transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.bubble, isUser ? styles.user : styles.assistant]}>
        {!isUser && !!authorLabel && (
          <Text style={styles.author}>{authorLabel}</Text>
        )}

        {message.pending ? (
          <View style={styles.typingRow}>
            <Text style={styles.typingText}>reading your chart</Text>
            <View style={styles.dotsContainer}>
              <Animated.View style={[styles.dot, { opacity: dot1 }]} />
              <Animated.View style={[styles.dot, { opacity: dot2 }]} />
              <Animated.View style={[styles.dot, { opacity: dot3 }]} />
            </View>
          </View>
        ) : (
          <Text style={[styles.text, isUser && { color: colors.white }]}>
            {message.text}
          </Text>
        )}

        {!message.pending && (
          <Text style={[styles.time, isUser && styles.timeUser]}>
            {clockTime(message.at)}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: spacing.md },
  rowLeft: { justifyContent: 'flex-start', paddingRight: spacing.xxl },
  rowRight: { justifyContent: 'flex-end', paddingLeft: spacing.xxl },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    maxWidth: '100%',
  },
  assistant: {
    backgroundColor: '#E6ECF5',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(163, 177, 198, 0.4)',
    borderRightColor: 'rgba(163, 177, 198, 0.4)',
    borderTopLeftRadius: radius.sm,
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 3,
  },
  user: {
    backgroundColor: colors.saffron,
    borderTopRightRadius: radius.sm,
    shadowColor: 'rgba(230,126,34,0.35)',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  author: {
    ...typography.tiny,
    color: colors.teal,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  text: { ...typography.body, color: colors.text, lineHeight: 21 },
  time: {
    ...typography.tiny,
    color: colors.textFaint,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  timeUser: { color: 'rgba(255,255,255,0.85)' },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typingText: { ...typography.small, color: colors.textMuted, fontStyle: 'italic' },
  dotsContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
});
