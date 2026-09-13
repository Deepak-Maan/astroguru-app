import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '../theme';

interface Props {
  uri?: string;
  name: string;
  size?: number;
  online?: boolean;
  showStatus?: boolean;
}

function initials(name: string): string {
  return name
    .replace(/^(Pandit|Acharya|Dr\.|Guru|Shastri|Jyotishi|Jyotish|Sadhika|Tarot)\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export function Avatar({ uri, name, size = 56, online, showStatus = false }: Props) {
  const dot = Math.max(10, size * 0.24);

  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.img, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <LinearGradient
          colors={['#7D3C98', '#E67E22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
            {initials(name)}
          </Text>
        </LinearGradient>
      )}

      {showStatus && (
        <View
          style={[
            styles.dot,
            {
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              backgroundColor: online ? colors.online : colors.offline,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  img: {
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.4)',
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.4)',
    overflow: 'hidden',
  },
  initials: { color: '#FFFFFF', fontWeight: '800' },
  dot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export { radius };
