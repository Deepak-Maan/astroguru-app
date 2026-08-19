/**
 * RashiChakra — the home screen's signature celestial hero.
 *
 * A luxury celestial card featuring interactive 3D/2D zodiac mandala,
 * planetary orbs, lagna degree markers, and instant Kundli chart generator.
 */
import React from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../../theme';
import { Kundli } from '../../types';
import { RASHIS } from '../../data/rashis';
import { NAKSHATRAS } from '../../data/nakshatras';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  kundli: Kundli | null;
  onPress: () => void;
}

export function RashiChakra({ kundli, onPress }: Props) {
  const lagna = kundli ? RASHIS[kundli.lagnaIndex] : null;
  const moon = kundli ? RASHIS[kundli.moonRashiIndex] : null;
  const nakshatra = kundli ? NAKSHATRAS[kundli.moonNakshatraIndex] : null;
  const lagnaDeg = (kundli?.lagnaLongitude ?? 0) % 30;
  const degLabel = `${Math.floor(lagnaDeg)}°${String(Math.floor((lagnaDeg % 1) * 60)).padStart(2, '0')}′`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={kundli ? 'Open Kundli Chart' : 'Add Birth Details to generate Kundli'}
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && { opacity: 0.92, transform: [{ scale: 0.985 }] },
      ]}
    >
      {/* Background Gradient & Cosmic Glows */}
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC', '#EFF6FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Right-Side Cosmic Mandala & Orbit Graphic */}
      <View style={styles.mandalaContainer} pointerEvents="none">
        {/* Outer Orbit Rings */}
        <View style={styles.orbitOuter} />
        <View style={styles.orbitMid} />
        <View style={styles.orbitInner} />

        {/* Orbiting Planetary Badges */}
        <View style={[styles.planetOrb, styles.planetSun]}>
          <Text style={styles.planetOrbText}>☀️</Text>
        </View>
        <View style={[styles.planetOrb, styles.planetMoon]}>
          <Text style={styles.planetOrbText}>🌙</Text>
        </View>
        <View style={[styles.planetOrb, styles.planetJupiter]}>
          <Text style={styles.planetOrbText}>🪐</Text>
        </View>
        <View style={[styles.planetOrb, styles.planetMars]}>
          <Text style={styles.planetOrbText}>⚡</Text>
        </View>

        {/* Center Sacred Chakra Centerpiece */}
        <View style={styles.chakraCenter}>
          <LinearGradient
            colors={['#FEF3C7', '#FDE68A']}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.chakraCenterIcon}>{kundli ? '🕉️' : '✨'}</Text>
        </View>

        {/* Glowing Constellation Star Particles */}
        <View style={[styles.starDot, { top: 20, right: 30, backgroundColor: '#F59E0B' }]} />
        <View style={[styles.starDot, { top: 80, right: 15, backgroundColor: '#059669', width: 4, height: 4 }]} />
        <View style={[styles.starDot, { top: 120, right: 80, backgroundColor: '#3B82F6' }]} />
      </View>

      {/* Left-Side Content Details */}
      <View style={styles.contentCol}>
        {/* Top Eyebrow Badge */}
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowBadge}>
            <Text style={styles.eyebrowText}>✨ YOUR SKY AT BIRTH</Text>
          </View>
          {kundli && (
            <View style={styles.liveLagnaBadge}>
              <Text style={styles.liveLagnaText}>LAGNA {degLabel}</Text>
            </View>
          )}
        </View>

        {/* Dynamic Title */}
        {kundli && lagna ? (
          <>
            <Text style={styles.headline}>
              {lagna.sanskrit} <Text style={styles.headlineLight}>({lagna.english})</Text>
            </Text>
            <Text style={styles.subtext}>
              Chandra in {moon?.sanskrit} · {nakshatra?.name} Pada {kundli.moonPada}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.headline}>Add birth details</Text>
            <Text style={styles.subtext} numberOfLines={2}>
              The chakra fills with your 9 Grahas, 12 Bhavas, and exact planetary coordinates.
            </Text>
          </>
        )}

        {/* Feature Highlights Pills */}
        <View style={styles.featuresRow}>
          <View style={styles.featurePill}>
            <Text style={styles.featurePillText}>🪐 9 Grahas</Text>
          </View>
          <View style={styles.featurePill}>
            <Text style={styles.featurePillText}>📊 12 Bhavas</Text>
          </View>
          <View style={styles.featurePill}>
            <Text style={styles.featurePillText}>📜 10-Page PDF</Text>
          </View>
        </View>

        {/* Bottom Call-To-Action Row */}
        <View style={styles.ctaRow}>
          <View style={styles.ctaBtn}>
            <LinearGradient
              colors={['#059669', '#047857']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.ctaBtnText}>
              {kundli ? 'View Full Kundli & Dasha ›' : 'Start Chart Now ›'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 4,
    overflow: 'hidden',
    minHeight: 185,
    justifyContent: 'center',
  },

  /* Right-side Mandala & Planet Orbs Graphic */
  mandalaContainer: {
    position: 'absolute',
    right: -25,
    top: -15,
    width: 210,
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitOuter: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.22)',
    borderStyle: 'dashed',
  },
  orbitMid: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1.5,
    borderColor: 'rgba(5, 150, 105, 0.25)',
  },
  orbitInner: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.30)',
  },

  /* Orbiting Planetary Badges */
  planetOrb: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  planetSun: {
    top: 15,
    right: 70,
    borderColor: '#F59E0B',
  },
  planetMoon: {
    bottom: 30,
    right: 35,
    borderColor: '#3B82F6',
  },
  planetJupiter: {
    top: 90,
    left: 20,
    borderColor: '#D97706',
  },
  planetMars: {
    bottom: 25,
    left: 45,
    borderColor: '#EF4444',
  },
  planetOrbText: {
    fontSize: 14,
  },

  /* Sacred Center Chakra */
  chakraCenter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D97706',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  chakraCenterIcon: {
    fontSize: 22,
  },

  starDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },

  /* Left-side Content Details */
  contentCol: {
    maxWidth: SCREEN_WIDTH * 0.62,
    gap: 4,
    zIndex: 2,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  eyebrowBadge: {
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  eyebrowText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#D97706',
    letterSpacing: 0.6,
  },
  liveLagnaBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
  },
  liveLagnaText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#059669',
  },

  headline: {
    fontSize: 21,
    fontWeight: '900',
    color: '#1E1B4B',
    marginTop: 2,
  },
  headlineLight: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  subtext: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
    fontWeight: '500',
    marginTop: 1,
  },

  /* Feature Highlight Pills */
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  featurePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featurePillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#334155',
  },

  /* Bottom CTA */
  ctaRow: {
    marginTop: 4,
  },
  ctaBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  ctaBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
