import React, { useState } from 'react';
import {
  Clipboard,
  Linking,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/authStore';

export function ReferralCard() {
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);

  // Generate unique referral code based on user phone or id
  const referralCode = `GURU${(user?.phone || user?.id || 'VIP').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()}`;

  const shareText = `🌟 Namaste! Join me on *AstroGuru* — India's Most Trusted Vedic Astrology App! 👑\n\n` +
    `🎁 Use my referral code *${referralCode}* to get *₹50 FREE Wallet Balance* on signup for your first Call/Chat with verified Acharyas!\n\n` +
    `📲 Download AstroGuru App now: https://expo.dev/artifacts/eas/hzQ4s-kBQ2MUA_GVtD_FcJqMlJk4lmZXrN5nYB1QdnA.apk`;

  const handleCopyCode = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}

    Clipboard.setString(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsAppShare = async () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (_) {}

    if (Platform.OS === 'web') {
      Linking.openURL(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
    } else {
      try {
        await Share.share({ message: shareText });
      } catch (_) {}
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E1B4B', '#0F172A', '#1E293B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.topRow}>
          <View style={styles.giftBadge}>
            <Text style={styles.giftBadgeText}>🎁 REFER & EARN ₹50</Text>
          </View>
          <Text style={styles.subTag}>Instant Wallet Credits</Text>
        </View>

        <Text style={styles.title}>Give ₹50, Get ₹50 Free!</Text>
        <Text style={styles.subtitle}>
          Invite friends & family to AstroGuru. When they sign up with your code, you both receive ₹50 wallet credits!
        </Text>

        {/* Code Box */}
        <View style={styles.codeRow}>
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>YOUR REFERRAL CODE:</Text>
            <Text style={styles.codeValue}>{referralCode}</Text>
          </View>

          <Pressable
            onPress={handleCopyCode}
            style={({ pressed }) => [styles.copyBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.copyBtnText}>{copied ? 'Copied! ✅' : 'Copy 📋'}</Text>
          </Pressable>
        </View>

        {/* WhatsApp Share Button */}
        <Pressable
          onPress={handleWhatsAppShare}
          style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
        >
          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.shareBtnText}>💬 Share on WhatsApp</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  giftBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  giftBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FCD34D',
    letterSpacing: 0.4,
  },
  subTag: {
    fontSize: 11,
    color: '#34D399',
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  codeBox: {
    flex: 1,
    paddingLeft: 4,
  },
  codeLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '800',
  },
  codeValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FCD34D',
    letterSpacing: 1,
    marginTop: 1,
  },
  copyBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FCD34D',
  },
  shareBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
