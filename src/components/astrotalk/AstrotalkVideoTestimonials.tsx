import React, { useEffect, useState } from 'react';
import {
  Dimensions,
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
  views: string;
  topic: string;
  quote: string;
  astrologerId: string;
  astrologerName: string;
  astrologerAvatar: string;
  astrologerSpecialty: string;
  astrologerRating: string;
  astrologerPrice: number;
  badge?: string;
}

const STORIES: Story[] = [
  {
    id: 's1',
    name: 'Ananya Panday',
    profession: 'Bollywood Actor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80',
    views: '48.2k',
    topic: 'Career Breakthrough & Film Signing',
    quote: 'Acharya Raman ji accurately predicted my major film signing 3 months in advance! Vedic guidance at AstroGuru has truly been my guiding light.',
    astrologerId: 'astro-1',
    astrologerName: 'Acharya Raman',
    astrologerAvatar: 'https://i.pravatar.cc/150?img=11',
    astrologerSpecialty: 'Vedic, Kundli Expert',
    astrologerRating: '4.9',
    astrologerPrice: 25,
    badge: '⭐ CELEBRITY',
  },
  {
    id: 's2',
    name: 'Vikramaditya Roy',
    profession: 'Tech Startup Founder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80',
    views: '32.1k',
    topic: 'Series A Funding Muhurat',
    quote: 'We signed our funding term sheet during the exact Abhijit Muhurat suggested by Guru Tarannum. The term sheet was cleared seamlessly with zero delays!',
    astrologerId: 'astro-2',
    astrologerName: 'Tarannum',
    astrologerAvatar: 'https://i.pravatar.cc/150?img=5',
    astrologerSpecialty: 'Tarot, Career Astrologer',
    astrologerRating: '4.8',
    astrologerPrice: 30,
    badge: '🔥 TRENDING',
  },
  {
    id: 's3',
    name: 'Priya & Karan',
    profession: 'Newlyweds, Mumbai',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=500&q=80',
    views: '54.6k',
    topic: '36 Gun Milan & Manglik Remedy',
    quote: 'We had Manglik dosha apprehensions from both families. Pt. V. Sharma performed the specific Kumbh Vivah puja and we are happily married today!',
    astrologerId: 'astro-3',
    astrologerName: 'Pt. V. Sharma',
    astrologerAvatar: 'https://i.pravatar.cc/150?img=68',
    astrologerSpecialty: 'Kundli Matching, Vastu',
    astrologerRating: '4.9',
    astrologerPrice: 20,
    badge: '💖 MARRIAGE',
  },
  {
    id: 's4',
    name: 'Dr. Meenakshi Iyer',
    profession: 'Cardiac Surgeon, London',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&q=80',
    views: '29.8k',
    topic: 'Medical Licensing Exam & UK Move',
    quote: 'Guru Govind advised me on wearing a natural Yellow Sapphire for my Jupiter Mahadasha. Cleared the FRCS exam on my very first attempt!',
    astrologerId: 'astro-5',
    astrologerName: 'Guru Govind',
    astrologerAvatar: 'https://i.pravatar.cc/150?img=60',
    astrologerSpecialty: 'Lal Kitab, Gemstones',
    astrologerRating: '4.9',
    astrologerPrice: 35,
    badge: '📜 SUCCESS',
  },
];

export function AstrotalkVideoTestimonials() {
  const router = useRouter();
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  // Auto-progress simulation for story modal
  useEffect(() => {
    if (!activeStory) {
      setStoryProgress(0);
      return;
    }

    setStoryProgress(0);
    const interval = setInterval(() => {
      setStoryProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStory]);

  const handleOpenStory = (story: Story) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}
    setActiveStory(story);
  };

  const handleConsultChat = () => {
    if (!activeStory) return;
    const astroId = activeStory.astrologerId;
    setActiveStory(null);
    router.push(`/chat/${astroId}`);
  };

  const handleConsultCall = () => {
    if (!activeStory) return;
    const astroId = activeStory.astrologerId;
    setActiveStory(null);
    router.push(`/call/${astroId}`);
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.titleWithBadge}>
            <Text style={styles.sectionTitle}>🎬 Devotee Stories & Video Reviews</Text>
            <View style={styles.verifiedCountPill}>
              <Text style={styles.verifiedCountText}>3 Crore+ Seekers</Text>
            </View>
          </View>
          <Text style={styles.sectionSub}>Watch real stories of career, marriage & life transformations</Text>
        </View>
      </View>

      {/* Horizontal Reels Scroller */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STORIES.map((story) => (
          <Pressable
            key={story.id}
            onPress={() => handleOpenStory(story)}
            style={({ pressed }) => [
              styles.reelCard,
              pressed && { opacity: 0.94, transform: [{ scale: 0.97 }] },
            ]}
          >
            {/* Background Cover Image */}
            <Image source={{ uri: story.coverImage }} style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.88)']}
              style={StyleSheet.absoluteFill}
            />

            {/* Top Specular Edge */}
            <View style={styles.specularTopEdge} />

            {/* Top Bar: Badge & Views */}
            <View style={styles.reelTopBar}>
              {story.badge ? (
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{story.badge}</Text>
                </View>
              ) : <View />}

              <View style={styles.viewsBadge}>
                <Text style={styles.viewsText}>👁️ {story.views}</Text>
              </View>
            </View>

            {/* Center Floating Play Button */}
            <View style={styles.centerPlay}>
              <View style={styles.playCircle}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </View>

            {/* Bottom Info Overlay */}
            <View style={styles.reelBottom}>
              <View style={styles.avatarRow}>
                <Image source={{ uri: story.avatar }} style={styles.devoteeAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.devoteeName} numberOfLines={1}>{story.name}</Text>
                  <Text style={styles.devoteeProf} numberOfLines={1}>{story.profession}</Text>
                </View>
              </View>

              <Text style={styles.topicText} numberOfLines={2}>
                "{story.topic}"
              </Text>

              {/* Tagged Astrologer Pill */}
              <View style={styles.astroTagPill}>
                <Text style={styles.astroTagText}>
                  ✨ Consulted {story.astrologerName} ({story.astrologerRating}⭐)
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Full-Screen Video Story Viewer Modal */}
      <Modal visible={!!activeStory} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {activeStory && (
              <>
                <Image source={{ uri: activeStory.coverImage }} style={StyleSheet.absoluteFill} />
                <LinearGradient
                  colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.92)']}
                  style={StyleSheet.absoluteFill}
                />

                {/* Top Story Progress Bar */}
                <View style={styles.storyProgressTrack}>
                  <View style={[styles.storyProgressBar, { width: `${storyProgress}%` }]} />
                </View>

                {/* Top Header Controls */}
                <View style={styles.modalTopBar}>
                  <View style={styles.modalDevoteeInfo}>
                    <Image source={{ uri: activeStory.avatar }} style={styles.modalDevoteeAvatar} />
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={styles.modalDevoteeName}>{activeStory.name}</Text>
                        <Text style={{ color: '#60A5FA', fontSize: 12 }}>✓</Text>
                      </View>
                      <Text style={styles.modalDevoteeProf}>{activeStory.profession}</Text>
                    </View>
                  </View>

                  <Pressable onPress={() => setActiveStory(null)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </Pressable>
                </View>

                {/* Center Quote Card */}
                <View style={styles.quoteContainer}>
                  <View style={styles.quoteCard}>
                    <Text style={styles.quoteIcon}>“</Text>
                    <Text style={styles.quoteBody}>{activeStory.quote}</Text>
                    <Text style={styles.topicFooter}>Topic: {activeStory.topic}</Text>
                  </View>
                </View>

                {/* Bottom Astrologer Connect Drawer */}
                <View style={styles.modalAstroDrawer}>
                  <View style={styles.astroInfoRow}>
                    <Image source={{ uri: activeStory.astrologerAvatar }} style={styles.astroAvatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.astroName}>{activeStory.astrologerName}</Text>
                      <Text style={styles.astroSpecialty}>{activeStory.astrologerSpecialty}</Text>
                      <Text style={styles.astroRating}>
                        ⭐ {activeStory.astrologerRating} • ₹{activeStory.astrologerPrice}/min
                      </Text>
                    </View>
                  </View>

                  {/* 2-Action Buttons: Chat & Call */}
                  <View style={styles.drawerActions}>
                    <Pressable
                      onPress={handleConsultChat}
                      style={({ pressed }) => [styles.chatActionBtn, pressed && { opacity: 0.88 }]}
                    >
                      <LinearGradient
                        colors={['#FFC107', '#F59E0B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                      <Text style={styles.chatActionText}>💬 Chat (FREE)</Text>
                    </Pressable>

                    <Pressable
                      onPress={handleConsultCall}
                      style={({ pressed }) => [styles.callActionBtn, pressed && { opacity: 0.88 }]}
                    >
                      <Text style={styles.callActionText}>📞 Call Now</Text>
                    </Pressable>
                  </View>
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
    paddingTop: 18,
    paddingBottom: 8,
  },
  headerRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  verifiedCountPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  verifiedCountText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#B45309',
  },
  sectionSub: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  reelCard: {
    width: 154,
    height: 236,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  specularTopEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 2,
  },
  reelTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 3,
  },
  badgePill: {
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  viewsBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  viewsText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  centerPlay: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)' as any,
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 3,
  },
  reelBottom: {
    gap: 4,
    zIndex: 3,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  devoteeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFC107',
  },
  devoteeName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  devoteeProf: {
    color: '#FDE68A',
    fontSize: 8.5,
    fontWeight: '600',
  },
  topicText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
    lineHeight: 14,
  },
  astroTagPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    marginTop: 2,
  },
  astroTagText: {
    color: '#FDE68A',
    fontSize: 8.5,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    height: 560,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  storyProgressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  storyProgressBar: {
    height: '100%',
    backgroundColor: '#FFC107',
    borderRadius: 2,
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalDevoteeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalDevoteeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  modalDevoteeName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  modalDevoteeProf: {
    color: '#FDE68A',
    fontSize: 11,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  quoteContainer: {
    paddingHorizontal: 6,
  },
  quoteCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    backdropFilter: 'blur(16px)' as any,
    gap: 6,
  },
  quoteIcon: {
    fontSize: 32,
    color: '#FFC107',
    lineHeight: 28,
  },
  quoteBody: {
    color: '#FFFFFF',
    fontSize: 13.5,
    lineHeight: 20,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  topicFooter: {
    color: '#FDE68A',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  modalAstroDrawer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  astroInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  astroAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#FFC107',
  },
  astroName: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  astroSpecialty: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  astroRating: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    marginTop: 1,
  },
  drawerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chatActionBtn: {
    flex: 1.2,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  chatActionText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  callActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#059669',
  },
  callActionText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#059669',
  },
});
