import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, radius, spacing } from '../../theme';
import { useUserStore } from '../../store/userStore';
import { ChatMessage } from '../../types';
import { guruVaniVoiceService } from '../../services/speech/guruVaniVoiceService';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type ConsultationStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

const QUICK_VEDIC_PROMPTS = [
  'Will my career see growth in 2026?',
  'How is my Shani Sade Sati affecting me?',
  'Which gemstone is most auspicious for my Kundli?',
  'What remedy brings mental peace & family harmony?',
  'Is this an auspicious time for financial investments?',
  'Tell me about my Lagna lord and current Dasha.',
];

export function GuruVaniVoiceModal({ visible, onClose }: Props) {
  const kundli = useUserStore((s) => s.kundli);
  const profile = useUserStore((s) => s.profile);

  const [status, setStatus] = useState<ConsultationStatus>('idle');
  const [inputText, setInputText] = useState('');
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [activeSpeechRecognition, setActiveSpeechRecognition] = useState<any>(null);

  // Animation values
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const orbRotation = useRef(new Animated.Value(0)).current;
  const wave1 = useRef(new Animated.Value(0.4)).current;
  const wave2 = useRef(new Animated.Value(0.7)).current;
  const wave3 = useRef(new Animated.Value(0.5)).current;
  const wave4 = useRef(new Animated.Value(0.9)).current;
  const wave5 = useRef(new Animated.Value(0.3)).current;

  // Pulse & Orb Animation loop
  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | null = null;
    let rotationLoop: Animated.CompositeAnimation | null = null;
    let waveLoop: Animated.CompositeAnimation | null = null;

    if (visible) {
      // Concentric aura pulsing
      pulseLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulse1, {
              toValue: 1.35,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulse1, {
              toValue: 1.0,
              duration: 2000,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(500),
            Animated.timing(pulse2, {
              toValue: 1.55,
              duration: 2200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulse2, {
              toValue: 1.0,
              duration: 2200,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseLoop.start();

      // Cosmic rotation
      rotationLoop = Animated.loop(
        Animated.timing(orbRotation, {
          toValue: 1,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotationLoop.start();

      // Voice wave oscillations
      waveLoop = Animated.loop(
        Animated.stagger(150, [
          Animated.sequence([
            Animated.timing(wave1, { toValue: 1.2, duration: 400, useNativeDriver: false }),
            Animated.timing(wave1, { toValue: 0.3, duration: 400, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(wave2, { toValue: 1.4, duration: 350, useNativeDriver: false }),
            Animated.timing(wave2, { toValue: 0.4, duration: 350, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(wave3, { toValue: 1.6, duration: 500, useNativeDriver: false }),
            Animated.timing(wave3, { toValue: 0.5, duration: 500, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(wave4, { toValue: 1.3, duration: 420, useNativeDriver: false }),
            Animated.timing(wave4, { toValue: 0.3, duration: 420, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(wave5, { toValue: 1.1, duration: 480, useNativeDriver: false }),
            Animated.timing(wave5, { toValue: 0.2, duration: 480, useNativeDriver: false }),
          ]),
        ])
      );
      waveLoop.start();
    }

    return () => {
      pulseLoop?.stop();
      rotationLoop?.stop();
      waveLoop?.stop();
    };
  }, [visible, status]);

  // Clean up speech on close
  useEffect(() => {
    if (!visible) {
      guruVaniVoiceService.stopSpeaking();
      if (activeSpeechRecognition) {
        try {
          activeSpeechRecognition.stop();
        } catch (_) {}
      }
      setStatus('idle');
    }
  }, [visible]);

  const handleAskQuestion = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    setStatus('thinking');
    guruVaniVoiceService.stopSpeaking();

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: trimmed,
      at: Date.now(),
    };

    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInputText('');

    try {
      const reply = await guruVaniVoiceService.consultGuruVani(trimmed, newHistory, kundli, profile);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: reply,
        at: Date.now(),
      };
      setHistory([...newHistory, aiMsg]);
      setLastAnswer(reply);
      setStatus('speaking');

      guruVaniVoiceService.speakText(
        reply,
        () => setStatus('speaking'),
        () => setStatus('idle')
      );
    } catch (e) {
      setStatus('idle');
    }
  };

  const handleToggleVoiceMic = () => {
    if (status === 'listening') {
      // Stop listening and process
      if (activeSpeechRecognition) {
        try {
          activeSpeechRecognition.stop();
        } catch (_) {}
      }
      if (inputText.trim()) {
        handleAskQuestion(inputText);
      } else {
        setStatus('idle');
      }
      return;
    }

    if (status === 'speaking') {
      guruVaniVoiceService.stopSpeaking();
      setStatus('idle');
      return;
    }

    // Try web speech recognition if available
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = 'en-IN';

          recognition.onstart = () => {
            setStatus('listening');
          };

          recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
              .map((res: any) => res[0].transcript)
              .join('');
            setInputText(transcript);
          };

          recognition.onerror = () => {
            setStatus('idle');
          };

          recognition.onend = () => {
            setActiveSpeechRecognition(null);
            if (inputText.trim()) {
              handleAskQuestion(inputText);
            } else {
              setStatus('idle');
            }
          };

          setActiveSpeechRecognition(recognition);
          recognition.start();
          return;
        } catch (e) {
          // Fall through to manual prompt mode
        }
      }
    }

    // Fallback if SpeechRecognition is not directly available: set state to listening and focus input
    setStatus('listening');
  };

  const spin = orbRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return 'Acharya GuruVani is Listening...';
      case 'thinking':
        return 'Consulting Planetary Gochar & Shastras...';
      case 'speaking':
        return 'GuruVani is Speaking Sacred Guidance...';
      default:
        return 'Tap Orb or Ask Any Vedic Question';
    }
  };

  const getStatusSubtext = () => {
    switch (status) {
      case 'listening':
        return 'Speak your question clearly or tap again to synthesize.';
      case 'thinking':
        return 'Synthesizing your Lagna chart, planetary dasha & transits...';
      case 'speaking':
        return 'Listen with a serene mind. Tap Stop Audio anytime.';
      default:
        return 'Conversational Voice Astrologer powered by Divine Jyotish AI';
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <LinearGradient
          colors={['rgba(10, 12, 22, 0.96)', 'rgba(15, 23, 42, 0.98)', 'rgba(10, 12, 22, 1)']}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>✨ Acharya GuruVani AI</Text>
            <Text style={styles.headerSubtitle}>Vedic Voice Jyotishi • Instant Cosmic Guidance</Text>
          </View>
          <Pressable
            onPress={() => {
              guruVaniVoiceService.stopSpeaking();
              onClose();
            }}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Central Pulsating Cosmic Orb Section */}
          <View style={styles.orbContainer}>
            {/* Outer Ripple 2 */}
            <Animated.View
              style={[
                styles.rippleRing,
                {
                  transform: [{ scale: pulse2 }],
                  borderColor:
                    status === 'speaking'
                      ? 'rgba(252, 211, 77, 0.35)'
                      : status === 'listening'
                      ? 'rgba(239, 68, 68, 0.4)'
                      : 'rgba(99, 102, 241, 0.25)',
                },
              ]}
            />

            {/* Outer Ripple 1 */}
            <Animated.View
              style={[
                styles.rippleRingInner,
                {
                  transform: [{ scale: pulse1 }],
                  borderColor:
                    status === 'speaking'
                      ? 'rgba(245, 158, 11, 0.45)'
                      : status === 'listening'
                      ? 'rgba(244, 63, 94, 0.5)'
                      : 'rgba(129, 140, 248, 0.35)',
                },
              ]}
            />

            {/* Orbital Planetary Ring */}
            <Animated.View style={[styles.orbitalRing, { transform: [{ rotate: spin }] }]}>
              <View style={styles.orbitalDot} />
              <View style={[styles.orbitalDot, styles.orbitalDotOpposite]} />
            </Animated.View>

            {/* Central Touch Orb */}
            <Pressable onPress={handleToggleVoiceMic} style={styles.coreOrbPressable}>
              <LinearGradient
                colors={
                  status === 'speaking'
                    ? ['#F59E0B', '#D97706', '#78350F']
                    : status === 'listening'
                    ? ['#EF4444', '#DC2626', '#881337']
                    : status === 'thinking'
                    ? ['#8B5CF6', '#6366F1', '#312E81']
                    : ['#6366F1', '#4F46E5', '#1E1B4B']
                }
                style={styles.coreOrb}
              >
                <Text style={styles.orbGlyph}>
                  {status === 'speaking' ? '🔊' : status === 'listening' ? '🎙️' : status === 'thinking' ? '🪐' : 'ॐ'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Dynamic Voice Waveform Visualizer */}
          <View style={styles.waveformRow}>
            <Animated.View style={[styles.waveBar, { transform: [{ scaleY: wave1 }] }]} />
            <Animated.View style={[styles.waveBar, { transform: [{ scaleY: wave2 }] }]} />
            <Animated.View style={[styles.waveBar, { transform: [{ scaleY: wave3 }] }]} />
            <Animated.View style={[styles.waveBar, { transform: [{ scaleY: wave4 }] }]} />
            <Animated.View style={[styles.waveBar, { transform: [{ scaleY: wave5 }] }]} />
          </View>

          {/* Status Indicators */}
          <View style={styles.statusBox}>
            <Text style={styles.statusTitle}>{getStatusText()}</Text>
            <Text style={styles.statusSubtitle}>{getStatusSubtext()}</Text>
          </View>

          {/* Last Spoken Guidance / Answer Card */}
          {lastAnswer && (
            <View style={styles.guidanceCard}>
              <View style={styles.guidanceCardHeader}>
                <Text style={styles.guidanceCardBadge}>DIVINE REVELATION</Text>
                {status === 'speaking' ? (
                  <Pressable
                    onPress={() => {
                      guruVaniVoiceService.stopSpeaking();
                      setStatus('idle');
                    }}
                    style={styles.audioStopPill}
                  >
                    <Text style={styles.audioStopText}>⏹️ Stop Audio</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => {
                      setStatus('speaking');
                      guruVaniVoiceService.speakText(
                        lastAnswer,
                        () => setStatus('speaking'),
                        () => setStatus('idle')
                      );
                    }}
                    style={styles.audioStopPill}
                  >
                    <Text style={styles.audioStopText}>🔊 Listen Again</Text>
                  </Pressable>
                )}
              </View>
              <Text style={styles.guidanceText}>{lastAnswer}</Text>
            </View>
          )}

          {/* Quick Vedic Question Pills */}
          <View style={styles.quickPromptsSection}>
            <Text style={styles.quickPromptsTitle}>Sacred Inquiries You May Ask:</Text>
            <View style={styles.promptPillWrap}>
              {QUICK_VEDIC_PROMPTS.map((prompt, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => {
                    setInputText(prompt);
                    handleAskQuestion(prompt);
                  }}
                  style={styles.promptPill}
                >
                  <Text style={styles.promptPillText}>✦ {prompt}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Input Bar for Voice / Text Consult */}
        <View style={styles.inputBarContainer}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type or speak your astrological question..."
            placeholderTextColor="#64748B"
            style={styles.textInput}
            returnKeyType="send"
            onSubmitEditing={() => handleAskQuestion(inputText)}
          />

          <Pressable
            onPress={() => {
              if (inputText.trim()) {
                handleAskQuestion(inputText);
              } else {
                handleToggleVoiceMic();
              }
            }}
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : null,
            ]}
          >
            <Text style={styles.sendButtonText}>
              {inputText.trim() ? '➤' : status === 'listening' ? '⏹' : '🎙️'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#0A0C16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 54 : 24,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 140, 248, 0.15)',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#EEF2FF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#A5B4FC',
    marginTop: 2,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  closeButtonText: {
    color: '#EEF2FF',
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl * 2,
    alignItems: 'center',
  },
  orbContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  rippleRing: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 2,
  },
  rippleRingInner: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
  },
  orbitalRing: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.25)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orbitalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FCD34D',
    shadowColor: '#FCD34D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    marginTop: -4,
  },
  orbitalDotOpposite: {
    backgroundColor: '#A855F7',
    shadowColor: '#A855F7',
    marginBottom: -4,
  },
  coreOrbPressable: {
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  coreOrb: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  orbGlyph: {
    fontSize: 42,
    color: '#FFFFFF',
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 28,
    marginVertical: spacing.sm,
  },
  waveBar: {
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: '#FCD34D',
  },
  statusBox: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EEF2FF',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 320,
    lineHeight: 18,
  },
  guidanceCard: {
    width: '100%',
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    marginBottom: spacing.xl,
  },
  guidanceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  guidanceCardBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FCD34D',
    letterSpacing: 1.2,
  },
  audioStopPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  audioStopText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EEF2FF',
  },
  guidanceText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#E0E7FF',
    fontWeight: '400',
  },
  quickPromptsSection: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  quickPromptsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A5B4FC',
    marginBottom: spacing.sm,
    letterSpacing: 0.3,
  },
  promptPillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptPill: {
    backgroundColor: 'rgba(30, 41, 79, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  promptPillText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  inputBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.md,
    backgroundColor: 'rgba(10, 12, 22, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(129, 140, 248, 0.2)',
    gap: 10,
  },
  textInput: {
    flex: 1,
    height: 46,
    backgroundColor: 'rgba(26, 33, 64, 0.9)',
    borderRadius: 23,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(99, 102, 241, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.4)',
  },
  sendButtonActive: {
    backgroundColor: '#6366F1',
  },
  sendButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
});
