/**
 * RashiChakra — Mystical Spatial Celestial Hero
 *
 * Luxury obsidian glass card featuring glowing celestial zodiac mandala,
 * navagraha planetary orbs, lagna degree markers, and instant Kundli chart launcher.
 */
import React from 'react';
import {
  Dimensions,
  Platform,
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
      {/* Ultra-Clear Crystal Light Gradient */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.92)', 'rgba(255, 255, 255, 0.82)', 'rgba(254, 249, 240, 0.90)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Specular Gold Edge Light */}
      <View style={styles.specularEdge} />

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
            colors={['#D4AF37', '#B8902A', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.chakraCenterIcon}>{kundli ? '🕉️' : '✨'}</Text>
        </View>

        {/* Glowing Constellation Star Particles */}
        <View style={[styles.starDot, { top: 20, right: 30, backgroundColor: '#D4AF37' }]} />
        <View style={[styles.starDot, { top: 80, right: 15, backgroundColor: '#38BDF8', width: 4, height: 4 }]} />
        <View style={[styles.starDot, { top: 120, right: 80, backgroundColor: '#A78BFA' }]} />
      </View>

      {/* Left-Side Content Details */}
      <View style={styles.contentCol}>
        {/* Top Eyebrow Badge */}
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowBadge}>
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.2)', 'rgba(139, 92, 246, 0.15)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
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
              Chandra in <Text style={{ color: colors.goldSoft, fontWeight: '700' }}>{moon?.sanskrit}</Text> · {nakshatra?.name} Pada {kundli.moonPada}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.headline}>Add birth details</Text>
            <Text style={styles.subtext} numberOfLines={2}>
              The celestial chakra reveals your 9 Grahas, 12 Bhavas, and exact planetary coordinates.
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
              colors={['#D4AF37', '#B8902A', '#D97706']}
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
    backgroundColor: 'rgba(18, 20, 42, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
    minHeight: 185,
    justifyContent: 'center',
    position: 'relative',
    backdropFilter: 'blur(16px)' as any,
  },
  specularEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderStyle: 'dashed',
  },
  orbitMid: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  orbitInner: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.35)',
  },

  /* Orbiting Planetary Badges */
  planetOrb: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(18, 20, 42, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1.5,
  },
  planetSun: {
    top: 15,
    right: 70,
    borderColor: '#D4AF37',
  },
  planetMoon: {
    bottom: 30,
    right: 35,
    borderColor: '#38BDF8',
  },
  planetJupiter: {
    top: 90,
    left: 20,
    borderColor: '#A78BFA',
  },
  planetMars: {
    bottom: 25,
    left: 45,
    borderColor: '#F43F5E',
  },
  planetOrbText: {
    fontSize: 14,
  },

  /* Sacred Center Chakra */
  chakraCenter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#F5D77F',
  },
  chakraCenterIcon: {
    fontSize: 22,
  },

  starDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.8,
  },

  /* Content Column */
  contentCol: {
    zIndex: 2,
    maxWidth: '68%',
    gap: 6,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyebrowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    overflow: 'hidden',
  },
  eyebrowText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: colors.goldSoft,
    letterSpacing: 0.8,
  },
  liveLagnaBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  liveLagnaText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },

  headline: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'web' ? 'Cinzel, Georgia, serif' : undefined,
  },
  headlineLight: {
    color: '#B8902A',
    fontWeight: '700',
    fontSize: 16,
  },
  subtext: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
    fontWeight: '500',
  },

  featuresRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  featurePill: {
    backgroundColor: 'rgba(241, 245, 249, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.22)',
  },
  featurePillText: {
    fontSize: 9.5,
    color: '#334155',
    fontWeight: '700',
  },

  ctaRow: {
    marginTop: 6,
  },
  ctaBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.4,
  },
});
