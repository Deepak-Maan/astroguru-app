import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
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
import { useAdminStore } from '../../src/store/adminStore';
import { colors, radius, spacing, typography } from '../../src/theme';

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
];

const DOC_TYPES: Array<{ id: DocType; label: string; icon: string; desc: string; sampleNum: string }> = [
  {
    id: 'aadhaar_front',
    label: 'Aadhaar (Front)',
    icon: '🇮🇳',
    desc: 'UIDAI Government ID with Photo',
    sampleNum: '582948199182',
  },
  {
    id: 'aadhaar_back',
    label: 'Aadhaar (Back)',
    icon: '🇮🇳',
    desc: 'Address & QR verification side',
    sampleNum: '582948199182',
  },
  {
    id: 'pan_card',
    label: 'PAN Card',
    icon: '🪪',
    desc: 'Income Tax Department ID for payouts',
    sampleNum: 'ABCDE9482Q',
  },
  {
    id: 'jyotish_degree',
    label: 'Jyotish Degree',
    icon: '📜',
    desc: 'ICAS, BVB or University Degree Certificate',
    sampleNum: 'ICAS-JYOTISH-2015-882',
  },
  {
    id: 'passport',
    label: 'Passport',
    icon: '🛂',
    desc: 'Indian or International Passport page',
    sampleNum: 'Z4819582',
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
  const [docNumber, setDocNumber] = useState('582948199182');
  const [dob, setDob] = useState('15/08/1988');
  const [gender, setGender] = useState('MALE / पुरुष');
  const [attachedImage, setAttachedImage] = useState<string | null>(SAMPLE_AVATARS[0]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fullscreen Inspection Modal
  const [inspectDoc, setInspectDoc] = useState<KycDocument | null>(null);

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

  const handleSelectDocType = (type: DocType, sample: string) => {
    triggerHaptic('light');
    setSelectedType(type);
    setDocNumber(sample);
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
      const last4 = docNumber.length >= 4 ? docNumber.slice(-4) : '9182';
      maskedNumber = `XXXX-XXXX-${last4}`;
    } else if (selectedType === 'pan_card') {
      const last4 = docNumber.length >= 4 ? docNumber.slice(-4) : '9482Q';
      maskedNumber = `••••••${last4}`;
    }

    uploadDocument({
      docType: selectedType,
      docNumber: docNumber.trim(),
      docNumberMasked: maskedNumber,
      holderName: holderName.trim(),
      dob: dob.trim(),
      gender: gender.trim(),
      imageUri: attachedImage || undefined,
      watermarkText: customWatermarkNote,
      watermarkOpacity,
      status: 'pending_review',
    });

    setSuccessToast(`🎉 ${DOC_TYPES.find((d) => d.id === selectedType)?.label} watermarked & stamped to KYC Vault!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleDownloadCopy = (doc: KycDocument) => {
    triggerHaptic('success');
    setSuccessToast(`📥 Secure watermarked copy of "${doc.holderName} (${doc.docNumberMasked})" exported!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleRemoveDoc = (id: string, name: string) => {
    triggerHaptic('medium');
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
                  Client-side tamper-proof watermarking prevents unauthorized misuse of your credentials.
                </Text>
              </View>
            </View>

            <View style={styles.trustScoreBar}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.trustLabel}>Astrologer Trust & Verification Score</Text>
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
                    onPress={() => handleSelectDocType(dt.id, dt.sampleNum)}
                    style={[
                      styles.docTypeBtn,
                      isSelected && styles.docTypeBtnActive,
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>{dt.icon}</Text>
                    <Text
                      style={[
                        styles.docTypeLabel,
                        isSelected && styles.docTypeLabelActive,
                      ]}
                    >
                      {dt.label}
                    </Text>
                    <Text style={styles.docTypeDesc} numberOfLines={2}>
                      {dt.desc}
                    </Text>
                    {isSelected && (
                      <View style={styles.activeCheckPill}>
                        <Text style={styles.activeCheckText}>✓ SELECTED</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Section 2: Input Document Details & Photo ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconPill}>
                <Text style={{ fontSize: 15 }}>✏️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>2. Document Details & Photo</Text>
                <Text style={styles.sectionSub}>Provide details to generate the official card preview</Text>
              </View>
            </View>

            {/* Photo Attachment Row */}
            <View style={styles.photoUploadRow}>
              <View style={styles.photoThumbWrapper}>
                {attachedImage ? (
                  <Image source={{ uri: attachedImage }} style={styles.photoThumb} />
                ) : (
                  <View style={styles.photoThumbPlaceholder}>
                    <Text style={{ fontSize: 20 }}>📸</Text>
                  </View>
                )}
              </View>

              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: colors.text }}>
                  Document Identification Photo
                </Text>
                <Text style={{ fontSize: 10.5, color: colors.textMuted }}>
                  Tap below to switch sample portrait photo
                </Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                  {SAMPLE_AVATARS.map((uri, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => {
                        triggerHaptic('light');
                        setAttachedImage(uri);
                      }}
                      style={[
                        styles.avatarSampleBtn,
                        attachedImage === uri && styles.avatarSampleBtnActive,
                      ]}
                    >
                      <Image source={{ uri }} style={{ width: 28, height: 28, borderRadius: 14 }} />
                    </Pressable>
                  ))}
                  <Pressable
                    onPress={() => {
                      triggerHaptic('light');
                      setAttachedImage(null);
                    }}
                    style={styles.removePhotoBtn}
                  >
                    <Text style={{ fontSize: 10, color: '#DC2626', fontWeight: '800' }}>No Photo</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Holder Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name on Document</Text>
              <TextInput
                value={holderName}
                onChangeText={setHolderName}
                placeholder="e.g. Pandit Deepak Sharma"
                placeholderTextColor={colors.textFaint}
                style={styles.textInput}
              />
            </View>

            {/* Document Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {selectedType === 'aadhaar_front' || selectedType === 'aadhaar_back'
                  ? 'Aadhaar Number (12 Digits)'
                  : selectedType === 'pan_card'
                  ? 'PAN Number (10 Characters)'
                  : 'Registration / Certificate Number'}
              </Text>
              <TextInput
                value={docNumber}
                onChangeText={setDocNumber}
                placeholder="e.g. 5829 4819 9182"
                placeholderTextColor={colors.textFaint}
                autoCapitalize="characters"
                style={[styles.textInput, { fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace', fontWeight: '800' }]}
              />
            </View>

            {/* DOB & Gender */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TextInput
                  value={dob}
                  onChangeText={setDob}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={colors.textFaint}
                  style={styles.textInput}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Gender</Text>
                <TextInput
                  value={gender}
                  onChangeText={setGender}
                  placeholder="MALE / FEMALE"
                  placeholderTextColor={colors.textFaint}
                  style={styles.textInput}
                />
              </View>
            </View>
          </View>

          {/* ── Section 3: Watermark & Anti-Theft Security Settings ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconPill}>
                <Text style={{ fontSize: 15 }}>🛡️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>3. Watermark & UIDAI Redaction Settings</Text>
                <Text style={styles.sectionSub}>Configure anti-theft stamps and digit masks</Text>
              </View>
            </View>

            {/* UIDAI Masking Switch (Aadhaar Only) */}
            {(selectedType === 'aadhaar_front' || selectedType === 'aadhaar_back') && (
              <View style={styles.switchRow}>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.switchTitle}>Mask First 8 Aadhaar Digits</Text>
                    <View style={styles.uidaiPill}>
                      <Text style={styles.uidaiPillText}>UIDAI COMPLIANT</Text>
                    </View>
                  </View>
                  <Text style={styles.switchSub}>
                    Converts numbers to "XXXX-XXXX-1234" to prevent identity theft.
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

            {/* Watermark Note */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Custom Watermark Text</Text>
              <TextInput
                value={customWatermarkNote}
                onChangeText={setCustomWatermarkNote}
                placeholder="e.g. FOR ASTROGURU VERIFICATION ONLY"
                placeholderTextColor={colors.textFaint}
                style={styles.textInput}
              />
            </View>

            {/* Watermark Opacity Chips */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Watermark Density & Opacity</Text>
              <View style={styles.opacityRow}>
                {[
                  { label: 'Subtle (20%)', val: 0.2 },
                  { label: 'Standard (35%)', val: 0.35 },
                  { label: 'High Security (50%)', val: 0.5 },
                ].map((item) => {
                  const isSelected = watermarkOpacity === item.val;
                  return (
                    <Pressable
                      key={item.val}
                      onPress={() => {
                        triggerHaptic('light');
                        setWatermarkOpacity(item.val);
                      }}
                      style={[
                        styles.opacityChip,
                        isSelected && styles.opacityChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.opacityChipText,
                          isSelected && styles.opacityChipTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {/* ── Section 4: Live Stamped Preview ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconPill}>
                <Text style={{ fontSize: 15 }}>👁️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>4. Live Stamped Watermark Preview</Text>
                <Text style={styles.sectionSub}>Exact document rendering with anti-theft lattice</Text>
              </View>
            </View>

            <WatermarkedDocViewer
              docType={selectedType}
              holderName={holderName}
              docNumber={docNumber}
              dob={dob}
              gender={gender}
              imageUri={attachedImage || undefined}
              isMasked={maskAadhaarDigits}
              watermarkText={customWatermarkNote}
              watermarkOpacity={watermarkOpacity}
              securityHash="AGY-SHA256-LIVE"
            />

            {/* Submit & Stamp Button */}
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
                🛡️ Stamp Watermark & Save to KYC Vault
              </Text>
            </Pressable>
          </View>

          {/* ── Section 5: Verified Documents Vault Table ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconPill}>
                <Text style={{ fontSize: 15 }}>📁</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Your Verified Credentials Vault ({documents.length})</Text>
                <Text style={styles.sectionSub}>All uploaded and watermarked identity records</Text>
              </View>
            </View>

            {documents.length === 0 ? (
              <View style={styles.emptyVaultBox}>
                <Text style={{ fontSize: 32 }}>📭</Text>
                <Text style={styles.emptyVaultTitle}>No Documents in Vault</Text>
                <Text style={styles.emptyVaultSub}>
                  Upload your Aadhaar and Jyotish Degrees above to earn a verified Gold badge.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {documents.map((doc) => {
                  const meta = DOC_TYPES.find((d) => d.id === doc.docType);
                  return (
                    <View key={doc.id} style={styles.vaultItemCard}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Text style={{ fontSize: 24 }}>{meta?.icon || '📄'}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.vaultDocTitle}>{meta?.label}</Text>
                          <Text style={styles.vaultDocNumber}>{doc.docNumberMasked}</Text>
                          <Text style={styles.vaultDocMeta}>
                            🔒 {doc.securityHash} · {doc.uploadedAt}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.statusPill,
                            {
                              backgroundColor:
                                doc.status === 'verified'
                                  ? '#ECFDF5'
                                  : doc.status === 'rejected'
                                  ? '#FEF2F2'
                                  : '#FFFBEB',
                              borderColor:
                                doc.status === 'verified'
                                  ? '#A7F3D0'
                                  : doc.status === 'rejected'
                                  ? '#FECACA'
                                  : '#FDE68A',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              {
                                color:
                                  doc.status === 'verified'
                                    ? '#059669'
                                    : doc.status === 'rejected'
                                    ? '#DC2626'
                                    : '#D97706',
                              },
                            ]}
                          >
                            {doc.status === 'verified'
                              ? '✅ VERIFIED'
                              : doc.status === 'rejected'
                              ? '❌ REJECTED'
                              : '⏳ UNDER REVIEW'}
                          </Text>
                        </View>
                      </View>

                      {/* Action buttons */}
                      <View style={styles.vaultActionsRow}>
                        <Pressable
                          onPress={() => setInspectDoc(doc)}
                          style={styles.vaultInspectBtn}
                        >
                          <Text style={styles.vaultInspectText}>🔍 View & Inspect</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => handleDownloadCopy(doc)}
                          style={styles.vaultDownloadBtn}
                        >
                          <Text style={styles.vaultDownloadText}>📥 Download Copy</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => handleRemoveDoc(doc.id, meta?.label || 'Document')}
                          style={styles.vaultRemoveBtn}
                        >
                          <Text style={styles.vaultRemoveText}>🗑️</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* ── Section 6: Security & UIDAI Compliance FAQ ── */}
          <View style={styles.sectionCard}>
            <Text style={styles.faqHeader}>🛡️ Identity Security & UIDAI Guidelines FAQ</Text>
            <View style={styles.faqItem}>
              <Text style={styles.faqQ}>Why is watermarking required for Astrologers?</Text>
              <Text style={styles.faqA}>
                Watermarking stamps a non-removable purpose statement across the card. This ensures that even if someone intercepts your document, they cannot open bank accounts or apply for loans in your name.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQ}>What is UIDAI 8-digit masking?</Text>
              <Text style={styles.faqA}>
                Under official UIDAI circulars, sharing masked Aadhaar (displaying only the last 4 digits) is legally approved for verification while completely eliminating identity theft risks.
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* ── Fullscreen Magnified Inspection Modal ── */}
        <Modal visible={!!inspectDoc} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={styles.modalTitle}>Credential Inspector</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    {inspectDoc?.docNumberMasked} · {inspectDoc?.securityHash}
                  </Text>
                </View>
                <Pressable onPress={() => setInspectDoc(null)} style={styles.modalCloseBtn}>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>✕</Text>
                </Pressable>
              </View>

              {inspectDoc && (
                <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                  <WatermarkedDocViewer
                    docType={inspectDoc.docType}
                    holderName={inspectDoc.holderName}
                    docNumber={inspectDoc.docNumber}
                    dob={inspectDoc.dob}
                    gender={inspectDoc.gender}
                    imageUri={inspectDoc.imageUri}
                    isMasked={maskAadhaarDigits}
                    watermarkText={inspectDoc.watermarkText}
                    watermarkOpacity={inspectDoc.watermarkOpacity}
                    securityHash={inspectDoc.securityHash}
                    dateStamp={inspectDoc.uploadedAt}
                  />
                </ScrollView>
              )}

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <Pressable
                  onPress={() => {
                    if (inspectDoc) handleDownloadCopy(inspectDoc);
                  }}
                  style={styles.modalExportBtn}
                >
                  <Text style={styles.modalExportText}>📥 Download Stamped PDF/Image</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  toastText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#065F46',
    flex: 1,
  },

  /* Hero Card */
  heroCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    overflow: 'hidden',
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
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
    backgroundColor: 'rgba(5, 150, 105, 0.18)',
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
    backgroundColor: '#065F46',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  verifiedBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#A7F3D0',
    letterSpacing: 0.5,
  },
  trustScoreBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 10,
  },
  trustLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
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

  /* Section Cards */
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
    backgroundColor: '#ECFDF5',
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

  /* Document Type Carousel */
  docTypeRow: {
    gap: 10,
    paddingVertical: 4,
  },
  docTypeBtn: {
    width: 140,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 4,
  },
  docTypeBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  docTypeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 2,
  },
  docTypeLabelActive: {
    color: '#065F46',
    fontWeight: '900',
  },
  docTypeDesc: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 12,
  },
  activeCheckPill: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  activeCheckText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  /* Photo Attachment */
  photoUploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  photoThumbWrapper: {
    width: 48,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  photoThumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSampleBtn: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarSampleBtnActive: {
    borderColor: '#059669',
  },
  removePhotoBtn: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  /* Form Inputs */
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#334155',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },

  /* Switch Row */
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  switchTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  switchSub: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14,
  },
  uidaiPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  uidaiPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#065F46',
  },

  /* Opacity Chips */
  opacityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  opacityChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  opacityChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  opacityChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  opacityChipTextActive: {
    color: '#065F46',
    fontWeight: '900',
  },

  /* Stamp Button */
  stampButton: {
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 4,
  },
  stampButtonText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  /* Vault Cards */
  emptyVaultBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyVaultTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  emptyVaultSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 16,
  },
  vaultItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  vaultDocTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  vaultDocNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
    marginTop: 1,
  },
  vaultDocMeta: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  vaultActionsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  vaultInspectBtn: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  vaultInspectText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  vaultDownloadBtn: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  vaultDownloadText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  vaultRemoveBtn: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  vaultRemoveText: {
    fontSize: 12,
  },

  /* FAQ */
  faqHeader: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  faqItem: {
    gap: 3,
    paddingVertical: 4,
  },
  faqQ: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  faqA: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    gap: 12,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalExportBtn: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalExportText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
