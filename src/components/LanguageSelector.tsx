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
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.75 }]}
      >
        <Text style={styles.flag}>{activeLangItem.flag}</Text>
        <Text style={styles.btnText}>{activeLangItem.native}</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Choose Language / भाषा चुनें</Text>
            <View style={styles.grid}>
              {LANGUAGES.map((lang) => {
                const active = currentLang === lang.code;
                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => handleSelect(lang.code)}
                    style={[styles.cell, active && styles.cellActive]}
                  >
                    {active && (
                      <LinearGradient
                        colors={[colors.teal, '#047857']}
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
                      <Text style={[styles.cellLabel, active && { color: 'rgba(255,255,255,0.85)' }]}>
                        {lang.label}
                      </Text>
                    </View>
                    {active && <Text style={styles.checkIcon}>✓</Text>}
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
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    overflow: 'hidden',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 2,
  },
  flag: { fontSize: 13 },
  btnText: { color: '#1E1B4B', fontWeight: '800', fontSize: 11.5 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(191, 219, 254, 0.6)',
    borderRightColor: 'rgba(191, 219, 254, 0.6)',
    gap: spacing.md,
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: { ...typography.h2, color: colors.teal, textAlign: 'center', fontSize: 18, fontWeight: '800' },

  grid: { gap: spacing.sm },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.6)',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  cellActive: { borderColor: colors.teal },
  cellFlag: { fontSize: 24 },
  cellNative: { ...typography.h3, color: colors.text, fontSize: 16, fontWeight: '800' },
  cellLabel: { ...typography.tiny, color: colors.textMuted, fontWeight: '600' },
  checkIcon: { color: colors.white, fontWeight: '900', fontSize: 16 },
});
