import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Share,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { colors, radius, spacing } from '../../theme';
import { DailyDirective, getDailyDirective } from '../../data/dailyDirectives';

interface Props {
  visible: boolean;
  rashiId?: string;
  onClose: () => void;
}

export function ShareableCosmicStoryModal({ visible, rashiId, onClose }: Props) {
  const directive: DailyDirective = getDailyDirective(rashiId);
  const [copied, setCopied] = useState(false);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const getShareText = () => {
    return (
      `✨ AstroGuru Daily Cosmic Directive ✨\n` +
      `🪐 Rashi: ${directive.rashiName} (${directive.sanskritName}) | ${formattedDate}\n\n` +
      `🟢 EMBRACE TODAY:\n` +
      directive.embrace.map((e) => `• ${e}`).join('\n') +
      `\n\n🔴 AVOID TODAY:\n` +
      directive.avoid.map((a) => `• ${a}`).join('\n') +
      `\n\n⚡ POWER MATRIX:\n` +
      `• Lucky Color: ${directive.powerMatrix.luckyColor}\n` +
      `• Lucky Number: ${directive.powerMatrix.luckyNumber}\n` +
      `• Lucky Direction: ${directive.powerMatrix.luckyDirection}\n` +
      `• Abhijit Muhurat: ${directive.powerMatrix.abhijitMuhurat}\n\n` +
      `“${directive.affirmation}”\n\n` +
      `📲 Discover your personalized Kundli & Vedic Forecast on AstroGuru!`
    );
  };

  const handleShareStory = async () => {
    try {
      await Share.share({
        title: `AstroGuru Daily Directive: ${directive.rashiName}`,
        message: getShareText(),
      });
    } catch (e: any) {
      Alert.alert('Share', 'Story text ready to share!');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        {/* Backdrop Tap Area */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.modalContent}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <Text style={styles.topBarIcon}>📸</Text>
              <Text style={styles.topBarTitle}>9:16 Cosmic Story Card</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* 9:16 Vertical Story Card Preview */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.storyScroll}
          >
            <View style={styles.storyCard}>
              <LinearGradient
                colors={['#0A0C1A', '#151A38', '#070912']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              {/* Luminous Specular Rim */}
              <View style={styles.storyRim} />

              {/* Top Branding & Date */}
              <View style={styles.cardHeader}>
                <View style={styles.brandRow}>
                  <Text style={styles.brandLogo}>🪐</Text>
                  <Text style={styles.brandName}>ASTROGURU</Text>
                </View>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateText}>{formattedDate}</Text>
                </View>
              </View>

              {/* Rashi Emblem Hero */}
              <View style={styles.rashiHero}>
                <View style={styles.chakraRing}>
                  <LinearGradient
                    colors={['rgba(99, 102, 241, 0.3)', 'rgba(236, 72, 153, 0.2)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.rashiSymbol}>✨</Text>
                </View>
                <Text style={styles.storyRashiTitle}>
                  {directive.rashiName} ({directive.sanskritName})
                </Text>
                <Text style={styles.storyRashiSub}>
                  {directive.element} Element · Ruled by {directive.rulingPlanet}
                </Text>
              </View>

              {/* Do's Section (Embrace) */}
              <View style={styles.directiveSection}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionIndicator, { backgroundColor: '#10B981' }]} />
                  <Text style={[styles.sectionTitle, { color: '#34D399' }]}>EMBRACE TODAY</Text>
                </View>
                {directive.embrace.slice(0, 2).map((item, idx) => (
                  <View key={idx} style={styles.directiveItem}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <Text style={styles.directiveItemText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Don'ts Section (Avoid) */}
              <View style={styles.directiveSection}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionIndicator, { backgroundColor: '#EF4444' }]} />
                  <Text style={[styles.sectionTitle, { color: '#F87171' }]}>AVOID TODAY</Text>
                </View>
                {directive.avoid.slice(0, 2).map((item, idx) => (
                  <View key={idx} style={styles.directiveItem}>
                    <Text style={styles.crossIcon}>✕</Text>
                    <Text style={styles.directiveItemText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Power Matrix Grid */}
              <View style={styles.matrixContainer}>
                <View style={styles.matrixCol}>
                  <Text style={styles.matrixLabel}>Lucky Color</Text>
                  <View style={styles.matrixColorRow}>
                    <View
                      style={[
                        styles.matrixColorDot,
                        { backgroundColor: directive.powerMatrix.luckyColorHex },
                      ]}
                    />
                    <Text style={styles.matrixValue}>{directive.powerMatrix.luckyColor}</Text>
                  </View>
                </View>

                <View style={styles.matrixCol}>
                  <Text style={styles.matrixLabel}>Lucky Number</Text>
                  <Text style={[styles.matrixValue, { color: '#FCD34D' }]}>
                    #{directive.powerMatrix.luckyNumber}
                  </Text>
                </View>

                <View style={styles.matrixCol}>
                  <Text style={styles.matrixLabel}>Abhijit Muhurat</Text>
                  <Text style={[styles.matrixValue, { color: '#38BDF8', fontSize: 11 }]}>
                    {directive.powerMatrix.abhijitMuhurat.split('–')[0]?.trim()}
                  </Text>
                </View>
              </View>

              {/* Affirmation */}
              <View style={styles.storyAffirmationBox}>
                <Text style={styles.storyAffirmationText}>“{directive.affirmation}”</Text>
              </View>

              {/* Story Watermark Footer */}
              <View style={styles.storyFooter}>
                <Text style={styles.footerPrompt}>Daily Vedic Horoscope & Kundli Insights</Text>
                <Text style={styles.footerLink}>astroguru.app</Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Bar */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={handleShareStory}
              style={({ pressed }) => [styles.primaryShareBtn, pressed && { opacity: 0.8 }]}
            >
              <LinearGradient
                colors={['#6366F1', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.btnIcon}>📲</Text>
              <Text style={styles.btnText}>Share to Instagram / WhatsApp</Text>
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
    backgroundColor: 'rgba(5, 7, 15, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '90%',
    backgroundColor: 'rgba(20, 26, 52, 0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    padding: spacing.md,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 140, 248, 0.18)',
    marginBottom: spacing.sm,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topBarIcon: {
    fontSize: 16,
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EEF2FF',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '700',
  },
  storyScroll: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  storyCard: {
    width: 280,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  storyRim: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  brandLogo: {
    fontSize: 16,
  },
  brandName: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: 1.2,
  },
  dateBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  dateText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  rashiHero: {
    alignItems: 'center',
    marginBottom: 12,
  },
  chakraRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(252, 211, 77, 0.5)',
    marginBottom: 6,
    overflow: 'hidden',
  },
  rashiSymbol: {
    fontSize: 22,
  },
  storyRashiTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#EEF2FF',
    letterSpacing: 0.3,
  },
  storyRashiSub: {
    fontSize: 10,
    color: '#A5B4FC',
    fontWeight: '500',
    marginTop: 2,
  },
  directiveSection: {
    backgroundColor: 'rgba(10, 13, 28, 0.7)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 0.8,
    borderColor: 'rgba(129, 140, 248, 0.15)',
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sectionIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  directiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  checkIcon: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '800',
    marginTop: 2,
  },
  crossIcon: {
    fontSize: 9,
    color: '#EF4444',
    fontWeight: '800',
    marginTop: 2,
  },
  directiveItemText: {
    flex: 1,
    fontSize: 10.5,
    color: '#E2E8F0',
    lineHeight: 14,
    fontWeight: '500',
  },
  matrixContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 33, 64, 0.6)',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  matrixCol: {
    flex: 1,
    alignItems: 'center',
  },
  matrixLabel: {
    fontSize: 8.5,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  matrixColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matrixColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  matrixValue: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#EEF2FF',
  },
  storyAffirmationBox: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 8,
    borderWidth: 0.6,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 8,
  },
  storyAffirmationText: {
    fontSize: 9.5,
    fontStyle: 'italic',
    color: '#FCD34D',
    textAlign: 'center',
    lineHeight: 13,
  },
  storyFooter: {
    alignItems: 'center',
    borderTopWidth: 0.8,
    borderTopColor: 'rgba(129, 140, 248, 0.15)',
    paddingTop: 6,
  },
  footerPrompt: {
    fontSize: 8.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 9.5,
    color: '#A5B4FC',
    fontWeight: '700',
    marginTop: 1,
    letterSpacing: 0.4,
  },
  actionRow: {
    marginTop: spacing.sm,
  },
  primaryShareBtn: {
    height: 44,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  btnIcon: {
    fontSize: 16,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
