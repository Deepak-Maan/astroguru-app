import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, typography } from '../theme';

interface VoiceNoteRecorderProps {
  onSendVoiceNote: (durationSec: number) => void;
  disabled?: boolean;
}

export function VoiceNoteRecorder({ onSendVoiceNote, disabled }: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<any>(null);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const barAnims = useRef([
    new Animated.Value(6),
    new Animated.Value(14),
    new Animated.Value(22),
    new Animated.Value(10),
    new Animated.Value(18),
    new Animated.Value(8),
    new Animated.Value(16),
  ]).current;

  useEffect(() => {
    if (isRecording) {
      // Pulse animation for recording dot
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.4, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      );
      pulseLoop.start();

      // Waveform random height twitching
      const interval = setInterval(() => {
        barAnims.forEach((bar) => {
          Animated.timing(bar, {
            toValue: Math.floor(Math.random() * 20) + 6,
            duration: 180,
            useNativeDriver: false,
          }).start();
        });
      }, 200);

      // Duration counter
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      return () => {
        pulseLoop.stop();
        clearInterval(interval);
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else {
      pulseAnim.setValue(1);
      if (timerRef.current) clearInterval(timerRef.current);
      setDuration(0);
    }
  }, [isRecording]);

  const startRecording = () => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (_) {}
    }
    setDuration(0);
    setIsRecording(true);
  };

  const cancelRecording = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (_) {}
    }
    setIsRecording(false);
    setDuration(0);
  };

  const sendRecording = () => {
    if (duration < 1) {
      // minimum 1 second
      cancelRecording();
      return;
    }
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    }
    const finalSec = duration;
    setIsRecording(false);
    setDuration(0);
    onSendVoiceNote(finalSec);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isRecording) {
    return (
      <View style={styles.recordingOverlay}>
        <View style={styles.recordStatusRow}>
          <Animated.View style={[styles.redDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.durationText}>{formatTimer(duration)}</Text>
        </View>

        {/* Dynamic Voice Waves */}
        <View style={styles.waveRow}>
          {barAnims.map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                styles.waveBar,
                { height: anim },
              ]}
            />
          ))}
        </View>

        {/* Cancel Button */}
        <Pressable
          onPress={cancelRecording}
          hitSlop={8}
          style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.cancelText}>🗑️ Cancel</Text>
        </Pressable>

        {/* Send Button */}
        <Pressable
          onPress={sendRecording}
          hitSlop={8}
          style={({ pressed }) => [styles.sendVoiceBtn, pressed && { opacity: 0.85 }]}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.sendVoiceIcon}>➤</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={startRecording}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [
        styles.micBtn,
        disabled && styles.micBtnDisabled,
        pressed && styles.micBtnPressed,
      ]}
    >
      <LinearGradient
        colors={['#8B5CF6', '#6366F1']}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.micIcon}>🎙️</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  micBtnDisabled: {
    opacity: 0.5,
  },
  micBtnPressed: {
    transform: [{ scale: 0.94 }],
  },
  micIcon: {
    fontSize: 20,
  },
  recordingOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(26, 33, 64, 0.95)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1.2,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  recordStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  durationText: {
    ...typography.body,
    color: '#EEF2FF',
    fontWeight: '800',
    fontSize: 15,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 24,
  },
  waveBar: {
    width: 3.5,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
  },
  cancelBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  cancelText: {
    ...typography.tiny,
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 12,
  },
  sendVoiceBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendVoiceIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
