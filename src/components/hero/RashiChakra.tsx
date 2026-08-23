/**
 * RashiChakra — Luxury 3D Crystalline Natal Chart Hero & Insights
 */
import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
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
  const [transitDrawerOpen, setTransitDrawerOpen] = useState(false);
  const [insightDrawerOpen, setInsightDrawerOpen] = useState(false);

  const lagna = kundli ? RASHIS[kundli.lagnaIndex] : null;
  const moon = kundli ? RASHIS[kundli.moonRashiIndex] : null;
  const nakshatra = kundli ? NAKSHATRAS[kundli.moonNakshatraIndex] : null;
  const lagnaDeg = (kundli?.lagnaLongitude ?? 0) % 30;
  const degLabel = `${Math.floor(lagnaDeg)}°${String(Math.floor((lagnaDeg % 1) * 60)).padStart(2, '0')}′`;

  const triggerHaptic = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
  };

  return (
    <View style={styles.cardContainer}>
      {/* Crystalline Glass Background */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.88)', 'rgba(255, 255, 255, 0.72)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Specular Edge Highlight */}
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
            colors={['#D4AF37', '#F5D77F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.chakraCenterIcon}>{kundli ? '🕉️' : '✨'}</Text>
        </View>
      </View>

      {/* Left-Side Content Details */}
      <Pressable onPress={onPress} style={styles.contentCol}>
        {/* Top Eyebrow Badge */}
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowBadge}>
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.18)', 'rgba(253, 230, 138, 0.25)']}
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
              Chandra in <Text style={{ color: '#B8902A', fontWeight: '800' }}>{moon?.sanskrit}</Text> · {nakshatra?.name} Pada {kundli.moonPada}
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

        {/* Primary Chart Launcher Button */}
        <View style={styles.ctaBtn}>
          <LinearGradient
            colors={['#D4AF37', '#F5D77F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.ctaBtnText}>
            {kundli ? 'View Full Kundli & Dasha ›' : 'Start Chart Now ›'}
          </Text>
        </View>
      </Pressable>

      {/* Expandable Accordion Drawers for Transits & Astro Insights */}
      {kundli && (
        <View style={styles.accordionContainer}>
          {/* Drawer 1: Planetary Transits */}
          <Pressable
            onPress={() => {
              triggerHaptic();
              setTransitDrawerOpen(!transitDrawerOpen);
            }}
            style={styles.accordionHeader}
          >
            <Text style={styles.accordionTitle}>🪐 Live Planetary Transits</Text>
            <Text style={styles.accordionArrow}>{transitDrawerOpen ? '▲' : '▼'}</Text>
          </Pressable>
          {transitDrawerOpen && (
            <View style={styles.accordionContent}>
              <Text style={styles.drawerInsightText}>
                • <Text style={{ fontWeight: '800', color: '#B8902A' }}>Jupiter Transit:</Text> Benefic aspect on 5th House (Wisdom & Progeny).
              </Text>
              <Text style={styles.drawerInsightText}>
                • <Text style={{ fontWeight: '800', color: '#B8902A' }}>Saturn Sade Sati:</Text> Neutral phase · No immediate obstacles.
              </Text>
            </View>
          )}

          {/* Drawer 2: Astrological Insights */}
          <Pressable
            onPress={() => {
              triggerHaptic();
              setInsightDrawerOpen(!insightDrawerOpen);
            }}
            style={styles.accordionHeader}
          >
            <Text style={styles.accordionTitle}>✨ Key Astrological Insights</Text>
            <Text style={styles.accordionArrow}>{insightDrawerOpen ? '▲' : '▼'}</Text>
          </Pressable>
          {insightDrawerOpen && (
            <View style={styles.accordionContent}>
              <Text style={styles.drawerInsightText}>
                • <Text style={{ fontWeight: '800', color: '#059669' }}>Favorable Muhurta:</Text> Abhijit Muhurta between 11:45 AM and 12:30 PM.
              </Text>
              <Text style={styles.drawerInsightText}>
                • <Text style={{ fontWeight: '800', color: '#7C3AED' }}>Recommended Sadhana:</Text> Gayatri Mantra chant 108x at sunrise.
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomColor: 'rgba(212, 175, 55, 0.35)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 45,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
    backdropFilter: 'blur(22px) saturate(190%)' as any,
    gap: 12,
  },
  specularEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    boxShadow: 'inset 0 1.5px 2px rgba(255, 255, 255, 1.0)' as any,
  },
  contentCol: {
    gap: 8,
    zIndex: 2,
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
    zIndex: 1,
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  planetOrbText: { fontSize: 13 },
  planetSun: { top: 12, right: 90 },
  planetMoon: { bottom: 25, right: 35 },
  planetJupiter: { top: 85, right: 8 },
  planetMars: { bottom: 50, right: 140 },

  /* Chakra Center */
  chakraCenter: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  chakraCenterIcon: { fontSize: 24 },

  /* Eyebrow Badge */
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyebrowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  eyebrowText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#B8902A',
    letterSpacing: 0.8,
  },
  liveLagnaBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  liveLagnaText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#B45309',
  },

  /* Titles */
  headline: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'web' ? 'Cinzel, Georgia, serif' : undefined,
  },
  headlineLight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  subtext: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
    lineHeight: 16,
    maxWidth: '70%',
  },

  /* Feature Pills */
  featuresRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 2,
  },
  featurePill: {
    backgroundColor: 'rgba(241, 245, 249, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
  },
  featurePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* Primary CTA */
  ctaBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 4,
  },
  ctaBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.2,
  },

  /* Accordion Drawers */
  accordionContainer: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.18)',
    paddingTop: 8,
    gap: 6,
    zIndex: 2,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(241, 245, 249, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
  },
  accordionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  accordionArrow: {
    fontSize: 10,
    color: '#B8902A',
    fontWeight: '800',
  },
  accordionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    gap: 3,
  },
  drawerInsightText: {
    fontSize: 10.5,
    color: '#334155',
    lineHeight: 15,
    fontWeight: '500',
  },
});
