import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { Card } from '../src/components/Card';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../src/theme';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Privacy Policy" subtitle="Official Data Protection & Legal Terms" showBack />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header Banner */}
          <Card style={styles.bannerCard}>
            <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
            <Text style={{ fontSize: 36 }}>🛡️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>AstroGuru Privacy Policy</Text>
              <Text style={styles.bannerSub}>Effective Date: August 09, 2026 · Version 2.2.0</Text>
            </View>
          </Card>

          {/* Section 1 */}
          <Card>
            <Text style={styles.sectionTitle}>1. Introduction & Overview</Text>
            <Text style={styles.paragraph}>
              Welcome to AstroGuru ("we", "our", or "us"). We respect your privacy and are committed to protecting your personal data and birth details. This Privacy Policy explains how we collect, use, store, and safeguard your information when you use the AstroGuru mobile application or website.
            </Text>
          </Card>

          {/* Section 2 */}
          <Card>
            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
            <Text style={styles.paragraph}>
              To provide accurate Vedic Kundli charts, Rashifal predictions, and live consultations, AstroGuru collects:
            </Text>
            <Text style={styles.bullet}>• <Text style={{ fontWeight: '700' }}>Birth Profile Data:</Text> Name, Date of Birth, Time of Birth, and Place of Birth.</Text>
            <Text style={styles.bullet}>• <Text style={{ fontWeight: '700' }}>Account Credentials:</Text> Mobile number or email address used for secure OTP login verification.</Text>
            <Text style={styles.bullet}>• <Text style={{ fontWeight: '700' }}>Consultation History:</Text> Messages exchanged between Seekers and Certified Jyotishis during live chat sessions.</Text>
            <Text style={styles.bullet}>• <Text style={{ fontWeight: '700' }}>Wallet & Payment Logs:</Text> Transaction reference IDs for wallet recharges and consultation debits.</Text>
          </Card>

          {/* Section 3 */}
          <Card>
            <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
            <Text style={styles.paragraph}>
              Your information is used strictly for legitimate astrology services:
            </Text>
            <Text style={styles.bullet}>• Calculating exact planetary longitudes, Lagna charts, Dasha timelines, and 36-Gun Milan matching.</Text>
            <Text style={styles.bullet}>• Displaying personalized daily horoscope predictions and AI voice audio Rashifal.</Text>
            <Text style={styles.bullet}>• Connecting Seekers with online Acharyas for real-time live consultations.</Text>
            <Text style={styles.bullet}>• Processing virtual puja bookings and Prashad delivery dispatch.</Text>
          </Card>

          {/* Section 4 */}
          <Card>
            <Text style={styles.sectionTitle}>4. Data Security & Storage</Text>
            <Text style={styles.paragraph}>
              We employ industry-standard encryption protocols (HTTPS/SSL) and secure local storage mechanisms. We do not sell, rent, or trade your personal birth details or phone numbers to third-party advertisers.
            </Text>
          </Card>

          {/* Section 5 */}
          <Card>
            <Text style={styles.sectionTitle}>5. User Rights & Data Control</Text>
            <Text style={styles.paragraph}>
              You have full ownership of your data. You can view, edit, or reset your saved birth profile at any time directly from the app Settings or Profile screen. If you wish to delete your account data permanently, contact our privacy officer at support@astroguru.app.
            </Text>
          </Card>

          {/* Section 6 */}
          <Card style={{ backgroundColor: 'rgba(217,119,6,0.08)', borderColor: 'rgba(217,119,6,0.3)' }}>
            <Text style={[styles.sectionTitle, { color: colors.saffron }]}>6. Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have any questions regarding this Privacy Policy or data practices, please contact us:
            </Text>
            <Text style={{ ...typography.small, color: colors.text, fontWeight: '700', marginTop: 4 }}>
              📧 Email: support@astroguru.app
            </Text>
            <Text style={{ ...typography.small, color: colors.text, fontWeight: '700', marginTop: 2 }}>
              📍 Developer: AstroGuru Studios · New Delhi, India
            </Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  bannerCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, overflow: 'hidden' },
  bannerTitle: { ...typography.h2, color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  bannerSub: { ...typography.tiny, color: 'rgba(255,255,255,0.75)', marginTop: 2, fontWeight: '600' },

  sectionTitle: { ...typography.h3, color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: spacing.xs },
  paragraph: { ...typography.small, color: colors.textMuted, lineHeight: 20, fontWeight: '500' },
  bullet: { ...typography.small, color: colors.text, lineHeight: 22, marginTop: 4, paddingLeft: spacing.xs },
});
