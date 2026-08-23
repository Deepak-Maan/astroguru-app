import React, { useEffect, useRef } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as THREE from 'three';
import { colors, radius, spacing, typography } from '../../theme';

interface Props {
  style?: ViewStyle;
}

export function AuthCelestialShowcase({ style }: Props) {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // ── Three.js WebGL Interactive 3D Celestial Armillary & Constellation Sphere ──
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const container = canvasContainerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';

    container.appendChild(renderer.domElement);

    // ── 1. 3D Particle Constellation (800 Stars) ──
    const starCount = 750;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const goldColor = new THREE.Color(0xd4af37);
    const cyanColor = new THREE.Color(0x38bdf8);
    const whiteColor = new THREE.Color(0xffffff);
    const lavenderColor = new THREE.Color(0xa78bfa);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      const radius = 2.5 + Math.random() * 8.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[idx] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[idx + 2] = radius * Math.cos(phi);

      const r = Math.random();
      const col =
        r < 0.3 ? goldColor : r < 0.5 ? cyanColor : r < 0.7 ? lavenderColor : whiteColor;

      starColors[idx] = col.r;
      starColors[idx + 1] = col.g;
      starColors[idx + 2] = col.b;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.042,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // ── 2. Rotating 3D Celestial Armillary Sphere & Zodiac Ring ──
    const celestialGroup = new THREE.Group();
    celestialGroup.position.set(0, 0, 0);

    // Outer Brass Ecliptic Ring
    const eclipticGeo = new THREE.TorusGeometry(2.2, 0.022, 16, 100);
    const eclipticMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.75,
      wireframe: true,
    });
    const eclipticMesh = new THREE.Mesh(eclipticGeo, eclipticMat);
    eclipticMesh.rotation.x = Math.PI / 3.5;
    celestialGroup.add(eclipticMesh);

    // Inner Sacred 20-sided Icosahedron Mandala Core
    const coreGeo = new THREE.IcosahedronGeometry(1.5, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    celestialGroup.add(coreMesh);

    // Cyan Horizon Orbit Ring
    const gyroGeo = new THREE.TorusGeometry(1.9, 0.012, 16, 80);
    const gyroMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
    });
    const gyroMesh = new THREE.Mesh(gyroGeo, gyroMat);
    gyroMesh.rotation.y = Math.PI / 3;
    celestialGroup.add(gyroMesh);

    // Center Golden Sun Core
    const sunGeo = new THREE.SphereGeometry(0.32, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xf5d77f,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    celestialGroup.add(sunMesh);

    scene.add(celestialGroup);

    // ── 3. Interactive Cursor Parallax Tracking ──
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 1.2;
      targetY = y * 1.2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ── 4. 60FPS Render Loop ──
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      camera.position.x = mouseX * 1.2;
      camera.position.y = -mouseY * 1.2;
      camera.lookAt(0, 0, 0);

      starField.rotation.y = elapsed * 0.015;
      starField.rotation.x = elapsed * 0.008;

      celestialGroup.rotation.y = elapsed * 0.06;
      celestialGroup.rotation.z = Math.sin(elapsed * 0.2) * 0.12;
      coreMesh.rotation.x = elapsed * 0.04;
      sunMesh.rotation.y = elapsed * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      eclipticGeo.dispose();
      eclipticMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      gyroGeo.dispose();
      gyroMat.dispose();
      sunGeo.dispose();
      sunMat.dispose();
    };
  }, []);

  return (
    <View style={[styles.showcaseContainer, style]}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#07080F', '#0B0D17', '#121428', '#1A1A3A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Atmospheric Nebula Ambient Glows */}
      <View style={styles.nebulaGlowGold} pointerEvents="none" />
      <View style={styles.nebulaGlowPurple} pointerEvents="none" />
      <View style={styles.nebulaGlowCyan} pointerEvents="none" />

      {/* Three.js 3D WebGL Canvas */}
      {Platform.OS === 'web' && (
        <div
          ref={canvasContainerRef as any}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* Foreground Content & Floating Glass Badges */}
      <View style={styles.foregroundLayer}>
        {/* Top Branding Cluster */}
        <View style={styles.brandCluster}>
          <View style={styles.brandPill}>
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.25)', 'rgba(139, 92, 246, 0.15)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.brandPillText}>✨ VEDIC ASTROLOGICAL INTELLIGENCE</Text>
          </View>

          <Text style={styles.brandTitle}>AstroGuru</Text>
          <Text style={styles.brandTagline} numberOfLines={2}>
            Your cosmic blueprint decoded with 9 Grahas, 12 Bhavas, and real-time celestial ephemeris.
          </Text>
        </View>

        {/* Floating Glassmorphic Badges Cluster */}
        <View style={styles.badgesCluster}>
          {/* Badge 1: Live Sky Astronomical Status */}
          <View style={styles.glassStatCard}>
            <View style={styles.statIconRing}>
              <Text style={{ fontSize: 16 }}>🪐</Text>
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={styles.livePulseDot} />
                <Text style={styles.statHeader}>LIVE CELESTIAL EPHEMERIS</Text>
              </View>
              <Text style={styles.statValue} numberOfLines={1}>
                Moon in Pushya · Abhijit Muhurta Active
              </Text>
              <Text style={styles.statSub} numberOfLines={1}>
                +85% Benefic Jupiterian transit in 11th House
              </Text>
            </View>
          </View>

          {/* Badge 2: Sacred Sanskrit Wisdom Quote */}
          <View style={styles.glassQuoteCard}>
            <View style={styles.quoteMark}>
              <Text style={styles.quoteMarkText}>“</Text>
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={styles.sanskritVerse}>॥ यत्पिण्डे तद्ब्रह्माण्डे ॥</Text>
              <Text style={styles.quoteTranslation} numberOfLines={2}>
                “As is the microcosm of the human spirit, so is the macrocosm of the universe.”
              </Text>
              <Text style={styles.quoteSource}>— Sacred Vedic Upanishads</Text>
            </View>
          </View>

          {/* Badge 3: Real-Time Encryption & Sync Tag */}
          <View style={styles.syncFooter}>
            <View style={styles.syncItem}>
              <Text style={styles.syncIcon}>🛡️</Text>
              <Text style={styles.syncText}>UIDAI Masked</Text>
            </View>
            <View style={styles.syncDivider} />
            <View style={styles.syncItem}>
              <Text style={styles.syncIcon}>⚡</Text>
              <Text style={styles.syncText}>500+ Verified Acharyas</Text>
            </View>
            <View style={styles.syncDivider} />
            <View style={styles.syncItem}>
              <Text style={styles.syncIcon}>📜</Text>
              <Text style={styles.syncText}>10-Page Kundli</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  showcaseContainer: {
    flex: 1,
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  foregroundLayer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
    zIndex: 2,
  },

  /* Atmospheric Nebulae */
  nebulaGlowGold: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    filter: 'blur(80px)' as any,
  },
  nebulaGlowPurple: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    filter: 'blur(90px)' as any,
  },
  nebulaGlowCyan: {
    position: 'absolute',
    top: '35%',
    left: '25%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(56, 189, 248, 0.10)',
    filter: 'blur(70px)' as any,
  },

  /* Brand Cluster */
  brandCluster: {
    gap: 6,
    maxWidth: 440,
  },
  brandPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    overflow: 'hidden',
  },
  brandPillText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#F5D77F',
    letterSpacing: 0.8,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'web' ? 'Cinzel, Georgia, serif' : undefined,
  },
  brandTagline: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 18,
    fontWeight: '500',
  },

  /* Floating Badges Cluster */
  badgesCluster: {
    gap: 8,
    maxWidth: 440,
  },
  glassStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(18, 20, 42, 0.82)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 3,
    backdropFilter: 'blur(16px)' as any,
  },
  statIconRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statHeader: {
    fontSize: 8,
    fontWeight: '900',
    color: '#F5D77F',
    letterSpacing: 0.6,
  },
  statValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  statSub: {
    fontSize: 10,
    color: '#38BDF8',
    fontWeight: '600',
  },

  /* Sacred Quote Card */
  glassQuoteCard: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(26, 26, 58, 0.82)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 3,
    backdropFilter: 'blur(16px)' as any,
  },
  quoteMark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteMarkText: {
    fontSize: 16,
    color: '#A78BFA',
    fontWeight: '900',
    lineHeight: 20,
  },
  sanskritVerse: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F5D77F',
    letterSpacing: 0.4,
  },
  quoteTranslation: {
    fontSize: 10.5,
    color: '#E2E8F0',
    fontStyle: 'italic',
    lineHeight: 15,
    fontWeight: '500',
  },
  quoteSource: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
  },

  /* Sync Footer */
  syncFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingTop: 2,
  },
  syncItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncIcon: {
    fontSize: 11,
  },
  syncText: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  syncDivider: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});
