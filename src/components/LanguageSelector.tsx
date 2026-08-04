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
        <LinearGradient
          colors={['rgba(16,185,129,0.14)', 'rgba(245,158,11,0.06)']}
          style={StyleSheet.absoluteFill}
        />
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
                        colors={[colors.saffron, colors.gold]}
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
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    backgroundColor: '#0E1726',
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.50)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  flag: { fontSize: 13 },
  btnText: { ...typography.tiny, color: colors.text, fontWeight: '800', fontSize: 12 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4,7,13,0.80)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: '#0E1726',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    gap: spacing.md,
    shadowColor: 'rgba(0,0,0,0.60)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 8,
  },
  modalTitle: { ...typography.h2, color: colors.saffron, textAlign: 'center', fontSize: 18, fontWeight: '800' },

  grid: { gap: spacing.sm },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.20)',
    backgroundColor: '#080E1A',
    overflow: 'hidden',
  },
  cellActive: { borderColor: colors.saffron },
  cellFlag: { fontSize: 24 },
  cellNative: { ...typography.h3, color: colors.text, fontSize: 16, fontWeight: '800' },
  cellLabel: { ...typography.tiny, color: colors.textMuted, fontWeight: '600' },
  checkIcon: { color: colors.white, fontWeight: '900', fontSize: 16 },
});
