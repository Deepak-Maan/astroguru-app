import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { useWalletStore } from '../src/store/walletStore';
import { formatCurrency } from '../src/utils';

export default function SatsangScreen() {
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance);
  const debit = useWalletStore((s) => s.debit);

  const [chatMessages, setChatMessages] = useState([
    { id: '1', user: 'Ramesh Sharma', text: 'Namaste Guruji 🙏', time: '14:50' },
    { id: '2', user: 'Priya Patel', text: 'Offered Ghee Diya 🪔 for family peace.', time: '14:51' },
    { id: '3', user: 'Amit Verma', text: 'When is the next Shani Shanti Puja?', time: '14:52' },
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [offeringSuccess, setOfferingSuccess] = useState<string | null>(null);

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    setChatMessages([
      ...chatMessages,
      { id: Date.now().toString(), user: 'You', text: inputMsg.trim(), time: 'Just now' },
    ]);
    setInputMsg('');
  };

  const handleSendOffering = (name: string, price: number, icon: string) => {
    if (balance < price) {
      alert(`Insufficient balance! Offering requires ${formatCurrency(price)}. Please recharge your wallet.`);
      router.push('/wallet');
      return;
    }
    const ok = debit(price, `Virtual offering: ${name}`);
    if (ok) {
      setOfferingSuccess(`Offered ${icon} ${name} (${formatCurrency(price)}) to the Acharya!`);
      setChatMessages([
        ...chatMessages,
        { id: Date.now().toString(), user: 'You', text: `Offered ${icon} ${name}!`, time: 'Just now' },
      ]);
      setTimeout(() => setOfferingSuccess(null), 4000);
    } else {
      alert(`Could not process offering. Please check your wallet balance.`);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="🌌 Live Satsang & Webinars" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Live Video Player Box */}
          <View style={styles.videoPlayer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800' }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.75)']}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.liveBadgeRow}>
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveTagText}>LIVE NOW</Text>
              </View>
              <Text style={styles.viewersText}>👥 1,420 Watching</Text>
            </View>

            <View style={styles.hostInfo}>
              <Text style={styles.hostTitle}>Mahamrityunjaya Mantra & Rahu Transit Guidance</Text>
              <Text style={styles.hostName}>Hosted by Acharya Dev Sharma</Text>
            </View>
          </View>

          {/* Virtual Offerings Banner */}
          <Card style={{ gap: spacing.xs }}>
            <SectionHeader title="🌸 Send Virtual Offerings" subtitle="Support the live satsang & seek blessings" />

            {offeringSuccess && (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>✨ {offeringSuccess}</Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 4 }}>
              {[
                { name: 'Rose Flowers', price: 21, icon: '🌸' },
                { name: 'Ghee Diya', price: 51, icon: '🪔' },
                { name: 'Temple Prashad', price: 108, icon: '🍯' },
              ].map((offering) => (
                <Pressable
                  key={offering.name}
                  onPress={() => handleSendOffering(offering.name, offering.price, offering.icon)}
                  style={({ pressed }) => [styles.offeringCard, pressed && { opacity: 0.8 }]}
                >
                  <Text style={{ fontSize: 26 }}>{offering.icon}</Text>
                  <Text style={styles.offeringName}>{offering.name}</Text>
                  <Chip label={formatCurrency(offering.price)} tone="gold" />
                </Pressable>
              ))}
            </View>
          </Card>

          {/* Live Stream Chat */}
          <Card style={{ gap: spacing.sm }}>
            <SectionHeader title="💬 Live Seekers Chat" subtitle="Ask live questions to Acharya" />

            <View style={styles.chatBox}>
              {chatMessages.map((msg) => (
                <View key={msg.id} style={styles.msgRow}>
                  <Text style={styles.msgUser}>{msg.user}:</Text>
                  <Text style={styles.msgText}>{msg.text}</Text>
                  <Text style={styles.msgTime}>{msg.time}</Text>
                </View>
              ))}
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.chatInput}
                value={inputMsg}
                onChangeText={setInputMsg}
                placeholder="Ask a question in live chat..."
              />
              <Button label="Send" variant="gold" size="sm" fullWidth={false} onPress={handleSendMessage} />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  videoPlayer: {
    height: 220,
    borderRadius: radius.xl,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    elevation: 4,
  },
  liveBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  liveTagText: { ...typography.tiny, color: colors.white, fontWeight: '900' },
  viewersText: { ...typography.tiny, color: colors.white, fontWeight: '700', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },

  hostInfo: { gap: 2 },
  hostTitle: { ...typography.h3, color: colors.white, fontSize: 16, fontWeight: '800' },
  hostName: { ...typography.tiny, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  offeringCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    gap: 4,
  },
  offeringName: { ...typography.tiny, color: colors.text, fontWeight: '700', textAlign: 'center' },

  successBanner: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderColor: colors.success,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  successText: { ...typography.small, color: colors.success, fontWeight: '800' },

  chatBox: {
    height: 180,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    gap: 6,
  },
  msgRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  msgUser: { ...typography.tiny, color: colors.saffron, fontWeight: '800' },
  msgText: { ...typography.small, color: colors.text, flex: 1 },
  msgTime: { ...typography.tiny, color: colors.textFaint, fontSize: 9 },

  inputRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  chatInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 13,
  },
});
