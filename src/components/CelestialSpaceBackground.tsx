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
function useFallbackStars(count = 50) {
  return useMemo(() => {
    const rnd = seededRandom(20260823);
    return Array.from({ length: count }, (_, i) => ({
      id: `star-${i}`,
      top: `${rnd() * 100}%`,
      left: `${rnd() * 100}%`,
      size: rnd() < 0.2 ? 3.5 : rnd() < 0.5 ? 2.5 : 1.5,
      opacity: 0.25 + rnd() * 0.65,
      color: rnd() < 0.3 ? colors.goldSoft : rnd() < 0.5 ? colors.cyan : '#FFFFFF',
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

  // ── Three.js WebGL Interactive 3D Starfield & Celestial Sphere (Web) ──
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const container = canvasContainerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
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
    renderer.domElement.style.zIndex = '0';

    container.appendChild(renderer.domElement);

    // ── 1. 3D Particle Constellation Starfield (800 Stars) ──
    const starCount = 750;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const goldColor = new THREE.Color(0xd4af37);
    const cyanColor = new THREE.Color(0x38bdf8);
    const whiteColor = new THREE.Color(0xffffff);
    const lavenderColor = new THREE.Color(0xa78bfa);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      // Spherical distribution around user
      const radius = 3 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[idx] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[idx + 2] = radius * Math.cos(phi);

      // Color variation (Gold, Cyan, Lavender, White)
      const r = Math.random();
      const col =
        r < 0.25 ? goldColor : r < 0.45 ? cyanColor : r < 0.65 ? lavenderColor : whiteColor;

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

    // ── 2. Rotating 3D Celestial Wireframe Zodiac Sphere ──
    const celestialGroup = new THREE.Group();
    celestialGroup.position.set(0, -0.5, -2);

    // Outer Brass Ecliptic Ring
    const ringGeo = new THREE.TorusGeometry(3.2, 0.018, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    celestialGroup.add(ringMesh);

    // Inner Sacred Celestial Armillary Sphere
    const sphereGeo = new THREE.IcosahedronGeometry(2.4, 2);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    celestialGroup.add(sphereMesh);

    // Secondary Gyro Ring
    const gyroGeo = new THREE.TorusGeometry(2.8, 0.012, 16, 80);
    const gyroMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
    });
    const gyroMesh = new THREE.Mesh(gyroGeo, gyroMat);
    gyroMesh.rotation.y = Math.PI / 4;
    celestialGroup.add(gyroMesh);

    scene.add(celestialGroup);

    // ── 3. Interactive Mouse Parallax Tracking ──
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 0.8;
      targetY = y * 0.8;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ── 4. 60FPS Render Loop ──
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth inertia damping for mouse parallax
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      camera.position.x = mouseX * 1.5;
      camera.position.y = -mouseY * 1.5;
      camera.lookAt(0, 0, 0);

      // Continuous cosmic rotations
      starField.rotation.y = elapsed * 0.018;
      starField.rotation.x = elapsed * 0.008;

      celestialGroup.rotation.y = elapsed * 0.04;
      celestialGroup.rotation.z = Math.sin(elapsed * 0.15) * 0.1;
      sphereMesh.rotation.x = elapsed * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // ── 5. Resize Observer ──
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

    // Cleanup
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
      ringGeo.dispose();
      ringMat.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      gyroGeo.dispose();
      gyroMat.dispose();
    };
  }, [interactive]);

  // Native/Mobile Animations
  useEffect(() => {
    if (Platform.OS === 'web') return;

    Animated.loop(
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
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(twinkleAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 40000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={[styles.root, style]}>
      {/* Deep Obsidian Midnight Base Gradient */}
      <LinearGradient
        colors={[colors.bg, colors.bgElevated, colors.gradientBottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Atmospheric Nebula Glows */}
      <View style={styles.nebulaGlowTop} pointerEvents="none" />
      <View style={styles.nebulaGlowBottom} pointerEvents="none" />
      <View style={styles.nebulaGlowCyan} pointerEvents="none" />

      {/* WebGL 3D Canvas Mount Point (Web) */}
      {Platform.OS === 'web' ? (
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
      ) : (
        /* Native Fallback Starfield */
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {fallbackStars.map((s) => (
            <Animated.View
              key={s.id}
              style={[
                styles.star,
                {
                  top: s.top as any,
                  left: s.left as any,
                  width: s.size,
                  height: s.size,
                  borderRadius: s.size / 2,
                  backgroundColor: s.color,
                  opacity: s.opacity,
                  transform: [
                    {
                      scale: twinkleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.85, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* Screen Foreground Content */}
      <View style={styles.contentContainer}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
  },
  nebulaGlowTop: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    filter: 'blur(80px)' as any,
  },
  nebulaGlowBottom: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    filter: 'blur(90px)' as any,
  },
  nebulaGlowCyan: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    filter: 'blur(70px)' as any,
  },
  star: {
    position: 'absolute',
  },
});
