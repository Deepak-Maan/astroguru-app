import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AstrotalkHeader } from '../src/components/astrotalk/AstrotalkHeader';
import { AstrotalkRechargeModal } from '../src/components/astrotalk/AstrotalkRechargeModal';
import { colors, radius, spacing } from '../src/theme';

interface VastuDirection {
  name: string;
  sanskrit: string;
  ruler: string;
  degrees: string;
  idealRooms: string[];
  avoidRooms: string[];
  remedy: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const VASTU_ZONES: Record<string, VastuDirection> = {
  NE: {
    name: 'North-East',
    sanskrit: 'Ishanya (ईशान कोण)',
    ruler: 'Lord Shiva / Jupiter (Guru)',
    degrees: '22.5° – 67.5°',
    idealRooms: ['Mandir / Puja Room', 'Meditation Corner', 'Water Fountain / Tank', 'Study Area'],
    avoidRooms: ['Kitchen (Fire Dosha)', 'Toilet / Bathroom', 'Heavy Master Bedroom', 'Shoe Racks'],
    remedy: 'Place a brass bowl with water and rose petals. Install a Guru Yantra if blocked.',
    color: '#0284C7',
    bgColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  E: {
    name: 'East',
    sanskrit: 'Indra (पूर्व दिशा)',
    ruler: 'Lord Indra / Sun (Surya)',
    degrees: '67.5° – 112.5°',
    idealRooms: ['Main Entrance Gate', 'Living Room', 'Balcony', 'Morning Sun Patio'],
    avoidRooms: ['Heavy Cluttered Storage', 'Master Bedroom', 'High boundary walls'],
    remedy: 'Hang a copper Sun symbol or place a brass Gayatri Yantra on the main wall.',
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  SE: {
    name: 'South-East',
    sanskrit: 'Agneya (आग्नेय कोण)',
    ruler: 'Lord Agni / Venus (Shukra)',
    degrees: '112.5° – 157.5°',
    idealRooms: ['Kitchen & Stove Cooking', 'Inverter / Electrical Panel', 'Geyser / Generator'],
    avoidRooms: ['Puja Room', 'Underground Water Tank', 'Master Bedroom'],
    remedy: 'Paint the kitchen in light pastel peach/cream. Place a red jasper gemstone near the stove.',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  S: {
    name: 'South',
    sanskrit: 'Yama (दक्षिण दिशा)',
    ruler: 'Lord Yama / Mars (Mangal)',
    degrees: '157.5° – 202.5°',
    idealRooms: ['Bedroom (Sleep head towards South)', 'Store Room', 'Heavy Staircase'],
    avoidRooms: ['Main Entrance (unless calibrated)', 'Water Boring', 'Mandir'],
    remedy: 'Place heavy wooden furniture in this corner to ground cosmic energies.',
    color: '#B45309',
    bgColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  SW: {
    name: 'South-West',
    sanskrit: 'Nairutya (नैऋत्य कोण)',
    ruler: 'Nirriti / Rahu',
    degrees: '202.5° – 247.5°',
    idealRooms: ['Master Bedroom for Family Head', 'Heavy Wardrobes / Safe', 'Overhead Water Tank'],
    avoidRooms: ['Main Entrance', 'Puja Room', 'Kitchen', 'Underground Water Tanks'],
    remedy: 'Keep this corner highest and heaviest. Place a natural Yellow Jasper pyramid.',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  W: {
    name: 'West',
    sanskrit: 'Varuna (पश्चिम दिशा)',
    ruler: 'Lord Varuna / Saturn (Shani)',
    degrees: '247.5° – 292.5°',
    idealRooms: ['Children Study Room', 'Dining Hall', 'Overhead Water Tank'],
    avoidRooms: ['Main Entrance (without Shani remedy)', 'Pooja Ghar'],
    remedy: 'Place a metal wind chime with 7 hollow rods or install a Shani Yantra.',
    color: '#475569',
    bgColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  NW: {
    name: 'North-West',
    sanskrit: 'Vayavya (वायव्य कोण)',
    ruler: 'Lord Vayu / Moon (Chandra)',
    degrees: '292.5° – 337.5°',
    idealRooms: ['Guest Bedroom', 'Finished Goods Storage', 'Car Parking', 'Pets Area'],
    avoidRooms: ['Master Bedroom (causes restlessness)', 'Puja Mandir'],
    remedy: 'Place a pair of brass running horses facing inwards to energize quick sales & vitality.',
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  N: {
    name: 'North',
    sanskrit: 'Kuber (उत्तर दिशा)',
    ruler: 'Lord Kuber / Mercury (Budh)',
    degrees: '337.5° – 22.5°',
    idealRooms: ['Cash Safe / Treasury Locker', 'Account Office', 'Study & Library', 'Open Balcony'],
    avoidRooms: ['Toilet', 'Heavy Concrete Walls', 'Kitchen Fire', 'Shoe Racks'],
    remedy: 'Place an energized Kuber Yantra or green indoor jade plant to attract wealth flow.',
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
};

export default function VastuCompassScreen() {
  const router = useRouter();
  const [selectedZone, setSelectedZone] = useState<string>('NE');
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);

  const zone = VASTU_ZONES[selectedZone];

  const handleZoneSelect = (z: string) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    setSelectedZone(z);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <AstrotalkHeader onOpenRecharge={() => setRechargeModalVisible(true)} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Title Header */}
          <View style={styles.titleBox}>
            <Text style={styles.heading}>🧭 Vedic Vastu Shastra Compass</Text>
            <Text style={styles.subHeading}>
              Align your home & workplace with cosmic 8-directional energies
            </Text>
          </View>

          {/* Compass Dial & Direction Grid */}
          <View style={styles.compassCard}>
            <Text style={styles.compassLabel}>Select Direction to Inspect Energy:</Text>
            
            <View style={styles.compassGrid}>
              {[
                { id: 'NW', label: 'NW\nवायव्य' },
                { id: 'N', label: 'N (North)\nकुबेर' },
                { id: 'NE', label: 'NE\nईशान' },
                { id: 'W', label: 'W (West)\nवरुण' },
                { id: 'CENTER', label: 'ब्रह्मस्थान\n(Center)' },
                { id: 'E', label: 'E (East)\nइंद्र' },
                { id: 'SW', label: 'SW\nनैऋत्य' },
                { id: 'S', label: 'S (South)\nयम' },
                { id: 'SE', label: 'SE\nआग्नेय' },
              ].map((item) => {
                if (item.id === 'CENTER') {
                  return (
                    <View key={item.id} style={styles.centerPill}>
                      <Text style={styles.centerText}>🌟{item.label}</Text>
                    </View>
                  );
                }

                const active = selectedZone === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handleZoneSelect(item.id)}
                    style={[styles.directionBtn, active && styles.directionBtnActive]}
                  >
                    {active && (
                      <LinearGradient
                        colors={['#FFC107', '#F59E0B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <Text style={[styles.directionText, active && styles.directionTextActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Zone Detail Analysis Card */}
          {zone && (
            <View style={[styles.detailCard, { backgroundColor: zone.bgColor, borderColor: zone.borderColor }]}>
              {/* Header */}
              <View style={styles.detailHeader}>
                <View>
                  <Text style={[styles.zoneName, { color: zone.color }]}>{zone.name} ({zone.degrees})</Text>
                  <Text style={styles.sanskritName}>{zone.sanskrit}</Text>
                </View>
                <View style={[styles.rulerPill, { backgroundColor: zone.color }]}>
                  <Text style={styles.rulerText}>👑 {zone.ruler}</Text>
                </View>
              </View>

              {/* Ideal Placements */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>✅ Highly Auspicious For:</Text>
                <View style={styles.bulletList}>
                  {zone.idealRooms.map((item, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <Text style={styles.checkIcon}>🟢</Text>
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Avoid Placements */}
              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionTitle, { color: '#DC2626' }]}>❌ Strictly Avoid Here (Vastu Dosha):</Text>
                <View style={styles.bulletList}>
                  {zone.avoidRooms.map((item, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <Text style={styles.crossIcon}>🔴</Text>
                      <Text style={[styles.bulletText, { color: '#7F1D1D' }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Remedy */}
              <View style={styles.remedyBox}>
                <Text style={styles.remedyHead}>🛡️ Vedic Vastu Remedy & Correction:</Text>
                <Text style={styles.remedyText}>{zone.remedy}</Text>
              </View>

              {/* Consult Vastu Expert CTA */}
              <Pressable
                onPress={() => router.push('/(tabs)/consult')}
                style={({ pressed }) => [styles.consultExpertBtn, pressed && { opacity: 0.88 }]}
              >
                <LinearGradient
                  colors={['#FFC107', '#F59E0B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.consultExpertText}>
                  Talk to Vastu Astrologer for Map Analysis ➔
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Recharge Modal */}
      <AstrotalkRechargeModal
        visible={rechargeModalVisible}
        onClose={() => setRechargeModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 100,
  },
  titleBox: {
    gap: 3,
  },
  heading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  subHeading: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  compassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  compassLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 12,
  },
  compassGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  directionBtn: {
    width: '31%',
    height: 64,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  directionBtnActive: {
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  directionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4B5563',
    textAlign: 'center',
  },
  directionTextActive: {
    color: '#1A1A1A',
    fontWeight: '900',
  },
  centerPill: {
    width: '31%',
    height: 64,
    borderRadius: 14,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B45309',
    textAlign: 'center',
  },
  detailCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    gap: 14,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  zoneName: {
    fontSize: 18,
    fontWeight: '900',
  },
  sanskritName: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '700',
    marginTop: 2,
  },
  rulerPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  rulerText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sectionBlock: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#065F46',
  },
  bulletList: {
    gap: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkIcon: {
    fontSize: 10,
  },
  crossIcon: {
    fontSize: 10,
  },
  bulletText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  remedyBox: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 3,
  },
  remedyHead: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B45309',
  },
  remedyText: {
    fontSize: 11.5,
    color: '#374151',
    lineHeight: 16,
    fontWeight: '600',
  },
  consultExpertBtn: {
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  consultExpertText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1A1A1A',
  },
});
