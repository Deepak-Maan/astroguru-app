import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { TAROT_DECK, TarotCard } from '../src/data/tarot';
import { useWalletStore } from '../src/store/walletStore';
import { useSubscriptionStore } from '../src/store/subscriptionStore';
import { formatCurrency } from '../src/utils';

const BASE_TAROT_FEE = 300;

export default function TarotScreen() {
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance);
  const debit = useWalletStore((s) => s.debit);
  const isVip = useSubscriptionStore((s) => s.isVip);

  // VIP Members get 15% discount
  const finalFee = isVip ? Math.round(BASE_TAROT_FEE * 0.85) : BASE_TAROT_FEE;

  const [spreadMode, setSpreadMode] = useState<'daily' | 'threeCard'>('daily');
  const [drawnCards, setDrawnCards] = useState<{ position: string; card: TarotCard; revealed: boolean }[]>(() => [
    { position: 'Today’s Cosmic Guidance', card: TAROT_DECK[0], revealed: false },
  ]);

  const [debitNotice, setDebitNotice] = useState<string | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const drawNewSpread = (mode: 'daily' | 'threeCard') => {
    // Attempt wallet debit for ₹300
    const success = debit(finalFee, `Tarot Card Reading (${mode === 'daily' ? 'Daily' : '3-Card Spread'})`);
    if (!success) {
      setShowRechargeModal(true);
      return;
    }

    setDebitNotice(`${formatCurrency(finalFee)} debited for Tarot Reading Session ✨`);
    setTimeout(() => setDebitNotice(null), 3500);

    setSpreadMode(mode);
    const shuffled = [...TAROT_DECK].sort(() => 0.5 - Math.random());
    if (mode === 'daily') {
      setDrawnCards([{ position: 'Today’s Cosmic Guidance', card: shuffled[0], revealed: false }]);
    } else {
      setDrawnCards([
        { position: '1 · Past Influences', card: shuffled[0], revealed: false },
        { position: '2 · Present Situation', card: shuffled[1], revealed: false },
        { position: '3 · Future Outcome', card: shuffled[2], revealed: false },
      ]);
    }
  };

  const revealCard = (index: number) => {
    setDrawnCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, revealed: true } : c))
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Tarot Card Reader" subtitle={`Session Fee: ${formatCurrency(finalFee)}`} showBack showWallet />

        {/* Clean Spread Selector Tabs */}
        <View style={styles.tabWrapper}>
          <View style={styles.tabRow}>
            <Pressable
              onPress={() => drawNewSpread('daily')}
              style={[styles.tabCell, spreadMode === 'daily' && styles.tabCellActive]}
            >
              {spreadMode === 'daily' && (
                <LinearGradient colors={['#E67E22', '#D4AC0D']} style={StyleSheet.absoluteFill} />
              )}
              <Text
                style={[styles.tabText, spreadMode === 'daily' && styles.tabTextActive]}
                numberOfLines={1}
              >
                🃏 Daily Card ({formatCurrency(finalFee)})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => drawNewSpread('threeCard')}
              style={[styles.tabCell, spreadMode === 'threeCard' && styles.tabCellActive]}
            >
              {spreadMode === 'threeCard' && (
                <LinearGradient colors={['#7D3C98', '#E67E22']} style={StyleSheet.absoluteFill} />
              )}
              <Text
                style={[styles.tabText, spreadMode === 'threeCard' && styles.tabTextActive]}
                numberOfLines={1}
              >
                ✨ 3-Card Spread ({formatCurrency(finalFee)})
              </Text>
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {!!debitNotice && (
            <View style={styles.debitBanner}>
              <Text style={styles.debitBannerText}>{debitNotice}</Text>
            </View>
          )}

          {/* Pricing Banner */}
          <View style={styles.priceBanner}>
            <LinearGradient
              colors={['rgba(230,126,34,0.12)', 'rgba(125,60,152,0.04)']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={{ fontSize: 24 }}>🔮</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.priceTitle}>
                Tarot Session Rate: {formatCurrency(finalFee)}
                {isVip && <Text style={{ color: colors.success }}> (15% VIP Discount Applied)</Text>}
              </Text>
              <Text style={styles.priceSub}>
                Debited from wallet balance ({formatCurrency(balance)} available)
              </Text>
            </View>
          </View>

          <Text style={styles.instruction}>
            Tap a card below to reveal its mystic message:
          </Text>

          {/* Cards Display */}
          <View style={styles.cardsRow}>
            {drawnCards.map((item, idx) => (
              <View key={idx} style={styles.cardCol}>
                <Text style={styles.posTitle}>{item.position}</Text>
                <Pressable
                  onPress={() => revealCard(idx)}
                  style={({ pressed }) => [styles.tarotCardFrame, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }] }
                >
                  {item.revealed ? (
                    <View style={styles.tarotCardFront}>
                      <Image source={{ uri: item.card.image }} style={styles.cardImage} />
                      <LinearGradient
                        colors={['transparent', 'rgba(27,20,56,0.92)']}
                        style={styles.cardGradOverlay}
                      />
                      <View style={styles.cardOverlayContent}>
                        <Text style={styles.cardGlyph}>{item.card.glyph}</Text>
                        <Text style={styles.cardName}>{item.card.name}</Text>
                      </View>
                    </View>
                  ) : (
                    <LinearGradient
                      colors={['#7D3C98', '#331F6B']}
                      style={styles.tarotCardBack}
                    >
                      <View style={styles.tarotBackPattern}>
                        <Text style={{ fontSize: 36 }}>✨</Text>
                        <Text style={styles.tapText}>TAP TO REVEAL</Text>
                      </View>
                    </LinearGradient>
                  )}
                </Pressable>

                {/* Interpretation */}
                {item.revealed && (
                  <Card style={{ marginTop: spacing.md }}>
                    <SectionHeader title={item.card.name} subtitle={`Element: ${item.card.element}`} />

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm }}>
                      {item.card.keywords.map((kw) => (
                        <Chip key={kw} label={kw} tone="gold" />
                      ))}
                    </View>

                    <Text style={styles.readHeading}>Upright Meaning:</Text>
                    <Text style={styles.readText}>{item.card.upright}</Text>

                    <Text style={styles.readHeading}>Cosmic Advice:</Text>
                    <Text style={styles.readAdvice}>💡 {item.card.advice}</Text>
                  </Card>
                )}
              </View>
            ))}
          </View>

          <Button
            label={`🔄 Shuffle & Pull New Spread (${formatCurrency(finalFee)})`}
            variant="gold"
            size="lg"
            onPress={() => drawNewSpread(spreadMode)}
            style={{ marginTop: spacing.md }}
          />
        </ScrollView>

        {/* ── RECHARGE REQUIRED MODAL ── */}
        <Modal visible={showRechargeModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Insufficient Wallet Balance</Text>
              <View style={styles.modalBody}>
                <Text style={{ fontSize: 40 }}>💰</Text>
                <Text style={styles.modalText}>
                  Tarot Reading Session requires <Text style={{ color: colors.saffron, fontWeight: '800' }}>{formatCurrency(finalFee)}</Text>.
                </Text>
                <Text style={styles.modalSubText}>
                  Your current wallet balance is <Text style={{ color: colors.danger }}>{formatCurrency(balance)}</Text>. Please add money to continue your reading.
                </Text>
              </View>

              <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                <Button
                  label="💰 Recharge Wallet Now"
                  variant="gold"
                  size="md"
                  onPress={() => {
                    setShowRechargeModal(false);
                    router.push('/wallet');
                  }}
                />
                <Button
                  label="Cancel"
                  variant="outline"
                  size="md"
                  onPress={() => setShowRechargeModal(false)}
                />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  tabWrapper: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E8F3',
    shadowColor: 'rgba(160,175,205,0.20)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    height: 42,
    alignItems: 'center',
  },
  tabCell: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    overflow: 'hidden',
    paddingHorizontal: spacing.xs,
  },
  tabCellActive: {
    borderColor: 'transparent',
  },
  tabText: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: '800',
    fontSize: 12,
    textAlign: 'center',
  },
  tabTextActive: { color: colors.white, fontWeight: '800' },

  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  debitBanner: {
    backgroundColor: 'rgba(39,174,96,0.12)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  debitBannerText: { ...typography.small, color: colors.success, fontWeight: '800', textAlign: 'center' },

  priceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: 'rgba(160,175,205,0.25)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  priceTitle: { ...typography.small, color: colors.text, fontWeight: '800' },
  priceSub: { ...typography.tiny, color: colors.textMuted, marginTop: 1, fontWeight: '600' },

  instruction: { ...typography.small, color: colors.textMuted, textAlign: 'center', fontWeight: '600' },

  cardsRow: { gap: spacing.lg },
  cardCol: { gap: spacing.xs },
  posTitle: { ...typography.h3, color: colors.saffron, textAlign: 'center', marginBottom: spacing.xs, fontWeight: '800' },

  tarotCardFrame: {
    height: 240,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E3E8F3',
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(125,60,152,0.30)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
  },
  tarotCardBack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarotBackPattern: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: radius.lg,
    width: '85%',
    height: '85%',
  },
  tapText: { ...typography.tiny, color: colors.white, fontWeight: '800', letterSpacing: 1.2 },

  tarotCardFront: { flex: 1, position: 'relative' },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardGradOverlay: { ...StyleSheet.absoluteFillObject },
  cardOverlayContent: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  cardGlyph: { fontSize: 32 },
  cardName: { ...typography.h2, color: colors.white, textShadowColor: '#000', textShadowRadius: 6, fontWeight: '800' },

  readHeading: { ...typography.tiny, color: colors.textFaint, fontWeight: '700', marginTop: spacing.md },
  readText: { ...typography.body, color: colors.text, lineHeight: 21, marginTop: 2, fontWeight: '500' },
  readAdvice: { ...typography.small, color: colors.saffron, fontWeight: '800', lineHeight: 20, marginTop: 4 },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(27,20,56,0.60)', justifyContent: 'center', padding: spacing.lg },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    gap: spacing.md,
    shadowColor: 'rgba(160,175,205,0.40)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 8,
  },
  modalTitle: { ...typography.h2, color: colors.saffron, textAlign: 'center', fontWeight: '800' },
  modalBody: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  modalText: { ...typography.body, color: colors.text, textAlign: 'center', fontSize: 16, fontWeight: '600' },
  modalSubText: { ...typography.small, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
