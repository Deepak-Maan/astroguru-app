import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../../src/theme';

const FAQS = [
  {
    q: 'How do I increase my consultation per-minute rate?',
    a: 'You can update your consultation rate anytime from your Workstation or Consultation Profile. Rates must be between ₹5/min and ₹500/min. Rate increases take effect immediately for new clients.',
  },
  {
    q: 'When are consultation earnings paid out?',
    a: 'Payouts are processed every Monday automatically if auto-payout is enabled and your balance exceeds your minimum threshold. You can also request an instant manual payout anytime from your Workstation.',
  },
  {
    q: 'What happens if a client disconnects during a live chat?',
    a: 'If a client disconnects unexpectedly, the session timer pauses automatically after 60 seconds. Minutes billed up to that point are credited to your earnings.',
  },
  {
    q: 'How is my Acharya rating calculated?',
    a: 'Your rating is the average of all 5-star client ratings received over the last 90 days. Higher ratings improve your placement in seeker recommendations.',
  },
  {
    q: 'Can I issue a refund if a client is dissatisfied?',
    a: 'Yes, you can request a session refund from your Monthly Earnings Report page within 48 hours of the session completion date.',
  },
  {
    q: 'How do I report inappropriate client behavior?',
    a: 'Use the "Report Client" button inside the active chat room or submit a support ticket below with the session ID. We take seeker misconduct very seriously.',
  },
];

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [ticketTopic, setTicketTopic] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');

  const filteredFaqs = searchQuery.trim()
    ? FAQS.filter((f) => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()))
    : FAQS;

  function handleSubmitTicket() {
    if (!ticketTopic.trim() || !ticketMsg.trim()) {
      if (Platform.OS === 'web') alert('Please fill in both topic and message for your ticket.');
      else Alert.alert('Error', 'Please fill in both topic and message for your ticket.');
      return;
    }
    if (Platform.OS === 'web') alert('✅ Support ticket submitted! Ticket ID: #ASTRO-8942\nOur team will respond via email within 2 hours.');
    else Alert.alert('Ticket Submitted ✅', 'Ticket ID: #ASTRO-8942\nOur team will respond via email within 2 hours.');
    setTicketTopic(''); setTicketMsg('');
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Support & Help Center" subtitle="Acharya assistance 24/7" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Search Box */}
          <View style={styles.searchCard}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholder="🔍 Search help topics, FAQs, payouts…"
              placeholderTextColor={colors.textFaint}
            />
          </View>

          {/* Quick Action Contact Cards */}
          <View style={styles.contactRow}>
            <View style={styles.contactCard}>
              <Text style={styles.contactIcon}>💬</Text>
              <Text style={styles.contactTitle}>WhatsApp Help</Text>
              <Text style={styles.contactSub}>+91 98765 43210</Text>
            </View>

            <View style={styles.contactCard}>
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactSub}>acharya@astroguru.app</Text>
            </View>
          </View>

          {/* FAQ Accordion */}
          <Text style={styles.sectionTitle}>❓ Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {filteredFaqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <View key={idx} style={styles.faqItem}>
                  <Pressable onPress={() => setExpandedFaq(isOpen ? null : idx)} style={styles.faqHeader}>
                    <Text style={styles.faqQuestion}>{faq.q}</Text>
                    <Text style={styles.faqChevron}>{isOpen ? '▲' : '▼'}</Text>
                  </Pressable>
                  {isOpen && (
                    <View style={styles.faqBody}>
                      <Text style={styles.faqAnswer}>{faq.a}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Submit Support Ticket */}
          <Text style={styles.sectionTitle}>🎫 Submit a Support Ticket</Text>
          <View style={styles.ticketCard}>
            <Text style={styles.fieldLabel}>Issue Topic</Text>
            <TextInput
              value={ticketTopic}
              onChangeText={setTicketTopic}
              style={styles.input}
              placeholder="e.g. Payout delay / Technical issue in chat"
              placeholderTextColor={colors.textFaint}
            />

            <Text style={styles.fieldLabel}>Describe Your Issue</Text>
            <TextInput
              value={ticketMsg}
              onChangeText={setTicketMsg}
              style={[styles.input, styles.textArea]}
              placeholder="Provide session IDs or relevant details…"
              placeholderTextColor={colors.textFaint}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Pressable onPress={handleSubmitTicket} style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85 }]}>
              <Text style={styles.submitBtnText}>📩 Submit Ticket</Text>
            </Pressable>
          </View>

        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  searchCard: { backgroundColor: '#FFFFFF', borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)', padding: 4 },
  searchInput: { paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: colors.text, fontWeight: '500' },
  contactRow: { flexDirection: 'row', gap: spacing.sm },
  contactCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)',
  },
  contactIcon: { fontSize: 24 },
  contactTitle: { fontSize: 13, fontWeight: '800', color: colors.text },
  contactSub: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  faqList: { gap: spacing.sm },
  faqItem: {
    backgroundColor: '#FFFFFF', borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)', overflow: 'hidden',
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, gap: 8 },
  faqQuestion: { fontSize: 13, fontWeight: '800', color: colors.text, flex: 1 },
  faqChevron: { fontSize: 11, color: colors.textMuted },
  faqBody: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(191,219,254,0.3)', paddingTop: 10 },
  faqAnswer: { fontSize: 13, color: colors.textMuted, lineHeight: 19, fontWeight: '500' },
  ticketCard: {
    backgroundColor: '#FFFFFF', borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)',
  },
  fieldLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '700' },
  input: {
    backgroundColor: '#F8FAFC', borderRadius: radius.md, borderWidth: 1.5,
    borderColor: 'rgba(191,219,254,0.7)', padding: 12, fontSize: 14, color: colors.text,
  },
  textArea: { minHeight: 90, paddingTop: 12 },
  submitBtn: {
    backgroundColor: colors.teal, borderRadius: radius.md, padding: 14, alignItems: 'center', marginTop: 4,
    shadowColor: colors.teal, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
  },
  submitBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
