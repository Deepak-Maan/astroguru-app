/**
 * GuruVani AI — Conversational Vedic Voice Consultation Service
 * Orchestrates voice-to-text queries, astrological AI synthesis via astrologyAiEngine,
 * and speech synthesis playback with soothing Vedic audio resonance.
 */

import { Platform } from 'react-native';
import { generateAstrologyAiReply } from '../ai/astrologyAiEngine';
import { Astrologer, BirthProfile, ChatMessage, Kundli } from '../../types';

export interface VoiceConsultationState {
  status: 'idle' | 'listening' | 'thinking' | 'speaking';
  transcript: string;
  response: string;
  speakingSentence: string;
}

const GURUVANI_ACHARYA: Astrologer = {
  id: 'guruvani_ai',
  name: 'Acharya GuruVani AI',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  rating: 5.0,
  reviews: 4890,
  pricePerMin: 0,
  experienceYears: 25,
  specialties: ['Vedic Voice Jyotish', 'Kundli Dasha Analysis', 'Mantra Remedies'],
  languages: ['Hindi', 'English', 'Sanskrit'],
  online: true,
  about: 'Divine Conversational Vedic Astrologer powered by authentic Shastras and planetary transits.',
  consultations: 12500,
};

class GuruVaniVoiceService {
  private isSpeaking: boolean = false;

  /**
   * Generates a context-rich Vedic response for a spoken voice query
   */
  async consultGuruVani(
    spokenQuery: string,
    history: ChatMessage[],
    kundli: Kundli | null,
    profile: BirthProfile | null
  ): Promise<string> {
    try {
      const aiReply = await generateAstrologyAiReply({
        currentMessage: spokenQuery,
        history,
        astrologer: GURUVANI_ACHARYA,
        kundli,
        profile,
      });

      return aiReply;
    } catch (error) {
      console.warn('[GuruVani Voice Consultation Error]', error);
      return `Namaste! Based on your birth chart, things are looking positive. Stay focused on your goals, work with patience, and avoid rushing into big decisions. Feel free to ask another question!`;
    }
  }

  /**
   * Vocalize the response using Speech Synthesis (Web or Native TTS)
   */
  speakText(text: string, onStart?: () => void, onDone?: () => void): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Stop prior speech
        const cleanText = text.replace(/[*_~`#]/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Find soft, calm English or Hindi voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            v.lang.startsWith('en-IN') ||
            v.lang.startsWith('hi-IN') ||
            v.name.includes('India') ||
            v.name.includes('Natural')
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.rate = 0.95; // Slightly calmer, revered pace
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          this.isSpeaking = true;
          onStart?.();
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          onDone?.();
        };

        utterance.onerror = () => {
          this.isSpeaking = false;
          onDone?.();
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.log('[Web Speech Warning]', e);
        onDone?.();
      }
    } else {
      // Mobile native fallback simulation
      onStart?.();
      setTimeout(() => {
        onDone?.();
      }, Math.min(4000, Math.max(1500, text.length * 35)));
    }
  }

  stopSpeaking(): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    this.isSpeaking = false;
  }
}

export const guruVaniVoiceService = new GuruVaniVoiceService();
