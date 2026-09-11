import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export interface AstrologerRemedy {
  id: string;
  astrologerName: string;
  consultationDate: string;
  problemArea: string;
  gemstone: {
    name: string;
    carat: string;
    finger: string;
    metal: string;
    inStore: boolean;
  };
  mantra: {
    name: string;
    count: number;
    recommendedTime: string;
  };
  fasting: string;
  donation: string;
}

interface Props {
  remedy?: AstrologerRemedy;
}

const DEFAULT_REMEDY: AstrologerRemedy = {
  id: 'rem_1',
  astrologerName: 'Acharya Raghavendra',
  consultationDate: 'Recent Consultation',
  problemArea: 'Career Growth & Shani Dasha Peace',
  gemstone: {
    name: 'Yellow Sapphire (Pukhraj)',
    carat: '4.5 Ratti',
    finger: 'Index Finger (Right Hand)',
    metal: 'Gold / Brass on Thursday morning',
    inStore: true,
  },
  mantra: {
    name: 'ॐ बृं बृहस्पतये नमः (Guru Beej Mantra)',
    count: 108,
    recommendedTime: 'Morning before 08:00 AM facing East',
  },
  fasting: 'Thursday Fast (Guruwar Vrat with yellow prasad)',
  donation: 'Donate yellow lentils (Chana Dal) & turmeric at temple',
};

export function RemedySummaryCard({ remedy = DEFAULT_REMEDY }: Props) {
  const router = useRouter();

  const handleOrderGemstone = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}
    router.push('/store');
  };

  const handleStartJapa = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}
    router.push('/japa');
  };

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={['#1E1B4B', '#0F172A', '#1E293B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Top Astrologer Banner */}
        <View style={styles.topRow}>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>📜 DIGITAL REMEDY PRESCRIPTION</Text>
          </View>
          <Text style={styles.dateText}>{remedy.consultationDate}</Text>
        </View>

        <Text style={styles.doctorName}>Prescribed by: {remedy.astrologerName}</Text>
        <Text style={styles.problemArea}>🎯 Focus: {remedy.problemArea}</Text>

        <View style={styles.divider} />

        {/* 1. Prescribed Gemstone */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionIcon}>💎</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>Blessed Gemstone: {remedy.gemstone.name}</Text>
            <Text style={styles.itemSub}>
              {remedy.gemstone.carat} • {remedy.gemstone.finger} • {remedy.gemstone.metal}
            </Text>

            <Pressable
              onPress={handleOrderGemstone}
              style={({ pressed }) => [styles.storeActionBtn, pressed && { opacity: 0.85 }]}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.storeActionText}>🛒 Order Lab-Certified Gemstone ➔</Text>
            </Pressable>
          </View>
        </View>

        {/* 2. Prescribed Mantra */}
        <View style={[styles.sectionRow, { marginTop: 12 }]}>
          <Text style={styles.sectionIcon}>📿</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>Daily Japa: {remedy.mantra.name}</Text>
            <Text style={styles.itemSub}>
              {remedy.mantra.count} Repetitions • {remedy.mantra.recommendedTime}
            </Text>

            <Pressable
              onPress={handleStartJapa}
              style={({ pressed }) => [styles.japaActionBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.japaActionText}>📿 Open Digital Japa Counter ➔</Text>
            </Pressable>
          </View>
        </View>

        {/* 3. Fasting & Charity */}
        <View style={styles.fastingBox}>
          <Text style={styles.fastingText}>
            🌿 <Text style={{ fontWeight: '800', color: '#FCD34D' }}>Fasting & Charity:</Text> {remedy.fasting} • {remedy.donation}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 8,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FCD34D',
    letterSpacing: 0.3,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  problemArea: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  sectionIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F1F5F9',
  },
  itemSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 15,
  },
  storeActionBtn: {
    borderRadius: 10,
    overflow: 'hidden',
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  storeActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  japaActionBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  japaActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FCD34D',
  },
  fastingBox: {
    marginTop: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  fastingText: {
    fontSize: 11,
    color: '#FEF3C7',
    lineHeight: 16,
  },
});
