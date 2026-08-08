import React, { useState } from 'react';
import {
  Alert, Platform, Pressable, ScrollView, StyleSheet,
  Switch, Text, TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Card } from '../../src/components/Card';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';

const LANGUAGES = ['Hindi', 'English', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Punjabi'];
const SPECIALIZATIONS = ['Vedic Kundli', 'Nadi Jyotish', 'Lal Kitab', 'Prashna', 'KP System', 'Muhurta', 'Gemology', 'Vastu', 'Numerology', 'Palmistry'];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function ConsultationProfile() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);

  const [name, setName] = useState(authUser?.name ?? 'Acharya Dev Sharma');
  const [bio, setBio] = useState('I am a Certified Vedic Astrologer with 12+ years of experience. Specializing in birth chart analysis, Dasha predictions, and Vedic remedies. I have guided 4,200+ seekers across India and abroad towards their cosmic destiny.');
  const [experience, setExperience] = useState('12');
  const [rate, setRate] = useState('45');
  const [isOnline, setIsOnline] = useState(true);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['Hindi', 'English']);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(['Vedic Kundli', 'Nadi Jyotish', 'Lal Kitab', 'KP System']);

  function toggleLang(lang: string) {
    setSelectedLangs((prev) => prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]);
  }

  function toggleSpec(spec: string) {
    setSelectedSpecs((prev) => prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]);
  }

  function handleSave() {
    if (Platform.OS === 'web') {
      alert('✅ Profile saved successfully!\nChanges will reflect on your public profile within a few minutes.');
    } else {
      Alert.alert('Profile Saved ✅', 'Your consultation profile has been updated successfully.');
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Consultation Profile" subtitle="Your public Acharya profile" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Visibility Toggle */}
          <View style={styles.visibilityCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.visLabel}>Profile Visibility</Text>
              <Text style={styles.visSub}>{isOnline ? '🟢 You are Online & Accepting Clients' : '🔴 You are Offline'}</Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ true: colors.teal, false: '#CBD5E1' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Display Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Your Acharya name"
              placeholderTextColor={colors.textFaint}
            />
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.label}>About / Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              style={[styles.input, styles.textArea]}
              placeholder="Describe your expertise, experience and approach…"
              placeholderTextColor={colors.textFaint}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{bio.length} characters</Text>
          </View>

          {/* Experience & Rate row */}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>Experience (Years)</Text>
              <TextInput
                value={experience}
                onChangeText={setExperience}
                style={styles.input}
                keyboardType="numeric"
                placeholder="12"
                placeholderTextColor={colors.textFaint}
              />
            </View>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>Rate (₹/min)</Text>
              <TextInput
                value={rate}
                onChangeText={setRate}
                style={styles.input}
                keyboardType="numeric"
                placeholder="45"
                placeholderTextColor={colors.textFaint}
              />
            </View>
          </View>

          {/* Languages */}
          <View style={styles.section}>
            <Text style={styles.label}>Languages Spoken</Text>
            <View style={styles.chipWrap}>
              {LANGUAGES.map((l) => (
                <Chip key={l} label={l} selected={selectedLangs.includes(l)} onPress={() => toggleLang(l)} />
              ))}
            </View>
          </View>

          {/* Specializations */}
          <View style={styles.section}>
            <Text style={styles.label}>Specializations</Text>
            <View style={styles.chipWrap}>
              {SPECIALIZATIONS.map((s) => (
                <Chip key={s} label={s} selected={selectedSpecs.includes(s)} onPress={() => toggleSpec(s)} />
              ))}
            </View>
          </View>

          {/* Save Button */}
          <Pressable onPress={handleSave} style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}>
            <Text style={styles.saveBtnText}>✅ Save Profile Changes</Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  visibilityCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: '#FFFFFF', borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)',
    shadowColor: '#BFDBFE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 2,
  },
  visLabel: { fontSize: 15, fontWeight: '800', color: colors.text },
  visSub: { fontSize: 12, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
  section: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 2 },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: radius.md, borderWidth: 1.5,
    borderColor: 'rgba(191,219,254,0.7)', padding: 12, fontSize: 15,
    color: colors.text, fontWeight: '500',
  },
  textArea: { minHeight: 110, paddingTop: 12 },
  charCount: { fontSize: 11, color: colors.textFaint, alignSelf: 'flex-end' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: 'rgba(191,219,254,0.6)',
  },
  chipSelected: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  chipTextSelected: { color: '#FFFFFF' },
  saveBtn: {
    backgroundColor: colors.teal, borderRadius: radius.lg, padding: 16,
    alignItems: 'center', marginTop: spacing.sm,
    shadowColor: colors.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});
