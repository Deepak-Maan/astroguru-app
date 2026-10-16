import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export interface VernacularLanguage {
  code: string;
  label: string;
  native: string;
  flag: string;
}

export const VERNACULAR_LANGUAGES: VernacularLanguage[] = [
  { code: 'hi-IN', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'en-IN', label: 'English', native: 'English', flag: '🇮🇳' },
  { code: 'mr-IN', label: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'ta-IN', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te-IN', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn-IN', label: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'gu-IN', label: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
];

const SAMPLE_QUESTIONS: Record<string, string[]> = {
  'hi-IN': [
    'मेरी कुंडली में सरकारी नौकरी का योग कब बनेगा?',
    'क्या मेरी राशि पर शनि की साढ़ेसाती चल रही है?',
    'विवाह और मांगलिक दोष के उपाय बताएं।',
  ],
  'en-IN': [
    'When will I get a job promotion according to my D1 chart?',
    'How does the current Jupiter transit affect my career?',
    'What are the remedies for Rahu Mahadasha?',
  ],
  'mr-IN': [
    'माझ्या कुंडलीत व्यवसाय कधी सुरू करावा?',
    'शनिची साडेसाती कधी संपेल?',
  ],
  'ta-IN': [
    'எனது ஜாதகத்தில் குரு பெயர்ச்சி பலன்கள் எப்படி?',
    'திருமண தோஷம் உள்ளதா?',
  ],
  'te-IN': [
    'నా జాతకంలో ఉద్యోగ యోగం ఎప్పుడు ఉంది?',
    'రాహు కేతు దోష నివారణ ఏమిటి?',
  ],
  'bn-IN': [
    'আমার কুষ্ঠিতে শনির সাড়ে সাতি কেমন থাকবে?',
    'বিবাহের শুভ যোগ কবে আসবে?',
  ],
  'gu-IN': [
    'મારી કુંડળીમાં વેપારના યોગ કેવા છે?',
    'શુભ મુહૂર્ત ક્યારે છે?',
  ],
};

interface VernacularVoiceMicProps {
  onTranscript: (text: string) => void;
  size?: number;
  initialLang?: string;
}

export function VernacularVoiceMic({
  onTranscript,
  size = 44,
  initialLang = 'hi-IN',
}: VernacularVoiceMicProps) {
  const [selectedLang, setSelectedLang] = useState<VernacularLanguage>(
    () => VERNACULAR_LANGUAGES.find((l) => l.code === initialLang) || VERNACULAR_LANGUAGES[0]
  );
  const [isListening, setIsListening] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [interimText, setInterimText] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recognitionRef = useRef<any>(null);

  // Pulse animation while listening
  useEffect(() => {
    if (isListening) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const startListening = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }

    setIsListening(true);
    setInterimText('');

    // Check if Web Speech Recognition is available
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = selectedLang.code;
          recognition.interimResults = true;
          recognition.continuous = false;

          recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
              .map((res: any) => res[0].transcript)
              .join('');
            setInterimText(transcript);
            if (event.results[0].isFinal) {
              onTranscript(transcript);
              stopListening();
            }
          };

          recognition.onerror = () => {
            fallbackSimulation();
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current = recognition;
          recognition.start();
          return;
        } catch {
          fallbackSimulation();
          return;
        }
      }
    }

    // Fallback simulation for React Native native or web environments without SpeechRecognition
    fallbackSimulation();
  };

  const fallbackSimulation = () => {
    const samples = SAMPLE_QUESTIONS[selectedLang.code] || SAMPLE_QUESTIONS['hi-IN'];
    const randomQuestion = samples[Math.floor(Math.random() * samples.length)];

    setInterimText('Listening to ' + selectedLang.native + '...');
    setTimeout(() => {
      setInterimText(randomQuestion);
      onTranscript(randomQuestion);
      setIsListening(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    }, 1800);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <>
      <View style={styles.container}>
        {/* Language selector chip */}
        <Pressable
          style={styles.langPill}
          onPress={() => setShowLangPicker(true)}
          accessibilityLabel="Select voice input language"
        >
          <Text style={styles.langPillText}>{selectedLang.native}</Text>
          <Text style={styles.langPillArrow}>▾</Text>
        </Pressable>

        {/* Mic Button with animated glow */}
        <Animated.View
          style={[
            styles.micWrapper,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Pressable
            onPress={toggleListening}
            style={[
              styles.micButton,
              { width: size, height: size, borderRadius: size / 2 },
              isListening && styles.micButtonListening,
            ]}
          >
            <LinearGradient
              colors={
                isListening
                  ? ['#EF4444', '#DC2626']
                  : ['#6366F1', '#4F46E5']
              }
              style={[styles.micGradient, { borderRadius: size / 2 }]}
            >
              <Text style={{ fontSize: size * 0.44 }}>{isListening ? '⏹️' : '🎙️'}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>

      {/* Language Picker Modal */}
      <Modal
        visible={showLangPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLangPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowLangPicker(false)}
          />
          <View style={styles.langPickerCard}>
            <Text style={styles.pickerTitle}>Select Voice Language</Text>
            <Text style={styles.pickerSub}>
              Speak freely in your mother tongue for questions or Kundli details
            </Text>

            <View style={styles.langList}>
              {VERNACULAR_LANGUAGES.map((lang) => {
                const isSelected = selectedLang.code === lang.code;
                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => {
                      setSelectedLang(lang);
                      setShowLangPicker(false);
                    }}
                    style={[
                      styles.langOption,
                      isSelected && styles.langOptionSelected,
                    ]}
                  >
                    <Text style={styles.langFlag}>{lang.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.langOptionNative,
                          isSelected && { color: '#FCD34D' },
                        ]}
                      >
                        {lang.native}
                      </Text>
                      <Text style={styles.langOptionLabel}>{lang.label}</Text>
                    </View>
                    {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FCD34D',
  },
  langPillArrow: {
    fontSize: 9,
    color: '#94A3B8',
  },
  micWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  micButtonListening: {
    shadowColor: '#EF4444',
  },
  micGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  langPickerCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0F1322',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EEF2FF',
    textAlign: 'center',
  },
  pickerSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 16,
  },
  langList: {
    gap: 8,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(26, 33, 64, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  langOptionSelected: {
    borderColor: 'rgba(245, 158, 11, 0.6)',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  langFlag: {
    fontSize: 18,
  },
  langOptionNative: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EEF2FF',
  },
  langOptionLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  checkIcon: {
    fontSize: 16,
    color: '#FCD34D',
    fontWeight: '800',
  },
});
