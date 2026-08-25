import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Platform,
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
import * as Haptics from 'expo-haptics';
import { AstrotalkHeader } from '../src/components/astrotalk/AstrotalkHeader';
import { AstrotalkRechargeModal } from '../src/components/astrotalk/AstrotalkRechargeModal';
import { colors, radius, spacing } from '../src/theme';
import { useWalletStore } from '../src/store/walletStore';
import { ASTROLOGERS } from '../src/data/astrologers';

interface Comment {
  id: string;
  name: string;
  avatar: string;
  text: string;
  gift?: string;
  time: string;
}

const GIFTS = [
  { id: 'g1', name: 'Rose Petals', icon: '🌸', price: 11 },
  { id: 'g2', name: 'Akhand Diya', icon: '🪔', price: 21 },
  { id: 'g3', name: 'Sacred Coconut', icon: '🥥', price: 51 },
  { id: 'g4', name: 'Gold Coin', icon: '🪙', price: 101 },
  { id: 'g5', name: 'Royal Mukut', icon: '👑', price: 501 },
];

const INITIAL_COMMENTS: Comment[] = [
  { id: 'c1', name: 'Rahul Sharma', avatar: 'https://i.pravatar.cc/100?img=33', text: 'Namaste Acharya ji! Will I get married in 2026?', time: 'just now' },
  { id: 'c2', name: 'Pooja Verma', avatar: 'https://i.pravatar.cc/100?img=41', text: 'Sent Akhand Diya! 🙏 Har Har Mahadev', gift: '🪔 Akhand Diya', time: '1s ago' },
  { id: 'c3', name: 'Amit Desai', avatar: 'https://i.pravatar.cc/100?img=60', text: 'Accurate reading on Jupiter transit! Thank you Guru ji', time: '4s ago' },
  { id: 'c4', name: 'Sneha Patel', avatar: 'https://i.pravatar.cc/100?img=28', text: 'Sent Gold Coin! 🪙 Please answer my job query', gift: '🪙 Gold Coin', time: '8s ago' },
];

export default function LiveDarshanScreen() {
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance ?? 100);
  const debit = useWalletStore((s) => s.debit);

  const [activeTab, setActiveTab] = useState<'astrologers' | 'temples'>('astrologers');
  const [selectedAstrologer, setSelectedAstrologer] = useState(ASTROLOGERS[0]);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [commentInput, setCommentInput] = useState('');
  const [giftDrawerVisible, setGiftDrawerVisible] = useState(false);
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [flyingGift, setFlyingGift] = useState<string | null>(null);

  // Simulated live chat comment generator
  useEffect(() => {
    const timer = setInterval(() => {
      const names = ['Kavita Rao', 'Vikram Singh', 'Deepak Goyal', 'Ananya Roy', 'Ramesh Chandra'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const msgs = [
        'Har Har Mahadev! 🙏',
        'Jai Shri Krishna! Please check my Kundli',
        'Will Shani Sade Sati end this year?',
        'Sent sacred flowers! 🌸',
        'Your daily horoscope reading was 100% true!',
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];

      setComments((prev) => [
        {
          id: `c-${Date.now()}`,
          name: randomName,
          avatar: `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 50) + 1}`,
          text: randomMsg,
          time: 'just now',
        },
        ...prev.slice(0, 12),
      ]);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const handleSendComment = () => {
    if (!commentInput.trim()) return;
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      name: 'You (Seeker)',
      avatar: 'https://i.pravatar.cc/100?img=12',
      text: commentInput.trim(),
      time: 'just now',
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentInput('');
  };

  const handleSendGift = (gift: typeof GIFTS[0]) => {
    if (balance < gift.price) {
      setGiftDrawerVisible(false);
      setRechargeModalVisible(true);
      return;
    }

    const success = debit(gift.price, `Live Gift: ${gift.name} to ${selectedAstrologer.name}`);
    if (success) {
      try {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (_) {}

      setFlyingGift(gift.icon);
      setTimeout(() => setFlyingGift(null), 2500);

      const newGiftComment: Comment = {
        id: `c-${Date.now()}`,
        name: 'You (Seeker)',
        avatar: 'https://i.pravatar.cc/100?img=12',
        text: `Sent ${gift.name}! ${gift.icon} Blessings to Guru ji.`,
        gift: `${gift.icon} ${gift.name} (₹${gift.price})`,
        time: 'just now',
      };

      setComments((prev) => [newGiftComment, ...prev]);
      setGiftDrawerVisible(false);
    }
  };

  const handleJoinQueue = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}
    setQueuePosition(4);
  };

  const TEMPLES = [
    { name: 'Shri Kashi Vishwanath Temple', city: 'Varanasi, UP', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=600', icon: '🔱' },
    { name: 'Shri Mahakaleshwar Jyotirlinga', city: 'Ujjain, MP', image: 'https://images.unsplash.com/photo-1609766857041-ed403ea6948c?auto=format&fit=crop&w=600', icon: '🛕' },
    { name: 'Shri Tirupati Balaji Temple', city: 'Tirumala, AP', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600', icon: '🕉️' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* AstroGuru Header */}
        <AstrotalkHeader onOpenRecharge={() => setRechargeModalVisible(true)} />

        {/* Tab Switcher: Live Astrologers vs Temple Darshan */}
        <View style={styles.tabBar}>
          <Pressable
            onPress={() => setActiveTab('astrologers')}
            style={[styles.tabItem, activeTab === 'astrologers' && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, activeTab === 'astrologers' && styles.tabTextActive]}>
              🔴 Live Astrologers (35)
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('temples')}
            style={[styles.tabItem, activeTab === 'temples' && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, activeTab === 'temples' && styles.tabTextActive]}>
              🏛️ 24/7 Temple Darshan
            </Text>
          </Pressable>
        </View>

        {activeTab === 'astrologers' ? (
          /* Live Astrologer Stream Screen */
          <View style={{ flex: 1 }}>
            {/* Live Video Stage */}
            <View style={styles.videoStage}>
              <Image source={{ uri: selectedAstrologer.avatar }} style={StyleSheet.absoluteFill} blurRadius={Platform.OS === 'web' ? 2 : 1} />
              <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']} style={StyleSheet.absoluteFill} />

              {/* Floating Gift Animation */}
              {flyingGift && (
                <View style={styles.flyingGiftContainer}>
                  <Text style={{ fontSize: 64 }}>{flyingGift}</Text>
                  <Text style={styles.giftSentText}>Gift Sent to Guru ji!</Text>
                </View>
              )}

              {/* Top Stream Overlay */}
              <View style={styles.streamTopBar}>
                <View style={styles.astrologerBadge}>
                  <Image source={{ uri: selectedAstrologer.avatar }} style={styles.streamAvatar} />
                  <View>
                    <Text style={styles.streamAstroName}>{selectedAstrologer.name}</Text>
                    <Text style={styles.streamTopic}>Vedic Kundli & Live Q&A</Text>
                  </View>
                </View>

                <View style={styles.viewersBadge}>
                  <View style={styles.redDot} />
                  <Text style={styles.viewersText}>👁️ 1.4k watching</Text>
                </View>
              </View>

              {/* Queue Status Banner */}
              {queuePosition !== null ? (
                <View style={styles.queueActiveBox}>
                  <Text style={styles.queueActiveText}>
                    ⏳ You are <Text style={{ fontWeight: '900', color: '#F59E0B' }}>#{queuePosition}</Text> in question queue • Est. Wait: 3 mins
                  </Text>
                </View>
              ) : (
                <Pressable
                  onPress={handleJoinQueue}
                  style={({ pressed }) => [styles.joinQueueBtn, pressed && { opacity: 0.85 }]}
                >
                  <Text style={styles.joinQueueText}>✋ Ask Free Question (Join Queue)</Text>
                </Pressable>
              )}
            </View>

            {/* Live Comments Feed */}
            <View style={styles.chatSection}>
              <ScrollView
                inverted
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.commentsList}
              >
                {comments.map((c) => (
                  <View key={c.id} style={styles.commentRow}>
                    <Image source={{ uri: c.avatar }} style={styles.commentAvatar} />
                    <View style={styles.commentBubble}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.commentAuthor}>{c.name}</Text>
                        {c.gift && (
                          <View style={styles.giftPill}>
                            <Text style={styles.giftPillText}>{c.gift}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.commentBody}>{c.text}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Bottom Input & Gift Button */}
              <View style={styles.inputRow}>
                <TextInput
                  placeholder="Say something to Acharya ji…"
                  placeholderTextColor="#9CA3AF"
                  value={commentInput}
                  onChangeText={setCommentInput}
                  onSubmitEditing={handleSendComment}
                  style={styles.chatInput}
                />

                <Pressable
                  onPress={handleSendComment}
                  style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.75 }]}
                >
                  <Text style={{ fontSize: 16 }}>🚀</Text>
                </Pressable>

                {/* Gift Button */}
                <Pressable
                  onPress={() => setGiftDrawerVisible(true)}
                  style={({ pressed }) => [styles.giftBtn, pressed && { opacity: 0.85 }]}
                >
                  <LinearGradient
                    colors={['#FFC107', '#F59E0B']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={{ fontSize: 20 }}>🎁</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          /* 24/7 Temple Darshan Tab */
          <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 100 }}>
            {TEMPLES.map((temple) => (
              <View key={temple.name} style={styles.templeCard}>
                <Image source={{ uri: temple.image }} style={styles.templeImg} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={StyleSheet.absoluteFill} />

                <View style={styles.templeLiveBadge}>
                  <View style={styles.redDot} />
                  <Text style={styles.templeLiveText}>24/7 LIVE 4K</Text>
                </View>

                <View style={styles.templeDetails}>
                  <Text style={styles.templeTitle}>{temple.icon} {temple.name}</Text>
                  <Text style={styles.templeLoc}>📍 {temple.city}</Text>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <Pressable
                      onPress={() => router.push('/store')}
                      style={styles.prashadBtn}
                    >
                      <Text style={styles.prashadBtnText}>🍯 Book Holy Prashad (₹251)</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Gift Drawer Modal */}
      <Modal visible={giftDrawerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.giftDrawer}>
            <View style={styles.giftDrawerHeader}>
              <Text style={styles.giftDrawerTitle}>Send Sacred Gift to Guru ji</Text>
              <Pressable onPress={() => setGiftDrawerVisible(false)}>
                <Text style={{ fontSize: 16, color: '#6B7280', fontWeight: '900' }}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.giftsGrid}>
              {GIFTS.map((g) => (
                <Pressable
                  key={g.id}
                  onPress={() => handleSendGift(g)}
                  style={({ pressed }) => [styles.giftCard, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
                >
                  <Text style={{ fontSize: 36 }}>{g.icon}</Text>
                  <Text style={styles.giftName}>{g.name}</Text>
                  <View style={styles.giftPricePill}>
                    <Text style={styles.giftPriceText}>₹{g.price}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Instant Recharge Modal */}
      <AstrotalkRechargeModal
        visible={rechargeModalVisible}
        onClose={() => setRechargeModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#F59E0B',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#D97706',
    fontWeight: '900',
  },
  videoStage: {
    height: 230,
    position: 'relative',
    backgroundColor: '#000',
    justifyContent: 'space-between',
    padding: 12,
  },
  flyingGiftContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  giftSentText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  streamTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  astrologerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  streamAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFC107',
  },
  streamAstroName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  streamTopic: {
    color: '#FDE68A',
    fontSize: 9.5,
  },
  viewersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  viewersText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  joinQueueBtn: {
    alignSelf: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  joinQueueText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  queueActiveBox: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  queueActiveText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  chatSection: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  commentsList: {
    gap: 8,
    paddingBottom: 8,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  commentBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  commentAuthor: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F2937',
  },
  giftPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  giftPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#D97706',
  },
  commentBody: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    height: 42,
    fontSize: 13,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  templeCard: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between',
    padding: 14,
  },
  templeImg: {
    ...StyleSheet.absoluteFillObject,
  },
  templeLiveBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  templeLiveText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
  templeDetails: {
    gap: 2,
  },
  templeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  templeLoc: {
    color: '#FDE68A',
    fontSize: 11.5,
  },
  prashadBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  prashadBtnText: {
    color: '#1A1A1A',
    fontSize: 11,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  giftDrawer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  giftDrawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  giftDrawerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  giftsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  giftCard: {
    width: '30%',
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  giftName: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  giftPricePill: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  giftPriceText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
