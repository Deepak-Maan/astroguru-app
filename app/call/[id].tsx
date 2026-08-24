import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../../src/theme';
import { ASTROLOGERS } from '../../src/data/astrologers';
import { useWalletStore } from '../../src/store/walletStore';

export default function CallScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const astrologer = ASTROLOGERS.find((a) => a.id === id) || ASTROLOGERS[0];
  const balance = useWalletStore((s) => s.balance ?? 100);
  const debit = useWalletStore((s) => s.debit);

  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  // Calling Pulse Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Connect after 2.5 seconds
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 2500);

    return () => {
      pulseLoop.stop();
      clearTimeout(connectTimer);
    };
  }, []);

  // Call Duration Timer & Per-Minute Wallet Deduction
  useEffect(() => {
    if (callStatus !== 'connected') return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;
        // Deduct per-minute rate every 60 seconds
        if (next % 60 === 0) {
          debit(astrologer.pricing.callPerMin || 25, `Voice Call with ${astrologer.name}`);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [callStatus]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (_) {}
    setCallStatus('ended');
    setTimeout(() => {
      router.back();
    }, 1200);
  };

  const toggleMute = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    setIsSpeaker(!isSpeaker);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>AstroGuru Voice Consultation</Text>
          <View style={styles.ratePill}>
            <Text style={styles.rateText}>₹{astrologer.pricing.callPerMin || 25}/min • Wallet: ₹{Number(balance || 0).toFixed(0)}</Text>
          </View>
        </View>

        {/* Astrologer Avatar & Wave Pulse */}
        <View style={styles.centerSection}>
          <View style={styles.avatarPulseWrapper}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: callStatus === 'connected' ? 0.3 : 0.6,
                },
              ]}
            />
            <Image source={{ uri: astrologer.avatar }} style={styles.avatar} />
          </View>

          <Text style={styles.astrologerName}>{astrologer.name}</Text>
          <Text style={styles.astrologerSpecialties}>{astrologer.specialties.join(' • ')}</Text>

          {/* Status / Timer */}
          <View style={styles.timerBadge}>
            {callStatus === 'connecting' && <Text style={styles.statusConnecting}>📞 Connecting with Acharya…</Text>}
            {callStatus === 'connected' && <Text style={styles.statusConnected}>🟢 In Call: {formatTime(seconds)}</Text>}
            {callStatus === 'ended' && <Text style={styles.statusEnded}>Call Ended</Text>}
          </View>
        </View>

        {/* Controls Footer */}
        <View style={styles.controlsFooter}>
          <View style={styles.actionsRow}>
            {/* Mute Button */}
            <Pressable
              onPress={toggleMute}
              style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
            >
              <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎙️'}</Text>
              <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
            </Pressable>

            {/* Speaker Button */}
            <Pressable
              onPress={toggleSpeaker}
              style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
            >
              <Text style={styles.controlIcon}>{isSpeaker ? '🔊' : '🔈'}</Text>
              <Text style={styles.controlLabel}>{isSpeaker ? 'Speaker' : 'Earpiece'}</Text>
            </Pressable>

            {/* End Call Button */}
            <Pressable
              onPress={handleEndCall}
              style={({ pressed }) => [styles.endCallBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={{ fontSize: 26 }}>📞</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    gap: 6,
  },
  appTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  ratePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  rateText: {
    color: '#FDE68A',
    fontSize: 11,
    fontWeight: '700',
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  avatarPulseWrapper: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  pulseRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F59E0B',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#FFC107',
  },
  astrologerName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  astrologerSpecialties: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  timerBadge: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  statusConnecting: {
    color: '#FDE68A',
    fontSize: 13,
    fontWeight: '800',
  },
  statusConnected: {
    color: '#34D399',
    fontSize: 15,
    fontWeight: '900',
  },
  statusEnded: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
  },
  controlsFooter: {
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  controlBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  controlBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  controlIcon: {
    fontSize: 22,
  },
  controlLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  endCallBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '135deg' }],
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
});
