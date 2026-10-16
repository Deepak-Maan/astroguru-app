import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Kundli } from '../types';
import { useUserStore } from '../store/userStore';
import { KundliChart } from './KundliChart';
import { RASHIS } from '../data/rashis';
import { NAKSHATRAS } from '../data/nakshatras';
import { colors, radius, spacing, typography } from '../theme';

interface FloatingKundliSheetProps {
  kundli?: Kundli | null;
  defaultExpanded?: boolean;
}

export function FloatingKundliSheet({ kundli: propKundli, defaultExpanded = false }: FloatingKundliSheetProps) {
  const storeKundli = useUserStore((s) => s.kundli);
  const activeKundli = propKundli || storeKundli;
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!activeKundli) return null;

  const lagnaRashi = RASHIS[activeKundli.lagnaIndex];
  const moonRashi = RASHIS[activeKundli.moonRashiIndex];
  const moonNak = NAKSHATRAS[activeKundli.moonNakshatraIndex];

  const handleToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setExpanded((prev) => !prev);
  };

  return (
    <>
      {/* Floating Picture-in-Picture Quick Launch Pill */}
      {!expanded && (
        <Pressable
          style={styles.floatingPill}
          onPress={handleToggle}
          accessibilityLabel="Open Picture-in-Picture Kundli Chart"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.9)', 'rgba(67, 56, 202, 0.95)']}
            style={styles.pillGradient}
          >
            <Text style={styles.pillIcon}>📜</Text>
            <Text style={styles.pillText}>Kundli PiP</Text>
          </LinearGradient>
        </Pressable>
      )}

      {/* Expanded Modal Bottom Sheet */}
      <Modal
        visible={expanded}
        transparent
        animationType="slide"
        onRequestClose={() => setExpanded(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.backdropPress} onPress={() => setExpanded(false)} />

          <View style={styles.sheetContainer}>
            <LinearGradient
              colors={['#0F1322', '#0A0C16']}
              style={StyleSheet.absoluteFill}
            />

            {/* Handle Bar */}
            <View style={styles.handleBar} />

            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Picture-in-Picture Kundli</Text>
                <Text style={styles.sheetSubtitle}>
                  Lagna: {lagnaRashi?.english} • Rashi: {moonRashi?.english}
                </Text>
              </View>
              <Pressable style={styles.closeBtn} onPress={() => setExpanded(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetScroll}
            >
              {/* Planetary Core Tags */}
              <View style={styles.tagsRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagLabel}>Ascendant</Text>
                  <Text style={styles.tagValue}>
                    {lagnaRashi ? `${lagnaRashi.english} (${lagnaRashi.sanskrit})` : 'Aries'}
                  </Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagLabel}>Nakshatra</Text>
                  <Text style={styles.tagValue}>
                    {moonNak?.name || 'Ashwini'} (Pada {activeKundli.moonPada})
                  </Text>
                </View>
                <View
                  style={[
                    styles.tag,
                    activeKundli.mangalDosha && styles.mangalTag,
                  ]}
                >
                  <Text style={styles.tagLabel}>Mangal Dosha</Text>
                  <Text
                    style={[
                      styles.tagValue,
                      activeKundli.mangalDosha && { color: '#EF4444' },
                    ]}
                  >
                    {activeKundli.mangalDosha ? 'Present' : 'None'}
                  </Text>
                </View>
              </View>

              {/* D1 North-Indian Kundli Chart */}
              <View style={styles.chartWrapper}>
                <KundliChart kundli={activeKundli} size={250} />
              </View>

              {/* Planetary Positions Quick Table */}
              <Text style={styles.sectionHeading}>Graha Placements (Houses)</Text>
              <View style={styles.grahaGrid}>
                {activeKundli.planets.map((p) => (
                  <View key={p.key} style={styles.grahaItem}>
                    <Text style={styles.grahaName}>{p.name}</Text>
                    <Text style={styles.grahaHouse}>House {p.house}</Text>
                    <Text style={styles.grahaSign}>
                      {RASHIS[p.rashiIndex]?.english}
                      {p.retrograde ? ' (R)' : ''}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingPill: {
    position: 'absolute',
    right: 16,
    bottom: 90,
    zIndex: 999,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  pillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  pillIcon: {
    fontSize: 16,
  },
  pillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropPress: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#0F1322',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    maxHeight: '80%',
    paddingBottom: 24,
    overflow: 'hidden',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#EEF2FF',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#CBD5E1',
    fontSize: 16,
    fontWeight: '700',
  },
  sheetScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    alignItems: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flex: 1,
    backgroundColor: 'rgba(26, 33, 64, 0.6)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  mangalTag: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  tagLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  tagValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FCD34D',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EEF2FF',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  grahaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  grahaItem: {
    width: '31%',
    backgroundColor: 'rgba(26, 33, 64, 0.5)',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  grahaName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EEF2FF',
  },
  grahaHouse: {
    fontSize: 11,
    color: '#FCD34D',
    marginTop: 2,
  },
  grahaSign: {
    fontSize: 10,
    color: '#94A3B8',
  },
});
