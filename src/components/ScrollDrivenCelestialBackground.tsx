import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { colors } from '../theme';
import { seededRandom } from '../utils';

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle;
  interactive?: boolean;
  scrollProgress?: number; // Optional controlled scroll progress (0 to 1)
  enableFloatingGlass?: boolean;
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
      size: rnd() < 0.2 ? 3.2 : rnd() < 0.5 ? 2.2 : 1.4,
      opacity: 0.2 + rnd() * 0.45,
      color: rnd() < 0.35 ? '#D4AF37' : rnd() < 0.6 ? '#818CF8' : '#F472B6',
    }));
  }, [count]);
}

/**
 * 🌌 ScrollDrivenCelestialBackground
 * ----------------------------------------------------
 * High-End 3D Scroll-Driven Celestial Background powered by Three.js WebGL & GSAP ScrollTrigger.
 *
 * ✨ Core Features:
 * 1. 3D Perspective Rotation & Deep Constellation Zoom on Scroll.
 * 2. Multi-phase Aura Transitions: Dawn Gold (Hero) -> Mystic Periwinkle (Birth Chart) -> Rose Quartz (Compatibility).
 * 3. Scrubbed Parallax Floating 3D Crystal Glassmorphism Badges & Sacred Geometry Runes.
 * 4. Micro Stardust Glyph Layers with differential depth physics.
 */
export function ScrollDrivenCelestialBackground({
  children,
  style,
  interactive = true,
  scrollProgress: controlledProgress,
  enableFloatingGlass = true,
}: Props) {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const auraLayerRef = useRef<HTMLDivElement | null>(null);
  const floatingGlassRef = useRef<HTMLDivElement | null>(null);
  const fallbackStars = useFallbackStars();

  // Scroll Progress State for CSS/WebGL Sync
  const scrollProgRef = useRef<{ value: number }>({ value: 0 });
  const [activePhase, setActivePhase] = useState<'dawn' | 'periwinkle' | 'rosequartz'>('dawn');

  // Mobile/Native animation loops
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const twinkleAnim = useRef(new Animated.Value(0)).current;

  // ── Three.js WebGL Engine with GSAP ScrollTrigger Sync ──
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const container = canvasContainerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      56,
      container.clientWidth / (container.clientHeight || window.innerHeight),
      0.1,
      1000
    );
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight || window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.zIndex = '0';

    container.appendChild(renderer.domElement);

    // 2. 3D Particle Constellation (Multi-Spectral Golden Stardust)
    const starCount = 950;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const initialZ = new Float32Array(starCount);

    const goldColor = new THREE.Color(0xd4af37);
    const lavenderColor = new THREE.Color(0x818cf8);
    const roseColor = new THREE.Color(0xf472b6);
    const cyanColor = new THREE.Color(0x38bdf8);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      const radius = 2.5 + Math.random() * 9.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[idx] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[idx + 2] = radius * Math.cos(phi);
      initialZ[i] = starPositions[idx + 2];

      const r = Math.random();
      const col =
        r < 0.38 ? goldColor : r < 0.65 ? lavenderColor : r < 0.85 ? roseColor : cyanColor;

      starColors[idx] = col.r;
      starColors[idx + 1] = col.g;
      starColors[idx + 2] = col.b;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.048,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      blending: THREE.NormalBlending,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 3. Rotating Translucent Crystal Armillary Sphere & Planetary Rings
    const celestialGroup = new THREE.Group();
    celestialGroup.position.set(0, 0, 0);

    // Outer Imperial Brass Zodiac Ring
    const eclipticGeo = new THREE.TorusGeometry(2.4, 0.025, 16, 100);
    const eclipticMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.58,
      wireframe: true,
    });
    const eclipticMesh = new THREE.Mesh(eclipticGeo, eclipticMat);
    eclipticMesh.rotation.x = Math.PI / 3.4;
    celestialGroup.add(eclipticMesh);

    // Inner Sacred 20-sided Crystal Mandala Core
    const coreGeo = new THREE.IcosahedronGeometry(1.65, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.24,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    celestialGroup.add(coreMesh);

    // Rose Quartz Celestial Meridian Ring
    const meridianGeo = new THREE.TorusGeometry(2.1, 0.015, 16, 80);
    const meridianMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.38,
      wireframe: true,
    });
    const meridianMesh = new THREE.Mesh(meridianGeo, meridianMat);
    meridianMesh.rotation.y = Math.PI / 2.8;
    celestialGroup.add(meridianMesh);

    // Cyan Orbit Ring
    const cyanOrbitGeo = new THREE.TorusGeometry(1.85, 0.012, 16, 80);
    const cyanOrbitMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.32,
      wireframe: true,
    });
    const cyanOrbitMesh = new THREE.Mesh(cyanOrbitGeo, cyanOrbitMat);
    cyanOrbitMesh.rotation.z = Math.PI / 4;
    celestialGroup.add(cyanOrbitMesh);

    // Center Golden Sun Mandala
    const sunGeo = new THREE.SphereGeometry(0.38, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xe6ca65,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    celestialGroup.add(sunMesh);

    scene.add(celestialGroup);

    // 4. GSAP ScrollTrigger Integration
    const scrollTarget = {
      progress: 0,
      cameraZ: 5.2,
      cameraRotX: 0,
      cameraRotY: 0,
      cameraRotZ: 0,
      groupScale: 1,
      coreRotX: 0,
      coreRotY: 0,
    };

    let triggerInstance: ScrollTrigger | null = null;

    // Detect scroll container or default to window
    const setupScrollTrigger = () => {
      // Find nearest scrollable parent or window
      const scrollElement =
        document.querySelector('[data-scroll-container]') ||
        document.querySelector('main') ||
        window;

      triggerInstance = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8, // Smooth catch-up delay for fluid 60fps feel
        onUpdate: (self) => {
          const p = self.progress;
          scrollProgRef.current.value = p;

          // Phase transition notification
          if (p < 0.33) {
            setActivePhase('dawn');
          } else if (p < 0.66) {
            setActivePhase('periwinkle');
          } else {
            setActivePhase('rosequartz');
          }

          // GSAP Tween calculations for 3D Camera & Celestial Core
          scrollTarget.progress = p;
          // Zoom from 5.2 down to 3.1
          scrollTarget.cameraZ = 5.2 - p * 2.1;
          // Smooth 3D perspective rotation arc
          scrollTarget.cameraRotX = Math.sin(p * Math.PI) * 0.45;
          scrollTarget.cameraRotY = p * 1.8;
          scrollTarget.cameraRotZ = p * 0.4;
          // Scale celestial core on deep scroll
          scrollTarget.groupScale = 1 + p * 0.45;
        },
      });

      // Parallax animations on Floating Glass Cards
      if (floatingGlassRef.current) {
        const floatCards = floatingGlassRef.current.querySelectorAll('.floating-glass-node');
        floatCards.forEach((card, i) => {
          const speed = parseFloat(card.getAttribute('data-speed') || '1');
          const rotDir = i % 2 === 0 ? 1 : -1;

          gsap.to(card, {
            y: -180 * speed,
            rotationX: 15 * rotDir * speed,
            rotationY: 20 * rotDir * speed,
            rotationZ: 10 * rotDir * speed,
            opacity: gsap.utils.interpolate([0.85, 1, 0.7]),
            scrollTrigger: {
              trigger: document.body,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.2,
            },
          });
        });
      }
      // Universal scroll capture for window and nested React Native ScrollViews
      const onScrollCaptured = (e: Event) => {
        const target = e.target as HTMLElement | Window | Document;
        let p = 0;
        if (target === window || target === document) {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          p = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        } else if (target && (target as HTMLElement).scrollHeight) {
          const el = target as HTMLElement;
          const maxScroll = el.scrollHeight - el.clientHeight;
          p = maxScroll > 0 ? el.scrollTop / maxScroll : 0;
        }
        p = Math.min(Math.max(p, 0), 1);
        scrollTarget.progress = p;
        scrollProgRef.current.value = p;
        if (p < 0.33) setActivePhase('dawn');
        else if (p < 0.66) setActivePhase('periwinkle');
        else setActivePhase('rosequartz');

        ScrollTrigger.update();
      };

      window.addEventListener('scroll', onScrollCaptured, { passive: true, capture: true });
      document.addEventListener('scroll', onScrollCaptured, { passive: true, capture: true });
    };

    setupScrollTrigger();

    // 5. Interactive Cursor Parallax Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetMouseX = x * 1.2;
      targetMouseY = y * 1.2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 6. 60FPS WebGL Render Loop with Damped Inertia
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Mouse parallax damping
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Handle controlled vs trigger progress
      const p = controlledProgress !== undefined ? controlledProgress : scrollTarget.progress;

      // Apply Scroll-Driven Camera Perspective with Mouse Parallax
      camera.position.z = 5.2 - p * 2.1;
      camera.position.x = mouseX * 1.2 + Math.sin(p * Math.PI) * 0.8;
      camera.position.y = -mouseY * 1.2 + (p - 0.5) * 0.6;

      camera.rotation.x = scrollTarget.cameraRotX - mouseY * 0.15;
      camera.rotation.y = scrollTarget.cameraRotY + mouseX * 0.15;
      camera.rotation.z = scrollTarget.cameraRotZ;

      // Celestial Rotations (Base Orbit + Scroll Velocity boost)
      const scrollVelocity = p * 0.08;
      starField.rotation.y = elapsed * 0.016 + p * 0.6;
      starField.rotation.x = elapsed * 0.008 + p * 0.3;

      celestialGroup.scale.setScalar(1 + p * 0.4);
      celestialGroup.rotation.y = elapsed * 0.04 + p * 1.4;
      celestialGroup.rotation.z = Math.sin(elapsed * 0.2) * 0.1 + p * 0.5;

      coreMesh.rotation.x = elapsed * 0.035 + p * 1.1;
      coreMesh.rotation.y = elapsed * 0.02 + p * 0.8;
      sunMesh.rotation.y = elapsed * 0.08 + p * 2.0;
      meridianMesh.rotation.x = elapsed * 0.05 + p * 0.9;
      cyanOrbitMesh.rotation.y = elapsed * 0.06 + p * 1.2;

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
          ScrollTrigger.refresh();
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', onScrollCaptured as any, true);
      document.removeEventListener('scroll', onScrollCaptured as any, true);
      resizeObserver.disconnect();
      if (triggerInstance) triggerInstance.kill();
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
      cyanOrbitGeo.dispose();
      cyanOrbitMat.dispose();
      sunGeo.dispose();
      sunMat.dispose();
    };
  }, [interactive, controlledProgress]);

  // ── Native Mobile Fallback Loop ──
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
      {/* 1. Base Morning Dawn Caustic Canvas */}
      <LinearGradient
        colors={
          activePhase === 'dawn'
            ? ['#FDFBF7', '#F8FAFC', '#F1F5F9', '#EFF6FF']
            : activePhase === 'periwinkle'
            ? ['#F8FAFC', '#EFF6FF', '#EEF2FF', '#FDFBF7']
            : ['#FDFBF7', '#FFF1F2', '#FDF2F8', '#F8FAFC']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Multi-Stop Shiftable Atmospheric Aura Caustics */}
      <div
        ref={auraLayerRef as any}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Dawn Phase Aura (Top/Hero) */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '520px',
            height: '520px',
            borderRadius: '50%',
            backgroundColor: 'rgba(212, 175, 55, 0.12)',
            filter: 'blur(110px)',
            opacity: activePhase === 'dawn' ? 1 : 0.35,
            transition: 'opacity 0.8s ease',
          }}
        />

        {/* Periwinkle & Lavender Phase Aura (Mid/Birth Chart) */}
        <div
          style={{
            position: 'absolute',
            top: '35%',
            left: '-140px',
            width: '580px',
            height: '580px',
            borderRadius: '50%',
            backgroundColor: 'rgba(129, 140, 248, 0.14)',
            filter: 'blur(120px)',
            opacity: activePhase === 'periwinkle' ? 1 : 0.4,
            transition: 'opacity 0.8s ease',
          }}
        />

        {/* Rose Quartz Phase Aura (Bottom/Compatibility) */}
        <div
          style={{
            position: 'absolute',
            bottom: '-160px',
            right: '10%',
            width: '540px',
            height: '540px',
            borderRadius: '50%',
            backgroundColor: 'rgba(244, 114, 182, 0.13)',
            filter: 'blur(115px)',
            opacity: activePhase === 'rosequartz' ? 1 : 0.3,
            transition: 'opacity 0.8s ease',
          }}
        />
      </div>

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

      {/* 4. Floating 3D Glassmorphic Parallax Badges & Sacred Zodiac Nodes */}
      {Platform.OS === 'web' && enableFloatingGlass && (
        <div
          ref={floatingGlassRef as any}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
            perspective: '1000px',
          }}
        >
          {/* Glass Node 1: Floating Lagna Compass (Top Right) */}
          <div
            className="floating-glass-node"
            data-speed="0.85"
            style={{
              position: 'absolute',
              top: '12%',
              right: '6%',
              width: '88px',
              height: '88px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(16px) saturate(180%)',
              border: '1.5px solid rgba(212, 175, 55, 0.35)',
              boxShadow: '0 16px 32px -10px rgba(212, 175, 55, 0.18), inset 0 1px 2px rgba(255,255,255,0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transformStyle: 'preserve-3d',
            }}
          >
            <span style={{ fontSize: '24px' }}>🪐</span>
            <span style={{ fontSize: '9px', fontWeight: '900', color: '#B8902A', letterSpacing: '0.5px' }}>
              LAGNA 1°
            </span>
          </div>

          {/* Glass Node 2: Floating 27-Nakshatra Prism (Mid Left) */}
          <div
            className="floating-glass-node"
            data-speed="1.25"
            style={{
              position: 'absolute',
              top: '48%',
              left: '4%',
              width: '96px',
              height: '96px',
              borderRadius: '28px',
              background: 'rgba(255, 255, 255, 0.70)',
              backdropFilter: 'blur(18px) saturate(180%)',
              border: '1.5px solid rgba(129, 140, 248, 0.35)',
              boxShadow: '0 18px 36px -10px rgba(129, 140, 248, 0.20), inset 0 1px 2px rgba(255,255,255,0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transformStyle: 'preserve-3d',
            }}
          >
            <span style={{ fontSize: '26px' }}>✨</span>
            <span style={{ fontSize: '9px', fontWeight: '900', color: '#6366F1', letterSpacing: '0.5px' }}>
              NAKSHATRA
            </span>
          </div>

          {/* Glass Node 3: Sacred Kundli Diamond (Mid Right) */}
          <div
            className="floating-glass-node"
            data-speed="0.65"
            style={{
              position: 'absolute',
              top: '68%',
              right: '8%',
              width: '84px',
              height: '84px',
              borderRadius: '22px',
              background: 'rgba(255, 255, 255, 0.68)',
              backdropFilter: 'blur(16px) saturate(180%)',
              border: '1.5px solid rgba(244, 114, 182, 0.35)',
              boxShadow: '0 16px 32px -10px rgba(244, 114, 182, 0.18), inset 0 1px 2px rgba(255,255,255,0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transformStyle: 'preserve-3d',
            }}
          >
            <span style={{ fontSize: '24px' }}>💞</span>
            <span style={{ fontSize: '9px', fontWeight: '900', color: '#DB2777', letterSpacing: '0.5px' }}>
              GUN MILAN
            </span>
          </div>

          {/* Glass Node 4: Micro Zodiac Sigils at Floating Depth Layers */}
          <div
            className="floating-glass-node"
            data-speed="1.6"
            style={{
              position: 'absolute',
              top: '28%',
              left: '12%',
              fontSize: '22px',
              opacity: 0.45,
              filter: 'blur(0.5px)',
            }}
          >
            ♈
          </div>
          <div
            className="floating-glass-node"
            data-speed="1.1"
            style={{
              position: 'absolute',
              top: '78%',
              left: '18%',
              fontSize: '24px',
              opacity: 0.4,
              filter: 'blur(0.5px)',
            }}
          >
            ♌
          </div>
          <div
            className="floating-glass-node"
            data-speed="1.4"
            style={{
              position: 'absolute',
              top: '86%',
              right: '22%',
              fontSize: '22px',
              opacity: 0.45,
              filter: 'blur(0.5px)',
            }}
          >
            ♓
          </div>
        </div>
      )}

      {/* 5. Native Mobile Fallback Elements */}
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

      {/* 6. Foreground Content Layer */}
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
