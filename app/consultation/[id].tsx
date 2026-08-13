import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../../src/theme';
import { ASTROLOGERS } from '../../src/data/astrologers';
import { Avatar } from '../../src/components/Avatar';
import { useWalletStore } from '../../src/store/walletStore';
import { useAuthStore } from '../../src/store/authStore';
import { formatCurrency } from '../../src/utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

import { getAstrologerByIdFromFirebase } from '../../src/services/firebaseAuthService';
import { initiateCallInFirebase, updateCallStatusInFirebase } from '../../src/services/firebaseRealtimeService';
import { showIncomingCallNotification } from '../../src/services/notificationService';
import { Astrologer } from '../../src/types';

export default function LiveConsultationScreen() {
  const router = useRouter();
  const { id, type = 'video', callId: paramCallId, role = 'seeker' } = useLocalSearchParams<{ id: string; type?: 'audio' | 'video'; callId?: string; role?: string }>();
  const [astrologer, setAstrologer] = useState<Astrologer>(() => ASTROLOGERS.find((a) => a.id === id) || ASTROLOGERS[0]);
  const [activeCallId, setActiveCallId] = useState(paramCallId || `call_${Date.now()}`);

  useEffect(() => {
    if (id) {
      getAstrologerByIdFromFirebase(String(id)).then((data) => {
        if (data) setAstrologer(data);
      });
    }
  }, [id]);

  const user = useAuthStore((s) => s.user);

  const debit = useWalletStore((s) => s.debit);
  const balance = useWalletStore((s) => s.balance);

  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isVideoOn, setIsVideoOn] = useState(type === 'video');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');
  const [showKundliOverlay, setShowKundliOverlay] = useState(false);

  const [seconds, setSeconds] = useState(0);
  const [billedMinutes, setBilledMinutes] = useState(1);

  // Animation drivers
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0.4)).current;

  // Initiate call in Firebase & notify Acharya when seeker starts call
  useEffect(() => {
    if (astrologer && role !== 'expert') {
      const seekerName = user?.name || 'Seeker';
      initiateCallInFirebase({
        callId: activeCallId,
        seekerId: user?.id ? String(user.id) : 'usr_seeker_demo',
        seekerName,
        astrologerId: astrologer.id,
        astrologerName: astrologer.name,
        type: type === 'video' ? 'video' : 'audio',
        ratePerMin: astrologer.pricePerMin,
      });

      showIncomingCallNotification({
        seekerName,
        type: type === 'video' ? 'video' : 'audio',
        callId: activeCallId,
      });
    }
  }, [astrologer?.id, activeCallId, role]);

  // Pulse animation while connecting
  useEffect(() => {
    if (callState === 'connecting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [callState]);

  // Audio wave animation during connected state
  useEffect(() => {
    if (callState === 'connected' && !isMuted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [callState, isMuted]);

  // Auto connect after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCallState('connected');
      if (astrologer) {
        updateCallStatusInFirebase(activeCallId, astrologer.id, 'connected');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [activeCallId, astrologer?.id]);

  // Call duration timer & billing engine
  useEffect(() => {
    if (callState !== 'connected') return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;
        // Bill every 60 seconds
        if (next > 0 && next % 60 === 0 && role !== 'expert') {
          setBilledMinutes((m) => m + 1);
          debit(astrologer.pricePerMin, `Live ${type.toUpperCase()} Consultation with ${astrologer.name}`);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [callState, astrologer, debit, type, role]);

  function handleEndCall() {
    setCallState('ended');
    if (astrologer) {
      updateCallStatusInFirebase(activeCallId, astrologer.id, 'ended');
    }
    setTimeout(() => {
      router.back();
    }, 1200);
  }

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Background Video / Audio Backdrop */}
      {isVideoOn ? (
        <View style={styles.videoBackground}>
          <LinearGradient
            colors={['#0F172A', '#1E293B', '#0F172A']}
            style={StyleSheet.absoluteFill}
          />
          {/* Simulated WebRTC Remote Video View */}
          <View style={styles.remoteVideoCanvas}>
            <Avatar name={astrologer.name} size={110} />
            <Text style={styles.remoteVideoName}>{astrologer.name}</Text>
            <View style={styles.liveIndicatorPill}>
              <View style={styles.greenDot} />
              <Text style={styles.liveIndicatorText}>HD WEBRTC LIVE STREAM</Text>
            </View>
          </View>

          {/* Self Video PIP Window */}
          <View style={styles.pipWindow}>
            <Avatar name={user?.name || 'You'} size={38} />
            <Text style={styles.pipLabel}>You ({cameraFacing})</Text>
          </View>
        </View>
      ) : (
        <LinearGradient
          colors={['#0F172A', '#1E293B', '#090D16']}
          style={StyleSheet.absoluteFill}
        >
          <View style={styles.audioCanvas}>
            <Animated.View style={[styles.avatarPulseRing, { transform: [{ scale: pulseAnim }] }]}>
              <Avatar name={astrologer.name} size={120} />
            </Animated.View>
            <Text style={styles.audioAstrologerName}>{astrologer.name}</Text>
            <Text style={styles.audioSpecialty}>{astrologer.specialties.join(' · ')}</Text>

            {/* Live Audio Waveform Indicator */}
            {callState === 'connected' && (
              <Animated.View style={[styles.waveRow, { opacity: waveAnim }]}>
                {[14, 28, 42, 20, 36, 18, 30].map((h, i) => (
                  <View key={i} style={[styles.waveBar, { height: h }]} />
                ))}
              </Animated.View>
            )}
          </View>
        </LinearGradient>
      )}

      {/* Top Header Overlay */}
      <SafeAreaView style={styles.topHeaderOverlay} edges={['top']}>
        <View style={styles.headerGlassCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerAstrologerName}>{astrologer.name}</Text>
            <Text style={styles.headerStatusText}>
              {callState === 'connecting'
                ? '⏳ Establishing WebRTC Connection…'
                : callState === 'ended'
                ? '🔴 Consultation Ended'
                : `⏱️ ${formatTimer(seconds)} · ₹${astrologer.pricePerMin * billedMinutes} charged`}
            </Text>
          </View>
          <Pressable
            onPress={() => setShowKundliOverlay(!showKundliOverlay)}
            style={styles.kundliOverlayBtn}
          >
            <Text style={styles.kundliOverlayBtnText}>🪐 Kundli Chart</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Kundli Chart Floating Drawer Overlay */}
      {showKundliOverlay && (
        <View style={styles.floatingKundliDrawer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.drawerTitle}>🪐 Live Seeker Kundli</Text>
            <Pressable onPress={() => setShowKundliOverlay(false)} style={styles.closeDrawerBtn}>
              <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>✕</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {[
              { label: 'Lagna Rashi', val: 'Mesha (Aries)' },
              { label: 'Moon Sign', val: 'Vrishabha (Taurus)' },
              { label: 'Current Dasha', val: 'Rahu - Jupiter (2026)' },
              { label: 'Sun Position', val: '10th House (Digbala)' },
            ].map((item) => (
              <View key={item.label} style={styles.kundliItemChip}>
                <Text style={styles.kundliChipLabel}>{item.label}</Text>
                <Text style={styles.kundliChipVal}>{item.val}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Bottom Control Bar */}
      <SafeAreaView style={styles.bottomControlOverlay} edges={['bottom']}>
        <View style={styles.controlsRow}>
          {/* Mute Button */}
          <Pressable
            onPress={() => setIsMuted(!isMuted)}
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          >
            <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎙️'}</Text>
            <Text style={styles.controlText}>{isMuted ? 'Muted' : 'Mic'}</Text>
          </Pressable>

          {/* Video Toggle Button */}
          <Pressable
            onPress={() => setIsVideoOn(!isVideoOn)}
            style={[styles.controlBtn, !isVideoOn && styles.controlBtnActive]}
          >
            <Text style={styles.controlIcon}>{isVideoOn ? '📹' : '🙈'}</Text>
            <Text style={styles.controlText}>{isVideoOn ? 'Video' : 'Cam Off'}</Text>
          </Pressable>

          {/* Camera Flip Button (Only when video is ON) */}
          {isVideoOn && (
            <Pressable
              onPress={() => setCameraFacing(cameraFacing === 'front' ? 'back' : 'front')}
              style={styles.controlBtn}
            >
              <Text style={styles.controlIcon}>🔄</Text>
              <Text style={styles.controlText}>Flip</Text>
            </Pressable>
          )}

          {/* Speaker Button */}
          <Pressable
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}
            style={[styles.controlBtn, !isSpeakerOn && styles.controlBtnActive]}
          >
            <Text style={styles.controlIcon}>{isSpeakerOn ? '🔊' : '🎧'}</Text>
            <Text style={styles.controlText}>{isSpeakerOn ? 'Speaker' : 'Earpiece'}</Text>
          </Pressable>

          {/* End Call Button */}
          <Pressable onPress={handleEndCall} style={styles.endCallBtn}>
            <Text style={styles.endCallIcon}>📞</Text>
            <Text style={styles.endCallText}>End</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  videoBackground: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  remoteVideoCanvas: { alignItems: 'center', gap: 12 },
  remoteVideoName: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  liveIndicatorPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.teal,
  },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  liveIndicatorText: { color: '#10B981', fontSize: 11, fontWeight: '900' },
  pipWindow: {
    position: 'absolute', top: 110, right: 20, width: 90, height: 120,
    borderRadius: radius.lg, backgroundColor: 'rgba(15,23,42,0.85)',
    borderWidth: 2, borderColor: colors.teal, alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  pipLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '700' },
  audioCanvas: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  avatarPulseRing: {
    borderRadius: 80, padding: 8, backgroundColor: 'rgba(5,150,105,0.15)',
    borderWidth: 2, borderColor: 'rgba(5,150,105,0.4)',
  },
  audioAstrologerName: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
  audioSpecialty: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  waveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  waveBar: { width: 6, backgroundColor: colors.teal, borderRadius: 3 },
  topHeaderOverlay: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  headerGlassCard: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    backgroundColor: 'rgba(15,23,42,0.85)', borderRadius: radius.xl,
    borderWidth: 1, borderColor: 'rgba(255,255,254,0.15)', gap: spacing.sm,
  },
  headerAstrologerName: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  headerStatusText: { fontSize: 12, color: '#10B981', fontWeight: '700', marginTop: 2 },
  kundliOverlayBtn: {
    backgroundColor: 'rgba(217,119,6,0.2)', paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.gold,
  },
  kundliOverlayBtnText: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  floatingKundliDrawer: {
    position: 'absolute', top: 120, left: spacing.md, right: spacing.md,
    backgroundColor: 'rgba(15,23,42,0.95)', borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1.5, borderColor: colors.gold, gap: 4, zIndex: 99,
  },
  drawerTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  closeDrawerBtn: { padding: 4 },
  kundliItemChip: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.md, padding: 10,
    marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', gap: 2,
  },
  kundliChipLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '700' },
  kundliChipVal: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  bottomControlOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  controlsRow: {
    flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center',
    paddingVertical: spacing.lg, backgroundColor: 'rgba(15,23,42,0.92)',
    borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  controlBtn: { alignItems: 'center', gap: 4, width: 60 },
  controlBtnActive: { opacity: 0.4 },
  controlIcon: { fontSize: 24 },
  controlText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  endCallBtn: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center', gap: 2,
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6,
  },
  endCallIcon: { fontSize: 22 },
  endCallText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
});
