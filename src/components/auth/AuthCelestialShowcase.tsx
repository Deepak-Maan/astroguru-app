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
      55,
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
    const starCount = 800;
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
      size: 0.045,
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
    const eclipticGeo = new THREE.TorusGeometry(2.3, 0.025, 16, 100);
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
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    celestialGroup.add(coreMesh);

    // Cyan Horizon Orbit Ring
    const gyroGeo = new THREE.TorusGeometry(2.0, 0.015, 16, 80);
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
    const sunGeo = new THREE.SphereGeometry(0.35, 32, 32);
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

      // Smooth inertia damping for mouse parallax
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      camera.position.x = mouseX * 1.2;
      camera.position.y = -mouseY * 1.2;
      camera.lookAt(0, 0, 0);

      // Continuous cosmic rotations
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
      {/* Background Gradient & Deep Atmosphere */}
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
          <Text style={styles.brandTagline}>
            Your cosmic blueprint decoded with 9 Grahas, 12 Bhavas, and real-time celestial ephemeris.
          </Text>
        </View>

        {/* Center Space for 3D Armillary Sphere */}
        <View style={styles.centerSphereSpacer} />

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
                <Text style={styles.statHeader}>LIVE ASTRONOMICAL EPHEMERIS</Text>
              </View>
              <Text style={styles.statValue}>
                Moon in Pushya · Abhijit Muhurta Active
              </Text>
              <Text style={styles.statSub}>
                +85% Benefic Jupiterian transit in 11th House
              </Text>
            </View>
          </View>

          {/* Badge 2: Sacred Sanskrit Wisdom Quote */}
          <View style={styles.glassQuoteCard}>
            <View style={styles.quoteMark}>
              <Text style={styles.quoteMarkText}>“</Text>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.sanskritVerse}>
                ॥ यत्पिण्डे तद्ब्रह्माण्डे ॥
              </Text>
              <Text style={styles.quoteTranslation}>
                “As is the microcosm of the human spirit, so is the macrocosm of the celestial universe.”
              </Text>
              <Text style={styles.quoteSource}>
                — Sacred Vedic Upanishads & Surya Siddhanta
              </Text>
            </View>
          </View>

          {/* Badge 3: Real-Time Encryption & Sync Tag */}
          <View style={styles.syncFooter}>
            <View style={styles.syncItem}>
              <Text style={styles.syncIcon}>🛡️</Text>
              <Text style={styles.syncText}>UIDAI Masked & Encrypted</Text>
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
    minHeight: '100%',
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
    top: -80,
    left: -80,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    filter: 'blur(90px)' as any,
  },
  nebulaGlowPurple: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    filter: 'blur(100px)' as any,
  },
  nebulaGlowCyan: {
    position: 'absolute',
    top: '35%',
    left: '25%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(56, 189, 248, 0.10)',
    filter: 'blur(80px)' as any,
  },

  /* Brand Cluster */
  brandCluster: {
    gap: 8,
    maxWidth: 480,
  },
  brandPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    overflow: 'hidden',
  },
  brandPillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#F5D77F',
    letterSpacing: 1,
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'web' ? 'Cinzel, Georgia, serif' : undefined,
  },
  brandTagline: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
    fontWeight: '500',
  },

  /* Center Sphere Spacer */
  centerSphereSpacer: {
    flex: 1,
    minHeight: 120,
  },

  /* Floating Badges Cluster */
  badgesCluster: {
    gap: 12,
    maxWidth: 480,
  },
  glassStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(18, 20, 42, 0.82)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 4,
    backdropFilter: 'blur(16px)' as any,
  },
  statIconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  statHeader: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F5D77F',
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  statSub: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },

  /* Sacred Quote Card */
  glassQuoteCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(26, 26, 58, 0.82)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 4,
    backdropFilter: 'blur(16px)' as any,
  },
  quoteMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteMarkText: {
    fontSize: 20,
    color: '#A78BFA',
    fontWeight: '900',
    lineHeight: 24,
  },
  sanskritVerse: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F5D77F',
    letterSpacing: 0.5,
  },
  quoteTranslation: {
    fontSize: 12,
    color: '#E2E8F0',
    fontStyle: 'italic',
    lineHeight: 18,
    fontWeight: '500',
  },
  quoteSource: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    marginTop: 2,
  },

  /* Sync Footer */
  syncFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 4,
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
    color: '#94A3B8',
    fontWeight: '600',
  },
  syncDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});
