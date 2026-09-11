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

export function DailySankalpAudioCard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSecs, setPlaybackSecs] = useState(0);
  const totalSecs = 108; // Sacred duration (1:48)

  const waveAnim1 = useRef(new Animated.Value(0.3)).current;
  const waveAnim2 = useRef(new Animated.Value(0.7)).current;
  const waveAnim3 = useRef(new Animated.Value(0.4)).current;
  const waveAnim4 = useRef(new Animated.Value(0.9)).current;
  const waveAnim5 = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackSecs((s) => (s >= totalSecs ? 0 : s + 1));
      }, 1000);

      // Start wave looping
      const loopWave = (val: Animated.Value, min: number, max: number, duration: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(val, { toValue: max, duration, useNativeDriver: false }),
            Animated.timing(val, { toValue: min, duration, useNativeDriver: false }),
          ])
        ).start();
      };

      loopWave(waveAnim1, 0.2, 1.0, 300);
      loopWave(waveAnim2, 0.3, 0.9, 450);
      loopWave(waveAnim3, 0.1, 1.0, 350);
      loopWave(waveAnim4, 0.4, 0.8, 400);
      loopWave(waveAnim5, 0.2, 1.0, 500);
    } else {
      clearInterval(timer);
      waveAnim1.setValue(0.3);
      waveAnim2.setValue(0.5);
      waveAnim3.setValue(0.3);
      waveAnim4.setValue(0.6);
      waveAnim5.setValue(0.4);
    }

    return () => clearInterval(timer);
  }, [isPlaying]);

  const togglePlay = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}
    setIsPlaying(!isPlaying);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#78350F', '#451A03', '#1C1917']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.topRow}>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>🌅 DAILY MORNING SANKALP</Text>
          </View>
          <Text style={styles.timeLabel}>
            {formatTime(playbackSecs)} / {formatTime(totalSecs)}
          </Text>
        </View>

        <View style={styles.mainContent}>
          {/* Play/Pause Button */}
          <Pressable
            onPress={togglePlay}
            style={({ pressed }) => [styles.playBtn, pressed && { transform: [{ scale: 0.94 }] }]}
          >
            <LinearGradient
              colors={['#F59E0B', '#D97706', '#B45309']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </Pressable>

          {/* Titles & Waveform */}
          <View style={styles.infoCol}>
            <Text style={styles.mantraTitle}>Shree Gayatri Maha Mantra & Sankalp</Text>
            <Text style={styles.mantraSub}>Chanted by Kashi Vedic Priests • 108 Repetitions</Text>

            {/* Audio wave bars */}
            <View style={styles.waveRow}>
              {[waveAnim1, waveAnim2, waveAnim3, waveAnim4, waveAnim5, waveAnim2, waveAnim1, waveAnim4, waveAnim3].map(
                (anim, idx) => (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.waveBar,
                      {
                        transform: [{ scaleY: isPlaying ? anim : 0.3 }],
                        backgroundColor: isPlaying ? '#FCD34D' : 'rgba(255,255,255,0.3)',
                      },
                    ]}
                  />
                )
              )}
            </View>
          </View>
        </View>

        {/* Mantra Verse Box */}
        <View style={styles.verseBox}>
          <Text style={styles.verseSanskrit}>
            ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FCD34D',
    letterSpacing: 0.4,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  playIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  infoCol: {
    flex: 1,
  },
  mantraTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mantraSub: {
    fontSize: 11,
    color: '#FDE68A',
    marginTop: 1,
    fontWeight: '500',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 16,
    marginTop: 6,
  },
  waveBar: {
    width: 3,
    height: 14,
    borderRadius: 2,
  },
  verseBox: {
    marginTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  verseSanskrit: {
    fontSize: 11,
    color: '#FEF3C7',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16,
  },
});
