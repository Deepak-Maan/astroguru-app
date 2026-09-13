import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../../src/theme';

const THRESHOLDS = ['₹500', '₹1,000', '₹2,000', '₹5,000'];

export default function BankSettings() {
  const [threshold, setThreshold] = useState('₹1,000');
  const [autoPayout, setAutoPayout] = useState(true);
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [holderName, setHolderName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [editingBank, setEditingBank] = useState(false);

  function handleSave() {
    if (Platform.OS === 'web') alert('✅ Bank details saved successfully!');
    else Alert.alert('Saved ✅', 'Your bank and payout settings have been updated.');
    setEditingBank(false);
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Bank & UPI Settings" subtitle="Manage your payout methods" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* TDS Info Card */}
          <View style={styles.tdsCard}>
            <Text style={styles.tdsTitle}>📋 TDS Information</Text>
            <Text style={styles.tdsSub}>10% TDS is deducted on consultation earnings exceeding ₹30,000/year as per Income Tax Act Section 194J. Form 16A issued quarterly.</Text>
          </View>

          {/* Current Bank Account */}
          <Text style={styles.sectionLabel}>🏦 Linked Bank Account</Text>
          <View style={styles.accountCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ gap: 4 }}>
                <Text style={styles.accountBank}>HDFC Bank</Text>
                <Text style={styles.accountNumber}>XXXX XXXX XXXX 4821</Text>
                <Text style={styles.accountHolder}>Account holder: {'\u0041charya Dev Sharma'}</Text>
              </View>
              <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✅ Verified</Text></View>
            </View>
            <Pressable onPress={() => setEditingBank(!editingBank)} style={styles.changeBtn}>
              <Text style={styles.changeBtnText}>{editingBank ? 'Cancel Changes' : '✏️ Change Bank Account'}</Text>
            </Pressable>
          </View>

          {/* Edit Bank Form */}
          {editingBank && (
            <View style={styles.editCard}>
              <Text style={styles.editTitle}>Update Bank Details</Text>
              <Text style={styles.fieldLabel}>Account Number</Text>
              <TextInput value={accountNumber} onChangeText={setAccountNumber} style={styles.input} placeholder="Enter account number" placeholderTextColor={colors.textFaint} keyboardType="numeric" secureTextEntry />
              <Text style={styles.fieldLabel}>IFSC Code</Text>
              <TextInput value={ifsc} onChangeText={setIfsc} style={styles.input} placeholder="E.g. HDFC0001234" placeholderTextColor={colors.textFaint} autoCapitalize="characters" />
              <Text style={styles.fieldLabel}>Account Holder Name</Text>
              <TextInput value={holderName} onChangeText={setHolderName} style={styles.input} placeholder="As per bank records" placeholderTextColor={colors.textFaint} />
              <Text style={styles.noteText}>⚠️ Documents (cancelled cheque/passbook) may be required for verification.</Text>
            </View>
          )}

          {/* UPI Section */}
          <Text style={styles.sectionLabel}>📱 UPI ID</Text>
          <View style={styles.accountCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ gap: 2 }}>
                <Text style={styles.accountBank}>acharya@ybl</Text>
                <Text style={styles.accountHolder}>Linked to PhonePe</Text>
              </View>
              <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✅ Verified</Text></View>
            </View>
          </View>
          <View style={styles.upiAddRow}>
            <TextInput value={upiId} onChangeText={setUpiId} style={[styles.input, { flex: 1 }]} placeholder="Add new UPI ID (e.g. name@upi)" placeholderTextColor={colors.textFaint} />
            <Pressable style={styles.addUpiBtn}>
              <Text style={styles.addUpiBtnText}>Add</Text>
            </Pressable>
          </View>

          {/* Minimum Payout Threshold */}
          <Text style={styles.sectionLabel}>💰 Minimum Payout Threshold</Text>
          <View style={styles.thresholdRow}>
            {THRESHOLDS.map((t) => (
              <Pressable key={t} onPress={() => setThreshold(t)} style={[styles.thresholdBtn, threshold === t && styles.thresholdBtnActive]}>
                <Text style={[styles.thresholdBtnText, threshold === t && styles.thresholdBtnTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          {/* Auto Payout */}
          <View style={styles.autoPayoutCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.autoPayoutLabel}>Auto Payout (Every Monday)</Text>
              <Text style={styles.autoPayoutSub}>Automatically transfer balance above threshold every Monday</Text>
            </View>
            <Switch value={autoPayout} onValueChange={setAutoPayout} trackColor={{ true: colors.teal, false: '#CBD5E1' }} thumbColor="#FFFFFF" />
          </View>

          <Pressable onPress={handleSave} style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}>
            <Text style={styles.saveBtnText}>💾 Save Settings</Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  tdsCard: {
    backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: radius.lg, padding: spacing.md, gap: 4,
    borderWidth: 1, borderColor: 'rgba(129,140,248,0.3)',
  },
  tdsTitle: { fontSize: 14, fontWeight: '800', color: '#A5B4FC' },
  tdsSub: { fontSize: 12, color: '#EEF2FF', lineHeight: 18, fontWeight: '500' },
  sectionLabel: { fontSize: 14, fontWeight: '800', color: '#EEF2FF' },
  accountCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.78)', borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm,
    borderWidth: 1, borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  accountBank: { fontSize: 15, fontWeight: '800', color: '#EEF2FF' },
  accountNumber: { fontSize: 13, color: '#A5B4FC', fontWeight: '600', letterSpacing: 1 },
  accountHolder: { fontSize: 12, color: '#A5B4FC', fontWeight: '600' },
  verifiedBadge: { backgroundColor: 'rgba(5,150,105,0.2)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(5,150,105,0.3)' },
  verifiedText: { color: colors.teal, fontSize: 11, fontWeight: '800' },
  changeBtn: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: 'rgba(129, 140, 248, 0.2)', alignItems: 'center', marginTop: 4 },
  changeBtnText: { color: colors.teal, fontWeight: '700', fontSize: 13 },
  editCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.78)', borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm,
    borderWidth: 1, borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  editTitle: { fontSize: 14, fontWeight: '800', color: '#EEF2FF' },
  fieldLabel: { fontSize: 12, color: '#A5B4FC', fontWeight: '700' },
  input: {
    backgroundColor: 'rgba(10, 12, 22, 0.6)', borderRadius: radius.md, borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)', padding: 12, fontSize: 14, color: '#EEF2FF',
  },
  noteText: { fontSize: 11, color: '#A5B4FC', fontWeight: '600', lineHeight: 17 },
  upiAddRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  addUpiBtn: { backgroundColor: colors.teal, borderRadius: radius.md, paddingHorizontal: 18, paddingVertical: 13 },
  addUpiBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  thresholdRow: { flexDirection: 'row', gap: spacing.sm },
  thresholdBtn: {
    flex: 1, paddingVertical: 11, borderRadius: radius.md, borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.3)', backgroundColor: 'rgba(26, 33, 64, 0.78)', alignItems: 'center',
  },
  thresholdBtnActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  thresholdBtnText: { fontSize: 13, fontWeight: '700', color: '#A5B4FC' },
  thresholdBtnTextActive: { color: '#FFFFFF' },
  autoPayoutCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: 'rgba(26, 33, 64, 0.78)', borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  autoPayoutLabel: { fontSize: 14, fontWeight: '700', color: '#EEF2FF' },
  autoPayoutSub: { fontSize: 12, color: '#A5B4FC', fontWeight: '500', marginTop: 2 },
  saveBtn: {
    backgroundColor: colors.teal, borderRadius: radius.lg, padding: 16, alignItems: 'center',
    shadowColor: colors.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});
