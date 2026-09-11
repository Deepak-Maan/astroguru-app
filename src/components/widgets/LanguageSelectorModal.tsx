import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useLanguageStore } from '../../store/languageStore';
import { LANGUAGES, LanguageCode } from '../../i18n/translations';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function LanguageSelectorModal({ visible, onClose }: Props) {
  const currentLang = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const handleSelect = (code: LanguageCode) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    setLanguage(code);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalCard}>
          <LinearGradient
            colors={['#1E1B4B', '#0F172A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.topGoldBar} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>🌐 Select App Language</Text>
              <Text style={styles.sub}>अपनी पसंदीदा भाषा चुनें</Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.langList}>
            {LANGUAGES.map((lang) => {
              const active = currentLang === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => handleSelect(lang.code)}
                  style={({ pressed }) => [
                    styles.langRow,
                    active && styles.langRowActive,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.langFlag}>{lang.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.langLabel, active && styles.langLabelActive]}>
                      {lang.native} ({lang.label})
                    </Text>
                  </View>
                  {active && <Text style={styles.checkIcon}>✅</Text>}
                </Pressable>
              );
            })}
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
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  topGoldBar: {
    height: 3,
    backgroundColor: '#F59E0B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sub: {
    fontSize: 11,
    color: '#FCD34D',
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '700',
  },
  langList: {
    padding: 16,
    gap: 8,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  langRowActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  langFlag: {
    fontSize: 22,
  },
  langLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  langLabelActive: {
    color: '#FCD34D',
  },
  checkIcon: {
    fontSize: 16,
  },
});
