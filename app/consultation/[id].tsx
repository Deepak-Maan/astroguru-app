import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, typography } from '../../src/theme';
import { ASTROLOGERS } from '../../src/data/astrologers';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { useWalletStore } from '../../src/store/walletStore';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { useRewardsStore } from '../../src/store/rewardsStore';
import { formatCurrency } from '../../src/utils';
import { getAstrologerByIdFromFirebase } from '../../src/services/firebaseAuthService';
import {
  initiateCallInFirebase,
  updateCallStatusInFirebase,
} from '../../src/services/firebaseRealtimeService';
import { showIncomingCallNotification } from '../../src/services/notificationService';
import { firebaseDb } from '../../src/services/firebaseConfig';
import { ref, onValue, off } from 'firebase/database';
import { Astrologer } from '../../src/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const IN_CALL_RECHARGE_OPTIONS = [
  { amount: 100, label: '₹100 (4 Mins)', bonus: 0 },
  { amount: 250, label: '₹250 (10 Mins)', bonus: 25 },
  { amount: 500, label: '₹500 (20 Mins)', bonus: 75 },
];

export default function LiveConsultationScreen() {
  const router = useRouter();
  const { id, type = 'video', callId: paramCallId, role = 'seeker' } = useLocalSearchParams<{
    id: string;
    type?: 'audio' | 'video';
    callId?: string;
    role?: string;
  }>();

  const [astrologer, setAstrologer] = useState<Astrologer>(
    () => ASTROLOGERS.find((a) => a.id === id) || ASTROLOGERS[0]
  );
  const [activeCallId, setActiveCallId] = useState(paramCallId || `call_${Date.now()}`);

  useEffect(() => {
    if (id) {
      getAstrologerByIdFromFirebase(String(id)).then((data) => {
        if (data) setAstrologer(data);
      });
    }
  }, [id]);

  const user = useAuthStore((s) => s.user);
  const kundli = useUserStore((s) => s.kundli);

  const debit = useWalletStore((s) => s.debit);
  const balance = useWalletStore((s) => s.balance);
  const topup = useWalletStore((s) => s.topup);
  const addCoins = useRewardsStore((s) => s.addCoins);

  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isVideoOn, setIsVideoOn] = useState(type === 'video');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');
  const [showKundliOverlay, setShowKundliOverlay] = useState(false);
  const [showInCallRecharge, setShowInCallRecharge] = useState(false);
  const [showRemediesModal, setShowRemediesModal] = useState(false);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [rating, setRating] = useState(5);

  const [seconds, setSeconds] = useState(0);
  const [billedMinutes, setBilledMinutes] = useState(0);
  const [lowBalanceAlert, setLowBalanceAlert] = useState(false);

  // Live Remedies list sent during call
  const [liveRemedies, setLiveRemedies] = useState<string[]>([
    '🪔 Light a pure cow ghee diya facing East at Sandhya Kaal',
    '🕊️ Feed green fodder / soaked moong dal to cows on Wednesday',
  ]);
  const [newRemedyInput, setNewRemedyInput] = useState('');

  // Animation drivers
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ring1Anim = useRef(new Animated.Value(1)).current;
  const ring2Anim = useRef(new Animated.Value(1)).current;
  const waveHeights = useRef(Array.from({ length: 14 }, () => new Animated.Value(8))).current;

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

  // Real-time Firebase Call Status Synchronizer
  useEffect(() => {
    if (!activeCallId) return;
    const cleanCallId = String(activeCallId).replace(/[.#$\[\]\/]/g, '_');
    const callRef = ref(firebaseDb, `calls/${cleanCallId}`);

    const unsubscribe = onValue(callRef, (snapshot) => {
      const callData = snapshot.val();
      if (!callData) return;

      if (callData.status === 'connected') {
        setCallState('connected');
      } else if (callData.status === 'ended' || callData.status === 'declined') {
        setCallState('ended');
        setShowRecapModal(true);
      }
    });

    // Auto-connect fallback if peer is active
    const timer = setTimeout(() => {
      if (callState === 'connecting') {
        setCallState('connected');
        if (astrologer) {
          updateCallStatusInFirebase(activeCallId, astrologer.id, 'connected');
        }
      }
    }, 2800);

    return () => {
      off(callRef);
      clearTimeout(timer);
    };
  }, [activeCallId, astrologer?.id]);

  // Calling Ring Animations
  useEffect(() => {
    if (callState === 'connecting') {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(ring1Anim, { toValue: 1.45, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(ring1Anim, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(ring2Anim, { toValue: 1.75, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(ring2Anim, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }
  }, [callState]);

  // Natural Audio Wave Spectrum
  useEffect(() => {
    if (callState === 'connected' && !isMuted) {
      const waveLoops = waveHeights.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 14 + ((i * 7) % 24),
              duration: 180 + (i % 5) * 60,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 6 + (i % 3) * 4,
              duration: 180 + (i % 5) * 60,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
          ])
        )
      );
      waveLoops.forEach((loop) => loop.start());
      return () => waveLoops.forEach((loop) => loop.stop());
    }
  }, [callState, isMuted]);

  const lastBilledMinuteRef = useRef(0);

  // Call duration timer & idempotent per-minute billing engine
  useEffect(() => {
    if (callState !== 'connected') return;

    // Bill Minute 1 upon call connect
    if (role !== 'expert' && lastBilledMinuteRef.current < 1 && astrologer) {
      const freshBalance = useWalletStore.getState().balance;
      const rate = astrologer.pricePerMin || 25;
      if (freshBalance < rate) {
        useWalletStore.getState().topup(100, 'Welcome Consultation Bonus');
      }
      const ok = useWalletStore.getState().debit(
        rate,
        `Live ${type === 'video' ? 'Video' : 'Audio'} Call · ${astrologer.name} (Min 1)`
      );
      if (ok) {
        lastBilledMinuteRef.current = 1;
        setBilledMinutes(1);
      } else {
        setLowBalanceAlert(true);
        handleEndCall();
        return;
      }
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;
        // Bill subsequent minutes at exactly 60s, 120s, 180s... (Minute 2, 3, 4...)
        const targetMinute = Math.floor(next / 60) + 1;
        if (role !== 'expert' && astrologer && targetMinute > lastBilledMinuteRef.current) {
          const freshBalance = useWalletStore.getState().balance;
          const rate = astrologer.pricePerMin || 25;
          if (freshBalance < rate) {
            setLowBalanceAlert(true);
            try {
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
            } catch (_) {}
            handleEndCall();
            return prev;
          }

          const ok = useWalletStore.getState().debit(
            rate,
            `Live ${type === 'video' ? 'Video' : 'Audio'} Call · ${astrologer.name} (Min ${targetMinute})`
          );
          if (ok) {
            lastBilledMinuteRef.current = targetMinute;
            setBilledMinutes(targetMinute);
          } else {
            setLowBalanceAlert(true);
            handleEndCall();
            return prev;
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [callState, astrologer?.id, astrologer?.name, astrologer?.pricePerMin, role, type]);

  function handleEndCall() {
    setCallState('ended');
    if (astrologer) {
      updateCallStatusInFirebase(activeCallId, astrologer.id, 'ended');
    }
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (_) {}
    setShowRecapModal(true);
  }

  function handleQuickRecharge(amount: number, bonus: number) {
    topup(amount + bonus, `In-Call Express Wallet Topup`);
    setShowInCallRecharge(false);
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (_) {}
    Alert.alert('Wallet Recharged', `₹${amount + bonus} added to your balance instantly! Consultation continues seamlessly.`);
  }

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalCharged = astrologer.pricePerMin * billedMinutes;

  return (
    <View style={styles.container}>
      {/* Background Video / Audio Backdrop */}
      {isVideoOn ? (
        <View style={styles.videoBackground}>
          <LinearGradient
            colors={['#0F172A', '#1E293B', '#0F172A']}
            style={StyleSheet.absoluteFill}
          />
          {/* HD Video Remote Stream Canvas */}
          <View style={styles.remoteVideoCanvas}>
            <Avatar name={astrologer.name} size={110} />
            <Text style={styles.remoteVideoName}>{astrologer.name}</Text>
            <View style={styles.liveIndicatorPill}>
              <View style={styles.greenDot} />
              <Text style={styles.liveIndicatorText}>HD WEBRTC 60FPS · 28ms LATENCY</Text>
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
          colors={['#050811', '#17122B', '#0B1120']}
          style={styles.audioCanvas}
        >
          {/* Animated Glow Rings while Connecting */}
          {callState === 'connecting' && (
            <>
              <Animated.View
                style={[
                  styles.auraRing,
                  {
                    transform: [{ scale: ring2Anim }],
                    opacity: 0.25,
                    borderColor: colors.gold,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.auraRing,
                  {
                    transform: [{ scale: ring1Anim }],
                    opacity: 0.45,
                    borderColor: '#10B981',
                  },
                ]}
              />
            </>
          )}

          <Animated.View style={[styles.avatarPulseRing, { transform: [{ scale: pulseAnim }] }]}>
            <Avatar name={astrologer.name} size={130} />
          </Animated.View>

          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={styles.audioAstrologerName}>{astrologer.name}</Text>
            <Text style={styles.audioSpecialty}>
              {astrologer.specialties?.join(' · ') || 'Senior Vedic Jyotishi'}
            </Text>

            <View style={styles.statusCallPill}>
              <View style={[styles.statusCallDot, { backgroundColor: callState === 'connected' ? '#10B981' : '#F59E0B' }]} />
              <Text style={styles.statusCallText}>
                {callState === 'connecting' ? 'RINGING & ESTABLISHING HD AUDIO…' : 'CONNECTED · ENCRYPTED VOICE'}
              </Text>
            </View>
          </View>

          {/* Voice Spectrum Wave Visualizer */}
          {callState === 'connected' && (
            <View style={styles.spectrumRow}>
              {waveHeights.map((anim, idx) => (
                <Animated.View
                  key={idx}
                  style={[
                    styles.spectrumBar,
                    {
                      height: isMuted ? 4 : anim,
                      opacity: isMuted ? 0.3 : 0.95,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </LinearGradient>
      )}

      {/* Top Header Overlay */}
      <SafeAreaView style={styles.topHeaderOverlay} edges={['top']}>
        <View style={styles.headerGlassCard}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.headerAstrologerName}>{astrologer.name}</Text>
              <View style={styles.verifiedBadge}>
                <Text style={{ fontSize: 10 }}>✓</Text>
              </View>
            </View>
            <Text style={styles.headerStatusText}>
              {callState === 'connecting'
                ? '⏳ Ringing Astrologer…'
                : callState === 'ended'
                ? '🔴 Call Ended'
                : `⏱️ ${formatTimer(seconds)} · ₹${totalCharged} billed (Bal: ₹${balance})`}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 6 }}>
            {/* Quick Recharge Button */}
            <Pressable
              onPress={() => setShowInCallRecharge(true)}
              style={styles.addMoneyPill}
            >
              <Text style={styles.addMoneyPillText}>+ ₹ Add</Text>
            </Pressable>

            {/* Kundli Peek Button */}
            <Pressable
              onPress={() => setShowKundliOverlay(!showKundliOverlay)}
              style={styles.kundliOverlayBtn}
            >
              <Text style={styles.kundliOverlayBtnText}>🪐 Kundli</Text>
            </Pressable>
          </View>
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
              { label: 'Lagna Rashi', val: kundli?.lagna || 'Mesha (Aries)' },
              { label: 'Moon Sign', val: kundli?.rashi || 'Vrishabha (Taurus)' },
              { label: 'Current Dasha', val: kundli?.dasha || 'Rahu - Jupiter (2026)' },
              { label: 'Sun Position', val: '10th House (Digbala)' },
              { label: 'Nakshatra', val: 'Rohini (Pada 2)' },
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
            onPress={() => {
              setIsMuted(!isMuted);
              try {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (_) {}
            }}
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          >
            <View style={[styles.controlIconCircle, isMuted && { backgroundColor: '#DC2626' }]}>
              <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎙️'}</Text>
            </View>
            <Text style={styles.controlText}>{isMuted ? 'Muted' : 'Mute'}</Text>
          </Pressable>

          {/* Video Toggle Button */}
          <Pressable
            onPress={() => {
              setIsVideoOn(!isVideoOn);
              try {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (_) {}
            }}
            style={[styles.controlBtn, !isVideoOn && styles.controlBtnActive]}
          >
            <View style={[styles.controlIconCircle, !isVideoOn && { backgroundColor: '#475569' }]}>
              <Text style={styles.controlIcon}>{isVideoOn ? '📹' : '🙈'}</Text>
            </View>
            <Text style={styles.controlText}>{isVideoOn ? 'Camera' : 'Cam Off'}</Text>
          </Pressable>

          {/* Camera Flip Button (Only when video is ON) */}
          {isVideoOn && (
            <Pressable
              onPress={() => {
                setCameraFacing(cameraFacing === 'front' ? 'back' : 'front');
                try {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (_) {}
              }}
              style={styles.controlBtn}
            >
              <View style={styles.controlIconCircle}>
                <Text style={styles.controlIcon}>🔄</Text>
              </View>
              <Text style={styles.controlText}>Flip</Text>
            </Pressable>
          )}

          {/* Speaker Button */}
          <Pressable
            onPress={() => {
              setIsSpeakerOn(!isSpeakerOn);
              try {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (_) {}
            }}
            style={[styles.controlBtn, !isSpeakerOn && styles.controlBtnActive]}
          >
            <View style={[styles.controlIconCircle, isSpeakerOn && { backgroundColor: colors.teal }]}>
              <Text style={styles.controlIcon}>{isSpeakerOn ? '🔊' : '🎧'}</Text>
            </View>
            <Text style={styles.controlText}>{isSpeakerOn ? 'Speaker' : 'Earpiece'}</Text>
          </Pressable>

          {/* Live Remedies Button */}
          <Pressable
            onPress={() => setShowRemediesModal(true)}
            style={styles.controlBtn}
          >
            <View style={[styles.controlIconCircle, { backgroundColor: '#78350F' }]}>
              <Text style={styles.controlIcon}>🪔</Text>
            </View>
            <Text style={styles.controlText}>Remedies</Text>
          </Pressable>

          {/* End Call Button */}
          <Pressable onPress={handleEndCall} style={styles.endCallBtn}>
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.endCallIcon}>📞</Text>
            <Text style={styles.endCallText}>End</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* ── IN-CALL EXPRESS RECHARGE MODAL ── */}
      <Modal visible={showInCallRecharge} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.rechargeCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.rechargeTitle}>⚡ In-Call Express Topup</Text>
              <Pressable onPress={() => setShowInCallRecharge(false)}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>✕</Text>
              </Pressable>
            </View>
            <Text style={styles.rechargeSub}>Add balance instantly to keep your consultation going:</Text>

            <View style={{ gap: 8, marginVertical: 10 }}>
              {IN_CALL_RECHARGE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.amount}
                  onPress={() => handleQuickRecharge(opt.amount, opt.bonus)}
                  style={styles.quickRechargeRow}
                >
                  <View>
                    <Text style={styles.quickRechargeAmount}>{opt.label}</Text>
                    {opt.bonus > 0 && (
                      <Text style={styles.quickRechargeBonus}>🎉 +₹{opt.bonus} Free Bonus</Text>
                    )}
                  </View>
                  <View style={styles.quickPayBtn}>
                    <Text style={styles.quickPayBtnText}>Add Balance</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* ── LIVE REMEDIES & NOTEPAD MODAL ── */}
      <Modal visible={showRemediesModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.rechargeCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.rechargeTitle}>🪔 Prescribed Remedies</Text>
              <Pressable onPress={() => setShowRemediesModal(false)}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 240, marginVertical: 10 }}>
              {liveRemedies.map((rem, idx) => (
                <View key={idx} style={styles.remedyItemRow}>
                  <Text style={{ fontSize: 14 }}>✨</Text>
                  <Text style={styles.remedyItemText}>{rem}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TextInput
                value={newRemedyInput}
                onChangeText={setNewRemedyInput}
                placeholder="Add remedy note…"
                placeholderTextColor="#94A3B8"
                style={styles.remedyInput}
              />
              <Button
                label="Add"
                variant="gold"
                size="sm"
                fullWidth={false}
                onPress={() => {
                  if (newRemedyInput.trim()) {
                    setLiveRemedies([...liveRemedies, newRemedyInput.trim()]);
                    setNewRemedyInput('');
                  }
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ── CONSULTATION SUMMARY & RATING RECAP MODAL ── */}
      <Modal visible={showRecapModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.recapCard}>
            <LinearGradient
              colors={['#1E1B4B', '#0F172A']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.recapIconBox}>
              <Text style={{ fontSize: 32 }}>✨</Text>
            </View>

            <Text style={styles.recapTitle}>Consultation Completed</Text>
            <Text style={styles.recapSub}>
              Your session with {astrologer.name} has concluded.
            </Text>

            {/* Metrics */}
            <View style={styles.recapMetricsBox}>
              <View style={styles.recapMetricItem}>
                <Text style={styles.metricLabel}>Duration</Text>
                <Text style={styles.metricVal}>{formatTimer(seconds)}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.recapMetricItem}>
                <Text style={styles.metricLabel}>Billed</Text>
                <Text style={[styles.metricVal, { color: colors.gold }]}>₹{totalCharged}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.recapMetricItem}>
                <Text style={styles.metricLabel}>Rate</Text>
                <Text style={styles.metricVal}>₹{astrologer.pricePerMin}/m</Text>
              </View>
            </View>

            {/* 5-Star Interactive Rating */}
            <View style={{ alignItems: 'center', marginVertical: 8 }}>
              <Text style={{ color: '#FDE68A', fontSize: 11, fontWeight: '700', marginBottom: 6 }}>
                Rate Your Experience ({rating} Stars):
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {[1, 2, 3, 4, 5].map((st) => (
                  <Pressable
                    key={st}
                    onPress={() => {
                      setRating(st);
                      try {
                        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch (_) {}
                    }}
                  >
                    <Text style={{ fontSize: 28, opacity: st <= rating ? 1 : 0.35 }}>
                      ⭐
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Button
              label="Done & Return to Home"
              variant="gold"
              size="md"
              onPress={() => {
                try {
                  addCoins(25);
                } catch (_) {}
                setShowRecapModal(false);
                router.replace('/(tabs)');
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050811' },
  videoBackground: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  remoteVideoCanvas: { alignItems: 'center', gap: 12 },
  remoteVideoName: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.teal,
  },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  liveIndicatorText: { color: '#10B981', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  pipWindow: {
    position: 'absolute',
    top: 110,
    right: 20,
    width: 90,
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderWidth: 2,
    borderColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pipLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '700' },
  audioCanvas: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  auraRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
  },
  avatarPulseRing: {
    borderRadius: 85,
    padding: 8,
    backgroundColor: 'rgba(217,119,6,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(217,119,6,0.5)',
  },
  audioAstrologerName: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
  audioSpecialty: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  statusCallPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  statusCallDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusCallText: { fontSize: 9.5, fontWeight: '800', color: '#CBD5E1', letterSpacing: 0.3 },
  spectrumRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 18, height: 36 },
  spectrumBar: { width: 5, backgroundColor: colors.gold, borderRadius: 3 },
  topHeaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  headerGlassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,254,0.15)',
    gap: spacing.sm,
  },
  headerAstrologerName: { fontSize: 15, fontWeight: '900', color: '#FFFFFF' },
  verifiedBadge: {
    backgroundColor: '#059669',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerStatusText: { fontSize: 11, color: '#10B981', fontWeight: '700', marginTop: 2 },
  addMoneyPill: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  addMoneyPillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  kundliOverlayBtn: {
    backgroundColor: 'rgba(217,119,6,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  kundliOverlayBtnText: { color: colors.gold, fontSize: 11, fontWeight: '800' },
  floatingKundliDrawer: {
    position: 'absolute',
    top: 120,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.gold,
    gap: 4,
    zIndex: 99,
  },
  drawerTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  closeDrawerBtn: { padding: 4 },
  kundliItemChip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    padding: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    gap: 2,
  },
  kundliChipLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '700' },
  kundliChipVal: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  bottomControlOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  controlBtn: { alignItems: 'center', gap: 4, width: 56 },
  controlBtnActive: { opacity: 0.6 },
  controlIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIcon: { fontSize: 20 },
  controlText: { color: '#CBD5E1', fontSize: 10, fontWeight: '700' },
  endCallBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  endCallIcon: { fontSize: 20 },
  endCallText: { color: '#FFFFFF', fontSize: 9.5, fontWeight: '900' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  rechargeCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  rechargeTitle: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  rechargeSub: { fontSize: 11, color: '#94A3B8', marginTop: 3 },
  quickRechargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickRechargeAmount: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  quickRechargeBonus: { fontSize: 10, color: '#10B981', fontWeight: '700' },
  quickPayBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  quickPayBtnText: { color: '#1A1A1A', fontSize: 11, fontWeight: '900' },
  remedyItemRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 8,
    borderRadius: radius.md,
    marginBottom: 6,
  },
  remedyItemText: { fontSize: 12, color: '#FEF3C7', flex: 1, lineHeight: 16 },
  remedyInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#FFFFFF',
    fontSize: 12,
  },
  recapCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    gap: 8,
  },
  recapIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(217,119,6,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  recapTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  recapSub: {
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
  },
  recapMetricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 10,
    marginVertical: 6,
    width: '100%',
  },
  recapMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '700',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
