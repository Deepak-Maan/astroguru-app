import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, StyleProp } from 'react-native';
import { Image, ImageStyle } from 'expo-image';

interface CosmicImageProps {
  source: string | { uri: string };
  style?: StyleProp<ImageStyle>;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  blurhash?: string;
  borderRadius?: number;
  priority?: 'low' | 'normal' | 'high';
  fallbackElement?: React.ReactNode;
}

const DEFAULT_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

export const CosmicImage: React.FC<CosmicImageProps> = ({
  source,
  style,
  contentFit = 'cover',
  blurhash = DEFAULT_BLURHASH,
  borderRadius,
  priority = 'normal',
  fallbackElement,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const uri = typeof source === 'string' ? source : source?.uri;

  if (hasError && fallbackElement) {
    return <>{fallbackElement}</>;
  }

  return (
    <View style={[{ overflow: 'hidden', borderRadius }, style as any]}>
      <Image
        source={uri ? { uri } : undefined}
        placeholder={{ blurhash }}
        contentFit={contentFit}
        transition={250}
        priority={priority}
        cachePolicy="memory-disk"
        style={StyleSheet.absoluteFill}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#FCD34D" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 33, 64, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
