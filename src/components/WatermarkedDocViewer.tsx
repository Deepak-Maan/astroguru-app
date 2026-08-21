import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DocType } from '../store/kycStore';
import { colors, radius } from '../theme';

interface Props {
  docType: DocType;
  holderName: string;
  docNumber: string;
  isMasked?: boolean;
  watermarkText: string;
  watermarkOpacity?: number;
  securityHash?: string;
  dateStamp?: string;
}

export function WatermarkedDocViewer({
  docType,
  holderName,
  docNumber,
  isMasked = true,
  watermarkText,
  watermarkOpacity = 0.35,
  securityHash = 'AGY-SHA256-7E9B',
  dateStamp,
}: Props) {
  const getDocMeta = () => {
    switch (docType) {
      case 'aadhaar_front':
        return {
          title: 'GOVERNMENT OF INDIA',
          sub: 'UNIQUE IDENTIFICATION AUTHORITY OF INDIA',
          label: 'Aadhaar Card (Front)',
          icon: '🇮🇳',
          headerBg: ['#EA580C', '#FFFFFF', '#059669'],
          cardBg: '#FFFDF9',
          borderCol: '#FDBA74',
          badgeText: 'AADHAAR',
        };
      case 'aadhaar_back':
        return {
          title: 'GOVERNMENT OF INDIA',
          sub: 'ADDRESS & VERIFICATION DETAILS',
          label: 'Aadhaar Card (Back)',
          icon: '🇮🇳',
          headerBg: ['#EA580C', '#FFFFFF', '#059669'],
          cardBg: '#FFFDF9',
          borderCol: '#FDBA74',
          badgeText: 'AADHAAR BACK',
        };
      case 'pan_card':
        return {
          title: 'INCOME TAX DEPARTMENT',
          sub: 'GOVERNMENT OF INDIA',
          label: 'Permanent Account Number Card',
          icon: '🇮🇳',
          headerBg: ['#0284C7', '#0369A1'],
          cardBg: '#F0F9FF',
          borderCol: '#BAE6FD',
          badgeText: 'PAN CARD',
        };
      case 'jyotish_degree':
        return {
          title: 'BHARATIYA VIDYA BHAVAN',
          sub: 'COUNCIL OF VEDIC ASTROLOGY & JYOTISH SCIENCES',
          label: 'Jyotish Acharya Degree Certificate',
          icon: '📜',
          headerBg: ['#D97706', '#B45309'],
          cardBg: '#FFFBEB',
          borderCol: '#FDE68A',
          badgeText: 'DEGREE',
        };
      case 'passport':
        return {
          title: 'REPUBLIC OF INDIA',
          sub: 'PASSPORT IDENTIFICATION PAGE',
          label: 'Indian Passport',
          icon: '🛂',
          headerBg: ['#1E1B4B', '#312E81'],
          cardBg: '#F8FAFC',
          borderCol: '#CBD5E1',
          badgeText: 'PASSPORT',
        };
    }
  };

  const meta = getDocMeta();
  const displayDocNum = isMasked && (docType === 'aadhaar_front' || docType === 'aadhaar_back')
    ? (docNumber.length >= 4 ? `XXXX-XXXX-${docNumber.slice(-4)}` : 'XXXX-XXXX-4819')
    : docNumber || '1234-5678-9012';

  const effectiveDate = dateStamp || '2026/08/21 15:30 IST';

  return (
    <View style={[styles.cardContainer, { borderColor: meta.borderCol, backgroundColor: meta.cardBg }]}>
      {/* ── Document Top Header ── */}
      <View style={styles.cardHeader}>
        <View style={styles.headerTitleRow}>
          <Text style={{ fontSize: 20 }}>{meta.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.govTitle}>{meta.title}</Text>
            <Text style={styles.govSub}>{meta.sub}</Text>
          </View>
          <View style={styles.docBadge}>
            <Text style={styles.docBadgeText}>{meta.badgeText}</Text>
          </View>
        </View>
      </View>

      {/* Tricolor divider strip for Indian Govt IDs */}
      {(docType === 'aadhaar_front' || docType === 'aadhaar_back' || docType === 'pan_card') && (
        <View style={styles.tricolorBar}>
          <View style={{ flex: 1, backgroundColor: '#EA580C', height: 3 }} />
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', height: 3 }} />
          <View style={{ flex: 1, backgroundColor: '#059669', height: 3 }} />
        </View>
      )}

      {/* ── Document Body Information ── */}
      <View style={styles.cardBody}>
        <View style={styles.holderRow}>
          {/* Avatar / Photo placeholder */}
          <View style={styles.photoBox}>
            <Text style={{ fontSize: 28 }}>👤</Text>
            <View style={styles.photoVerifiedBadge}>
              <Text style={{ fontSize: 8 }}>✅</Text>
            </View>
          </View>

          {/* Details */}
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.fieldLabel}>NAME / धारक का नाम</Text>
            <Text style={styles.holderNameText}>{holderName || 'Pandit Deepak Sharma'}</Text>

            <Text style={[styles.fieldLabel, { marginTop: 4 }]}>
              {docType.includes('aadhaar') ? 'AADHAAR NO. / आधार संख्या' : docType === 'pan_card' ? 'PAN NUMBER' : 'REGISTRATION NO.'}
            </Text>
            <View style={styles.docNumberRow}>
              <Text style={styles.docNumberText}>{displayDocNum}</Text>
              {isMasked && (docType === 'aadhaar_front' || docType === 'aadhaar_back') && (
                <View style={styles.uidaiMaskBadge}>
                  <Text style={styles.uidaiMaskText}>🛡️ UIDAI Masked</Text>
                </View>
              )}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 4 }]}>DIGITAL KYC SIGNATURE</Text>
            <Text style={styles.hashText}>{securityHash}</Text>
          </View>
        </View>
      </View>

      {/* ── Security Watermark Overlay Layer (Diagonally Stamped) ── */}
      <View style={[StyleSheet.absoluteFill, styles.watermarkOverlay]} pointerEvents="none">
        {/* Lattice of diagonal watermark stamps */}
        <View style={[styles.watermarkBand, { opacity: watermarkOpacity }]}>
          <Text style={styles.watermarkText}>{watermarkText}</Text>
        </View>
        <View style={[styles.watermarkBand, { opacity: watermarkOpacity, marginTop: 40 }]}>
          <Text style={styles.watermarkText}>{watermarkText}</Text>
        </View>
        <View style={[styles.watermarkBand, { opacity: watermarkOpacity, marginTop: 40 }]}>
          <Text style={styles.watermarkText}>STAMPED: {effectiveDate} · {securityHash}</Text>
        </View>
        <View style={[styles.watermarkBand, { opacity: watermarkOpacity, marginTop: 40 }]}>
          <Text style={styles.watermarkText}>NOT VALID FOR OTHER FINANCIAL/LEGAL PURPOSES</Text>
        </View>
      </View>

      {/* ── Tamper-Proof Security Footer ── */}
      <View style={styles.securityFooter}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 11 }}>🔒</Text>
          <Text style={styles.securityFooterText}>
            Digitally Stamped for AstroGuru · 256-Bit Encrypted
          </Text>
        </View>
        <Text style={styles.securityFooterHash}>{securityHash}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginVertical: 4,
  },
  cardHeader: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  govTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.8,
  },
  govSub: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 1,
  },
  docBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#334155',
    letterSpacing: 0.5,
  },
  tricolorBar: {
    flexDirection: 'row',
    width: '100%',
  },

  cardBody: {
    padding: 14,
  },
  holderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  photoBox: {
    width: 68,
    height: 78,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    position: 'relative',
  },
  photoVerifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

  fieldLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  holderNameText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  docNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  docNumberText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  uidaiMaskBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  uidaiMaskText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  hashText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  /* ── Watermark Layer ── */
  watermarkOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 10,
  },
  watermarkBand: {
    transform: [{ rotate: '-22deg' }],
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    borderStyle: 'dashed',
    paddingVertical: 3,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermarkText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#B91C1C',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  /* ── Security Footer ── */
  securityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  securityFooterText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  securityFooterHash: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#F59E0B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
