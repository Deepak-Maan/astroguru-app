import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../theme';
import { useLanguageStore } from '../store/languageStore';
import { LANGUAGES, LanguageCode } from '../i18n/translations';

interface Props {
  compact?: boolean;
}

export function LanguageSelector({ compact = true }: Props) {
  const currentLang = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const [modalVisible, setModalVisible] = useState(false);

  const activeLangItem = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setModalVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }]}
        accessibilityRole="button"
        accessibilityLabel="Select language"
      >
        <Text style={styles.flag}>{activeLangItem.flag}</Text>
        <Text style={styles.btnText}>{activeLangItem.native}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Choose Language / भाषा चुनें</Text>
                <Text style={styles.modalSub}>Select your preferred astrology reading language</Text>
              </View>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={12}
                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.grid}>
              {LANGUAGES.map((lang) => {
                const active = currentLang === lang.code;
                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => handleSelect(lang.code)}
                    style={({ pressed }) => [
                      styles.cell,
                      active ? styles.cellActive : styles.cellInactive,
                      pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                    ]}
                  >
                    {active && (
                      <LinearGradient
                        colors={['#6366F1', '#4F46E5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <Text style={styles.cellFlag}>{lang.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cellNative, active && { color: colors.white }]}>
                        {lang.native}
                      </Text>
                      <Text style={[styles.cellLabel, active && { color: 'rgba(255,255,255,0.92)' }]}>
                        {lang.label}
                      </Text>
                    </View>
                    {active ? (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkIcon}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.radioOutline} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(129, 140, 248, 0.4)',
    borderLeftColor: 'rgba(129, 140, 248, 0.25)',
    borderBottomWidth: 3,
    borderRightWidth: 1.2,
    borderBottomColor: 'rgba(10, 12, 28, 0.95)',
    borderRightColor: 'rgba(129, 140, 248, 0.15)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  flag: { fontSize: 13 },
  btnText: { ...typography.tiny, color: '#EEF2FF', fontWeight: '800', fontSize: 12.5 },
  chevron: { fontSize: 11, color: '#A5B4FC', fontWeight: '800', marginLeft: 1 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 15, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#11162B',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(129, 140, 248, 0.45)',
    borderLeftColor: 'rgba(129, 140, 248, 0.25)',
    borderBottomWidth: 4,
    borderRightWidth: 1.2,
    borderBottomColor: 'rgba(10, 12, 28, 0.98)',
    borderRightColor: 'rgba(129, 140, 248, 0.15)',
    gap: spacing.md,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 140, 248, 0.18)',
  },
  modalTitle: {
    ...typography.h2,
    color: '#EEF2FF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  modalSub: {
    ...typography.tiny,
    color: '#A5B4FC',
    marginTop: 2,
    fontSize: 11.5,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  closeText: {
    color: '#A5B4FC',
    fontSize: 14,
    fontWeight: '800',
  },

  grid: { gap: spacing.sm },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cellInactive: {
    backgroundColor: 'rgba(26, 33, 64, 0.82)',
    borderTopWidth: 1.2,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(129, 140, 248, 0.3)',
    borderLeftColor: 'rgba(129, 140, 248, 0.2)',
    borderBottomWidth: 3,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(10, 12, 28, 0.95)',
    borderRightColor: 'rgba(129, 140, 248, 0.12)',
  },
  cellActive: {
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: '#A5B4FC',
    borderLeftColor: 'rgba(165, 180, 252, 0.6)',
    borderBottomWidth: 3.5,
    borderRightWidth: 1.2,
    borderBottomColor: '#312E81',
    borderRightColor: 'rgba(79, 70, 229, 0.5)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  cellFlag: { fontSize: 24 },
  cellNative: {
    ...typography.h3,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  cellLabel: {
    ...typography.tiny,
    color: '#A5B4FC',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 1,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  checkIcon: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
  radioOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.35)',
  },
});
