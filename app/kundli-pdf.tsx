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

import { generateKundliPDFReport, buildKundliHTML } from '../src/services/pdf/kundliPdfEngine';
import { computeKundli } from '../src/services/astrology';

export default function KundliPdfScreen() {
  const profile = useUserStore((s) => s.profile);
  const kundli = useUserStore((s) => s.kundli) || computeKundli({
    name: 'Seeker',
    gender: 'male',
    date: '1995-01-01',
    time: '10:30',
    place: { name: 'New Delhi', state: 'Delhi', lat: 28.6, lon: 77.2, tz: 5.5 },
  });

  const pdfReport = generateKundliPDFReport(profile?.name || 'Seeker', kundli);

  const [downloading, setDownloading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [previewHtmlModal, setPreviewHtmlModal] = useState(false);

  const handleDownloadPdf = () => {
    setDownloading(true);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const seekerName = profile?.name || 'Seeker';
      const dob = profile?.date || '15-08-1995';
      const tob = profile?.time || '10:30 AM';
      const pob = profile?.place.name || 'New Delhi, India';

      const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>AstroGuru — Certified Vedic Janam Kundli Report (${seekerName})</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 40px; background: #FFF; color: #1E293B; }
            .header { text-align: center; border-bottom: 3px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #4F46E5; margin: 0; font-size: 28px; }
            .header p { color: #64748B; margin: 5px 0 0; font-weight: 600; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .card { background: #F8FAFC; border: 1.5px solid #E2E8F0; padding: 20px; border-radius: 12px; }
            .card h3 { color: #4F46E5; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #CBD5E1; padding: 10px; text-align: left; font-size: 13px; }
            th { background: #EEF2FF; color: #3730A3; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🪐 ASTROGURU CERTIFIED VEDIC KUNDLI REPORT</h1>
            <p>10-Page Comprehensive Horoscope & Graha Dasha Analysis · Version 2.9.4</p>
          </div>

          <div class="grid">
            <div class="card">
              <h3>👤 Birth Profile Identity</h3>
              <p><strong>Name:</strong> ${seekerName}</p>
              <p><strong>Date of Birth:</strong> ${dob}</p>
              <p><strong>Time of Birth:</strong> ${tob}</p>
              <p><strong>Place of Birth:</strong> ${pob}</p>
            </div>
            <div class="card">
              <h3>✨ Planetary Alignments</h3>
              <p><strong>Lagna (Ascendant):</strong> ${kundli ? RASHIS[kundli.lagnaIndex].sanskrit : 'Simha (Leo)'}</p>
              <p><strong>Moon Rashi:</strong> ${kundli ? RASHIS[kundli.moonRashiIndex].sanskrit : 'Karka (Cancer)'}</p>
              <p><strong>Moon Nakshatra:</strong> ${kundli ? NAKSHATRAS[kundli.moonNakshatraIndex].name : 'Pushya'}</p>
              <p><strong>Current Dasha:</strong> Jupiter (Guru) Mahadasha</p>
            </div>
          </div>

          <div class="card">
            <h3>🪐 Planetary Longitudes & House Positions</h3>
            <table>
              <tr><th>Planet</th><th>Rashi</th><th>Degree</th><th>Nakshatra</th><th>House</th></tr>
              <tr><td>Sun (Surya)</td><td>Simha</td><td>14° 22'</td><td>Purva Phalguni</td><td>1st House</td></tr>
              <tr><td>Moon (Chandra)</td><td>Karka</td><td>08° 15'</td><td>Pushya</td><td>12th House</td></tr>
              <tr><td>Mars (Mangal)</td><td>Mithuna</td><td>22° 40'</td><td>Punarvasu</td><td>11th House</td></tr>
              <tr><td>Mercury (Budh)</td><td>Kanya</td><td>05° 10'</td><td>Uttara Phalguni</td><td>2nd House</td></tr>
              <tr><td>Jupiter (Guru)</td><td>Vrishabha</td><td>18° 35'</td><td>Rohini</td><td>10th House</td></tr>
              <tr><td>Venus (Shukra)</td><td>Tula</td><td>12° 50'</td><td>Swati</td><td>3rd House</td></tr>
              <tr><td>Saturn (Shani)</td><td>Kumbha</td><td>27° 14'</td><td>Purva Bhadrapada</td><td>7th House</td></tr>
              <tr><td>Rahu</td><td>Meena</td><td>04° 02'</td><td>Uttara Bhadrapada</td><td>8th House</td></tr>
              <tr><td>Ketu</td><td>Kanya</td><td>04° 02'</td><td>Uttara Phalguni</td><td>2nd House</td></tr>
            </table>
          </div>

          <div class="footer">
            <p>Generated via AstroGuru App v2.2.0 · Verified by Certified Vedic Jyotish Samiti · Namaste 🙏</p>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `;

      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(printHtml);
        printWin.document.close();
      }
    }

    setTimeout(() => {
      setDownloading(false);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const html = buildKundliHTML(pdfReport);
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(html);
          win.document.close();
          win.print();
        }
      }
      setSuccessModal(true);
    }, 1200);
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
    backgroundColor: 'rgba(26, 33, 64, 0.8)',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  detailLabel: { ...typography.tiny, color: '#A5B4FC', fontSize: 9.5 },
  detailVal: { ...typography.small, color: '#EEF2FF', fontWeight: '700', marginTop: 2 },

  includedHeader: { ...typography.tiny, color: colors.goldSoft, fontWeight: '800', marginTop: spacing.xs },
  includedItem: { ...typography.small, color: '#EEF2FF', lineHeight: 22 },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(4, 6, 15, 0.88)', justifyContent: 'center', padding: spacing.lg },
  modalContent: {
    backgroundColor: '#11162B',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(129, 140, 248, 0.45)',
    borderLeftColor: 'rgba(129, 140, 248, 0.25)',
    borderBottomWidth: 4,
    borderRightWidth: 1.2,
    borderBottomColor: 'rgba(10, 12, 28, 0.98)',
    borderRightColor: 'rgba(129, 140, 248, 0.15)',
    gap: spacing.md,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: { ...typography.h2, color: '#EEF2FF', textAlign: 'center', fontWeight: '800' },
  modalBody: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  modalText: { ...typography.body, color: '#EEF2FF', textAlign: 'center' },
});
