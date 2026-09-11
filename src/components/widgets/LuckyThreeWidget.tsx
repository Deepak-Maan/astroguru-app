import React, { useState } from 'react';
import {
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

interface LuckyInfo {
  number: number;
  planet: string;
  colorName: string;
  colorHex: string;
  colorMeaning: string;
  muhurat: string;
  muhuratName: string;
  direction: string;
}

export function LuckyThreeWidget() {
  // Dynamic daily lucky metrics derived from current date
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);

  const luckyConfigs: LuckyInfo[] = [
    {
      number: 7,
      planet: 'Ketu & Jupiter',
      colorName: 'Imperial Gold',
      colorHex: '#F59E0B',
      colorMeaning: 'Brings wealth & wisdom',
      muhurat: '11:48 AM – 01:15 PM',
      muhuratName: 'Abhijit Muhurat (Most Auspicious)',
      direction: 'North-East (Ishanya)',
    },
    {
      number: 3,
      planet: 'Jupiter (Brihaspati)',
      colorName: 'Saffron Orange',
      colorHex: '#EA580C',
      colorMeaning: 'Enhances focus & divine grace',
      muhurat: '09:15 AM – 10:45 AM',
      muhuratName: 'Amrit Kaal',
      direction: 'East (Purva)',
    },
    {
      number: 9,
      planet: 'Mars (Mangal)',
      colorName: 'Ruby Crimson',
      colorHex: '#DC2626',
      colorMeaning: 'Courage & triumph over obstacles',
      muhurat: '02:30 PM – 03:55 PM',
      muhuratName: 'Vijaya Muhurat',
      direction: 'South (Dakshin)',
    },
    {
      number: 1,
      planet: 'Sun (Surya)',
      colorName: 'Solar Golden',
      colorHex: '#D97706',
      colorMeaning: 'Leadership & vitality',
      muhurat: '07:00 AM – 08:30 AM',
      muhuratName: 'Brahma Muhurat Blessings',
      direction: 'East (Purva)',
    },
    {
      number: 5,
      planet: 'Mercury (Budha)',
      colorName: 'Emerald Green',
      colorHex: '#059669',
      colorMeaning: 'Business growth & sharp intellect',
      muhurat: '04:15 PM – 05:45 PM',
      muhuratName: 'Shubh Choghadiya',
      direction: 'North (Uttar)',
    },
    {
      number: 6,
      planet: 'Venus (Shukra)',
      colorName: 'Diamond Pearl',
      colorHex: '#E2E8F0',
      colorMeaning: 'Love, luxury & harmony',
      muhurat: '06:00 PM – 07:30 PM',
      muhuratName: 'Sandhya Muhurat',
      direction: 'South-East (Agneya)',
    },
  ];

  const info = luckyConfigs[dayOfYear % luckyConfigs.length];

  const handleShare = async () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}

    const text = `🌟 *Today's AstroGuru Cosmic Luck* (${today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}):\n\n` +
      `🔢 *Lucky Number:* ${info.number} (${info.planet})\n` +
      `🎨 *Lucky Color:* ${info.colorName} (${info.colorMeaning})\n` +
      `⏰ *Shubh Muhurat:* ${info.muhurat} (${info.muhuratName})\n` +
      `🧭 *Lucky Direction:* ${info.direction}\n\n` +
      `Check your daily Rashi on AstroGuru App! 👑`;

    if (Platform.OS === 'web') {
      Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`);
    } else {
      try {
        await Share.share({ message: text });
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
        {/* Specular golden top border */}
        <View style={styles.topAuraBar} />

        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.badgeIcon}>✨</Text>
            <View>
              <Text style={styles.title}>Today's Cosmic Luck</Text>
              <Text style={styles.subtitle}>
                {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }]}
          >
            <LinearGradient
              colors={['#D97706', '#B45309']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.shareBtnText}>📲 Share</Text>
          </Pressable>
        </View>

        {/* 3 Metrics Row */}
        <View style={styles.metricsRow}>
          {/* 1. Lucky Number */}
          <View style={styles.metricCol}>
            <View style={styles.numberBubble}>
              <LinearGradient
                colors={['#F59E0B', '#B45309']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.numberVal}>{info.number}</Text>
            </View>
            <Text style={styles.metricLabel}>Lucky Number</Text>
            <Text style={styles.metricSub}>{info.planet}</Text>
          </View>

          <View style={styles.colDivider} />

          {/* 2. Lucky Color */}
          <View style={styles.metricCol}>
            <View style={[styles.colorBubble, { backgroundColor: info.colorHex, borderColor: '#FDE68A' }]} />
            <Text style={styles.metricLabel}>Lucky Color</Text>
            <Text style={styles.metricSub} numberOfLines={1}>{info.colorName}</Text>
          </View>

          <View style={styles.colDivider} />

          {/* 3. Shubh Muhurat */}
          <View style={styles.metricCol}>
            <View style={styles.clockBubble}>
              <Text style={{ fontSize: 16 }}>⏰</Text>
            </View>
            <Text style={styles.metricLabel}>Shubh Muhurat</Text>
            <Text style={styles.metricSub} numberOfLines={1}>{info.muhurat.split('–')[0]?.trim() || '11:48 AM'}</Text>
          </View>
        </View>

        {/* Footer Auspicious Bar */}
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            🌟 <Text style={{ fontWeight: '800', color: '#FCD34D' }}>Shubh Window:</Text> {info.muhurat} • {info.muhuratName}
          </Text>
        </View>
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
    padding: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(217, 119, 6, 0.4)',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  topAuraBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#F59E0B',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeIcon: {
    fontSize: 22,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 1,
  },
  shareBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  shareBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  numberBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 4,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  numberVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  colorBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  clockBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E2E8F0',
    textAlign: 'center',
  },
  metricSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 1,
  },
  colDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerNote: {
    marginTop: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  footerNoteText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
    textAlign: 'center',
  },
});
