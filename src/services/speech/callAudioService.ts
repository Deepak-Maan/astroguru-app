/**
 * AstroGuru Live Voice Call Audio & Speech Engine
 * Powers real audio ringtones, connected chimes, astrologer voice synthesis,
 * and live continuous two-way speech recognition.
 */
import { Platform } from 'react-native';

class CallAudioService {
  private audioCtx: AudioContext | null = null;
  private ringOscillator: OscillatorNode | null = null;
  private ringGain: GainNode | null = null;
  private ringTimer: any = null;
  private isSpeaking: boolean = false;
  private activeRecognition: any = null;

  private getAudioContext(): AudioContext | null {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.audioCtx || this.audioCtx.state === 'suspended') {
      try {
        this.audioCtx = new AudioCtx();
      } catch (_) {}
    }
    return this.audioCtx;
  }

  /**
   * Play realistic telephone ringtone during 'connecting' phase
   */
  playRingtone(): void {
    if (Platform.OS !== 'web') return;
    this.stopRingtone();

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const playPulse = () => {
        try {
          if (!this.audioCtx || this.audioCtx.state === 'closed') return;
          const osc1 = this.audioCtx.createOscillator();
          const osc2 = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(440, this.audioCtx.currentTime); // Standard ring frequency 1
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(480, this.audioCtx.currentTime); // Standard ring frequency 2

          gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.8);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc1.start();
          osc2.start();
          osc1.stop(this.audioCtx.currentTime + 1.8);
          osc2.stop(this.audioCtx.currentTime + 1.8);
        } catch (_) {}
      };

      playPulse();
      this.ringTimer = setInterval(playPulse, 3200);
    } catch (_) {}
  }

  stopRingtone(): void {
    if (this.ringTimer) {
      clearInterval(this.ringTimer);
      this.ringTimer = null;
    }
  }

  /**
   * Play pleasant chime when call connects
   */
  playConnectChime(): void {
    if (Platform.OS !== 'web') return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.18); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.35); // G5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
    } catch (_) {}
  }

  /**
   * Play call disconnect / end tone
   */
  playEndTone(): void {
    if (Platform.OS !== 'web') return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now + i * 0.22);
        gain.gain.setValueAtTime(0.08, now + i * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.22 + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.22);
        osc.stop(now + i * 0.22 + 0.15);
      }
    } catch (_) {}
  }

  /**
   * Speaks text using Speech Synthesis with natural Indian / Hindi inflection
   */
  speakText(
    text: string,
    options?: {
      onStart?: () => void;
      onDone?: () => void;
      isSpeaker?: boolean;
    }
  ): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[*_~`#]/g, '').trim();
        if (!cleanText) {
          options?.onDone?.();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            v.lang.startsWith('hi-IN') ||
            v.lang.startsWith('en-IN') ||
            v.name.includes('India') ||
            v.name.includes('Rishi') ||
            v.name.includes('Kalpana') ||
            v.name.includes('Natural')
        );

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.rate = 0.94; // Calm, respectful Vedic pace
        utterance.pitch = 0.98;
        utterance.volume = options?.isSpeaker === false ? 0.4 : 1.0;

        utterance.onstart = () => {
          this.isSpeaking = true;
          options?.onStart?.();
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          options?.onDone?.();
        };

        utterance.onerror = () => {
          this.isSpeaking = false;
          options?.onDone?.();
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('[SpeechSynthesis Error]', e);
        options?.onDone?.();
      }
    } else {
      // Native fallback simulation
      options?.onStart?.();
      setTimeout(() => {
        options?.onDone?.();
      }, Math.min(5000, Math.max(1600, text.length * 40)));
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

  isSpeechRecognitionSupported(): boolean {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  /**
   * Start listening to the seeker's microphone
   */
  startListening(options: {
    onResult: (text: string, isFinal: boolean) => void;
    onError?: (err: any) => void;
    onEnd?: () => void;
  }): { stop: () => void } {
    this.stopListening();

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = 'en-IN'; // Works for Indian English and Hinglish

          recognition.onresult = (event: any) => {
            let interim = '';
            let final = '';
            for (let i = 0; i < event.results.length; i++) {
              const res = event.results[i];
              if (res.isFinal) {
                final += res[0].transcript;
              } else {
                interim += res[0].transcript;
              }
            }
            options.onResult(final || interim, !!final);
          };

          recognition.onerror = (e: any) => {
            options.onError?.(e);
          };

          recognition.onend = () => {
            this.activeRecognition = null;
            options.onEnd?.();
          };

          this.activeRecognition = recognition;
          recognition.start();

          return {
            stop: () => {
              try {
                recognition.stop();
              } catch (_) {}
              this.activeRecognition = null;
            },
          };
        } catch (e) {
          options.onError?.(e);
        }
      }
    }

    return { stop: () => {} };
  }

  stopListening(): void {
    if (this.activeRecognition) {
      try {
        this.activeRecognition.stop();
      } catch (_) {}
      this.activeRecognition = null;
    }
  }

  cleanupAll(): void {
    this.stopRingtone();
    this.stopSpeaking();
    this.stopListening();
  }
}

export const callAudioService = new CallAudioService();
