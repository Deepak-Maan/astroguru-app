/**
 * RashiChakra — the home screen's signature celestial hero.
 *
 * A 3D/2D zodiac band carrying the user's own nine grahas at their
 * computed sidereal longitudes, with the lagna marked by a rising shaft.
 * Features an unbreakable, ultra-resilient fallback system for zero crashes.
 */
import React, { Component, ErrorInfo, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../../theme';
import { Kundli } from '../../types';
import { RASHIS } from '../../data/rashis';
import { NAKSHATRAS } from '../../data/nakshatras';

const HERO_HEIGHT = 195;
const DRAG_SENSITIVITY = 0.006;
const DRIFT = 0.043;

// Dynamically check if GLView is available
let GLViewComponent: any = null;
try {
  const ExpoGL = require('expo-gl');
  GLViewComponent = ExpoGL.GLView;
} catch (_) {
  GLViewComponent = null;
}

interface Props {
  kundli: Kundli | null;
  onPress: () => void;
}

class ChakraErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: any) {
    console.log('[ChakraErrorBoundary Note]', err);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function InnerRashiChakra({ kundli, onPress }: Props) {
  const [failed, setFailed] = useState(!GLViewComponent);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  const handlesRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const glRef = useRef<any>(null);
  const frameRef = useRef<number | null>(null);
  const timelineRef = useRef<any>(null);
  const layoutRef = useRef({ width: 0, height: HERO_HEIGHT });

  const dragRef = useRef(0);
  const dragTargetRef = useRef(0);
  const dragStartRef = useRef(0);
  const driftRef = useRef(0);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => alive && setReduceMotion(v))
      .catch(() => alive && setReduceMotion(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(
    () => () => {
      try {
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        timelineRef.current?.kill?.();
        handlesRef.current?.dispose?.();
        rendererRef.current?.dispose?.();
      } catch (_) {}
      handlesRef.current = null;
      rendererRef.current = null;
      glRef.current = null;
    },
    [],
  );

  const onContextCreate = useCallback(
    (gl: any) => {
      try {
        const THREE = require('three');
        const { gsap } = require('gsap/gsap-core');
        const { createChakra } = require('./chakraScene');

        glRef.current = gl;
        const bw = gl.drawingBufferWidth || 300;
        const bh = gl.drawingBufferHeight || 195;

        const canvas =
          gl.canvas ??
          ({
            width: bw,
            height: bh,
            style: {},
            clientWidth: bw,
            clientHeight: bh,
            addEventListener: () => {},
            removeEventListener: () => {},
            getContext: () => gl,
          } as unknown as HTMLCanvasElement);

        const renderer = new THREE.WebGLRenderer({
          canvas,
          context: gl as unknown as WebGLRenderingContext,
          antialias: true,
          alpha: true,
        });
        renderer.setPixelRatio(1);
        renderer.setSize(bw, bh, false);
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;

        const handles = createChakra(kundli);
        handlesRef.current = handles;

        const ratio = layoutRef.current.width > 0 ? bw / layoutRef.current.width : 1;
        handles.setSize(bw, bh, ratio);

        const reduced = reduceMotion === true;
        if (reduced) {
          handles.starOpacity.value = 1;
          handles.bandReveal.value = 1;
          handles.notchReveal.value = 1;
          handles.tickReveal.value = 1;
          handles.grahaReveal.value = 1;
          handles.beamReveal.value = 1;
        } else {
          const tl = gsap.timeline();
          timelineRef.current = tl;

          tl.to(handles.starOpacity, { value: 1, duration: 1.4, ease: 'power1.out' }, 0)
            .to(handles.bandReveal, { value: 1, duration: 1.55, ease: 'power2.inOut' }, 0.22)
            .to(handles.notchReveal, { value: 1, duration: 0.85, ease: 'power2.out' }, 0.95)
            .to(handles.tickReveal, { value: 1, duration: 1.0, ease: 'power1.out' }, 1.15)
            .to(handles.grahaReveal, { value: 1, duration: 1.5, ease: 'none' }, 1.35)
            .to(handles.beamReveal, { value: 1, duration: 0.95, ease: 'power4.out' }, 2.5);
        }

        const clock = new THREE.Clock();
        const render = () => {
          frameRef.current = requestAnimationFrame(render);
          const h = handlesRef.current;
          const r = rendererRef.current;
          if (!h || !r) return;

          const dt = Math.min(clock.getDelta(), 0.05);
          h.time.value += dt;
          if (!reduced) driftRef.current += dt * DRIFT;

          dragRef.current += (dragTargetRef.current - dragRef.current) * Math.min(dt * 6, 1);
          h.spin.rotation.y = driftRef.current + dragRef.current;

          r.render(h.scene, h.camera);
          gl.endFrameEXP();
        };
        render();
      } catch (err) {
        console.log('[RashiChakra] WebGL init fallback:', err);
        setFailed(true);
      }
    },
    [kundli, reduceMotion],
  );

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    layoutRef.current = { width, height };
    try {
      const gl = glRef.current;
      const h = handlesRef.current;
      const r = rendererRef.current;
      if (gl && h && r) {
        const bw = gl.drawingBufferWidth;
        const bh = gl.drawingBufferHeight;
        r.setSize(bw, bh, false);
        h.setSize(bw, bh, width > 0 ? bw / width : 1);
      }
    } catch (_) {}
  }, []);

  const pan = Gesture.Pan()
    .onStart(() => {
      dragStartRef.current = dragTargetRef.current;
    })
    .onUpdate((e) => {
      dragTargetRef.current = dragStartRef.current - e.translationX * DRAG_SENSITIVITY;
    });

  const tap = Gesture.Tap().onEnd(() => {
    onPress();
  });

  const gesture = Gesture.Exclusive(pan, tap);

  const lagna = kundli ? RASHIS[kundli.lagnaIndex] : null;
  const moon = kundli ? RASHIS[kundli.moonRashiIndex] : null;
  const nakshatra = kundli ? NAKSHATRAS[kundli.moonNakshatraIndex] : null;
  const lagnaDeg = (kundli?.lagnaLongitude ?? 0) % 30;
  const degLabel = `${Math.floor(lagnaDeg)}°${String(Math.floor((lagnaDeg % 1) * 60)).padStart(2, '0')}′`;

  const overlay = (
    <View style={styles.overlay} pointerEvents="none">
      <Text style={styles.eyebrow}>YOUR SKY AT BIRTH</Text>

      {kundli && lagna ? (
        <>
          <Text style={styles.headline}>
            {lagna.sanskrit} <Text style={styles.headlineLight}>rising</Text>
          </Text>
          <Text style={styles.readout}>
            <Text style={styles.degrees}>{degLabel}</Text> · Moon in {moon?.sanskrit} ·{' '}
            {nakshatra?.name} pada {kundli.moonPada}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.headline}>Add your birth details</Text>
          <Text style={styles.readout} numberOfLines={2}>
            The chakra fills with your nine grahas once we know when and where you were born.
          </Text>
        </>
      )}

      <View style={styles.footerRow}>
        <Text style={styles.link}>{kundli ? 'Open kundli →' : 'Start now →'}</Text>
        {kundli && !failed && <Text style={styles.hint}>Drag to turn the 3D sky</Text>}
      </View>
    </View>
  );

  if (failed || !GLViewComponent) {
    return (
      <Pressable onPress={onPress} style={styles.card}>
        <LinearGradient
          colors={['#EEF2F7', '#E6ECF5', '#DFE7F2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Subtle decorative celestial rings */}
        <View style={styles.decorativeRing1} />
        <View style={styles.decorativeRing2} />
        <View style={styles.cosmicStar1} />
        <View style={styles.cosmicStar2} />
        {overlay}
      </Pressable>
    );
  }

  const GLView = GLViewComponent;

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.card} onLayout={onLayout}>
        <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
        <LinearGradient
          colors={['rgba(238,242,247,0.10)', 'rgba(230,236,245,0.75)', '#E6ECF5']}
          locations={[0.20, 0.60, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {overlay}
      </View>
    </GestureDetector>
  );
}

export function RashiChakra(props: Props) {
  const fallback = (
    <Pressable onPress={props.onPress} style={styles.card}>
      <LinearGradient
        colors={['#EEF2F7', '#E6ECF5', '#DFE7F2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.overlay}>
        <Text style={styles.eyebrow}>YOUR SKY AT BIRTH</Text>
        <Text style={styles.headline}>Vedic Celestial Sky</Text>
        <Text style={styles.link}>Open kundli →</Text>
      </View>
    </Pressable>
  );

  return (
    <ChakraErrorBoundary fallback={fallback}>
      <InnerRashiChakra {...props} />
    </ChakraErrorBoundary>
  );
}

const styles = StyleSheet.create({
  card: {
    height: HERO_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#E6ECF5',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(163, 177, 198, 0.4)',
    borderRightColor: 'rgba(163, 177, 198, 0.4)',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 10,
    elevation: 5,
  },
  decorativeRing1: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 119, 6, 0.20)',
  },
  decorativeRing2: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(56, 225, 195, 0.25)',
  },
  cosmicStar1: {
    position: 'absolute',
    right: 80,
    top: 40,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  cosmicStar2: {
    position: 'absolute',
    right: 140,
    top: 80,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#38E1C3',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    gap: 2,
  },
  eyebrow: {
    ...typography.tiny,
    fontSize: 9.5,
    letterSpacing: 2,
    color: colors.gold,
    fontWeight: '800',
  },
  headline: {
    ...typography.display,
    fontSize: 22,
    color: colors.text,
    marginTop: 1,
    fontWeight: '800',
  },
  headlineLight: {
    fontWeight: '500',
    color: colors.textMuted,
  },
  readout: {
    ...typography.small,
    fontSize: 11.5,
    color: colors.textMuted,
    lineHeight: 16,
    fontWeight: '600',
  },
  degrees: {
    color: colors.gold,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  link: { ...typography.small, fontWeight: '800', color: colors.teal, fontSize: 12.5 },
  hint: { ...typography.tiny, fontSize: 9.5, color: colors.textFaint },
});
