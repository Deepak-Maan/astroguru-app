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

    const rotateX = -((y - centerY) / centerY) * 7.5;
    const rotateY = ((x - centerX) / centerX) * 7.5;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`,
      transition: 'transform 0.08s ease-out',
    });

    setShinePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18,
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
              background: `radial-gradient(circle at ${shinePos.x}% ${shinePos.y}%, rgba(212, 175, 55, ${shinePos.opacity}), transparent 65%)`,
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
            background: `radial-gradient(circle at ${shinePos.x}% ${shinePos.y}%, rgba(212, 175, 55, ${shinePos.opacity}), transparent 65%)`,
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
    backgroundColor: 'rgba(18, 20, 42, 0.78)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
    backdropFilter: 'blur(16px)' as any,
    willChange: 'transform' as any,
  },
  cardBorderGold: {
    borderColor: 'rgba(212, 175, 55, 0.28)',
  },
  cardGlow: {
    borderColor: 'rgba(212, 175, 55, 0.45)',
    shadowColor: 'rgba(212, 175, 55, 0.35)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  cardElevated: {
    backgroundColor: 'rgba(26, 26, 58, 0.85)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 10,
  },
  inner: {
    flex: 1,
    zIndex: 2,
  },
  padded: {
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
});
