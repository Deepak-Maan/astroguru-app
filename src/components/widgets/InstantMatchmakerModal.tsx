import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ASTROLOGERS } from '../../data/astrologers';
import { Astrologer } from '../../types';
import { useWalletStore } from '../../store/walletStore';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  defaultTopic?: string;
}

const TOPICS = [
  { id: 'love', label: 'Love & Marriage', icon: '💍', sub: 'Compatibility, delays, soulmate' },
  { id: 'career', label: 'Career & Job', icon: '💼', sub: 'Promotions, switches, business' },
  { id: 'wealth', label: 'Money & Wealth', icon: '💰', sub: 'Investments, debts, Lakshmi yoga' },
  { id: 'health', label: 'Health & Well-being', icon: '🩺', sub: 'Vitality, mental peace, remedies' },
  { id: 'breakup', label: 'Breakup & Ex-Back', icon: '💔', sub: 'Reconciliation, closure, future' },
  { id: 'foreign', label: 'Foreign Travel / PR', icon: '✈️', sub: 'Visa, settlement, abroad job' },
];

const MODES = [
  { id: 'call', label: 'Audio Call', icon: '📞', tag: 'Fastest' },
  { id: 'chat', label: 'Live Chat', icon: '💬', tag: 'Private' },
  { id: 'video', label: 'Video Call', icon: '📹', tag: 'Face-to-Face' },
];

export function InstantMatchmakerModal({ visible, onClose, defaultTopic }: Props) {
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance ?? 100);

  const [selectedTopic, setSelectedTopic] = useState(defaultTopic || 'love');
  const [selectedMode, setSelectedMode] = useState<'call' | 'chat' | 'video'>('call');
  const [selectedLang, setSelectedLang] = useState<'any' | 'hi' | 'en'>('any');
  const [isMatching, setIsMatching] = useState(false);
  const [matchedAstrologer, setMatchedAstrologer] = useState<Astrologer | null>(null);

  const handleStartMatch = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (_) {}

    setIsMatching(true);

    // Find best matching online astrologer
    setTimeout(() => {
      const onlineList = ASTROLOGERS.filter((a) => a.online);
      const candidates = onlineList.length > 0 ? onlineList : ASTROLOGERS;

      // Match based on specialty
      const topicMatches = candidates.filter((a) => {
        if (selectedTopic === 'love') return a.specialties.some((s) => s.toLowerCase().includes('love') || s.toLowerCase().includes('relationship') || s.toLowerCase().includes('marriage'));
        if (selectedTopic === 'career') return a.specialties.some((s) => s.toLowerCase().includes('career') || s.toLowerCase().includes('business') || s.toLowerCase().includes('finance'));
        if (selectedTopic === 'wealth') return a.specialties.some((s) => s.toLowerCase().includes('finance') || s.toLowerCase().includes('wealth') || s.toLowerCase().includes('vedic'));
        return true;
      });

      const chosen = topicMatches.length > 0 ? topicMatches[0] : candidates[0];
      setMatchedAstrologer(chosen);
      setIsMatching(false);
    }, 1800);
  };

  const handleConnectNow = () => {
    if (!matchedAstrologer) return;
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}

    onClose();
    if (selectedMode === 'chat') {
      router.push(`/chat/${matchedAstrologer.id}` as any);
    } else {
      router.push(`/call/${matchedAstrologer.id}` as any);
    }
  };

  const resetAndClose = () => {
    setIsMatching(false);
    setMatchedAstrologer(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={resetAndClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={resetAndClose} />

        <View style={styles.modalSheet}>
          <LinearGradient
            colors={['#1E1B4B', '#0F172A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Golden Aura Edge */}
          <View style={styles.topBar} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <View style={styles.badgeRow}>
                <Text style={styles.badgeText}>⚡ 1-TAP SMART MATCH</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>Verified Gurus</Text>
                </View>
              </View>
              <Text style={styles.sheetTitle}>Instant Astrologer Connect</Text>
            </View>

            <Pressable onPress={resetAndClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {!matchedAstrologer && !isMatching ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {/* Step 1: Select Topic */}
              <Text style={styles.sectionLabel}>1. What is on your mind today?</Text>
              <View style={styles.topicsGrid}>
                {TOPICS.map((t) => {
                  const active = selectedTopic === t.id;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => {
                        try {
                          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch (_) {}
                        setSelectedTopic(t.id);
                      }}
                      style={[styles.topicChip, active && styles.topicChipActive]}
                    >
                      <Text style={styles.topicIcon}>{t.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.topicTitle, active && styles.topicTitleActive]}>{t.label}</Text>
                        <Text style={styles.topicSub}>{t.sub}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Step 2: Select Mode */}
              <Text style={[styles.sectionLabel, { marginTop: 14 }]}>2. Preferred Consultation Mode</Text>
              <View style={styles.modesRow}>
                {MODES.map((m) => {
                  const active = selectedMode === m.id;
                  return (
                    <Pressable
                      key={m.id}
                      onPress={() => {
                        try {
                          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch (_) {}
                        setSelectedMode(m.id as any);
                      }}
                      style={[styles.modeCard, active && styles.modeCardActive]}
                    >
                      <Text style={styles.modeIcon}>{m.icon}</Text>
                      <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{m.label}</Text>
                      <View style={[styles.modeTag, active && styles.modeTagActive]}>
                        <Text style={[styles.modeTagText, active && styles.modeTagTextActive]}>{m.tag}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* CTA Match Button */}
              <Pressable
                onPress={handleStartMatch}
                style={({ pressed }) => [styles.matchBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706', '#B45309']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.matchBtnText}>⚡ Find & Match Top Acharya (Free)</Text>
              </Pressable>

              <Text style={styles.footerGuarantee}>
                🔒 100% Private & Confidential • First 5 mins Free for new users
              </Text>
            </ScrollView>
          ) : isMatching ? (
            /* Matching Radar Animation */
            <View style={styles.matchingState}>
              <ActivityIndicator size="large" color="#F59E0B" style={{ marginBottom: 16 }} />
              <Text style={styles.matchingTitle}>Finding Best Available Acharya…</Text>
              <Text style={styles.matchingSub}>
                Scanning 50+ Vedic experts specializing in {TOPICS.find((t) => t.id === selectedTopic)?.label}
              </Text>
            </View>
          ) : matchedAstrologer ? (
            /* Matched Astrologer Card */
            <View style={styles.matchedCard}>
              <View style={styles.matchedBadge}>
                <Text style={styles.matchedBadgeText}>✨ PERFECT MATCH FOUND</Text>
              </View>

              <Image source={{ uri: matchedAstrologer.avatar }} style={styles.matchedAvatar} />
              <Text style={styles.matchedName}>{matchedAstrologer.name}</Text>
              <Text style={styles.matchedExp}>
                {matchedAstrologer.experienceYears || 10} yrs exp • {matchedAstrologer.rating} ⭐ ({matchedAstrologer.consultations || 1000}+ consultations)
              </Text>

              <View style={styles.matchedSpecialties}>
                {matchedAstrologer.specialties.slice(0, 3).map((sp: string, i: number) => (
                  <View key={i} style={styles.spPill}>
                    <Text style={styles.spPillText}>{sp}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.matchedRate}>
                Rate: <Text style={{ color: '#FCD34D', fontWeight: '900' }}>₹{matchedAstrologer.pricePerMin || 25}/min</Text> (🎁 First 5 Mins Free)
              </Text>

              <Pressable
                onPress={handleConnectNow}
                style={({ pressed }) => [styles.connectBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.connectBtnText}>
                  {selectedMode === 'chat' ? '💬 Start Chat Now' : '📞 Start Call Now'}
                </Text>
              </Pressable>

              <Pressable onPress={() => setMatchedAstrologer(null)} style={{ marginTop: 12 }}>
                <Text style={styles.reMatchText}>🔄 Match Another Astrologer</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderBottomWidth: 0,
  },
  topBar: {
    height: 3,
    backgroundColor: '#F59E0B',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FCD34D',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#CBD5E1',
    marginBottom: 8,
  },
  topicsGrid: {
    gap: 8,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  topicChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  topicIcon: {
    fontSize: 22,
  },
  topicTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F1F5F9',
  },
  topicTitleActive: {
    color: '#FCD34D',
  },
  topicSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  modesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modeCardActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  modeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  modeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  modeLabelActive: {
    color: '#FCD34D',
  },
  modeTag: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginTop: 4,
  },
  modeTagActive: {
    backgroundColor: '#F59E0B',
  },
  modeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
  },
  modeTagTextActive: {
    color: '#000000',
  },
  matchBtn: {
    marginTop: 18,
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  matchBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  footerGuarantee: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  matchingState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchingTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  matchingSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  matchedCard: {
    padding: 24,
    alignItems: 'center',
  },
  matchedBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginBottom: 14,
  },
  matchedBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FCD34D',
    letterSpacing: 0.5,
  },
  matchedAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    marginBottom: 10,
  },
  matchedName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  matchedExp: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  matchedSpecialties: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  spPill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  spPillText: {
    fontSize: 10,
    color: '#FDE68A',
    fontWeight: '700',
  },
  matchedRate: {
    fontSize: 13,
    color: '#E2E8F0',
    marginBottom: 16,
  },
  connectBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 14,
    alignItems: 'center',
  },
  connectBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  reMatchText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
  },
});
