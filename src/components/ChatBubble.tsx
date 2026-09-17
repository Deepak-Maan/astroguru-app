import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
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

  // Voice Note Playback Simulation
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying && message.isAudio) {
      const dur = message.audioDuration || 6;
      interval = setInterval(() => {
        setPlayProgress((p) => {
          if (p >= 1) {
            setIsPlaying(false);
            return 0;
          }
          return p + 0.1 / dur;
        });
      }, 100);
    } else {
      if (!isPlaying) setPlayProgress(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, message.isAudio, message.audioDuration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const WAVE_BARS = [4, 10, 16, 8, 22, 14, 6, 18, 12, 20, 15, 8, 14, 10, 18, 6];

  return (
    <Animated.View
      style={[
        styles.row,
        isUser ? styles.rowRight : styles.rowLeft,
        { opacity: fadeAnim, transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.bubble, isUser ? styles.user : styles.assistant, message.isAudio && styles.audioBubble]}>
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
        ) : message.isAudio ? (
          <View style={styles.audioRow}>
            <Pressable
              onPress={togglePlay}
              hitSlop={6}
              style={[styles.playBtn, isUser ? styles.playBtnUser : styles.playBtnAssistant]}
            >
              <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </Pressable>

            <View style={styles.audioWaveContainer}>
              <View style={styles.audioBarsRow}>
                {WAVE_BARS.map((h, i) => {
                  const barProgress = i / WAVE_BARS.length;
                  const isFilled = isPlaying && playProgress >= barProgress;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.audioBar,
                        {
                          height: h,
                          backgroundColor: isFilled
                            ? (isUser ? '#FFFFFF' : '#818CF8')
                            : (isUser ? 'rgba(255,255,255,0.45)' : 'rgba(165,180,252,0.35)'),
                        },
                      ]}
                    />
                  );
                })}
              </View>
              <View style={styles.audioMetaRow}>
                <Text style={[styles.audioDuration, isUser && { color: 'rgba(255,255,255,0.85)' }]}>
                  {message.audioDuration ? `0:${message.audioDuration < 10 ? '0' : ''}${message.audioDuration}` : '0:06'}
                </Text>
                <Text style={[styles.audioMicTag, isUser && { color: 'rgba(255,255,255,0.75)' }]}>
                  🎙️ Voice Note
                </Text>
              </View>
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
    backgroundColor: 'rgba(26, 33, 64, 0.82)',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(129, 140, 248, 0.4)',
    borderLeftColor: 'rgba(129, 140, 248, 0.25)',
    borderRightWidth: 1.2,
    borderRightColor: 'rgba(129, 140, 248, 0.15)',
    borderBottomWidth: 2.5,
    borderBottomColor: 'rgba(10, 12, 28, 0.95)',
    borderTopLeftRadius: radius.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  user: {
    backgroundColor: '#6366F1',
    borderTopRightRadius: radius.sm,
    borderTopWidth: 1.2,
    borderTopColor: 'rgba(255, 255, 255, 0.45)',
    borderBottomWidth: 2.5,
    borderBottomColor: '#4338CA',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
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
    backgroundColor: colors.primary,
  },

  /* Audio Bubble Styles */
  audioBubble: {
    minWidth: 200,
    paddingVertical: spacing.sm + 2,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnUser: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  playBtnAssistant: {
    backgroundColor: 'rgba(129, 140, 248, 0.25)',
  },
  playIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  audioWaveContainer: {
    flex: 1,
    gap: 4,
  },
  audioBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
    height: 24,
  },
  audioBar: {
    width: 3,
    borderRadius: 1.5,
  },
  audioMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  audioDuration: {
    ...typography.tiny,
    color: '#A5B4FC',
    fontWeight: '700',
    fontSize: 11,
  },
  audioMicTag: {
    ...typography.tiny,
    color: '#A5B4FC',
    fontWeight: '600',
    fontSize: 10,
  },
});
