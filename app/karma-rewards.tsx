import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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

interface Task {
  id: string;
  title: string;
  subtitle: string;
  rewardCoins: number;
  completed: boolean;
  route?: string;
}

const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Read Daily Horoscope', subtitle: 'Check your Moon Sign forecast for today', rewardCoins: 15, completed: true, route: '/(tabs)/horoscope' },
  { id: 't2', title: '108 Gayatri Mantra Japa', subtitle: 'Perform 1 round on the 108 digital Mala', rewardCoins: 25, completed: false, route: '/japa' },
  { id: 't3', title: 'Check Today’s Shubh Muhurat', subtitle: 'Avoid Rahu Kaal and plan auspicious work', rewardCoins: 15, completed: false, route: '/panchang' },
  { id: 't4', title: 'Light Virtual Akhand Diya', subtitle: 'Offer evening lamp prayers in Live Darshan', rewardCoins: 20, completed: false, route: '/live-darshan' },
  { id: 't5', title: 'Daily 3-Card Tarot Flip', subtitle: 'Receive cosmic guidance for career & love', rewardCoins: 25, completed: false, route: '/tarot' },
];

export default function KarmaRewardsScreen() {
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance ?? 100);
  const topup = useWalletStore((s) => s.topup);

  const [karmaCoins, setKarmaCoins] = useState(140);
  const [streakDays, setStreakDays] = useState(5);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [rewardToast, setRewardToast] = useState<string | null>(null);
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);

  const handleCompleteTask = (task: Task) => {
    if (task.completed) {
      if (task.route) router.push(task.route as any);
      return;
    }

    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (_) {}

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: true } : t))
    );
    setKarmaCoins((c) => c + task.rewardCoins);

    setRewardToast(`+${task.rewardCoins} Karma Coins Earned! 🌟`);
    setTimeout(() => setRewardToast(null), 3000);

    if (task.route) {
      router.push(task.route as any);
    }
  };

  const handleConvertCoins = () => {
    if (karmaCoins < 100) {
      alert('You need at least 100 Karma Coins to convert into ₹10 AstroGuru Wallet Cash!');
      return;
    }

    const rupeesToAdd = 10;
    setKarmaCoins((c) => c - 100);
    topup(rupeesToAdd, 'Karma Coins Conversion (100 Coins = ₹10)');

    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (_) {}

    setRewardToast(`🎉 ₹10 Cash Added to AstroGuru Wallet!`);
    setTimeout(() => setRewardToast(null), 3500);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <AstrotalkHeader onOpenRecharge={() => setRechargeModalVisible(true)} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header Banner */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={['#78350F', '#B45309', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streakDays}-DAY KARMA STREAK</Text>
            </View>

            <View style={styles.heroRow}>
              <View>
                <Text style={styles.coinsTitle}>Your Karma Balance</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Text style={styles.coinsAmount}>{karmaCoins}</Text>
                  <Text style={styles.coinsUnit}>Coins</Text>
                </View>
                <Text style={styles.coinsRate}>100 Karma Coins = ₹10 Real Wallet Cash</Text>
              </View>

              <Pressable
                onPress={handleConvertCoins}
                style={({ pressed }) => [styles.convertBtn, pressed && { opacity: 0.85 }]}
              >
                <LinearGradient
                  colors={['#FFC107', '#F59E0B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.convertBtnText}>Convert to ₹ Cash ➔</Text>
              </Pressable>
            </View>
          </View>

          {/* Toast */}
          {!!rewardToast && (
            <View style={styles.toastBox}>
              <Text style={styles.toastText}>{rewardToast}</Text>
            </View>
          )}

          {/* Daily Tasks List */}
          <View style={styles.tasksSection}>
            <Text style={styles.tasksHeading}>✨ Today's Spiritual Tasks & Quests</Text>
            <Text style={styles.tasksSub}>Complete daily spiritual rituals to earn free coins</Text>

            <View style={{ gap: 10, marginTop: 8 }}>
              {tasks.map((task) => (
                <View key={task.id} style={styles.taskCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskSub}>{task.subtitle}</Text>
                    <View style={styles.rewardPill}>
                      <Text style={styles.rewardText}>🪙 +{task.rewardCoins} Coins</Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => handleCompleteTask(task)}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      task.completed ? styles.actionBtnDone : styles.actionBtnActive,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={[styles.actionBtnText, task.completed && { color: '#059669' }]}>
                      {task.completed ? 'Claimed ✓' : 'Start ➔'}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

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
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 100,
  },
  heroCard: {
    borderRadius: 22,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    gap: 12,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  streakBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  streakText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coinsTitle: {
    color: '#FEF3C7',
    fontSize: 12,
    fontWeight: '700',
  },
  coinsAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  coinsUnit: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FDE68A',
  },
  coinsRate: {
    fontSize: 10,
    color: '#FEF3C7',
    fontWeight: '600',
    marginTop: 2,
  },
  convertBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.pill,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  convertBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  toastBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.2,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
  },
  toastText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#065F46',
  },
  tasksSection: {
    gap: 3,
  },
  tasksHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  tasksSub: {
    fontSize: 11.5,
    color: '#6B7280',
    fontWeight: '600',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  taskSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  rewardPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  rewardText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#D97706',
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  actionBtnActive: {
    backgroundColor: '#FFC107',
  },
  actionBtnDone: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#1A1A1A',
  },
});
