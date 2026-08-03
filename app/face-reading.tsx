import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';

export default function FaceReadingScreen() {
  const router = useRouter();

  const [scanning, setScanning] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const handleStartScan = () => {
    setScanning(true);
    setReport(null);
    setTimeout(() => {
      setScanning(false);
      setReport({
        forehead: 'Broad & High Forehead — Indicates exceptional strategic intelligence & leadership capabilities.',
        eyes: 'Bright Deep Eyes — Shows high emotional intuition and strong artistic vision.',
        chin: 'Square Defined Jawline — Signifies unshakeable determination, perseverance, and financial resilience.',
        destinyAge: 'Peak fortune & major career rise predicted between ages 28–34.',
      });
    }, 2500);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="🤖 Samudrika AI Face Reader" showBack />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={{ gap: spacing.md, alignItems: 'center' }}>
            <View style={styles.scannerCircle}>
              <LinearGradient
                colors={['rgba(109,40,217,0.18)', 'rgba(245,158,11,0.06)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 54 }}>👤</Text>
            </View>

            <Text style={styles.scannerTitle}>Samudrika Shastra Facial Geometry</Text>
            <Text style={styles.scannerSub}>Analyzes forehead lines, eye depth & chin geometry for fortune prediction.</Text>

            <Button
              label={scanning ? 'Scanning Facial Features…' : '📷 Take Selfie & Scan Face'}
              variant="gold"
              loading={scanning}
              onPress={handleStartScan}
            />
          </Card>

          {report && (
            <Card style={{ gap: spacing.sm }}>
              <SectionHeader title="Samudrika Shastra AI Analysis" />

              <View style={styles.featureBox}>
                <Text style={styles.featureLabel}>🧠 Forehead & Intellect:</Text>
                <Text style={styles.featureVal}>{report.forehead}</Text>
              </View>

              <View style={styles.featureBox}>
                <Text style={styles.featureLabel}>👁️ Eyes & Intuition:</Text>
                <Text style={styles.featureVal}>{report.eyes}</Text>
              </View>

              <View style={styles.featureBox}>
                <Text style={styles.featureLabel}>🗿 Jawline & Determination:</Text>
                <Text style={styles.featureVal}>{report.chin}</Text>
              </View>

              <View style={styles.destinyBox}>
                <Text style={styles.destinyTitle}>🌟 Destiny & Career Age Peak:</Text>
                <Text style={styles.destinyVal}>{report.destinyAge}</Text>
              </View>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  scannerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scannerTitle: { ...typography.h2, color: colors.text, textAlign: 'center', fontWeight: '800' },
  scannerSub: { ...typography.small, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },

  featureBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    gap: 2,
  },
  featureLabel: { ...typography.tiny, color: colors.saffron, fontWeight: '800' },
  featureVal: { ...typography.small, color: colors.text, lineHeight: 18 },

  destinyBox: {
    backgroundColor: 'rgba(109,40,217,0.10)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(109,40,217,0.3)',
    gap: 2,
    marginTop: 4,
  },
  destinyTitle: { ...typography.tiny, color: colors.auroraA, fontWeight: '800' },
  destinyVal: { ...typography.small, color: colors.text, fontWeight: '800', lineHeight: 18 },
});
