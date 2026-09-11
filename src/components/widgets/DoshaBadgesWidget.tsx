import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface DoshaItem {
  id: string;
  name: string;
  hindiName: string;
  status: 'Clear' | 'Mild' | 'Active' | 'Neutral';
  statusColor: string;
  icon: string;
  description: string;
  remedy: string;
  gemstone: string;
}

export function DoshaBadgesWidget() {
  const router = useRouter();
  const [selectedDosha, setSelectedDosha] = useState<DoshaItem | null>(null);

  const DOSHAS: DoshaItem[] = [
    {
      id: 'manglik',
      name: 'Manglik Dosha',
      hindiName: 'मांगलिक दोष',
      status: 'Mild',
      statusColor: '#F59E0B',
      icon: '🔴',
      description: 'Mars is placed in the 7th house causing minor delays in relationship settlement.',
      remedy: 'Recite Hanuman Chalisa on Tuesdays & light a sesame oil lamp.',
      gemstone: 'Red Coral (Moonga)',
    },
    {
      id: 'kaalsarp',
      name: 'Kaal Sarp',
      hindiName: 'कालसर्प योग',
      status: 'Clear',
      statusColor: '#10B981',
      icon: '🐍',
      description: 'Planets are freely positioned outside Rahu-Ketu axis. No Kaal Sarp afflictions.',
      remedy: 'Maintain Shiva Panchakshari japa for perpetual prosperity.',
      gemstone: 'Silver Snake Ring',
    },
    {
      id: 'sadesati',
      name: 'Shani Sade Sati',
      hindiName: 'शनि साढ़े साती',
      status: 'Active',
      statusColor: '#EF4444',
      icon: '🪐',
      description: 'Currently traversing Phase 2 (Peak). Discipline, patience, and honesty will yield big rewards.',
      remedy: 'Chant Shani Beej Mantra 108 times on Saturdays & donate black sesame.',
      gemstone: 'Blue Sapphire (Neelam) / Amethyst',
    },
    {
      id: 'pitra',
      name: 'Pitra Dosha',
      hindiName: 'पितृ दोष',
      status: 'Clear',
      statusColor: '#10B981',
      icon: '☀️',
      description: 'Ancestral karmic energies are balanced and peaceful.',
      remedy: 'Offer water to Peepal tree and feed birds regularly.',
      gemstone: 'Yellow Sapphire',
    },
  ];

  const handleOpenDetail = (dosha: DoshaItem) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    setSelectedDosha(dosha);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E1B4B', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={{ fontSize: 20 }}>🛡️</Text>
            <View>
              <Text style={styles.title}>Kundli Dosha Health Check</Text>
              <Text style={styles.subtitle}>Instant planetary health badge scanner</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/(tabs)/kundli')}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.viewKundliText}>Full Chart ›</Text>
          </Pressable>
        </View>

        {/* 4 Badges 2x2 Grid */}
        <View style={styles.grid}>
          {DOSHAS.map((item) => {
            const isAlert = item.status === 'Active' || item.status === 'Mild';
            return (
              <Pressable
                key={item.id}
                onPress={() => handleOpenDetail(item)}
                style={({ pressed }) => [
                  styles.badgeCard,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
              >
                <View style={styles.badgeTopRow}>
                  <Text style={styles.badgeIcon}>{item.icon}</Text>
                  <View style={[styles.statusPill, { backgroundColor: item.statusColor + '25', borderColor: item.statusColor }]}>
                    <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
                  </View>
                </View>

                <Text style={styles.doshaName}>{item.name}</Text>
                <Text style={styles.doshaHindi}>{item.hindiName}</Text>
                <Text style={styles.tapRemedyText}>{isAlert ? '⚡ Tap for Remedy' : '✅ Balanced'}</Text>
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>

      {/* Dosha Remedy Modal */}
      {selectedDosha && (
        <Modal visible={!!selectedDosha} transparent animationType="fade" onRequestClose={() => setSelectedDosha(null)}>
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setSelectedDosha(null)} />

            <View style={styles.modalCard}>
              <LinearGradient
                colors={['#1E1B4B', '#0F172A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={[styles.modalTopBar, { backgroundColor: selectedDosha.statusColor }]} />

              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 32 }}>{selectedDosha.icon}</Text>
                  <View>
                    <Text style={styles.modalTitle}>{selectedDosha.name}</Text>
                    <Text style={styles.modalHindi}>{selectedDosha.hindiName}</Text>
                  </View>
                </View>

                <View style={[styles.statusPill, { backgroundColor: selectedDosha.statusColor + '25', borderColor: selectedDosha.statusColor }]}>
                  <Text style={[styles.statusText, { color: selectedDosha.statusColor }]}>{selectedDosha.status}</Text>
                </View>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.sectionHeader}>Astrological Impact</Text>
                <Text style={styles.bodyText}>{selectedDosha.description}</Text>

                <View style={styles.remedyBox}>
                  <Text style={styles.remedyHeader}>🕉️ Prescribed Vedic Remedy</Text>
                  <Text style={styles.remedyText}>{selectedDosha.remedy}</Text>
                </View>

                <View style={styles.gemstoneRow}>
                  <Text style={styles.gemstoneLabel}>Recommended Gemstone:</Text>
                  <Text style={styles.gemstoneVal}>{selectedDosha.gemstone}</Text>
                </View>

                <Pressable
                  onPress={() => {
                    setSelectedDosha(null);
                    router.push('/(tabs)/consult');
                  }}
                  style={({ pressed }) => [styles.consultBtn, pressed && { opacity: 0.9 }]}
                >
                  <LinearGradient
                    colors={['#F59E0B', '#D97706']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.consultBtnText}>Talk to Acharya for Personal Remedy ➔</Text>
                </Pressable>

                <Pressable onPress={() => setSelectedDosha(null)} style={{ marginTop: 12, alignItems: 'center' }}>
                  <Text style={styles.closeModalText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  viewKundliText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeCard: {
    width: '48.5%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badgeIcon: {
    fontSize: 18,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
  },
  doshaName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F1F5F9',
  },
  doshaHindi: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 1,
  },
  tapRemedyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FCD34D',
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  modalTopBar: {
    height: 4,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalHindi: {
    fontSize: 12,
    color: '#FCD34D',
    fontWeight: '700',
  },
  modalBody: {
    padding: 18,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
    marginBottom: 14,
  },
  remedyBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 12,
  },
  remedyHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FCD34D',
    marginBottom: 4,
  },
  remedyText: {
    fontSize: 12,
    color: '#FEF3C7',
    lineHeight: 17,
  },
  gemstoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  gemstoneLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  gemstoneVal: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FCD34D',
  },
  consultBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    paddingVertical: 12,
    alignItems: 'center',
  },
  consultBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  closeModalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
