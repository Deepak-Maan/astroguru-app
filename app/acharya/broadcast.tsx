import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../../src/theme';

const AUDIENCES = ['All Clients', 'Active Subscribers', 'VIP Clients', 'Past 30-day'];
const PAST_BROADCASTS = [
  { id: '1', message: '🌙 Shravan Mass special: Get 20% off on Kundli reading this month. Book now!', date: '01 Aug 2026', reach: 312 },
  { id: '2', message: '🪐 Saturn Retrograde alert: Important for all Capricorn & Aquarius ascendants. Book a special remedial consultation.', date: '22 Jul 2026', reach: 198 },
  { id: '3', message: '✨ Guru Purnima blessings to all my seekers! Free 5-min guidance today for existing clients.', date: '21 Jul 2026', reach: 445 },
  { id: '4', message: '📅 I will be unavailable on 10-12 Aug (Janmashtami). Please book your sessions in advance.', date: '05 Jul 2026', reach: 124 },
];

export default function Broadcast() {
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('All Clients');
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [broadcasts, setBroadcasts] = useState(PAST_BROADCASTS);

  function handleSend() {
    if (!message.trim()) {
      if (Platform.OS === 'web') alert('Please write an announcement message.');
      else Alert.alert('Empty Message', 'Please write an announcement message before sending.');
      return;
    }

    const confirmMsg = scheduleMode === 'now'
      ? `Send to "${audience}" now?`
      : `Schedule for ${scheduleDate} at ${scheduleTime} to "${audience}"?`;

    const doSend = () => {
      setBroadcasts((prev) => [
        { id: Date.now().toString(), message: message.trim(), date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), reach: 0 },
        ...prev,
      ]);
      setMessage('');
      if (Platform.OS === 'web') alert('✅ Broadcast sent successfully!');
    };

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) doSend();
    } else {
      Alert.alert('Confirm Broadcast', confirmMsg, [
        { text: 'Cancel', style: 'cancel' },
        { text: scheduleMode === 'now' ? 'Send Now' : 'Schedule', onPress: doSend },
      ]);
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Broadcast Announcement" subtitle="Reach all your clients at once" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Compose Box */}
          <View style={styles.composeCard}>
            <Text style={styles.sectionLabel}>✍️ Write Your Announcement</Text>
            <TextInput
              value={message}
              onChangeText={(t) => { if (t.length <= 280) setMessage(t); }}
              style={styles.composeInput}
              placeholder="Type your announcement to clients… (e.g. special offer, holiday schedule, new service)"
              placeholderTextColor={colors.textFaint}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={[styles.charCounter, message.length > 250 && { color: '#EF4444' }]}>
              {message.length}/280
            </Text>
          </View>

          {/* Audience Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>👥 Target Audience</Text>
            <View style={styles.chipRow}>
              {AUDIENCES.map((a) => (
                <Pressable
                  key={a}
                  onPress={() => setAudience(a)}
                  style={[styles.chip, audience === a && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, audience === a && styles.chipTextSelected]}>{a}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Schedule Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>📅 When to Send</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {(['now', 'later'] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setScheduleMode(m)}
                  style={[styles.scheduleBtn, scheduleMode === m && styles.scheduleBtnActive]}
                >
                  <Text style={[styles.scheduleBtnText, scheduleMode === m && { color: '#FFFFFF' }]}>
                    {m === 'now' ? '⚡ Send Now' : '🕐 Schedule for Later'}
                  </Text>
                </Pressable>
              ))}
            </View>
            {scheduleMode === 'later' && (
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                <TextInput
                  value={scheduleDate}
                  onChangeText={setScheduleDate}
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Date (DD/MM/YYYY)"
                  placeholderTextColor={colors.textFaint}
                />
                <TextInput
                  value={scheduleTime}
                  onChangeText={setScheduleTime}
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Time (HH:MM)"
                  placeholderTextColor={colors.textFaint}
                />
              </View>
            )}
          </View>

          {/* Send Button */}
          <Pressable onPress={handleSend} style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.85 }]}>
            <Text style={styles.sendBtnText}>
              {scheduleMode === 'now' ? '📢 Send Broadcast Now' : '📅 Schedule Broadcast'}
            </Text>
          </Pressable>

          {/* Past Broadcasts */}
          <Text style={styles.pastTitle}>📜 Past Broadcasts</Text>
          {broadcasts.map((b) => (
            <View key={b.id} style={styles.pastCard}>
              <Text style={styles.pastMessage} numberOfLines={2}>{b.message}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                <Text style={styles.pastDate}>📅 {b.date}</Text>
                <Text style={styles.pastReach}>
                  {b.reach > 0 ? `👥 ${b.reach} clients reached` : '⏳ Sending…'}
                </Text>
              </View>
            </View>
          ))}

        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  composeCard: {
    backgroundColor: '#FFFFFF', borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)',
    shadowColor: '#BFDBFE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 2,
  },
  composeInput: {
    backgroundColor: '#F8FAFC', borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)',
    padding: 12, fontSize: 14, color: colors.text, minHeight: 120,
  },
  charCounter: { fontSize: 11, color: colors.textFaint, alignSelf: 'flex-end', fontWeight: '600' },
  section: { gap: spacing.sm },
  sectionLabel: { fontSize: 14, fontWeight: '800', color: colors.text },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: 'rgba(191,219,254,0.6)',
  },
  chipSelected: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  chipTextSelected: { color: '#FFFFFF' },
  scheduleBtn: {
    flex: 1, padding: 12, borderRadius: radius.md, borderWidth: 1.5,
    borderColor: 'rgba(191,219,254,0.6)', alignItems: 'center', backgroundColor: '#FFFFFF',
  },
  scheduleBtnActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  scheduleBtnText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: radius.md, borderWidth: 1.5,
    borderColor: 'rgba(191,219,254,0.7)', padding: 12, fontSize: 14, color: colors.text,
  },
  sendBtn: {
    backgroundColor: colors.teal, borderRadius: radius.lg, padding: 16, alignItems: 'center',
    shadowColor: colors.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  sendBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  pastTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  pastCard: {
    backgroundColor: '#FFFFFF', borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.4)',
  },
  pastMessage: { fontSize: 13, color: colors.text, lineHeight: 19, fontWeight: '500' },
  pastDate: { fontSize: 11, color: colors.textFaint, fontWeight: '600' },
  pastReach: { fontSize: 11, color: colors.teal, fontWeight: '700' },
});
