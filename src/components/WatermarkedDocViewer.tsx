import React from 'react';
import { Image, StyleSheet, Text, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DocType } from '../store/kycStore';
import { colors, radius } from '../theme';

interface Props {
  docType: DocType;
  holderName: string;
  docNumber: string;
  dob?: string;
  gender?: string;
  imageUri?: string;
  isMasked?: boolean;
  watermarkText?: string;
  watermarkOpacity?: number;
  securityHash?: string;
  dateStamp?: string;
  scale?: number;
}

export function WatermarkedDocViewer({
  docType,
  holderName,
  docNumber,
  dob = '15/08/1988',
  gender = 'MALE / पुरुष',
  imageUri,
  isMasked = true,
  watermarkText = 'FOR ASTROGURU VERIFICATION ONLY',
  watermarkOpacity = 0.35,
  securityHash = 'AGY-SHA256-7E9B',
  dateStamp,
  scale = 1,
}: Props) {
  // Format masked / unmasked display number
  const formatDocNumber = () => {
    const raw = docNumber.replace(/\s+/g, '');
    if (docType === 'aadhaar_front' || docType === 'aadhaar_back') {
      if (isMasked) {
        const last4 = raw.length >= 4 ? raw.slice(-4) : '9182';
        return `XXXX  XXXX  ${last4}`;
      } else {
        const p1 = raw.slice(0, 4) || '5829';
        const p2 = raw.slice(4, 8) || '4819';
        const p3 = raw.slice(8, 12) || '9182';
        return `${p1}  ${p2}  ${p3}`;
      }
    }
    if (docType === 'pan_card') {
      if (isMasked) {
        const last4 = raw.length >= 4 ? raw.slice(-4) : '9482Q';
        return `••••••${last4}`;
      }
      return raw.toUpperCase() || 'ABCDE9482Q';
    }
    return docNumber || 'ICAS-JYOTISH-2015-882';
  };

  const displayNum = formatDocNumber();
  const effectiveDate = dateStamp || '2026/08/21 17:30 IST';
  const fullWatermark = `${watermarkText} · ${effectiveDate} · [${securityHash}]`;

  return (
    <View style={[styles.cardOuterContainer, { transform: [{ scale }] }]}>
      {/* ══════════════════════════════════════════════════
          1. AADHAAR CARD (FRONT)
         ══════════════════════════════════════════════════ */}
      {docType === 'aadhaar_front' && (
        <View style={[styles.baseCard, styles.aadhaarCard]}>
          {/* Tricolor Header Bar */}
          <View style={styles.tricolorBar}>
            <View style={{ flex: 1, backgroundColor: '#FF9933' }} />
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
            <View style={{ flex: 1, backgroundColor: '#138808' }} />
          </View>

          {/* UIDAI Header */}
          <View style={styles.aadhaarHeader}>
            <View style={styles.emblemBox}>
              <Text style={{ fontSize: 18 }}>🏛️</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.govtIndiaHindi}>भारत सरकार</Text>
              <Text style={styles.govtIndiaEng}>Government of India</Text>
              <Text style={styles.uidaiSub}>Unique Identification Authority of India</Text>
            </View>
            <View style={styles.aadhaarLogoBox}>
              <Text style={{ fontSize: 18 }}>☀️</Text>
            </View>
          </View>

          {/* Body: Photo + Details + QR */}
          <View style={styles.aadhaarBody}>
            {/* Photo frame */}
            <View style={styles.photoContainer}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.holderPhoto} resizeMode="cover" />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={{ fontSize: 26 }}>👤</Text>
                  <Text style={styles.photoSubText}>OFFICIAL PHOTO</Text>
                </View>
              )}
            </View>

            {/* Holder Information */}
            <View style={styles.aadhaarDetailsCol}>
              <Text style={styles.holderNameText}>{holderName || 'Pandit Deepak Sharma'}</Text>
              <Text style={styles.aadhaarMetaText}>
                जन्म तिथि / DOB: <Text style={styles.aadhaarMetaVal}>{dob}</Text>
              </Text>
              <Text style={styles.aadhaarMetaText}>
                लिंग / Gender: <Text style={styles.aadhaarMetaVal}>{gender}</Text>
              </Text>
            </View>

            {/* Simulated QR Code */}
            <View style={styles.qrBox}>
              <Text style={{ fontSize: 28 }}>🏁</Text>
              <Text style={styles.qrCaption}>SECURE QR</Text>
            </View>
          </View>

          {/* Big Aadhaar Number */}
          <View style={styles.aadhaarNumberRow}>
            <Text style={styles.aadhaarNumberText}>{displayNum}</Text>
          </View>

          {/* Aadhaar Bottom Tagline */}
          <View style={styles.aadhaarFooter}>
            <Text style={styles.aadhaarTagline}>मेरा आधार, मेरी पहचान</Text>
          </View>
        </View>
      )}

      {/* ══════════════════════════════════════════════════
          2. AADHAAR CARD (BACK)
         ══════════════════════════════════════════════════ */}
      {docType === 'aadhaar_back' && (
        <View style={[styles.baseCard, styles.aadhaarCard]}>
          {/* Tricolor Header Bar */}
          <View style={styles.tricolorBar}>
            <View style={{ flex: 1, backgroundColor: '#FF9933' }} />
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
            <View style={{ flex: 1, backgroundColor: '#138808' }} />
          </View>

          <View style={styles.aadhaarHeader}>
            <Text style={{ fontSize: 18 }}>🏛️</Text>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.govtIndiaHindi}>भारतीय विशिष्ट पहचान प्राधिकरण</Text>
              <Text style={styles.govtIndiaEng}>Unique Identification Authority of India</Text>
            </View>
            <Text style={{ fontSize: 18 }}>☀️</Text>
          </View>

          <View style={{ paddingHorizontal: 14, paddingVertical: 10, gap: 4 }}>
            <Text style={styles.addressLabel}>पता / Address:</Text>
            <Text style={styles.addressText}>
              C/O: Pt. R.K. Sharma, House No. 42B, Shanti Vihar, Near Hanuman Mandir, Sector 14,
              New Delhi, Delhi - 110001
            </Text>
          </View>

          <View style={styles.aadhaarNumberRow}>
            <Text style={styles.aadhaarNumberText}>{displayNum}</Text>
          </View>

          <View style={styles.aadhaarFooter}>
            <Text style={styles.aadhaarTagline}>📞 1947 | help@uidai.gov.in | www.uidai.gov.in</Text>
          </View>
        </View>
      )}

      {/* ══════════════════════════════════════════════════
          3. PAN CARD (INCOME TAX DEPARTMENT)
         ══════════════════════════════════════════════════ */}
      {docType === 'pan_card' && (
        <View style={[styles.baseCard, styles.panCard]}>
          <LinearGradient
            colors={['#E0F2FE', '#BAE6FD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Header */}
          <View style={styles.panHeader}>
            <Text style={{ fontSize: 18 }}>🏛️</Text>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.panTitleHindi}>आयकर विभाग</Text>
              <Text style={styles.panTitleEng}>INCOME TAX DEPARTMENT</Text>
              <Text style={styles.panSub}>GOVT. OF INDIA</Text>
            </View>
            <View style={styles.hologramSeal}>
              <Text style={{ fontSize: 16 }}>✨</Text>
            </View>
          </View>

          {/* PAN Body */}
          <View style={styles.panBody}>
            <View style={styles.photoContainer}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.holderPhoto} resizeMode="cover" />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={{ fontSize: 24 }}>👤</Text>
                </View>
              )}
            </View>

            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.panLabel}>नाम / Name:</Text>
              <Text style={styles.panValue}>{holderName.toUpperCase()}</Text>

              <Text style={styles.panLabel}>पिता का नाम / Father's Name:</Text>
              <Text style={styles.panValue}>PT. RAMESH SHARMA</Text>

              <Text style={styles.panLabel}>जन्म की तारीख / Date of Birth:</Text>
              <Text style={styles.panValue}>{dob}</Text>
            </View>
          </View>

          {/* PAN Number Banner */}
          <View style={styles.panNumberBanner}>
            <Text style={styles.panNumberLabel}>Permanent Account Number Card</Text>
            <Text style={styles.panNumberText}>{displayNum}</Text>
          </View>
        </View>
      )}

      {/* ══════════════════════════════════════════════════
          4. JYOTISH DEGREE / CERTIFICATE
         ══════════════════════════════════════════════════ */}
      {docType === 'jyotish_degree' && (
        <View style={[styles.baseCard, styles.degreeCard]}>
          <LinearGradient
            colors={['#FFFBEB', '#FEF3C7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.degreeOrnamentalBorder}>
            <View style={styles.degreeHeader}>
              <Text style={{ fontSize: 22 }}>🕉️</Text>
              <Text style={styles.degreeCouncilText}>
                COUNCIL OF VEDIC ASTROLOGY & JYOTISH SCIENCES
              </Text>
              <Text style={styles.degreeSanskritText}>॥ विद्या ददाति विनयं ॥</Text>
            </View>

            <Text style={styles.degreeBodyTitle}>CERTIFICATE OF JYOTISH ACHARYA</Text>
            <Text style={styles.degreeCertifyText}>
              This is to certify that Vedic Scholar
            </Text>
            <Text style={styles.degreeHolderName}>{holderName.toUpperCase()}</Text>
            <Text style={styles.degreeDesc}>
              has successfully qualified with Highest Honors in Parashari Vedic Astrology, Kundli
              Prashna & Planetary Dasha Shastra.
            </Text>

            <View style={styles.degreeFooterRow}>
              <Text style={styles.degreeRegText}>Reg: {displayNum}</Text>
              <View style={styles.goldSealBadge}>
                <Text style={{ fontSize: 16 }}>🏵️</Text>
                <Text style={styles.goldSealText}>VERIFIED SEAL</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* ══════════════════════════════════════════════════
          5. PASSPORT IDENTIFICATION
         ══════════════════════════════════════════════════ */}
      {docType === 'passport' && (
        <View style={[styles.baseCard, styles.passportCard]}>
          <View style={styles.passportHeader}>
            <Text style={{ fontSize: 20 }}>🛂</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.passportTitle}>PASSPORT / पासपोर्ट</Text>
              <Text style={styles.passportSub}>REPUBLIC OF INDIA / भारत गणराज्य</Text>
            </View>
            <Text style={styles.passportType}>P &lt; IND</Text>
          </View>

          <View style={styles.aadhaarBody}>
            <View style={styles.photoContainer}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.holderPhoto} resizeMode="cover" />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={{ fontSize: 24 }}>👤</Text>
                </View>
              )}
            </View>

            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.aadhaarMetaText}>
                Surname: <Text style={styles.aadhaarMetaVal}>SHARMA</Text>
              </Text>
              <Text style={styles.aadhaarMetaText}>
                Given Names: <Text style={styles.aadhaarMetaVal}>{holderName.toUpperCase()}</Text>
              </Text>
              <Text style={styles.aadhaarMetaText}>
                Passport No: <Text style={[styles.aadhaarMetaVal, { color: '#0369A1' }]}>{displayNum}</Text>
              </Text>
              <Text style={styles.aadhaarMetaText}>
                Nationality: <Text style={styles.aadhaarMetaVal}>INDIAN / भारतीय</Text>
              </Text>
            </View>
          </View>

          <View style={styles.mrzBox}>
            <Text style={styles.mrzText}>
              P&lt;INDSHARMA&lt;&lt;DEEPAK&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
            </Text>
            <Text style={styles.mrzText}>
              Z4819582&lt;2IND8808154M3208157&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;8
            </Text>
          </View>
        </View>
      )}

      {/* ══════════════════════════════════════════════════
          DIAGONAL ANTI-THEFT WATERMARK LATTICE OVERLAY
         ══════════════════════════════════════════════════ */}
      <View style={[StyleSheet.absoluteFill, styles.watermarkOverlay]} pointerEvents="none">
        <View style={[styles.watermarkPattern, { opacity: watermarkOpacity }]}>
          <Text style={styles.watermarkLine} numberOfLines={1}>
            {fullWatermark}
          </Text>
          <Text style={styles.watermarkLine} numberOfLines={1}>
            {fullWatermark}
          </Text>
          <Text style={styles.watermarkLine} numberOfLines={1}>
            {fullWatermark}
          </Text>
          <Text style={styles.watermarkLine} numberOfLines={1}>
            {fullWatermark}
          </Text>
          <Text style={styles.watermarkLine} numberOfLines={1}>
            {fullWatermark}
          </Text>
        </View>
      </View>

      {/* ══════════════════════════════════════════════════
          CRYPTO HASH & SECURITY TAMPER SEAL BADGE
         ══════════════════════════════════════════════════ */}
      <View style={styles.securitySealFooter}>
        <View style={styles.hashChip}>
          <Text style={{ fontSize: 11 }}>🔒</Text>
          <Text style={styles.hashChipText}>{securityHash}</Text>
        </View>
        <View style={styles.uidaiCompliantBadge}>
          <Text style={styles.uidaiCompliantText}>✓ UIDAI IT ACT 2000 WATERMARKED</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardOuterContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative',
  },
  baseCard: {
    minHeight: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },

  /* Aadhaar Styling */
  aadhaarCard: {
    backgroundColor: '#FFFDF9',
    borderColor: '#FDBA74',
  },
  tricolorBar: {
    height: 4,
    flexDirection: 'row',
  },
  aadhaarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FED7AA',
  },
  emblemBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aadhaarLogoBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  govtIndiaHindi: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9A3412',
  },
  govtIndiaEng: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E293B',
  },
  uidaiSub: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#64748B',
  },
  aadhaarBody: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  photoContainer: {
    width: 72,
    height: 86,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  holderPhoto: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  photoSubText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: '#64748B',
  },
  aadhaarDetailsCol: {
    flex: 1,
    gap: 3,
  },
  holderNameText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  aadhaarMetaText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  aadhaarMetaVal: {
    color: '#0F172A',
    fontWeight: '800',
  },
  qrBox: {
    width: 58,
    height: 68,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  qrCaption: {
    fontSize: 7,
    fontWeight: '900',
    color: '#64748B',
  },
  aadhaarNumberRow: {
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.2)',
  },
  aadhaarNumberText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#9A3412',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  aadhaarFooter: {
    paddingVertical: 5,
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
  },
  aadhaarTagline: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#C2410C',
  },
  addressLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#9A3412',
  },
  addressText: {
    fontSize: 10.5,
    color: '#1E293B',
    lineHeight: 15,
    fontWeight: '600',
  },

  /* PAN Card Styling */
  panCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#7DD3FC',
  },
  panHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#BAE6FD',
  },
  panTitleHindi: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0369A1',
  },
  panTitleEng: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0C4A6E',
    letterSpacing: 0.5,
  },
  panSub: {
    fontSize: 8,
    fontWeight: '800',
    color: '#0284C7',
  },
  hologramSeal: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7DD3FC',
  },
  panBody: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  panLabel: {
    fontSize: 8.5,
    color: '#0369A1',
    fontWeight: '700',
  },
  panValue: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '900',
  },
  panNumberBanner: {
    backgroundColor: '#0284C7',
    paddingVertical: 6,
    alignItems: 'center',
  },
  panNumberLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#BAE6FD',
    textTransform: 'uppercase',
  },
  panNumberText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },

  /* Jyotish Degree Styling */
  degreeCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    padding: 10,
  },
  degreeOrnamentalBorder: {
    borderWidth: 2,
    borderColor: '#D97706',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  degreeHeader: {
    alignItems: 'center',
    gap: 2,
  },
  degreeCouncilText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#92400E',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  degreeSanskritText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B45309',
  },
  degreeBodyTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#78350F',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  degreeCertifyText: {
    fontSize: 9,
    color: '#92400E',
    fontStyle: 'italic',
  },
  degreeHolderName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#451A03',
  },
  degreeDesc: {
    fontSize: 8.5,
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 12,
    paddingHorizontal: 8,
  },
  degreeFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
    paddingTop: 6,
  },
  degreeRegText: {
    fontSize: 9,
    color: '#92400E',
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  goldSealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  goldSealText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#B45309',
  },

  /* Passport Styling */
  passportCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  passportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#0F172A',
    gap: 8,
  },
  passportTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  passportSub: {
    fontSize: 8,
    color: '#94A3B8',
  },
  passportType: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F59E0B',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  mrzBox: {
    backgroundColor: '#F1F5F9',
    padding: 6,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
  },
  mrzText: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
    color: '#0F172A',
    letterSpacing: 1,
  },

  /* Watermark Lattice Overlay */
  watermarkOverlay: {
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  watermarkPattern: {
    width: '180%',
    height: '180%',
    transform: [{ rotate: '-24deg' }],
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  watermarkLine: {
    fontSize: 11,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  /* Cryptographic Footer Seal */
  securitySealFooter: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  hashChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hashChipText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#34D399',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  uidaiCompliantBadge: {
    backgroundColor: 'rgba(5, 150, 105, 0.9)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  uidaiCompliantText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
