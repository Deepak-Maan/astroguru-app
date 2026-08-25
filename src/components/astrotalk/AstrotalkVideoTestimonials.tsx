import React, { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { radius, spacing } from '../../theme';

interface Story {
  id: string;
  name: string;
  profession: string;
  avatar: string;
  coverImage: string;
  topic: string;
  quote: string;
  astrologerId: string;
  astrologerName: string;
  verified: boolean;
}

const STORIES: Story[] = [
  {
    id: 's1',
    name: 'Ananya Panday',
    profession: 'Actor & Influencer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    topic: 'Career Breakthrough & Movie Launch',
    quote: 'Acharya Raman ji accurately predicted my major film signing 3 months in advance! Vedic guidance at AstroGuru is truly life changing.',
    astrologerId: 'astro-1',
    astrologerName: 'Acharya Raman',
    verified: true,
  },
  {
    id: 's2',
    name: 'Vikramaditya Roy',
    profession: 'Tech Startup Founder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
    topic: 'Series A Funding Muhurat',
    quote: 'We signed our funding term sheet during the exact Abhijit Muhurat suggested by Guru Tarannum. It was 100% successful!',
    astrologerId: 'astro-2',
    astrologerName: 'Tarannum',
    verified: true,
  },
  {
    id: 's3',
    name: 'Priya & Karan',
    profession: 'Married Couple, Mumbai',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80',
    topic: 'Kundli Match & Manglik Remedy',
    quote: 'We were told we had Manglik dosha. The specific Kumbh Vivah remedy performed resolved our family hesitations immediately.',
    astrologerId: 'astro-3',
    astrologerName: 'Pt. V. Sharma',
    verified: true,
  },
];

export function AstrotalkVideoTestimonials() {
  const router = useRouter();
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  const handleOpenStory = (story: Story) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    setActiveStory(story);
  };

  const handleConsult = () => {
    if (!activeStory) return;
    const astroId = activeStory.astrologerId;
    setActiveStory(null);
    router.push(`/chat/${astroId}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>🎬 Devotee Stories & Video Reviews</Text>
          <Text style={styles.sectionSub}>Trusted by 3 Crore+ Seekers across India</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STORIES.map((story) => (
          <Pressable
            key={story.id}
            onPress={() => handleOpenStory(story)}
            style={({ pressed }) => [styles.storyCard, pressed && { transform: [{ scale: 0.97 }] }]}
          >
            <Image source={{ uri: story.coverImage }} style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.85)']}
              style={StyleSheet.absoluteFill}
            />

            {/* Top Play Badge */}
            <View style={styles.playBadge}>
              <Text style={{ fontSize: 11 }}>▶️ 15s Story</Text>
            </View>

            {/* Bottom Info */}
            <View style={styles.storyBottom}>
              <View style={styles.avatarRow}>
                <Image source={{ uri: story.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{story.name}</Text>
                  <Text style={styles.profession}>{story.profession}</Text>
                </View>
              </View>
              <Text style={styles.topic} numberOfLines={2}>
                "{story.topic}"
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Story Video Popup Modal */}
      <Modal visible={!!activeStory} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {activeStory && (
              <>
                <Image source={{ uri: activeStory.coverImage }} style={StyleSheet.absoluteFill} />
                <LinearGradient
                  colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.92)']}
                  style={StyleSheet.absoluteFill}
                />

                {/* Close Button */}
                <Pressable onPress={() => setActiveStory(null)} style={styles.closeBtn}>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#FFFFFF' }}>✕</Text>
                </Pressable>

                <View style={styles.modalBody}>
                  <View style={styles.modalHeaderRow}>
                    <Image source={{ uri: activeStory.avatar }} style={styles.modalAvatar} />
                    <View>
                      <Text style={styles.modalName}>{activeStory.name}</Text>
                      <Text style={styles.modalProf}>{activeStory.profession}</Text>
                    </View>
                  </View>

                  <View style={styles.quoteBox}>
                    <Text style={styles.quoteMark}>“</Text>
                    <Text style={styles.quoteText}>{activeStory.quote}</Text>
                  </View>

                  {/* Consult CTA */}
                  <Pressable
                    onPress={handleConsult}
                    style={({ pressed }) => [styles.consultBtn, pressed && { opacity: 0.88 }]}
                  >
                    <LinearGradient
                      colors={['#FFC107', '#F59E0B']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.consultBtnText}>
                      Consult {activeStory.astrologerName} Now ➔
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerRow: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  sectionSub: {
    fontSize: 11.5,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  storyCard: {
    width: 140,
    height: 195,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  playBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  storyBottom: {
    gap: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  profession: {
    color: '#FDE68A',
    fontSize: 8.5,
    fontWeight: '600',
  },
  topic: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    height: 480,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between',
    padding: 20,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    gap: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  modalName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  modalProf: {
    color: '#FDE68A',
    fontSize: 12,
  },
  quoteBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 14,
    borderRadius: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  quoteMark: {
    fontSize: 24,
    color: '#FFC107',
    lineHeight: 24,
  },
  quoteText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  consultBtn: {
    height: 46,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  consultBtnText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#1A1A1A',
  },
});
