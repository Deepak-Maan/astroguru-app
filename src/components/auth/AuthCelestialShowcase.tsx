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
      size: 0.044,
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
    const eclipticGeo = new THREE.TorusGeometry(2.25, 0.024, 16, 100);
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
    const coreGeo = new THREE.IcosahedronGeometry(1.55, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    celestialGroup.add(coreMesh);

    // Cyan Horizon Orbit Ring
    const gyroGeo = new THREE.TorusGeometry(1.95, 0.014, 16, 80);
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
    const sunGeo = new THREE.SphereGeometry(0.34, 32, 32);
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
        colors={['#FDFBF7', '#F8FAFC', '#F1F5F9', '#EFF6FF']}
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
              <Text style={{ fontSize: 18 }}>🪐</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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
            <View style={{ flex: 1, gap: 2 }}>
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
              <Text style={styles.syncText}>10-Page Kundli Engine</Text>
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
    padding: spacing.xl,
    justifyContent: 'space-between',
    zIndex: 2,
  },

  /* Atmospheric Nebulae */
  nebulaGlowGold: {
    position: 'absolute',
    top: -70,
    left: -70,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    filter: 'blur(85px)' as any,
  },
  nebulaGlowPurple: {
    position: 'absolute',
    bottom: -90,
    right: -90,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(129, 140, 248, 0.08)',
    filter: 'blur(95px)' as any,
  },
  nebulaGlowCyan: {
    position: 'absolute',
    top: '35%',
    left: '25%',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(244, 114, 182, 0.06)',
    filter: 'blur(75px)' as any,
  },

  /* Brand Cluster */
  brandCluster: {
    gap: 8,
    maxWidth: 480,
  },
  brandPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    overflow: 'hidden',
  },
  brandPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B8902A',
    letterSpacing: 0.8,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'web' ? 'Cinzel, Georgia, serif' : undefined,
  },
  brandTagline: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
  },

  /* Floating Badges Cluster */
  badgesCluster: {
    gap: 10,
    maxWidth: 480,
  },
  glassStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.22)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    backdropFilter: 'blur(16px)' as any,
  },
  statIconRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
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
    fontSize: 8.5,
    fontWeight: '900',
    color: '#B8902A',
    letterSpacing: 0.6,
  },
  statValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  statSub: {
    fontSize: 10.5,
    color: '#0284C7',
    fontWeight: '600',
  },

  /* Sacred Quote Card */
  glassQuoteCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.25)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    backdropFilter: 'blur(16px)' as any,
  },
  quoteMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteMarkText: {
    fontSize: 18,
    color: '#6366F1',
    fontWeight: '900',
    lineHeight: 22,
  },
  sanskritVerse: {
    fontSize: 13,
    fontWeight: '900',
    color: '#B8902A',
    letterSpacing: 0.4,
  },
  quoteTranslation: {
    fontSize: 11.5,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 16,
    fontWeight: '500',
  },
  quoteSource: {
    fontSize: 9.5,
    color: '#64748B',
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
    gap: 5,
  },
  syncIcon: {
    fontSize: 12,
  },
  syncText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  syncDivider: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
});
