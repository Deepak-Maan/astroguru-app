import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { formatCurrency } from '../../src/utils';
import { Astrologer, ChatMessage } from '../../src/types';
import { getAstrologerByIdFromFirebase } from '../../src/services/firebaseAuthService';
import { initiateCallInFirebase, updateCallStatusInFirebase } from '../../src/services/firebaseRealtimeService';
import { showIncomingCallNotification } from '../../src/services/notificationService';
import { callAudioService } from '../../src/services/speech/callAudioService';
import { generateAstrologyAiReply } from '../../src/services/ai/astrologyAiEngine';
import { RASHIS } from '../../src/data/rashis';
import { NAKSHATRAS } from '../../src/data/nakshatras';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const QUICK_CONSULTATION_PROMPTS = [
  '💼 Career & Promotion',
  '💍 Marriage & Relationship',
  '💰 Wealth & Business Growth',
  '🪐 Shani Sade Sati Status',
  '💎 Best Gemstone for Me',
  '📿 Immediate Dosha Remedy',
];

export default function LiveConsultationScreen() {
  const router = useRouter();
  const { id, type = 'audio', callId: paramCallId, role = 'seeker' } = useLocalSearchParams<{
    id: string;
    type?: 'audio' | 'video';
    callId?: string;
    role?: string;
  }>();

  const [astrologer, setAstrologer] = useState<Astrologer>(() => ASTROLOGERS.find((a) => a.id === id) || ASTROLOGERS[0]);
  const [activeCallId, setActiveCallId] = useState(paramCallId || `call_${Date.now()}`);

  const user = useAuthStore((s) => s.user);
  const kundli = useUserStore((s) => s.kundli);
  const profile = useUserStore((s) => s.profile);
  const debit = useWalletStore((s) => s.debit);
  const topup = useWalletStore((s) => s.topup);
  const balance = useWalletStore((s) => s.balance);

  // Call state machine
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [speechState, setSpeechState] = useState<'idle' | 'astrologer_speaking' | 'listening' | 'analyzing'>('idle');
  const [liveAstrologerSpeech, setLiveAstrologerSpeech] = useState<string>('');
  const [seekerSpokenText, setSeekerSpokenText] = useState<string>('');
  const [callHistory, setCallHistory] = useState<ChatMessage[]>([]);

  // Hardware/Media controls
  const [isVideoOn, setIsVideoOn] = useState(type === 'video');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');
  const [showKundliOverlay, setShowKundliOverlay] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [manualInputVal, setManualInputVal] = useState('');

  // Call duration and billing
  const [seconds, setSeconds] = useState(0);
  const [billedMinutes, setBilledMinutes] = useState(1);

  // Animation drivers
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0.3)).current;
  const waveAnim2 = useRef(new Animated.Value(0.5)).current;
  const waveAnim3 = useRef(new Animated.Value(0.8)).current;
  const waveAnim4 = useRef(new Animated.Value(0.4)).current;
  const waveAnim5 = useRef(new Animated.Value(0.6)).current;

  // Fetch astrologer data
  useEffect(() => {
    if (id) {
      getAstrologerByIdFromFirebase(String(id)).then((data) => {
        if (data) setAstrologer(data);
      });
    }
  }, [id]);

  // Visual Equalizer animations
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (speechState === 'astrologer_speaking' || speechState === 'listening') {
      loop = Animated.loop(
        Animated.stagger(120, [
          Animated.sequence([
            Animated.timing(waveAnim1, { toValue: 1.3, duration: 280, useNativeDriver: false }),
            Animated.timing(waveAnim1, { toValue: 0.3, duration: 280, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim2, { toValue: 1.5, duration: 320, useNativeDriver: false }),
            Animated.timing(waveAnim2, { toValue: 0.4, duration: 320, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim3, { toValue: 1.6, duration: 360, useNativeDriver: false }),
            Animated.timing(waveAnim3, { toValue: 0.5, duration: 360, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim4, { toValue: 1.4, duration: 300, useNativeDriver: false }),
            Animated.timing(waveAnim4, { toValue: 0.3, duration: 300, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim5, { toValue: 1.2, duration: 340, useNativeDriver: false }),
            Animated.timing(waveAnim5, { toValue: 0.2, duration: 340, useNativeDriver: false }),
          ]),
        ])
      );
      loop.start();
    } else {
      waveAnim1.setValue(0.3);
      waveAnim2.setValue(0.5);
      waveAnim3.setValue(0.8);
      waveAnim4.setValue(0.4);
      waveAnim5.setValue(0.6);
    }
    return () => loop?.stop();
  }, [speechState]);

  // Pulse animation while connecting
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (callState === 'connecting') {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      loop.start();
    }
    return () => loop?.stop();
  }, [callState]);

  // 1. INITIATE CALL & PLAY RINGTONE
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

      // Play authentic telephone ringtone while connecting
      callAudioService.playRingtone();
    }

    return () => {
      callAudioService.cleanupAll();
    };
  }, [astrologer?.id, activeCallId, role]);

  // 2. ANSWER CALL & VOCALIZE GREETING
  const handleAstrologerGreeting = useCallback(() => {
    const seekerFirstName = user?.name ? user.name.split(' ')[0] : 'Seeker';
    const rashiName = kundli ? RASHIS[kundli.moonRashiIndex].english : 'Aapki Rashi';
    const greeting = `Pranam ${seekerFirstName} ji! Main Acharya ${astrologer.name} bol raha hoon. Swagat hai. Mere samne aapki ${rashiName} rashi ki kundli khuli hui hai. Batayein, aaj kis vishay mein margdarshan chahiye?`;

    setLiveAstrologerSpeech(greeting);
    setSpeechState('astrologer_speaking');

    callAudioService.speakText(greeting, {
      onStart: () => setSpeechState('astrologer_speaking'),
      onDone: () => {
        setSpeechState('listening');
        startListeningToSeeker();
      },
      isSpeaker: isSpeakerOn,
    });
  }, [astrologer.name, user?.name, kundli, isSpeakerOn]);

  // 3. LISTEN TO SEEKER'S VOICE VIA MIC
  const startListeningToSeeker = useCallback(() => {
    if (isMuted) {
      setSpeechState('idle');
      return;
    }

    setSpeechState('listening');
    setSeekerSpokenText('');

    callAudioService.startListening({
      onResult: (transcript, isFinal) => {
        setSeekerSpokenText(transcript);
        if (isFinal && transcript.trim().length > 3) {
          processSpokenQuestion(transcript.trim());
        }
      },
      onError: () => {
        setSpeechState('idle');
      },
      onEnd: () => {
        // Recognition cycle completed
      },
    });
  }, [isMuted]);

  // 4. PROCESS SEEKER'S QUESTION & VOCALIZE ASTROLOGICAL ANSWER
  const processSpokenQuestion = async (question: string) => {
    callAudioService.stopListening();
    setSpeechState('analyzing');

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: question,
      at: Date.now(),
    };
    const updatedHistory = [...callHistory, userMsg];
    setCallHistory(updatedHistory);

    try {
      // Synthesize authentic Jyotish response based on real birth chart
      const reply = await generateAstrologyAiReply({
        currentMessage: question,
        history: updatedHistory,
        astrologer,
        kundli,
        profile,
      });

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: reply,
        at: Date.now(),
      };
      setCallHistory([...updatedHistory, aiMsg]);
      setLiveAstrologerSpeech(reply);
      setSpeechState('astrologer_speaking');

      // Vocalize response through astrologer voice
      callAudioService.speakText(reply, {
        onStart: () => setSpeechState('astrologer_speaking'),
        onDone: () => {
          setSpeechState('listening');
          startListeningToSeeker();
        },
        isSpeaker: isSpeakerOn,
      });
    } catch (e) {
      const fallback = `Aapki kundli ke anusar abhi graha dasha anukool hai. Dhairya aur niyam se kaam karein, labh hoga. Koi aur prashna pooch sakte hain.`;
      setLiveAstrologerSpeech(fallback);
      callAudioService.speakText(fallback, {
        onDone: () => {
          setSpeechState('listening');
          startListeningToSeeker();
        },
        isSpeaker: isSpeakerOn,
      });
    }
  };

  // Connect after 2.5s simulated ringing
  useEffect(() => {
    const timer = setTimeout(() => {
      callAudioService.stopRingtone();
      callAudioService.playConnectChime();
      setCallState('connected');

      if (astrologer) {
        updateCallStatusInFirebase(activeCallId, astrologer.id, 'connected');
      }

      // Astrologer starts speaking immediately
      setTimeout(() => {
        handleAstrologerGreeting();
      }, 600);
    }, 2600);

    return () => clearTimeout(timer);
  }, [activeCallId, astrologer?.id, handleAstrologerGreeting]);

  // Call duration timer & billing engine
  useEffect(() => {
    if (callState !== 'connected') return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;
        // Bill every 60 seconds
        if (next > 0 && next % 60 === 0 && role !== 'expert') {
          setBilledMinutes((m) => m + 1);
          debit(astrologer.pricePerMin, `Live Voice Call with ${astrologer.name}`);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [callState, astrologer, debit, role]);

  // Handle Mute toggle
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      callAudioService.stopListening();
      if (speechState === 'listening') setSpeechState('idle');
    } else {
      if (speechState === 'idle') {
        startListeningToSeeker();
      }
    }
  };

  // Handle Speaker toggle
  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  // End Call
  const handleEndCall = () => {
    callAudioService.cleanupAll();
    callAudioService.playEndTone();
    setCallState('ended');

    if (astrologer) {
      updateCallStatusInFirebase(activeCallId, astrologer.id, 'ended');
    }

    setShowSummaryModal(true);
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Background Video or Audio Backdrop */}
      {isVideoOn ? (
        <View style={styles.videoBackground}>
          <LinearGradient
            colors={['#0F172A', '#1E293B', '#0F172A']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.remoteVideoCanvas}>
            <Animated.View style={[styles.avatarPulseRing, { transform: [{ scale: speechState === 'astrologer_speaking' ? pulseAnim : 1 }] }]}>
              <Avatar uri={astrologer.avatar} name={astrologer.name} size={110} />
            </Animated.View>
            <Text style={styles.remoteVideoName}>{astrologer.name}</Text>
            <View style={styles.liveIndicatorPill}>
              <View style={styles.greenDot} />
              <Text style={styles.liveIndicatorText}>HD WEBRTC LIVE STREAM</Text>
            </View>
          </View>

          {/* Self PIP Window */}
          <View style={styles.pipWindow}>
            <Avatar name={user?.name || 'You'} size={38} />
            <Text style={styles.pipLabel}>You ({cameraFacing})</Text>
          </View>
        </View>
      ) : (
        <LinearGradient
          colors={['#0A0C16', '#12172F', '#080A12']}
          style={StyleSheet.absoluteFill}
        >
          <View style={styles.audioCanvas}>
            {/* Pulsing Astrologer Persona Ring */}
            <Animated.View
              style={[
                styles.avatarPulseRing,
                {
                  transform: [{ scale: speechState === 'astrologer_speaking' || callState === 'connecting' ? pulseAnim : 1 }],
                  borderColor: speechState === 'astrologer_speaking' ? '#FCD34D' : speechState === 'listening' ? '#34D399' : 'rgba(129, 140, 248, 0.4)',
                },
              ]}
            >
              <Avatar uri={astrologer.avatar} name={astrologer.name} size={130} />
            </Animated.View>

            <Text style={styles.audioAstrologerName}>{astrologer.name}</Text>
            <Text style={styles.audioSpecialty}>{astrologer.specialties.slice(0, 2).join(' · ')}</Text>

            {/* Real-time Status Badge */}
            <View style={[
              styles.speechStatusPill,
              speechState === 'astrologer_speaking' && { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: '#F59E0B' },
              speechState === 'listening' && { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10B981' },
              speechState === 'analyzing' && { backgroundColor: 'rgba(99, 102, 241, 0.2)', borderColor: '#6366F1' },
            ]}>
              <Text style={styles.speechStatusDot}>
                {speechState === 'astrologer_speaking' ? '🔊' : speechState === 'listening' ? '🎙️' : speechState === 'analyzing' ? '🪐' : '⏳'}
              </Text>
              <Text style={styles.speechStatusText}>
                {callState === 'connecting'
                  ? 'RINGING ASTROLOGER...'
                  : speechState === 'astrologer_speaking'
                  ? 'ACHARYA IS SPEAKING...'
                  : speechState === 'listening'
                  ? 'LISTENING TO YOU... SPEAK NOW'
                  : speechState === 'analyzing'
                  ? 'READING YOUR KUNDLI...'
                  : 'CALL ACTIVE'}
              </Text>
            </View>

            {/* Live Interactive Equalizer Waveform */}
            {callState === 'connected' && (
              <View style={styles.waveContainer}>
                {[waveAnim1, waveAnim2, waveAnim3, waveAnim4, waveAnim5, waveAnim2, waveAnim4].map((anim, idx) => (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.waveBar,
                      {
                        transform: [{ scaleY: anim }],
                        backgroundColor: speechState === 'astrologer_speaking' ? '#FCD34D' : speechState === 'listening' ? '#34D399' : '#818CF8',
                      },
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Live Subtitle Transcript Card */}
            {callState === 'connected' && (
              <View style={styles.transcriptCard}>
                {speechState === 'listening' && !!seekerSpokenText ? (
                  <Text style={styles.seekerSpeechText}>
                    🗣️ You: "{seekerSpokenText}"
                  </Text>
                ) : (
                  <Text style={styles.transcriptText} numberOfLines={3}>
                    {liveAstrologerSpeech || 'Connected. Speak or tap any topic below to consult.'}
                  </Text>
                )}
              </View>
            )}

            {/* Quick Consultation Prompt Chips */}
            {callState === 'connected' && (
              <View style={styles.quickPromptsWrap}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPromptsScroll}>
                  {QUICK_CONSULTATION_PROMPTS.map((prompt) => (
                    <Pressable
                      key={prompt}
                      onPress={() => processSpokenQuestion(prompt)}
                      style={styles.quickPromptChip}
                    >
                      <Text style={styles.quickPromptChipText}>{prompt}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
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
                ? '⏳ Ringing Acharya…'
                : callState === 'ended'
                ? '🔴 Call Finished'
                : `⏱️ ${formatTimer(seconds)} · ₹${astrologer.pricePerMin * billedMinutes} total`}
            </Text>
          </View>

          <Pressable
            onPress={() => setShowKundliOverlay(!showKundliOverlay)}
            style={styles.kundliOverlayBtn}
          >
            <Text style={styles.kundliOverlayBtnText}>🪐 Kundli</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowTextInput(!showTextInput)}
            style={styles.textInputToggleBtn}
          >
            <Text style={{ fontSize: 16 }}>⌨️</Text>
          </Pressable>
        </View>

        {/* Optional Manual Text Query Bar */}
        {showTextInput && callState === 'connected' && (
          <View style={styles.manualInputBar}>
            <TextInput
              value={manualInputVal}
              onChangeText={setManualInputVal}
              placeholder="Type question if mic is quiet..."
              placeholderTextColor="#64748B"
              style={styles.manualInputField}
              onSubmitEditing={() => {
                if (manualInputVal.trim()) {
                  processSpokenQuestion(manualInputVal.trim());
                  setManualInputVal('');
                  setShowTextInput(false);
                }
              }}
            />
            <Pressable
              onPress={() => {
                if (manualInputVal.trim()) {
                  processSpokenQuestion(manualInputVal.trim());
                  setManualInputVal('');
                  setShowTextInput(false);
                }
              }}
              style={styles.manualSendBtn}
            >
              <Text style={{ color: '#0F172A', fontWeight: '900', fontSize: 12 }}>ASK</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>

      {/* Kundli Chart Floating Drawer Overlay */}
      {showKundliOverlay && (
        <View style={styles.floatingKundliDrawer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.drawerTitle}>🪐 Seeker Birth Chart</Text>
            <Pressable onPress={() => setShowKundliOverlay(false)} style={styles.closeDrawerBtn}>
              <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>✕</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {[
              { label: 'Lagna', val: kundli ? RASHIS[kundli.lagnaIndex].english : 'Mesha (Aries)' },
              { label: 'Moon Sign', val: kundli ? RASHIS[kundli.moonRashiIndex].english : 'Taurus' },
              { label: 'Nakshatra', val: kundli ? NAKSHATRAS[kundli.moonNakshatraIndex].name : 'Rohini' },
              { label: 'Sun Sign', val: kundli ? RASHIS[kundli.sunRashiIndex].english : 'Leo' },
              { label: 'Manglik Dosha', val: kundli?.mangalDosha ? 'Present (Remedy Required)' : 'Clean / None' },
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
            onPress={toggleMute}
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          >
            <View style={[styles.controlIconCircle, isMuted && { backgroundColor: 'rgba(239, 68, 68, 0.3)' }]}>
              <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎙️'}</Text>
            </View>
            <Text style={[styles.controlText, isMuted && { color: '#EF4444' }]}>
              {isMuted ? 'Muted' : 'Mute'}
            </Text>
          </Pressable>

          {/* Speaker Button */}
          <Pressable
            onPress={toggleSpeaker}
            style={[styles.controlBtn, !isSpeakerOn && styles.controlBtnActive]}
          >
            <View style={[styles.controlIconCircle, !isSpeakerOn && { backgroundColor: 'rgba(129, 140, 248, 0.2)' }]}>
              <Text style={styles.controlIcon}>{isSpeakerOn ? '🔊' : '🎧'}</Text>
            </View>
            <Text style={styles.controlText}>{isSpeakerOn ? 'Speaker' : 'Earpiece'}</Text>
          </Pressable>

          {/* Video Toggle Button (if desired) */}
          <Pressable
            onPress={() => setIsVideoOn(!isVideoOn)}
            style={styles.controlBtn}
          >
            <View style={styles.controlIconCircle}>
              <Text style={styles.controlIcon}>{isVideoOn ? '📹' : '🙈'}</Text>
            </View>
            <Text style={styles.controlText}>{isVideoOn ? 'Video' : 'Audio Only'}</Text>
          </Pressable>

          {/* End Call Button */}
          <Pressable onPress={handleEndCall} style={styles.endCallBtn}>
            <Text style={styles.endCallIcon}>📞</Text>
            <Text style={styles.endCallText}>End</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* ─── POST-CALL SUMMARY & BLESSING MODAL ─── */}
      <Modal visible={showSummaryModal} animationType="fade" transparent>
        <View style={styles.summaryOverlay}>
          <View style={styles.summaryCard}>
            <Text style={{ fontSize: 40, textAlign: 'center' }}>🪔</Text>
            <Text style={styles.summaryTitle}>Consultation Completed</Text>
            <Text style={styles.summarySubtitle}>
              With Acharya {astrologer.name}
            </Text>

            <View style={styles.summaryStatsBox}>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatLabel}>Duration</Text>
                <Text style={styles.summaryStatVal}>{formatTimer(seconds)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatLabel}>Minutes Billed</Text>
                <Text style={styles.summaryStatVal}>{billedMinutes} min</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatLabel}>Total Fee</Text>
                <Text style={[styles.summaryStatVal, { color: '#FCD34D' }]}>
                  ₹{astrologer.pricePerMin * billedMinutes}
                </Text>
              </View>
            </View>

            <View style={styles.ratingRow}>
              {['★', '★', '★', '★', '★'].map((star, i) => (
                <Text key={i} style={styles.ratingStar}>{star}</Text>
              ))}
            </View>
            <Text style={styles.ratingPrompt}>5-Star Vedic Consultation Experience</Text>

            <Button
              label="Done & Return to App"
              variant="gold"
              size="md"
              style={{ marginTop: spacing.md }}
              onPress={() => {
                setShowSummaryModal(false);
                router.back();
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0C16' },
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

  audioCanvas: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg },
  avatarPulseRing: {
    borderRadius: 80, padding: 8, backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 2.5, borderColor: '#818CF8',
    shadowColor: '#818CF8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16,
  },
  audioAstrologerName: { fontSize: 22, fontWeight: '900', color: '#EEF2FF', marginTop: 14 },
  audioSpecialty: { fontSize: 13, color: '#A5B4FC', fontWeight: '600', marginTop: 2 },

  speechStatusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.18)', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: radius.pill, borderWidth: 1.2, borderColor: '#818CF8', marginTop: 14,
  },
  speechStatusDot: { fontSize: 13 },
  speechStatusText: { color: '#EEF2FF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  waveContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, marginTop: 12 },
  waveBar: { width: 5, height: 32, borderRadius: 3, backgroundColor: '#818CF8' },

  transcriptCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderRadius: radius.lg,
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: 14,
    maxWidth: '96%',
    minHeight: 58,
    justifyContent: 'center',
  },
  transcriptText: {
    ...typography.small,
    color: '#EEF2FF',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
  },
  seekerSpeechText: {
    ...typography.small,
    color: '#34D399',
    textAlign: 'center',
    fontWeight: '700',
  },

  quickPromptsWrap: { marginTop: 12, width: '100%' },
  quickPromptsScroll: { gap: 8, paddingHorizontal: spacing.xs },
  quickPromptChip: {
    backgroundColor: 'rgba(30, 41, 75, 0.8)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  quickPromptChipText: {
    color: '#EEF2FF',
    fontSize: 12,
    fontWeight: '700',
  },

  topHeaderOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: spacing.md, paddingTop: spacing.xs,
  },
  headerGlassCard: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    backgroundColor: 'rgba(15, 23, 42, 0.88)', borderRadius: radius.xl,
    borderWidth: 1.2, borderColor: 'rgba(129, 140, 248, 0.3)', gap: spacing.sm,
  },
  headerAstrologerName: { fontSize: 16, fontWeight: '900', color: '#EEF2FF' },
  headerStatusText: { fontSize: 12, color: '#34D399', fontWeight: '700', marginTop: 2 },
  kundliOverlayBtn: {
    backgroundColor: 'rgba(252, 211, 77, 0.15)', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: radius.pill, borderWidth: 1, borderColor: '#FCD34D',
  },
  kundliOverlayBtnText: { color: '#FCD34D', fontSize: 11, fontWeight: '800' },
  textInputToggleBtn: {
    padding: 6, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.1)',
  },
  manualInputBar: {
    flexDirection: 'row', gap: 6, marginTop: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.95)', padding: 6, borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(129, 140, 248, 0.35)',
  },
  manualInputField: {
    flex: 1, color: '#EEF2FF', fontSize: 13, paddingHorizontal: 8,
  },
  manualSendBtn: {
    backgroundColor: '#FCD34D', borderRadius: radius.sm, paddingHorizontal: 12, justifyContent: 'center',
  },

  floatingKundliDrawer: {
    position: 'absolute', top: 120, left: spacing.md, right: spacing.md,
    backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1.5, borderColor: '#FCD34D', gap: 4, zIndex: 99,
  },
  drawerTitle: { color: '#EEF2FF', fontSize: 14, fontWeight: '900' },
  closeDrawerBtn: { padding: 4 },
  kundliItemChip: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.md, padding: 10,
    marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', gap: 2,
  },
  kundliChipLabel: { color: '#A5B4FC', fontSize: 10, fontWeight: '700' },
  kundliChipVal: { color: '#EEF2FF', fontSize: 12, fontWeight: '800' },

  bottomControlOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  controlsRow: {
    flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center',
    paddingVertical: spacing.md + 4, backgroundColor: 'rgba(14, 18, 37, 0.96)',
    borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  controlBtn: { alignItems: 'center', gap: 4, width: 68 },
  controlBtnActive: { opacity: 0.6 },
  controlIconCircle: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(30, 41, 75, 0.8)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  controlIcon: { fontSize: 22 },
  controlText: { color: '#EEF2FF', fontSize: 11, fontWeight: '700' },
  endCallBtn: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center', gap: 1,
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6,
  },
  endCallIcon: { fontSize: 20 },
  endCallText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },

  summaryOverlay: {
    flex: 1, backgroundColor: 'rgba(5, 7, 15, 0.88)', justifyContent: 'center', padding: spacing.xl,
  },
  summaryCard: {
    backgroundColor: '#0E1225', borderRadius: 24, padding: spacing.xl,
    borderWidth: 1.5, borderColor: 'rgba(129, 140, 248, 0.35)', gap: spacing.sm,
    shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20,
  },
  summaryTitle: { ...typography.h2, color: '#EEF2FF', textAlign: 'center', fontWeight: '900' },
  summarySubtitle: { ...typography.small, color: '#A5B4FC', textAlign: 'center', fontWeight: '600' },
  summaryStatsBox: {
    flexDirection: 'row', backgroundColor: 'rgba(26, 33, 64, 0.75)', borderRadius: radius.md,
    padding: spacing.md, marginVertical: spacing.sm, justifyContent: 'space-around', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  summaryStatItem: { alignItems: 'center', gap: 2 },
  summaryDivider: { width: 1, height: 28, backgroundColor: 'rgba(129, 140, 248, 0.2)' },
  summaryStatLabel: { ...typography.tiny, color: '#A5B4FC', fontWeight: '600' },
  summaryStatVal: { ...typography.body, color: '#EEF2FF', fontWeight: '800' },
  ratingRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 4 },
  ratingStar: { color: '#FCD34D', fontSize: 26 },
  ratingPrompt: { ...typography.tiny, color: '#A5B4FC', textAlign: 'center', fontWeight: '600' },
});
