/**
 * RashiChakra — the home screen's signature 3D hero.
 *
 * A three-dimensional zodiac band carrying the user's own nine grahas at their
 * computed sidereal longitudes, with the lagna marked by a rising shaft.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { gsap } from 'gsap/gsap-core';
import * as THREE from 'three';
import { colors, radius, spacing, typography } from '../../theme';
import { Kundli } from '../../types';
import { RASHIS } from '../../data/rashis';
import { NAKSHATRAS } from '../../data/nakshatras';
import { ChakraHandles, createChakra } from './chakraScene';

const HERO_HEIGHT = 304;
/** Radians of spin per point dragged. */
const DRAG_SENSITIVITY = 0.006;
/** Ambient drift, radians per second. */
const DRIFT = 0.043;

interface Props {
  kundli: Kundli | null;
  onPress: () => void;
}

export function RashiChakra({ kundli, onPress }: Props) {
  const [failed, setFailed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  const handlesRef = useRef<ChakraHandles | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const glRef = useRef<ExpoWebGLRenderingContext | null>(null);
  const frameRef = useRef<number | null>(null);
  const timelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(null);
  const layoutRef = useRef({ width: 0, height: HERO_HEIGHT });

  /** Live drag offset, and the value we ease toward. */
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

  /** Tear everything down — GL contexts are not garbage collected for us. */
  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      timelineRef.current?.kill();
      handlesRef.current?.dispose();
      rendererRef.current?.dispose();
      handlesRef.current = null;
      rendererRef.current = null;
      glRef.current = null;
    },
    [],
  );

  const onContextCreate = useCallback(
    (gl: ExpoWebGLRenderingContext) => {
      try {
        glRef.current = gl;
        const bw = gl.drawingBufferWidth;
        const bh = gl.drawingBufferHeight;

        const canvas =
          (gl as unknown as { canvas?: HTMLCanvasElement }).canvas ??
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

        /* -- The entrance ------------------------------------------------- */
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

        /* -- Render loop ---------------------------------------------------- */
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
        console.warn('[RashiChakra] WebGL unavailable, falling back:', err);
        setFailed(true);
      }
    },
    [kundli, reduceMotion],
  );

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    layoutRef.current = { width, height };
    const gl = glRef.current;
    const h = handlesRef.current;
    const r = rendererRef.current;
    if (gl && h && r) {
      const bw = gl.drawingBufferWidth;
      const bh = gl.drawingBufferHeight;
      r.setSize(bw, bh, false);
      h.setSize(bw, bh, width > 0 ? bw / width : 1);
    }
  }, []);

  /* -- Gestures ------------------------------------------------------------ */
  const pan = Gesture.Pan()
    .onStart(() => {
      dragStartRef.current = dragTargetRef.current;
    })
    .onUpdate((e) => {
      dragTargetRef.current = dragStartRef.current + e.translationX * DRAG_SENSITIVITY;
    })
    .onEnd((e) => {
      dragTargetRef.current += e.velocityX * DRAG_SENSITIVITY * 0.22;
    })
    .runOnJS(true);

  const tap = Gesture.Tap().maxDistance(12).onEnd(onPress).runOnJS(true);
  const gesture = Gesture.Race(pan, tap);

  /* -- Copy ---------------------------------------------------------------- */
  const lagna = kundli ? RASHIS[kundli.lagnaIndex] : null;
  const moon = kundli ? RASHIS[kundli.moonRashiIndex] : null;
  const nakshatra = kundli ? NAKSHATRAS[kundli.moonNakshatraIndex] : null;

  const lagnaDeg = kundli ? kundli.lagnaLongitude % 30 : 0;
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
          <Text style={styles.readout}>
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

  if (failed) {
    return (
      <Pressable onPress={onPress}>
        <LinearGradient
          colors={['#FFFFFF', '#F4F6FB']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[styles.card, styles.fallback]}
        >
          {overlay}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.card} onLayout={onLayout}>
        <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
        {/* Soft light gradient overlay */}
        <LinearGradient
          colors={['rgba(244,246,251,0.05)', 'rgba(244,246,251,0.65)', '#FFFFFF']}
          locations={[0.25, 0.65, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {overlay}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    height: HERO_HEIGHT,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: '#150A33',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    shadowColor: 'rgba(160,175,205,0.35)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 6,
  },
  fallback: { justifyContent: 'flex-end', backgroundColor: '#FFFFFF' },

  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    gap: 3,
  },
  eyebrow: {
    ...typography.tiny,
    fontSize: 10,
    letterSpacing: 3,
    color: colors.saffron,
    fontWeight: '800',
  },
  headline: {
    ...typography.display,
    fontSize: 30,
    color: colors.text,
    marginTop: 2,
    fontWeight: '800',
  },
  headlineLight: {
    fontWeight: '400',
    color: colors.textMuted,
  },
  readout: {
    ...typography.small,
    fontSize: 12.5,
    color: colors.textMuted,
    lineHeight: 18,
    fontWeight: '600',
  },
  degrees: {
    color: colors.saffron,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  link: { ...typography.small, fontWeight: '800', color: colors.auroraA },
  hint: { ...typography.tiny, fontSize: 10, color: colors.textFaint },
});
