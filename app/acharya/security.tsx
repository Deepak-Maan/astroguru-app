import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function Security() {
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [twoFactor, setTwoFactor] = useState(true);

  // Privacy controls
  const [visibilityRadio, setVisibilityRadio] = useState<'everyone' | 'registered' | 'vip'>('everyone');
  const [allowSched, setAllowSched] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  function handlePassChange() {
    if (!currPass || !newPass || !confirmPass) {
      if (Platform.OS === 'web') alert('Please fill in all password fields.');
      else Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    if (newPass !== confirmPass) {
      if (Platform.OS === 'web') alert('New passwords do not match.');
      else Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (Platform.OS === 'web') alert('✅ Password updated successfully!');
    else Alert.alert('Success', 'Password updated successfully!');
    setCurrPass(''); setNewPass(''); setConfirmPass('');
  }

  function handleSignoutAll() {
    const msg = 'Sign out of all other active sessions across mobile & web?';
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) alert('✅ All other active sessions terminated.');
    } else {
      Alert.alert('Sign Out All', msg, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out All', style: 'destructive', onPress: () => Alert.alert('Sessions Ended', 'All other active sessions terminated.') },
      ]);
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Security & Privacy Vault" subtitle="Account security & data preferences" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Change Password */}
          <Text style={styles.sectionTitle}>🔒 Change Password</Text>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Current Password</Text>
            <TextInput value={currPass} onChangeText={setCurrPass} secureTextEntry style={styles.input} placeholder="••••••••" placeholderTextColor={colors.textFaint} />
            
            <Text style={styles.fieldLabel}>New Password</Text>
            <TextInput value={newPass} onChangeText={setNewPass} secureTextEntry style={styles.input} placeholder="••••••••" placeholderTextColor={colors.textFaint} />

            <Text style={styles.fieldLabel}>Confirm New Password</Text>
            <TextInput value={confirmPass} onChangeText={setConfirmPass} secureTextEntry style={styles.input} placeholder="••••••••" placeholderTextColor={colors.textFaint} />

            <Pressable onPress={handlePassChange} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}>
              <Text style={styles.actionBtnText}>Update Password</Text>
            </Pressable>
          </View>

          {/* 2FA */}
          <View style={styles.switchCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Two-Factor Authentication (2FA)</Text>
              <Text style={styles.cardSub}>Require OTP code via SMS/WhatsApp on new logins</Text>
            </View>
            <Switch value={twoFactor} onValueChange={setTwoFactor} trackColor={{ true: colors.teal, false: '#CBD5E1' }} thumbColor="#FFFFFF" />
          </View>

          {/* Active Sessions */}
          <Text style={styles.sectionTitle}>📱 Active Sessions</Text>
          <View style={styles.card}>
            <View style={styles.sessionRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sessionName}>Android App (This Device)</Text>
                <Text style={styles.sessionMeta}>📍 New Delhi, India · Active Now</Text>
              </View>
              <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>Current</Text></View>
            </View>

            <View style={[styles.sessionRow, { borderTopWidth: 1, borderTopColor: 'rgba(191,219,254,0.4)', paddingTop: 10 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sessionName}>Chrome / Windows PC</Text>
                <Text style={styles.sessionMeta}>📍 New Delhi, India · 2 hours ago</Text>
              </View>
            </View>

            <Pressable onPress={handleSignoutAll} style={styles.dangerBtn}>
              <Text style={styles.dangerBtnText}>🚪 Sign Out All Other Devices</Text>
            </Pressable>
          </View>

          {/* Privacy Settings */}
          <Text style={styles.sectionTitle}>👁️ Privacy Controls</Text>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Who can view my full profile?</Text>
            {(['everyone', 'registered', 'vip'] as const).map((opt) => (
              <Pressable key={opt} onPress={() => setVisibilityRadio(opt)} style={styles.radioRow}>
                <View style={[styles.radioCircle, visibilityRadio === opt && styles.radioCircleActive]}>
                  {visibilityRadio === opt && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>
                  {opt === 'everyone' ? 'Everyone (Public)' : opt === 'registered' ? 'Registered Users Only' : 'VIP Subscribers Only'}
                </Text>
              </Pressable>
            ))}

            <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: 'rgba(191,219,254,0.4)', paddingTop: 12, marginTop: 4 }]}>
              <Text style={styles.switchLabel}>Show availability schedule on profile</Text>
              <Switch value={allowSched} onValueChange={setAllowSched} trackColor={{ true: colors.teal, false: '#CBD5E1' }} thumbColor="#FFFFFF" />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Allow past clients to see session history</Text>
              <Switch value={showHistory} onValueChange={setShowHistory} trackColor={{ true: colors.teal, false: '#CBD5E1' }} thumbColor="#FFFFFF" />
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)',
  },
  switchCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: '#FFFFFF', borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)',
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textMuted, fontWeight: '500', marginTop: 2 },
  fieldLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '700' },
  input: {
    backgroundColor: '#F8FAFC', borderRadius: radius.md, borderWidth: 1.5,
    borderColor: 'rgba(191,219,254,0.7)', padding: 12, fontSize: 14, color: colors.text,
  },
  actionBtn: {
    backgroundColor: colors.teal, borderRadius: radius.md, padding: 12, alignItems: 'center', marginTop: 4,
  },
  actionBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sessionName: { fontSize: 14, fontWeight: '800', color: colors.text },
  sessionMeta: { fontSize: 11, color: colors.textFaint, fontWeight: '600', marginTop: 2 },
  currentBadge: { backgroundColor: 'rgba(5,150,105,0.1)', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  currentBadgeText: { color: colors.teal, fontSize: 10, fontWeight: '800' },
  dangerBtn: { paddingVertical: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(239,68,68,0.2)', marginTop: 4 },
  dangerBtnText: { color: colors.danger, fontWeight: '800', fontSize: 13 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  radioCircleActive: { borderColor: colors.teal },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.teal },
  radioText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { fontSize: 13, color: colors.text, fontWeight: '600', flex: 1 },
});
