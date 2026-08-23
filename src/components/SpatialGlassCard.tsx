import React, { useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padded?: boolean;
  glow?: boolean;
  elevated?: boolean;
  tilt?: boolean;
  borderGold?: boolean;
}

export function SpatialGlassCard({
  children,
  style,
  onPress,
  padded = true,
  glow = false,
  elevated = false,
  tilt = true,
  borderGold = false,
}: Props) {
  const cardRef = useRef<any>(null);
  const [tiltStyle, setTiltStyle] = useState<any>({});
  const [shinePos, setShinePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: any) => {
    if (!tilt || Platform.OS !== 'web') return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.012, 1.012, 1.012)`,
      transition: 'transform 0.08s ease-out',
    });

    setShinePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.22,
    });
  };

  const handleMouseLeave = () => {
    if (!tilt || Platform.OS !== 'web') return;
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
    });
    setShinePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const content = (
    <View style={[styles.inner, padded && styles.padded]}>
      {children}
    </View>
  );

  const containerStyle = [
    styles.card,
    glow && styles.cardGlow,
    elevated && styles.cardElevated,
    borderGold && styles.cardBorderGold,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        ref={cardRef}
        accessibilityRole="button"
        onPress={onPress}
        onMouseMove={handleMouseMove as any}
        onMouseLeave={handleMouseLeave as any}
        style={({ pressed }) => [
          ...containerStyle,
          tiltStyle as any,
          pressed && styles.pressed,
        ]}
      >
        {/* Realistic top-edge specular glass highlight */}
        <View style={styles.topSpecularEdge} pointerEvents="none" />

        {/* Specular Radial Cursor Highlight on Web */}
        {Platform.OS === 'web' && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 'inherit',
              pointerEvents: 'none',
              background: `radial-gradient(circle at ${shinePos.x}% ${shinePos.y}%, rgba(212, 175, 55, ${shinePos.opacity}), transparent 60%)`,
              transition: 'opacity 0.25s ease',
              zIndex: 1,
            }}
          />
        )}
        {content}
      </Pressable>
    );
  }

  return (
    <View
      ref={cardRef}
      onMouseMove={handleMouseMove as any}
      onMouseLeave={handleMouseLeave as any}
      style={[...containerStyle, tiltStyle as any]}
    >
      {/* Realistic top-edge specular glass highlight */}
      <View style={styles.topSpecularEdge} pointerEvents="none" />

      {Platform.OS === 'web' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            background: `radial-gradient(circle at ${shinePos.x}% ${shinePos.y}%, rgba(212, 175, 55, ${shinePos.opacity}), transparent 60%)`,
            transition: 'opacity 0.25s ease',
            zIndex: 1,
          }}
        />
      )}
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 45,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
    backdropFilter: 'blur(22px) saturate(190%)' as any,
    willChange: 'transform' as any,
    transformStyle: 'preserve-3d' as any,
  },
  topSpecularEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    zIndex: 2,
    boxShadow: 'inset 0 1.5px 2px rgba(255, 255, 255, 1.0)' as any,
  },
  cardBorderGold: {
    borderColor: 'rgba(212, 175, 55, 0.42)',
    borderBottomColor: '#D4AF37',
  },
  cardGlow: {
    borderColor: '#D4AF37',
    borderBottomColor: '#F5D77F',
    shadowColor: 'rgba(212, 175, 55, 0.35)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },
  cardElevated: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.16,
    shadowRadius: 48,
    elevation: 8,
  },
  inner: {
    flex: 1,
    zIndex: 3,
  },
  padded: {
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});
