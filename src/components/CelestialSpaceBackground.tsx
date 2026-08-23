import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as THREE from 'three';
import { colors } from '../theme';
import { seededRandom } from '../utils';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle;
  interactive?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Fixed seed starfield for native/mobile fallback */
function useFallbackStars(count = 45) {
  return useMemo(() => {
    const rnd = seededRandom(20260823);
    return Array.from({ length: count }, (_, i) => ({
      id: `star-${i}`,
      top: `${rnd() * 100}%`,
      left: `${rnd() * 100}%`,
      size: rnd() < 0.2 ? 3.2 : rnd() < 0.5 ? 2.2 : 1.4,
      opacity: 0.2 + rnd() * 0.45,
      color: rnd() < 0.35 ? '#D4AF37' : rnd() < 0.6 ? '#818CF8' : '#F472B6',
    }));
  }, [count]);
}

export function CelestialSpaceBackground({ children, style, interactive = true }: Props) {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const fallbackStars = useFallbackStars();

  // Mobile/Native animation loops
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const twinkleAnim = useRef(new Animated.Value(0)).current;

  // ── Three.js WebGL Interactive 3D Morning Dawn Celestial Engine (Web) ──
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const container = canvasContainerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      58,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5.2;

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
    renderer.domElement.style.zIndex = '0';

    container.appendChild(renderer.domElement);

    // ── 1. 3D Particle Constellation (Golden Stardust & Dawn Lavender) ──
    const starCount = 750;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const goldColor = new THREE.Color(0xd4af37);
    const lavenderColor = new THREE.Color(0x818cf8);
    const roseColor = new THREE.Color(0xf472b6);
    const cyanColor = new THREE.Color(0x38bdf8);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      const radius = 2.8 + Math.random() * 8.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[idx] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[idx + 2] = radius * Math.cos(phi);

      const r = Math.random();
      const col =
        r < 0.35 ? goldColor : r < 0.6 ? lavenderColor : r < 0.8 ? roseColor : cyanColor;

      starColors[idx] = col.r;
      starColors[idx + 1] = col.g;
      starColors[idx + 2] = col.b;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.046,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // ── 2. Rotating Translucent Crystal Celestial Armillary Sphere ──
    const celestialGroup = new THREE.Group();
    celestialGroup.position.set(0, 0, 0);

    // Outer Imperial Brass Zodiac Ring
    const eclipticGeo = new THREE.TorusGeometry(2.35, 0.024, 16, 100);
    const eclipticMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.55,
      wireframe: true,
    });
    const eclipticMesh = new THREE.Mesh(eclipticGeo, eclipticMat);
    eclipticMesh.rotation.x = Math.PI / 3.5;
    celestialGroup.add(eclipticMesh);

    // Inner Sacred 20-sided Crystal Mandala Core
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    celestialGroup.add(coreMesh);

    // Rose Quartz Celestial Meridian Ring
    const meridianGeo = new THREE.TorusGeometry(2.05, 0.014, 16, 80);
    const meridianMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const meridianMesh = new THREE.Mesh(meridianGeo, meridianMat);
    meridianMesh.rotation.y = Math.PI / 3;
    celestialGroup.add(meridianMesh);

    // Center Golden Sun Mandala
    const sunGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xe6ca65,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
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
      if (!interactive) return;
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

      // Smooth inertia damping for cursor parallax
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      camera.position.x = mouseX * 1.3;
      camera.position.y = -mouseY * 1.3;
      camera.lookAt(0, 0, 0);

      // Continuous cosmic rotations
      starField.rotation.y = elapsed * 0.016;
      starField.rotation.x = elapsed * 0.008;

      celestialGroup.rotation.y = elapsed * 0.05;
      celestialGroup.rotation.z = Math.sin(elapsed * 0.2) * 0.1;
      coreMesh.rotation.x = elapsed * 0.035;
      sunMesh.rotation.y = elapsed * 0.08;

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
      meridianGeo.dispose();
      meridianMat.dispose();
      sunGeo.dispose();
      sunMat.dispose();
    };
  }, [interactive]);

  // ── Native Mobile Ambient Loop ──
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 35000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const twinkle = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(twinkleAnim, {
          toValue: 0.3,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    rotate.start();
    twinkle.start();

    return () => {
      pulse.stop();
      rotate.stop();
      twinkle.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const auraScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });

  return (
    <View style={[styles.container, style]}>
      {/* 1. Base Morning Dawn Caustic Gradient */}
      <LinearGradient
        colors={['#FDFBF7', '#F8FAFC', '#F1F5F9', '#EFF6FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Ambient Fluid Caustic Glows */}
      <View style={styles.ambientGlowGold} pointerEvents="none" />
      <View style={styles.ambientGlowLavender} pointerEvents="none" />
      <View style={styles.ambientGlowRose} pointerEvents="none" />

      {/* 3. Three.js WebGL Interactive 3D Canvas (Web) */}
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
            zIndex: 0,
          }}
        />
      )}

      {/* 4. Native Mobile Fallback Elements */}
      {Platform.OS !== 'web' && (
        <>
          <Animated.View
            style={[
              styles.nativeAuraCircle,
              {
                transform: [{ scale: auraScale }, { rotate: spin }],
              },
            ]}
          />
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {fallbackStars.map((star) => (
              <Animated.View
                key={star.id}
                style={[
                  styles.nativeStar,
                  {
                    top: star.top as any,
                    left: star.left as any,
                    width: star.size,
                    height: star.size,
                    borderRadius: star.size / 2,
                    backgroundColor: star.color,
                    opacity: twinkleAnim,
                  },
                ]}
              />
            ))}
          </View>
        </>
      )}

      {/* 5. Foregound Content Layer */}
      <View style={styles.contentLayer}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  contentLayer: {
    flex: 1,
    zIndex: 1,
  },

  /* Atmospheric Caustic Glows */
  ambientGlowGold: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 480,
    height: 480,
    borderRadius: 240,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    filter: 'blur(100px)' as any,
  },
  ambientGlowLavender: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: 'rgba(129, 140, 248, 0.07)',
    filter: 'blur(110px)' as any,
  },
  ambientGlowRose: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(244, 114, 182, 0.06)',
    filter: 'blur(95px)' as any,
  },

  /* Native Mobile Fallback */
  nativeAuraCircle: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: (SCREEN_WIDTH * 0.8) / 2,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    borderStyle: 'dashed',
  },
  nativeStar: {
    position: 'absolute',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 1,
  },
});
