import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
export interface ReceiptTransaction {
  id: string;
  type?: string;
  amount: number;
  timestamp?: number | string;
  at?: number;
  description?: string;
  label?: string;
  referenceId?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  transaction: ReceiptTransaction | null;
}

export function RechargeReceiptModal({ visible, onClose, transaction }: Props) {
  if (!transaction) return null;

  const invoiceNo = `AG-INV-${(transaction.id || 'TXN').replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`;
  const rawDate = transaction.timestamp || transaction.at || Date.now();
  const txnDate = new Date(rawDate).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const baseAmount = Math.round(transaction.amount / 1.18);
  const gstAmount = transaction.amount - baseAmount;

  const handleShareReceipt = async () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}

    const text = `📄 *AstroGuru Official Payment Receipt*\n\n` +
      `• Invoice No: ${invoiceNo}\n` +
      `• Date: ${txnDate}\n` +
      `• Amount Paid: ₹${transaction.amount}\n` +
      `• Status: Success / Verified ✅\n` +
      `• Payment Ref: ${transaction.referenceId || transaction.id}\n\n` +
      `Thank you for trusting AstroGuru! 🌟`;

    try {
      await Share.share({ message: text });
    } catch (_) {}
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.receiptCard}>
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Top Gold Bar */}
          <View style={styles.topGoldBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 24 }}>🌟</Text>
              <View>
                <Text style={styles.brandTitle}>AstroGuru</Text>
                <Text style={styles.brandSub}>Vedic Consultation & Astrology Services</Text>
              </View>
            </View>

            <View style={styles.paidBadge}>
              <Text style={styles.paidText}>PAID ✅</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Invoice Meta */}
          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLabel}>Invoice Number</Text>
              <Text style={styles.metaValue}>{invoiceNo}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.metaLabel}>Date & Time</Text>
              <Text style={styles.metaValue}>{txnDate}</Text>
            </View>
          </View>

          {/* Details Box */}
          <View style={styles.tableBox}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.thLeft}>Description</Text>
              <Text style={styles.thRight}>Amount</Text>
            </View>

            <View style={styles.tableDataRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.tdTitle}>Wallet Recharge Credits</Text>
                <Text style={styles.tdSub}>Ref: {transaction.referenceId || transaction.id}</Text>
              </View>
              <Text style={styles.tdAmount}>₹{baseAmount}</Text>
            </View>

            <View style={styles.tableDataRow}>
              <Text style={styles.tdTitle}>GST / Service Tax (18%)</Text>
              <Text style={styles.tdAmount}>₹{gstAmount}</Text>
            </View>

            <View style={styles.tableTotalRow}>
              <Text style={styles.totalLabel}>Total Paid (INR)</Text>
              <Text style={styles.totalAmount}>₹{transaction.amount}</Text>
            </View>
          </View>

          {/* Guarantee Footer */}
          <Text style={styles.footerNote}>
            🔒 100% Secure & Encrypted Transaction. Keep this receipt for your records.
          </Text>

          {/* Actions */}
          <View style={styles.btnRow}>
            <Pressable
              onPress={handleShareReceipt}
              style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.9 }]}
            >
              <LinearGradient
                colors={['#1E1B4B', '#0F172A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.shareBtnText}>📤 Share / Download Receipt</Text>
            </Pressable>

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  receiptCard: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  topGoldBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#F59E0B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  brandSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  paidBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  paidText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#15803D',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  metaLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  tableBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingBottom: 6,
    marginBottom: 6,
  },
  thLeft: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  thRight: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  tableDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  tdTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  tdSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  tdAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  tableTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: '#CBD5E1',
    paddingTop: 8,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D97706',
  },
  footerNote: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 14,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  shareBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  closeBtn: {
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
});
