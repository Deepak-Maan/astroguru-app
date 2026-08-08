import React, { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../../src/theme';

const CERTS = [
  { id: '1', name: 'Jyotish Acharya', body: 'Bharatiya Vidya Bhavan', year: '2012', verified: true },
  { id: '2', name: 'Jyotish Visharad', body: 'ICAS — Indian Council of Astrological Sciences', year: '2015', verified: true },
  { id: '3', name: 'KP Astrology Certificate', body: 'KP Astro Academy', year: '2018', verified: true },
  { id: '4', name: 'Vastu Shastra Certificate', body: 'National Institute of Vastu', year: '2021', verified: false },
  { id: '5', name: 'Lal Kitab Practitioner', body: 'Lal Kitab Research Institute', year: '2023', verified: false },
];

export default function Certifications() {
  const router = useRouter();
  const [certs, setCerts] = useState(CERTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCertName, setNewCertName] = useState('');
  const [newCertBody, setNewCertBody] = useState('');
  const [newCertYear, setNewCertYear] = useState('');

  function handleAdd() {
    if (!newCertName.trim() || !newCertBody.trim()) {
      if (Platform.OS === 'web') alert('Please fill all fields.');
      else Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    setCerts((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newCertName.trim(), body: newCertBody.trim(), year: newCertYear || new Date().getFullYear().toString(), verified: false },
    ]);
    setNewCertName(''); setNewCertBody(''); setNewCertYear('');
    setModalVisible(false);
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Certifications & Degrees" subtitle="Your professional credentials" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🏆 Verification Status</Text>
            <Text style={styles.infoSub}>Verified credentials boost your profile trust score and appear with a ✅ badge to seekers.</Text>
          </View>

          {certs.map((cert) => (
            <View key={cert.id} style={[styles.certCard, { borderLeftColor: cert.verified ? colors.teal : '#F59E0B' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={styles.certName}>{cert.name}</Text>
                  <Text style={styles.certBody}>{cert.body}</Text>
                  <Text style={styles.certYear}>📅 Issued: {cert.year}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: cert.verified ? 'rgba(5,150,105,0.12)' : 'rgba(245,158,11,0.12)', borderColor: cert.verified ? colors.teal : '#F59E0B' }]}>
                  <Text style={[styles.badgeText, { color: cert.verified ? colors.teal : '#D97706' }]}>
                    {cert.verified ? '✅ Verified' : '⏳ Pending'}
                  </Text>
                </View>
              </View>
              {!cert.verified && (
                <Text style={styles.pendingNote}>Documents under review · Usually takes 3–5 business days</Text>
              )}
            </View>
          ))}

          <Pressable onPress={() => setModalVisible(true)} style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}>
            <Text style={styles.addBtnText}>＋ Add Certificate or Degree</Text>
          </Pressable>

        </ScrollView>

        {/* Add Certificate Modal */}
        <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add New Certificate</Text>
              <TextInput
                value={newCertName}
                onChangeText={setNewCertName}
                style={styles.modalInput}
                placeholder="Certificate / Degree name"
                placeholderTextColor={colors.textFaint}
              />
              <TextInput
                value={newCertBody}
                onChangeText={setNewCertBody}
                style={styles.modalInput}
                placeholder="Issuing institution"
                placeholderTextColor={colors.textFaint}
              />
              <TextInput
                value={newCertYear}
                onChangeText={setNewCertYear}
                style={styles.modalInput}
                placeholder="Year (e.g. 2024)"
                placeholderTextColor={colors.textFaint}
                keyboardType="numeric"
              />
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <Pressable onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleAdd} style={styles.confirmBtn}>
                  <Text style={styles.confirmBtnText}>Submit for Review</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  infoCard: {
    backgroundColor: 'rgba(5,150,105,0.08)', borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: 'rgba(5,150,105,0.2)', gap: 4,
  },
  infoTitle: { fontSize: 14, fontWeight: '800', color: colors.teal },
  infoSub: { fontSize: 12, color: colors.textMuted, fontWeight: '500', lineHeight: 18 },
  certCard: {
    backgroundColor: '#FFFFFF', borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)', borderLeftWidth: 4, gap: 8,
    shadowColor: '#BFDBFE', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 2,
  },
  certName: { fontSize: 15, fontWeight: '800', color: colors.text },
  certBody: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  certYear: { fontSize: 12, color: colors.textFaint, fontWeight: '600' },
  badge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  pendingNote: { fontSize: 11, color: '#D97706', fontStyle: 'italic', fontWeight: '600' },
  addBtn: {
    backgroundColor: '#FFFFFF', borderRadius: radius.lg, padding: 16, alignItems: 'center',
    borderWidth: 2, borderColor: colors.teal, borderStyle: 'dashed',
  },
  addBtnText: { color: colors.teal, fontWeight: '800', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.lg, gap: spacing.sm,
  },
  modalTitle: { fontSize: 18, fontWeight: '900', color: colors.text, marginBottom: 4 },
  modalInput: {
    backgroundColor: '#F8FAFC', borderRadius: radius.md, borderWidth: 1.5,
    borderColor: 'rgba(191,219,254,0.7)', padding: 12, fontSize: 14, color: colors.text,
  },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: '#F1F5F9', alignItems: 'center',
  },
  cancelBtnText: { fontWeight: '700', color: colors.textMuted },
  confirmBtn: {
    flex: 2, padding: 14, borderRadius: radius.md, backgroundColor: colors.teal, alignItems: 'center',
  },
  confirmBtnText: { fontWeight: '800', color: '#FFFFFF' },
});
