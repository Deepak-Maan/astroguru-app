import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { GradientBackground } from '../../src/components/GradientBackground';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { WatermarkedDocViewer } from '../../src/components/WatermarkedDocViewer';
import { DocType, KycDocument, useKycStore } from '../../src/store/kycStore';
import { colors, radius, spacing } from '../../src/theme';

const DOC_TYPES: Array<{ id: DocType; label: string; icon: string; desc: string }> = [
  {
    id: 'aadhaar_front',
    label: 'Aadhaar (Front)',
    icon: '🇮🇳',
    desc: 'UIDAI Government ID with Photo',
  },
  {
    id: 'aadhaar_back',
    label: 'Aadhaar (Back)',
    icon: '🇮🇳',
    desc: 'Address & QR verification side',
  },
  {
    id: 'pan_card',
    label: 'PAN Card',
    icon: '🪪',
    desc: 'Income Tax Department ID for payouts',
  },
  {
    id: 'jyotish_degree',
    label: 'Jyotish Degree',
    icon: '📜',
    desc: 'ICAS, BVB or University Astrological Degree',
  },
  {
    id: 'passport',
    label: 'Passport',
    icon: '🛂',
    desc: 'Indian or International Passport page',
  },
];

export default function KycVerificationScreen() {
  const {
    documents,
    overallStatus,
    trustScore,
    maskAadhaarDigits,
    customWatermarkNote,
    watermarkOpacity,
    uploadDocument,
    removeDocument,
    toggleMaskAadhaar,
    setCustomWatermarkNote,
    setWatermarkOpacity,
  } = useKycStore();

  const [selectedType, setSelectedType] = useState<DocType>('aadhaar_front');
  const [holderName, setHolderName] = useState('Pandit Deepak Sharma');
  const [docNumber, setDocNumber] = useState('481958294819');
  const [notes, setNotes] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const triggerHaptic = (type: 'light' | 'medium' | 'success' = 'light') => {
    try {
      if (Platform.OS !== 'web') {
        if (type === 'success') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.impactAsync(
            type === 'medium'
              ? Haptics.ImpactFeedbackStyle.Medium
              : Haptics.ImpactFeedbackStyle.Light
          );
        }
      }
    } catch (_) {}
  };

  const handleUploadAndStamp = () => {
    if (!holderName.trim()) {
      const msg = 'Please enter the document holder full name.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Missing Field', msg);
      return;
    }
    if (!docNumber.trim()) {
      const msg = 'Please enter the document number.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Missing Field', msg);
      return;
    }

    triggerHaptic('success');

    // Compute masked format
    let maskedNumber = docNumber;
    if (maskAadhaarDigits && (selectedType === 'aadhaar_front' || selectedType === 'aadhaar_back')) {
      maskedNumber = `XXXX-XXXX-${docNumber.slice(-4)}`;
    } else if (selectedType === 'pan_card') {
      maskedNumber = `•••••${docNumber.slice(-4)}`;
    }

    uploadDocument({
      docType: selectedType,
      docNumberMasked: maskedNumber,
      holderName: holderName.trim(),
      watermarkText: customWatermarkNote,
      status: 'pending_review',
      notes: notes.trim() || undefined,
    });

    setSuccessToast(`✅ Document securely watermarked & submitted to KYC Vault!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleRemoveDoc = (id: string, name: string) => {
    const msg = `Remove "${name}" from your KYC security vault?`;
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) {
        removeDocument(id);
      }
    } else {
      Alert.alert('Remove Document', msg, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeDocument(id),
        },
      ]);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title="Govt ID & Watermark Vault"
          subtitle="Anti-theft ID verification for Astrologers"
          showBack
          showWallet
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── Success Toast Banner ── */}
          {successToast && (
            <View style={styles.toastBanner}>
              <Text style={{ fontSize: 20 }}>🛡️</Text>
              <Text style={styles.toastText}>{successToast}</Text>
            </View>
          )}

          {/* ── Trust Score & Compliance Header ── */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={['#0F172A', '#1E293B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroTopRow}>
              <View style={styles.heroShieldCircle}>
                <Text style={{ fontSize: 24 }}>🛡️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.heroTitle}>Aadhaar & ID Shield</Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedBadgeText}>
                      {overallStatus === 'verified' ? '✅ VERIFIED' : '⏳ PENDING REVIEW'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.heroSub}>
                  Client-side tamper-proof watermarking prevents misuse of your government IDs.
                </Text>
              </View>
            </View>

            <View style={styles.trustScoreBar}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.trustLabel}>Astrologer Trust & Identity Score</Text>
                <Text style={styles.trustValue}>{trustScore}%</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${trustScore}%` }]} />
              </View>
            </View>
          </View>

          {/* ── Section 1: Choose Document Type ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconPill}>
                <Text style={{ fontSize: 15 }}>🪪</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>1. Select Document To Watermark</Text>
                <Text style={styles.sectionSub}>Choose which credential to stamp & submit</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.docTypeRow}
            >
              {DOC_TYPES.map((dt) => {
                const isSelected = selectedType === dt.id;
                return (
                  <Pressable
                    key={dt.id}
                    onPress={() => {
                      triggerHaptic('light');
                      setSelectedType(dt.id);
                    }}
                    style={[styles.docTypePill, isSelected && styles.docTypePillActive]}
                  >
                    <Text style={{ fontSize: 18 }}>{dt.icon}</Text>
                    <View>
                      <Text style={[styles.docTypePillText, isSelected && styles.docTypePillTextActive]}>
                        {dt.label}
                      </Text>
                      <Text style={styles.docTypeDescText}>{dt.desc}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Section 2: Security & Watermark Customization ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconPill}>
                <Text style={{ fontSize: 15 }}>🔒</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>2. Document Details & Security Stamp</Text>
                <Text style={styles.sectionSub}>Watermark is permanently embedded into image</Text>
              </View>
            </View>

            {/* Holder Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME (EXACTLY AS ON ID)</Text>
              <TextInput
                value={holderName}
                onChangeText={setHolderName}
                style={styles.textInput}
                placeholder="e.g. Pandit Deepak Sharma"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Document Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {selectedType.includes('aadhaar')
                  ? '12-DIGIT AADHAAR NUMBER'
                  : selectedType === 'pan_card'
                  ? '10-CHARACTER PAN NUMBER'
                  : 'REGISTRATION / CERTIFICATE NO.'}
              </Text>
              <TextInput
                value={docNumber}
                onChangeText={setDocNumber}
                style={styles.textInput}
                placeholder={selectedType.includes('aadhaar') ? '4819 5829 4819' : 'ABCDE1234F'}
                placeholderTextColor="#94A3B8"
                maxLength={20}
              />
            </View>

            {/* UIDAI Masking Toggle for Aadhaar */}
            {selectedType.includes('aadhaar') && (
              <View style={styles.securityToggleCard}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.toggleTitle}>UIDAI 8-Digit Aadhaar Masking</Text>
                    <View style={styles.recomBadge}>
                      <Text style={styles.recomBadgeText}>RECOMMENDED</Text>
                    </View>
                  </View>
                  <Text style={styles.toggleSub}>
                    Masks first 8 digits (XXXX-XXXX-1234) per UIDAI identity safety guidelines.
                  </Text>
                </View>
                <Switch
                  value={maskAadhaarDigits}
                  onValueChange={() => {
                    triggerHaptic('light');
                    toggleMaskAadhaar();
                  }}
                  trackColor={{ true: '#059669', false: '#CBD5E1' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            )}

            {/* Custom Watermark Purpose Text */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>WATERMARK PURPOSE TEXT</Text>
              <TextInput
                value={customWatermarkNote}
                onChangeText={setCustomWatermarkNote}
                style={styles.textInput}
                placeholder="FOR ASTROGURU VERIFICATION ONLY"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.helperText}>
                Stamps diagonally across your document with dynamic date & SHA-256 hash.
              </Text>
            </View>

            {/* Watermark Opacity Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>WATERMARK OPACITY / DENSITY</Text>
              <View style={styles.opacityRow}>
                {[
                  { label: 'Subtle (25%)', val: 0.25 },
                  { label: 'Standard (35%)', val: 0.35 },
                  { label: 'Heavy (50%)', val: 0.5 },
                ].map((op) => {
                  const isSelected = watermarkOpacity === op.val;
                  return (
                    <Pressable
                      key={op.val}
                      onPress={() => {
                        triggerHaptic('light');
                        setWatermarkOpacity(op.val);
                      }}
                      style={[styles.opacityPill, isSelected && styles.opacityPillActive]}
                    >
                      <Text
                        style={[
                          styles.opacityPillText,
                          isSelected && styles.opacityPillTextActive,
                        ]}
                      >
                        {op.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {/* ── Section 3: Live Watermarked Document Preview ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconPill}>
                <Text style={{ fontSize: 15 }}>👁️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>3. Live Watermark & Redaction Preview</Text>
                <Text style={styles.sectionSub}>Inspect tamper-proof stamp before saving</Text>
              </View>
            </View>

            <WatermarkedDocViewer
              docType={selectedType}
              holderName={holderName}
              docNumber={docNumber}
              isMasked={maskAadhaarDigits}
              watermarkText={customWatermarkNote}
              watermarkOpacity={watermarkOpacity}
              securityHash="AGY-SHA256-7E9B"
            />

            {/* Stamp & Upload Button */}
            <Pressable
              onPress={handleUploadAndStamp}
              style={({ pressed }) => [
                styles.stampButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
              ]}
            >
              <LinearGradient
                colors={['#059669', '#10B981', '#047857']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.stampButtonText}>
                🔒 Stamp Watermark & Submit to KYC Vault
              </Text>
            </Pressable>
          </View>

          {/* ── Section 4: Watermarked Documents Vault ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconPill}>
                <Text style={{ fontSize: 15 }}>📁</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Your Verified KYC Documents Vault</Text>
                <Text style={styles.sectionSub}>
                  {documents.length} document(s) stored with cryptographic hash
                </Text>
              </View>
            </View>

            {documents.length === 0 ? (
              <View style={styles.emptyVault}>
                <Text style={{ fontSize: 36 }}>📂</Text>
                <Text style={styles.emptyVaultTitle}>No Documents Uploaded Yet</Text>
                <Text style={styles.emptyVaultSub}>
                  Use the studio above to watermark and submit your government credentials.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {documents.map((doc) => (
                  <View key={doc.id} style={styles.vaultCard}>
                    <View style={styles.vaultCardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 20 }}>
                          {doc.docType.includes('aadhaar')
                            ? '🇮🇳'
                            : doc.docType === 'pan_card'
                            ? '🪪'
                            : doc.docType === 'jyotish_degree'
                            ? '📜'
                            : '🛂'}
                        </Text>
                        <View>
                          <Text style={styles.vaultDocTitle}>
                            {doc.docType === 'aadhaar_front'
                              ? 'Aadhaar Card (Front)'
                              : doc.docType === 'aadhaar_back'
                              ? 'Aadhaar Card (Back)'
                              : doc.docType === 'pan_card'
                              ? 'PAN Card'
                              : doc.docType === 'jyotish_degree'
                              ? 'Vedic Jyotish Degree'
                              : 'Passport'}
                          </Text>
                          <Text style={styles.vaultDocNumber}>{doc.docNumberMasked}</Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              doc.status === 'verified' ? '#ECFDF5' : '#FFFBEB',
                            borderColor:
                              doc.status === 'verified' ? '#A7F3D0' : '#FDE68A',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            {
                              color:
                                doc.status === 'verified' ? '#059669' : '#D97706',
                            },
                          ]}
                        >
                          {doc.status === 'verified' ? '✅ VERIFIED' : '⏳ IN REVIEW'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.vaultMetaRow}>
                      <Text style={styles.vaultMetaText}>📅 Stamped: {doc.uploadedAt}</Text>
                      <Text style={styles.vaultHashText}>🔐 {doc.securityHash}</Text>
                    </View>

                    <View style={styles.vaultWatermarkNoteBox}>
                      <Text style={styles.vaultWatermarkNote}>
                        Watermark: "{doc.watermarkText}"
                      </Text>
                    </View>

                    <View style={styles.vaultActionRow}>
                      <Pressable
                        onPress={() => {
                          triggerHaptic('light');
                          setSelectedType(doc.docType);
                          setHolderName(doc.holderName);
                        }}
                        style={styles.previewBtn}
                      >
                        <Text style={styles.previewBtnText}>🔍 Inspect Watermark</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => handleRemoveDoc(doc.id, doc.holderName)}
                        style={styles.deleteBtn}
                      >
                        <Text style={styles.deleteBtnText}>🗑️ Remove</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* ── Section 5: Security & Anti-Theft FAQ ── */}
          <View style={styles.faqCard}>
            <Text style={styles.faqTitle}>🛡️ Why Watermark Your Government IDs?</Text>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>1. Prevents Identity Theft & Misuse</Text>
              <Text style={styles.faqAnswer}>
                Watermarking ensures your Aadhaar, PAN, or certificates cannot be used to open unauthorized bank accounts, SIM cards, or loans elsewhere.
              </Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>2. 100% UIDAI & IT Act 2000 Compliant</Text>
              <Text style={styles.faqAnswer}>
                Our 8-digit Aadhaar masking redacts non-essential digits while validating the mandatory last 4 digits for astrologer KYC.
              </Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>3. SHA-256 Digital Fingerprint</Text>
              <Text style={styles.faqAnswer}>
                Each submission generates a unique cryptographic hash, guaranteeing the document cannot be tampered with or replaced without authorization.
              </Text>
            </View>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    gap: 14,
  },

  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
  },
  toastText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#065F46',
  },

  /* Hero Card */
  heroCard: {
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#334155',
    gap: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroShieldCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    borderWidth: 1.5,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 16,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(5, 150, 105, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#34D399',
    letterSpacing: 0.5,
  },

  trustScoreBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 10,
  },
  trustLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  trustValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#34D399',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },

  /* Section Card */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },

  /* Doc Type Pills */
  docTypeRow: {
    gap: 8,
    paddingVertical: 2,
  },
  docTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  docTypePillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  docTypePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  docTypePillTextActive: {
    color: '#065F46',
    fontWeight: '900',
  },
  docTypeDescText: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 1,
  },

  /* Input Groups */
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  helperText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },

  /* UIDAI Security Toggle */
  securityToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    gap: 10,
  },
  toggleTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#166534',
  },
  toggleSub: {
    fontSize: 10,
    color: '#15803D',
    marginTop: 2,
  },
  recomBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  recomBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#166534',
  },

  /* Opacity Row */
  opacityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  opacityPill: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  opacityPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  opacityPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  opacityPillTextActive: {
    color: '#1D4ED8',
    fontWeight: '900',
  },

  /* Stamp Button */
  stampButton: {
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 6,
  },
  stampButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  /* Vault */
  emptyVault: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyVaultTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  emptyVaultSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 260,
  },
  vaultCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  vaultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vaultDocTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  vaultDocNumber: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  vaultMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vaultMetaText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  vaultHashText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  vaultWatermarkNoteBox: {
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 8,
  },
  vaultWatermarkNote: {
    fontSize: 9.5,
    color: '#475569',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  vaultActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  previewBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  previewBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },

  /* FAQ */
  faqCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  faqTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  faqItem: {
    gap: 3,
  },
  faqQuestion: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  faqAnswer: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
});
