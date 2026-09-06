import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Card } from '../Card';
import { Button } from '../Button';
import { Chip } from '../Chip';
import { SectionHeader } from '../SectionHeader';
import { colors, radius, spacing, typography } from '../../theme';
import { useAdminStore, PaymentGatewaySettings, IncomingPaymentRequest } from '../../store/adminStore';
import { generateDynamicUpiQrUrl } from '../../services/paymentService';

export function AdminPaymentGatewayPanel() {
  const {
    paymentSettings,
    incomingPaymentsQueue,
    updatePaymentSettings,
    approveIncomingPayment,
    rejectIncomingPayment,
  } = useAdminStore();

  // Form Local State
  const [upiId, setUpiId] = useState(paymentSettings.upiId || 'astroguru@upi');
  const [merchantName, setMerchantName] = useState(paymentSettings.merchantName || 'AstroGuru Vedic Services');
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState(paymentSettings.qrCodeImageUrl || '');
  const [bankAccount, setBankAccount] = useState(paymentSettings.bankAccountNumber || '');
  const [bankIfsc, setBankIfsc] = useState(paymentSettings.bankIfsc || '');
  const [bankName, setBankName] = useState(paymentSettings.bankName || '');
  const [holderName, setHolderName] = useState(paymentSettings.accountHolderName || '');
  const [autoApprove, setAutoApprove] = useState(paymentSettings.autoApproveUpi ?? true);
  const [minRecharge, setMinRecharge] = useState(String(paymentSettings.minRechargeAmount || 50));
  const [supportPhone, setSupportPhone] = useState(paymentSettings.supportPhone || '+91 98765 43210');
  const [instructions, setInstructions] = useState(paymentSettings.instructions || '');

  // Filter for incoming payment requests
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Reject modal state
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('Invalid 12-digit UTR or payment not received.');

  // Live Preview Dynamic QR
  const previewQrUrl = qrCodeImageUrl.trim()
    ? qrCodeImageUrl.trim()
    : generateDynamicUpiQrUrl(500);

  const handleSaveSettings = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (_) {}

    updatePaymentSettings({
      upiId: upiId.trim(),
      merchantName: merchantName.trim(),
      qrCodeImageUrl: qrCodeImageUrl.trim() || previewQrUrl,
      bankAccountNumber: bankAccount.trim(),
      bankIfsc: bankIfsc.trim().toUpperCase(),
      bankName: bankName.trim(),
      accountHolderName: holderName.trim(),
      autoApproveUpi: autoApprove,
      minRechargeAmount: Number(minRecharge) || 50,
      supportPhone: supportPhone.trim(),
      instructions: instructions.trim(),
    });

    setSaveSuccessMsg('✅ Payment Gateway & QR Scanner settings updated successfully!');
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  const handleQuickPreset = (presetUpi: string, presetName: string, sampleQr?: string) => {
    setUpiId(presetUpi);
    setMerchantName(presetName);
    if (sampleQr) {
      setQrCodeImageUrl(sampleQr);
    } else {
      setQrCodeImageUrl(generateDynamicUpiQrUrl(500));
    }
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
  };

  const filteredQueue = incomingPaymentsQueue.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const pendingCount = incomingPaymentsQueue.filter((p) => p.status === 'pending').length;
  const approvedTotal = incomingPaymentsQueue
    .filter((p) => p.status === 'approved')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={{ gap: spacing.md }}>
      {/* ── HEADER BANNER ── */}
      <Card style={styles.heroCard}>
        <LinearGradient
          colors={['#78350F', '#B45309', '#D97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroTopRow}>
          <View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>⚡ DIRECT MERCHANT PAYMENTS</Text>
            </View>
            <Text style={styles.heroTitle}>Payment Gateway & QR Scanner Hub</Text>
            <Text style={styles.heroSub}>
              Configure your UPI ID, custom QR Code Scanner, and review incoming user receipts.
            </Text>
          </View>
          <Text style={{ fontSize: 36 }}>💳</Text>
        </View>

        {/* Quick Revenue Summary */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Collected via QR</Text>
            <Text style={styles.summaryVal}>₹{approvedTotal.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Pending Approvals</Text>
            <Text style={[styles.summaryVal, { color: '#FEF3C7' }]}>{pendingCount} Requests</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Receiver UPI ID</Text>
            <Text style={styles.summaryVal} numberOfLines={1}>{paymentSettings.upiId}</Text>
          </View>
        </View>
      </Card>

      {/* ── 1. ACTIVE QR SCANNER PREVIEW & CONFIGURATION ── */}
      <Card style={{ gap: spacing.md }}>
        <SectionHeader
          title="📸 Live QR Scanner & Receiver Setup"
          subtitle="Users will scan this exact QR code in the app to send recharge payments"
        />

        {/* Scanner Live Preview Stage */}
        <View style={styles.qrStageRow}>
          <View style={styles.qrImageWrap}>
            <Image
              source={{ uri: previewQrUrl }}
              style={styles.qrImage}
              resizeMode="contain"
            />
            <View style={styles.qrLivePill}>
              <Text style={styles.qrLiveText}>🟢 LIVE APP SCANNER</Text>
            </View>
          </View>

          <View style={styles.qrDetailsCol}>
            <Text style={styles.qrDetailsTitle}>Receiver UPI VPA:</Text>
            <Text style={styles.qrDetailsVpa}>{upiId}</Text>

            <Text style={[styles.qrDetailsTitle, { marginTop: 8 }]}>Business / Merchant:</Text>
            <Text style={styles.qrDetailsName}>{merchantName}</Text>

            <View style={styles.autoApproveBadge}>
              <Text style={styles.autoApproveText}>
                {autoApprove ? '⚡ Instant Auto-Credit: ON' : '⏳ Manual Admin Approval: ON'}
              </Text>
            </View>

            <Text style={styles.qrTip}>
              ✨ Any seeker scanning this code with GPay, PhonePe, Paytm or BHIM will pay directly to this UPI ID.
            </Text>
          </View>
        </View>

        {/* Preset Quick Choosers */}
        <View style={{ gap: 6 }}>
          <Text style={styles.fieldLabel}>Quick UPI Presets & Providers:</Text>
          <View style={styles.presetsRow}>
            {[
              { label: '🟢 Google Pay', upi: 'astroguru@okhdfcbank', name: 'AstroGuru (Google Pay)' },
              { label: '🟣 PhonePe', upi: 'astroguru@ybl', name: 'AstroGuru (PhonePe Business)' },
              { label: '🔵 Paytm', upi: '9876543210@paytm', name: 'AstroGuru (Paytm Payments)' },
              { label: '🇮🇳 BHIM / UPI', upi: 'astroguru@upi', name: 'AstroGuru Vedic Services' },
            ].map((pr) => (
              <Pressable
                key={pr.label}
                onPress={() => handleQuickPreset(pr.upi, pr.name)}
                style={({ pressed }) => [
                  styles.presetBtn,
                  upiId === pr.upi && styles.presetBtnActive,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[styles.presetText, upiId === pr.upi && styles.presetTextActive]}>
                  {pr.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Inputs */}
        <View style={{ gap: spacing.sm }}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Receiver UPI ID / VPA (Required) *</Text>
            <TextInput
              value={upiId}
              onChangeText={setUpiId}
              placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
              placeholderTextColor={colors.textFaint}
              autoCapitalize="none"
              style={styles.fieldInput}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Merchant / Business Display Name *</Text>
            <TextInput
              value={merchantName}
              onChangeText={setMerchantName}
              placeholder="e.g. AstroGuru Vedic Services"
              placeholderTextColor={colors.textFaint}
              style={styles.fieldInput}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Custom QR Code Scanner Image URL (Optional)</Text>
            <TextInput
              value={qrCodeImageUrl}
              onChangeText={setQrCodeImageUrl}
              placeholder="Paste custom QR image link or leave blank for auto-generated QR"
              placeholderTextColor={colors.textFaint}
              autoCapitalize="none"
              style={styles.fieldInput}
            />
            <Text style={styles.fieldHint}>
              💡 Leave blank to auto-generate a crisp, scan-ready QR code linked directly to your UPI ID above.
            </Text>
          </View>
        </View>

        {/* Bank Details Dropdown / Sub-card */}
        <View style={styles.bankSubCard}>
          <Text style={styles.bankSubTitle}>🏦 Bank Account Transfer Option (Optional)</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Account Number</Text>
              <TextInput
                value={bankAccount}
                onChangeText={setBankAccount}
                placeholder="50100482910128"
                placeholderTextColor={colors.textFaint}
                keyboardType="numeric"
                style={styles.fieldInput}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>IFSC Code</Text>
              <TextInput
                value={bankIfsc}
                onChangeText={setBankIfsc}
                placeholder="HDFC0000128"
                placeholderTextColor={colors.textFaint}
                autoCapitalize="characters"
                style={styles.fieldInput}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 6 }}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Bank Name</Text>
              <TextInput
                value={bankName}
                onChangeText={setBankName}
                placeholder="HDFC Bank Ltd."
                placeholderTextColor={colors.textFaint}
                style={styles.fieldInput}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Account Holder Name</Text>
              <TextInput
                value={holderName}
                onChangeText={setHolderName}
                placeholder="AstroGuru Technologies"
                placeholderTextColor={colors.textFaint}
                style={styles.fieldInput}
              />
            </View>
          </View>
        </View>

        {/* Auto Approve Switch */}
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Instant Auto-Approve on UTR Submission</Text>
            <Text style={styles.switchSub}>
              When enabled, user's wallet is credited immediately when they submit their 12-digit bank UTR.
            </Text>
          </View>
          <Switch
            value={autoApprove}
            onValueChange={setAutoApprove}
            trackColor={{ false: '#CBD5E1', true: colors.gold }}
            thumbColor={autoApprove ? '#FFFFFF' : '#F1F5F9'}
          />
        </View>

        {/* Save Settings Button */}
        <Button
          label="💾 Save Payment Gateway & QR Settings"
          variant="gold"
          size="md"
          onPress={handleSaveSettings}
        />

        {!!saveSuccessMsg && (
          <View style={styles.successToast}>
            <Text style={styles.successToastText}>{saveSuccessMsg}</Text>
          </View>
        )}
      </Card>

      {/* ── 2. INCOMING PAYMENT REQUESTS & UTR VERIFICATION DESK ── */}
      <Card style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionHeader
            title="📥 Incoming Payments & UTR Desk"
            subtitle="Verify and approve user recharge receipts"
          />
          <View style={styles.queueCountBadge}>
            <Text style={styles.queueCountText}>{filteredQueue.length} Orders</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <Pressable
              key={st}
              onPress={() => setFilterStatus(st)}
              style={[styles.filterPill, filterStatus === st && styles.filterPillActive]}
            >
              <Text style={[styles.filterPillText, filterStatus === st && styles.filterPillTextActive]}>
                {st.toUpperCase()} {st === 'pending' ? `(${pendingCount})` : ''}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Requests List */}
        {filteredQueue.length === 0 ? (
          <View style={styles.emptyQueue}>
            <Text style={{ fontSize: 32 }}>📭</Text>
            <Text style={styles.emptyQueueText}>No payment requests in this filter.</Text>
          </View>
        ) : (
          filteredQueue.map((req) => (
            <Card
              key={req.id}
              style={[
                styles.paymentItemCard,
                {
                  borderLeftColor:
                    req.status === 'approved'
                      ? '#10B981'
                      : req.status === 'rejected'
                      ? '#EF4444'
                      : '#F59E0B',
                },
              ]}
            >
              <View style={styles.paymentItemHeader}>
                <View>
                  <Text style={styles.paymentSeekerName}>{req.userName}</Text>
                  <Text style={styles.paymentSeekerEmail}>{req.userEmail}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.paymentAmount}>₹{req.amount}</Text>
                  <Text style={styles.paymentCredit}>+ ₹{req.bonus} Bonus = ₹{req.totalCredit}</Text>
                </View>
              </View>

              {/* UTR & Transaction Details */}
              <View style={styles.utrDetailBox}>
                <View style={styles.utrRow}>
                  <Text style={styles.utrLabel}>12-Digit Bank UTR:</Text>
                  <Text style={styles.utrValue}>{req.utr}</Text>
                </View>

                <View style={styles.utrRow}>
                  <Text style={styles.utrLabel}>Payment Mode:</Text>
                  <Text style={styles.utrValue}>
                    {req.paymentMode === 'QR_SCAN' ? '📸 QR Code Scanner' : '📱 1-Tap UPI App'}
                  </Text>
                </View>

                <View style={styles.utrRow}>
                  <Text style={styles.utrLabel}>Timestamp:</Text>
                  <Text style={styles.utrTime}>{req.createdAt}</Text>
                </View>

                {req.adminNotes && (
                  <View style={styles.utrRow}>
                    <Text style={[styles.utrLabel, { color: '#EF4444' }]}>Rejection Note:</Text>
                    <Text style={[styles.utrValue, { color: '#EF4444' }]}>{req.adminNotes}</Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.paymentActionsRow}>
                <View style={styles.statusBadgeWrap}>
                  <Chip
                    label={req.status.toUpperCase()}
                    variant={
                      req.status === 'approved'
                        ? 'success'
                        : req.status === 'rejected'
                        ? 'error'
                        : 'warning'
                    }
                  />
                </View>

                {req.status === 'pending' && (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button
                      label="❌ Reject"
                      variant="danger"
                      size="sm"
                      fullWidth={false}
                      onPress={() => {
                        rejectIncomingPayment(req.id, 'Invalid UTR reference or payment not received');
                      }}
                    />
                    <Button
                      label="✅ Approve & Credit"
                      variant="gold"
                      size="sm"
                      fullWidth={false}
                      onPress={() => {
                        approveIncomingPayment(req.id);
                        try {
                          if (Platform.OS !== 'web') {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          }
                        } catch (_) {}
                      }}
                    />
                  </View>
                )}
              </View>
            </Card>
          ))
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    gap: spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroSub: {
    fontSize: 11.5,
    color: '#FEF3C7',
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 16,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: radius.lg,
    padding: 10,
    marginTop: 4,
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#FDE68A',
    fontWeight: '700',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  qrStageRow: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  qrImageWrap: {
    width: 110,
    height: 110,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  qrImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  qrLivePill: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#065F46',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
  },
  qrLiveText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#A7F3D0',
  },
  qrDetailsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  qrDetailsTitle: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
  },
  qrDetailsVpa: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.text,
  },
  qrDetailsName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  autoApproveBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  autoApproveText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
  },
  qrTip: {
    fontSize: 9.5,
    color: colors.textFaint,
    marginTop: 4,
    lineHeight: 13,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetBtnActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  presetText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  presetTextActive: {
    color: '#B45309',
    fontWeight: '900',
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  fieldInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  fieldHint: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  bankSubCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: radius.lg,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bankSubTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#334155',
    marginBottom: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  switchSub: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  successToast: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.2,
    borderColor: '#A7F3D0',
    padding: 10,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  successToastText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  queueCountBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  queueCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B45309',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  emptyQueue: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyQueueText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  paymentItemCard: {
    gap: 10,
    borderLeftWidth: 4,
  },
  paymentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paymentSeekerName: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
  },
  paymentSeekerEmail: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
  },
  paymentCredit: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
  },
  utrDetailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: 8,
    gap: 3,
  },
  utrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  utrLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  utrValue: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.text,
  },
  utrTime: {
    fontSize: 10,
    color: colors.textFaint,
  },
  paymentActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadgeWrap: {},
});
