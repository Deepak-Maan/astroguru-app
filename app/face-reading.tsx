import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';

export default function FaceReadingScreen() {
  const router = useRouter();

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [laserPos, setLaserPos] = useState(0);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [report, setReport] = useState<any | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Real Device Camera Stream
  const openDeviceCamera = async () => {
    setCameraError(null);
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } catch (err: any) {
        setCameraError('Camera access denied. Please allow camera permissions.');
      }
    } else {
      setCameraActive(true);
    }
  };

  const stopDeviceCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    openDeviceCamera();
    return () => {
      stopDeviceCamera();
    };
  }, []);

  // Running Laser Line Scanner
  useEffect(() => {
    let interval: any;
    if (scanning) {
      let step = 0;
      let pos = 0;
      let direction = 1;

      interval = setInterval(() => {
        pos += direction * 6;
        if (pos >= 90) direction = -1;
        if (pos <= 10) direction = 1;
        setLaserPos(pos);

        step += 3;
        setScanProgress(Math.min(step, 100));

        if (step >= 100) {
          clearInterval(interval);
          setScanning(false);
          setReport({
            forehead: 'Broad & High Forehead — Indicates exceptional strategic intelligence & leadership capabilities.',
            eyes: 'Bright Deep Eyes — Shows high emotional intuition and strong artistic vision.',
            chin: 'Square Defined Jawline — Signifies unshakeable determination, perseverance, and financial resilience.',
            destinyAge: 'Peak fortune & major career rise predicted between ages 28–34.',
          });
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [scanning]);

  const handleStartScan = () => {
    setScanning(true);
    setReport(null);

    // Capture camera snapshot
    if (videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 400;
        canvas.height = videoRef.current.videoHeight || 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          setCapturedSnapshot(canvas.toDataURL('image/png'));
        }
      } catch (e) {}
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="🤖 Samudrika AI Face Reader" showBack />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Camera Viewfinder */}
          <Card style={{ gap: spacing.md, alignItems: 'center' }}>
            <View style={styles.scannerFrame}>
              {Platform.OS === 'web' ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: capturedSnapshot ? 'none' : 'block',
                  }}
                />
              ) : null}

              {capturedSnapshot && (
                <Image source={{ uri: capturedSnapshot }} style={styles.faceSnapshot} />
              )}

              {/* Laser beam */}
              {scanning && (
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  <View style={[styles.laserBar, { top: `${laserPos}%` }]}>
                    <LinearGradient
                      colors={['transparent', '#0D9488', 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.laserBeam}
                    />
                  </View>
                </View>
              )}

              {/* Oval Face Alignment Overlay */}
              <View style={styles.faceOvalOverlay} pointerEvents="none" />
            </View>

            {!!cameraError && <Text style={styles.cameraErrorText}>⚠️ {cameraError}</Text>}

            <Text style={styles.scannerTitle}>Samudrika Shastra Facial Geometry</Text>
            <Text style={styles.scannerSub}>Align face inside oval frame & tap to scan facial features.</Text>

            <Button
              label={scanning ? `Scanning Facial Features... ${scanProgress}%` : '📷 Open Camera & Scan Face'}
              variant="gold"
              loading={scanning}
              onPress={handleStartScan}
            />
          </Card>

          {report && (
            <Card style={{ gap: spacing.sm }}>
              <SectionHeader title="Samudrika Shastra AI Analysis" />

              <View style={styles.featureBox}>
                <Text style={styles.featureLabel}>🧠 Forehead & Intellect:</Text>
                <Text style={styles.featureVal}>{report.forehead}</Text>
              </View>

              <View style={styles.featureBox}>
                <Text style={styles.featureLabel}>👁️ Eyes & Intuition:</Text>
                <Text style={styles.featureVal}>{report.eyes}</Text>
              </View>

              <View style={styles.featureBox}>
                <Text style={styles.featureLabel}>🗿 Jawline & Determination:</Text>
                <Text style={styles.featureVal}>{report.chin}</Text>
              </View>

              <View style={styles.destinyBox}>
                <Text style={styles.destinyTitle}>🌟 Destiny & Career Age Peak:</Text>
                <Text style={styles.destinyVal}>{report.destinyAge}</Text>
              </View>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  scannerFrame: {
    width: '100%',
    height: 300,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.saffron,
    position: 'relative',
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceSnapshot: { width: '100%', height: '100%', resizeMode: 'cover' },
  faceOvalOverlay: {
    width: '65%',
    height: '75%',
    borderWidth: 2,
    borderColor: 'rgba(13,148,136,0.6)',
    borderRadius: 120,
    borderStyle: 'dashed',
    position: 'absolute',
  },

  laserBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    zIndex: 10,
  },
  laserBeam: { width: '100%', height: 4 },

  cameraErrorText: { ...typography.tiny, color: colors.danger, textAlign: 'center' },

  scannerTitle: { ...typography.h2, color: colors.text, textAlign: 'center', fontWeight: '800' },
  scannerSub: { ...typography.small, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },

  featureBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    gap: 2,
  },
  featureLabel: { ...typography.tiny, color: colors.saffron, fontWeight: '800' },
  featureVal: { ...typography.small, color: colors.text, lineHeight: 18 },

  destinyBox: {
    backgroundColor: 'rgba(109,40,217,0.10)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(109,40,217,0.3)',
    gap: 2,
    marginTop: 4,
  },
  destinyTitle: { ...typography.tiny, color: colors.auroraA, fontWeight: '800' },
  destinyVal: { ...typography.small, color: colors.text, fontWeight: '800', lineHeight: 18 },
});
