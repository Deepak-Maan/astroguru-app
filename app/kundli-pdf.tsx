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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { useUserStore } from '../src/store/userStore';
import { RASHIS } from '../src/data/rashis';
import { NAKSHATRAS } from '../src/data/nakshatras';

export default function KundliPdfScreen() {
  const profile = useUserStore((s) => s.profile);
  const kundli = useUserStore((s) => s.kundli);

  const [downloading, setDownloading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const handleDownloadPdf = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setSuccessModal(true);
    }, 1500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🪐 My Vedic Kundli Report (${profile?.name || 'Seeker'}):\nLagna: ${
        kundli ? RASHIS[kundli.lagnaIndex].sanskrit : 'Simha'
      }\nRashi: ${
        kundli ? RASHIS[kundli.moonRashiIndex].sanskrit : 'Karka'
      }\nNakshatra: ${
        kundli ? NAKSHATRAS[kundli.moonNakshatraIndex].name : 'Pushya'
      }\n\nGenerated via AstroGuru App ✨`
    );
    const url = `https://api.whatsapp.com/send?text=${text}`;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Kundli PDF & Export" subtitle="Generate Printable 10-Page Vedic Chart" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero PDF Card Preview */}
          <Card style={styles.pdfHeroCard}>
            <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={StyleSheet.absoluteFill} />

            <View style={styles.pdfHeaderRow}>
              <Text style={{ fontSize: 36 }}>📄</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.pdfTitle}>{profile?.name || 'Seeker'}'s Full Kundli Report</Text>
                <Text style={styles.pdfSub}>10-Page Certified Vedic Janam Kundli (PDF)</Text>
              </View>
              <Chip label="HD Printable" tone="gold" />
            </View>

            <View style={styles.pdfDetailsGrid}>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>BIRTH DATE & TIME</Text>
                <Text style={styles.detailVal}>{profile?.date || '01-07-2003'} · {profile?.time || '11:15'}</Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>BIRTH PLACE</Text>
                <Text style={styles.detailVal}>{profile?.place.name || 'New Delhi'}</Text>
              </View>
            </View>

            {/* Included Sections */}
            <Text style={styles.includedHeader}>Included Report Sections:</Text>
            {[
              '✅ Lagna (D1) & Moon (Chandra) Birth Charts',
              '✅ Navamsha (D9) Marriage & Destiny Chart',
              '✅ 9 Graha Longitudes, Constellations & Pada Breakdown',
              '✅ 120-Year Vimshottari Dasha Timeline (Mahadasha & Antardasha)',
              '✅ Mangal Dosha & Sade Sati Analysis Report',
              '✅ Personalised Gemstone & Rudraksha Remedy Recommendations',
            ].map((item, idx) => (
              <Text key={idx} style={styles.includedItem}>{item}</Text>
            ))}

            <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
              <Button
                label={downloading ? 'Generating PDF Report…' : '📥 Download 10-Page Kundli PDF'}
                variant="gold"
                size="lg"
                loading={downloading}
                onPress={handleDownloadPdf}
              />
              <Button
                label="📲 Share Kundli Summary via WhatsApp"
                variant="outline"
                size="md"
                onPress={handleWhatsAppShare}
              />
            </View>
          </Card>
        </ScrollView>

        {/* ── SUCCESS MODAL ── */}
        <Modal visible={successModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>PDF Ready for Download!</Text>
              <View style={styles.modalBody}>
                <Text style={{ fontSize: 48 }}>✅ 📄</Text>
                <Text style={styles.modalText}>
                  Your 10-page Kundli PDF report has been generated successfully.
                </Text>
              </View>

              <View style={{ gap: spacing.sm }}>
                <Button label="📲 Share on WhatsApp" variant="gold" size="md" onPress={handleWhatsAppShare} />
                <Button label="Close" variant="outline" size="sm" onPress={() => setSuccessModal(false)} />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  pdfHeroCard: { gap: spacing.md },
  pdfHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pdfTitle: { ...typography.h2, color: colors.text, fontSize: 18, fontWeight: '800' },
  pdfSub: { ...typography.small, color: colors.textMuted, marginTop: 2, fontSize: 12 },

  pdfDetailsGrid: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  detailBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#E3E8F3',
  },
  detailLabel: { ...typography.tiny, color: colors.textFaint, fontSize: 9.5 },
  detailVal: { ...typography.small, color: colors.text, fontWeight: '700', marginTop: 2 },

  includedHeader: { ...typography.tiny, color: colors.saffron, fontWeight: '800', marginTop: spacing.xs },
  includedItem: { ...typography.small, color: colors.text, lineHeight: 22 },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(27,20,56,0.60)', justifyContent: 'center', padding: spacing.lg },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    gap: spacing.md,
    shadowColor: 'rgba(160,175,205,0.40)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 8,
  },
  modalTitle: { ...typography.h2, color: colors.saffron, textAlign: 'center', fontWeight: '800' },
  modalBody: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  modalText: { ...typography.body, color: colors.text, textAlign: 'center' },
});
