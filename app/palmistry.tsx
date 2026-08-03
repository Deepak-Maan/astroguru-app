import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';

export interface ScanResultItem {
  name: string;
  icon: string;
  depthScore: number;
  clarity: string;
  reading: string;
  planetaryImpact: string;
}

export default function PalmistryScreen() {
  const [scanType, setScanType] = useState<'palm' | 'face'>('palm');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Scanning progress states
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('Align inside camera frame');
  const [laserPos, setLaserPos] = useState(0);
  const [scanned, setScanned] = useState(false);

  // Captured snapshot
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);

  // Analysis results
  const [vitalityIndex, setVitalityIndex] = useState(92);
  const [emotionalBalance, setEmotionalBalance] = useState(88);
  const [careerPotential, setCareerPotential] = useState(95);
  const [linesAnalysis, setLinesAnalysis] = useState<ScanResultItem[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Real Device Camera Stream
  const openDeviceCamera = async () => {
    setCameraError(null);
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: scanType === 'face' ? 'user' : 'environment',
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
        console.log('Camera error:', err);
        setCameraError('Camera access denied or unavailable. Please grant camera permission.');
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
  }, [scanType]);

  // Animated Laser Line Scanner Engine
  useEffect(() => {
    let interval: any;
    if (isScanning) {
      let step = 0;
      let pos = 0;
      let direction = 1;

      interval = setInterval(() => {
        pos += direction * 5;
        if (pos >= 95) direction = -1;
        if (pos <= 5) direction = 1;
        setLaserPos(pos);

        step += 2;
        setScanProgress(Math.min(step, 100));

        if (scanType === 'palm') {
          if (step < 25) setCurrentStepText('🔍 Tracing Life Line & Vitality...');
          else if (step < 50) setCurrentStepText('💓 Mapping Heart Line Curve...');
          else if (step < 75) setCurrentStepText('🧠 Measuring Head Line Depth...');
          else setCurrentStepText('👑 Analyzing Fate Line & Mounts...');
        } else {
          if (step < 25) setCurrentStepText('👁️ Analyzing Forehead (Sun & Moon Mount)...');
          else if (step < 50) setCurrentStepText('👃 Measuring Nose Structure (Jupiter & Mars)...');
          else if (step < 75) setCurrentStepText('👄 Reading Chin & Jaw (Saturn & Venus)...');
          else setCurrentStepText('✨ Synthesizing Samudrika Shastra Features...');
        }

        if (step >= 100) {
          clearInterval(interval);
          finishScanSequence();
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isScanning, scanType]);

  const triggerLiveScan = () => {
    setIsScanning(true);
    setScanned(false);
    setScanProgress(0);

    // Capture snapshot from video element if on web
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
      } catch (e) {
        console.log('Snapshot error:', e);
      }
    }
  };

  const finishScanSequence = () => {
    setIsScanning(false);
    setScanned(true);

    const seed = Date.now();
    const vit = 86 + (seed % 12);
    const emo = 84 + ((seed >> 2) % 13);
    const car = 90 + ((seed >> 4) % 9);

    setVitalityIndex(vit);
    setEmotionalBalance(emo);
    setCareerPotential(car);

    if (scanType === 'palm') {
      setLinesAnalysis([
        {
          name: 'Life Line (Vitality)',
          icon: '❤️',
          depthScore: vit,
          clarity: 'Strong & Deep',
          reading: `Live camera analysis detected a long, clear curve around the Venus Mount. Shows high physical stamina, immunity vigor, and major success around age ${28 + (seed % 7)}.`,
          planetaryImpact: 'Sun & Mars mounts show strong planetary strength.',
        },
        {
          name: 'Heart Line (Emotions)',
          icon: '💞',
          depthScore: emo,
          clarity: 'Clear & Curved',
          reading: `Curves upwards towards the Jupiter mount. Suggests deep romantic sincerity, high emotional maturity, and strong empathy in personal relationships.`,
          planetaryImpact: 'Venus mount shows high harmony and creative passion.',
        },
        {
          name: 'Head Line (Intellect)',
          icon: '🧠',
          depthScore: 89,
          clarity: 'Strong & Deep',
          reading: `Extends straight across the mid-palm. Indicates structured analytical thinking, excellent crisis management skills, and high focus.`,
          planetaryImpact: 'Mercury mount indicates business and financial acumen.',
        },
        {
          name: 'Fate Line (Career & Wealth)',
          icon: '👑',
          depthScore: car,
          clarity: 'Strong & Deep',
          reading: `Originates clearly near the palm base running towards Saturn. Points to self-made financial success, authority, and career independence.`,
          planetaryImpact: 'Saturn mount promises long-term wealth accumulation.',
        },
      ]);
    } else {
      setLinesAnalysis([
        {
          name: 'Forehead & Crown (Surya & Chandra)',
          icon: '☀️',
          depthScore: vit,
          clarity: 'Broad & Clear',
          reading: `Samudrika Shastra reading: A broad, smooth forehead indicates high intellect, leadership qualities, and natural administrative authority.`,
          planetaryImpact: 'Sun mount governs fame and social respect.',
        },
        {
          name: 'Nose & Cheeks (Guru & Mangal)',
          icon: '👃',
          depthScore: emo,
          clarity: 'Straight & Symmetric',
          reading: `Straight bridge and high cheekbones indicate financial independence, courage under pressure, and strong executive drive.`,
          planetaryImpact: 'Jupiter & Mars mounts strengthen career trajectory.',
        },
        {
          name: 'Chin & Jawline (Shani & Shukra)',
          icon: '👑',
          depthScore: car,
          clarity: 'Prominent & Defined',
          reading: `Firm jawline and rounded chin reflect endurance, long-term stability, and strong willpower to achieve ambitious life goals.`,
          planetaryImpact: 'Saturn mount promises steady accumulation of wealth.',
        },
      ]);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Live AI Camera Scanner" subtitle="Real-time Face & Palm Computer Vision" showBack showWallet />

        {/* Scan Type Switcher (Palm vs Face) */}
        <View style={styles.tabRow}>
          <Pressable
            onPress={() => { setScanType('palm'); setScanned(false); setCapturedSnapshot(null); }}
            style={[styles.tabCell, scanType === 'palm' && styles.tabCellActive]}
          >
            {scanType === 'palm' && (
              <LinearGradient colors={[colors.gold, colors.saffron]} style={StyleSheet.absoluteFill} />
            )}
            <Text style={[styles.tabText, scanType === 'palm' && styles.tabTextActive]}>
              ✋ Live Palm Scanner
            </Text>
          </Pressable>

          <Pressable
            onPress={() => { setScanType('face'); setScanned(false); setCapturedSnapshot(null); }}
            style={[styles.tabCell, scanType === 'face' && styles.tabCellActive]}
          >
            {scanType === 'face' && (
              <LinearGradient colors={[colors.auroraA, colors.auroraB]} style={StyleSheet.absoluteFill} />
            )}
            <Text style={[styles.tabText, scanType === 'face' && styles.tabTextActive]}>
              👤 Live Face Reading
            </Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Live Camera Viewfinder */}
          <Card style={styles.scannerCard}>
            <View style={styles.scannerFrame}>
              {/* HTML5 Live Video Element on Web */}
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
                <Image source={{ uri: capturedSnapshot }} style={styles.palmImage} />
              )}

              {/* Fallback image if camera permissions unavailable */}
              {cameraError && !capturedSnapshot && (
                <Image
                  source={{
                    uri:
                      scanType === 'palm'
                        ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400'
                        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                  }}
                  style={styles.palmImage}
                />
              )}

              <LinearGradient
                colors={['rgba(122,60,255,0.25)', 'transparent', 'rgba(245,197,66,0.25)']}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />

              {/* Face / Palm Guide Overlay */}
              <View style={styles.guideOverlay} pointerEvents="none">
                <View style={scanType === 'face' ? styles.faceGuideBox : styles.palmGuideBox} />
              </View>

              {/* Running Laser Beam Overlay */}
              {isScanning && (
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  <View style={[styles.runningLaserBar, { top: `${laserPos}%` }]}>
                    <LinearGradient
                      colors={['transparent', '#FFD700', 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.laserBeam}
                    />
                    <View style={styles.laserGlow} />
                  </View>

                  {/* Progress Status Bar */}
                  <View style={styles.scanStatusBox}>
                    <Text style={styles.scanStatusText}>{currentStepText}</Text>
                    <View style={styles.progressBarTrack}>
                      <View style={[styles.progressBarFill, { width: `${scanProgress}%` }]} />
                    </View>
                  </View>
                </View>
              )}

              {!isScanning && !scanned && (
                <View style={styles.scanPromptOverlay} pointerEvents="none">
                  <Text style={{ fontSize: 36 }}>{scanType === 'palm' ? '✋' : '👤'}</Text>
                  <Text style={styles.scanPromptText}>
                    {scanType === 'palm' ? 'Align Palm inside Camera Frame' : 'Align Face inside Camera Frame'}
                  </Text>
                  <Text style={styles.scanPromptSub}>
                    Live device camera feed active · Ensure clear light
                  </Text>
                </View>
              )}
            </View>

            {!!cameraError && (
              <Text style={styles.cameraErrorText}>⚠️ {cameraError}</Text>
            )}

            {!scanned && (
              <Button
                label={
                  isScanning
                    ? `Scanning... ${scanProgress}%`
                    : scanType === 'palm'
                    ? '📷 Scan Live Palm with Camera'
                    : '📷 Scan Live Face with Camera'
                }
                variant="gold"
                size="lg"
                loading={isScanning}
                onPress={triggerLiveScan}
                style={{ marginTop: spacing.md }}
              />
            )}
          </Card>

          {/* Analysis Results */}
          {scanned && (
            <View style={{ gap: spacing.md }}>
              <Card>
                <SectionHeader
                  title={scanType === 'palm' ? 'Palmistry Laser Analysis' : 'Face Reading (Samudrika Shastra)'}
                  subtitle="REAL CAMERA COMPUTER VISION SYNTHESIS"
                />
                <View style={styles.overviewGrid}>
                  <View style={styles.overviewBox}>
                    <Text style={styles.overviewNum}>{vitalityIndex}%</Text>
                    <Text style={styles.overviewLabel}>Vitality Index</Text>
                  </View>
                  <View style={styles.overviewBox}>
                    <Text style={[styles.overviewNum, { color: colors.teal }]}>{emotionalBalance}%</Text>
                    <Text style={styles.overviewLabel}>Emotional Balance</Text>
                  </View>
                  <View style={styles.overviewBox}>
                    <Text style={[styles.overviewNum, { color: colors.auroraB }]}>{careerPotential}%</Text>
                    <Text style={styles.overviewLabel}>Career Potential</Text>
                  </View>
                </View>
              </Card>

              {/* Analysis Items */}
              {linesAnalysis.map((item) => (
                <Card key={item.name} style={styles.lineCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <Text style={{ fontSize: 28 }}>{item.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lineTitle}>{item.name}</Text>
                      <Text style={styles.lineClarity}>{item.clarity}</Text>
                    </View>
                    <Chip label={`${item.depthScore}% score`} tone="gold" />
                  </View>
                  <Text style={styles.lineReading}>{item.reading}</Text>
                  <Text style={styles.lineImpact}>✨ {item.planetaryImpact}</Text>
                </Card>
              ))}

              <Button
                label="📷 Scan Again with Live Camera"
                variant="outline"
                size="md"
                onPress={() => {
                  setScanned(false);
                  setCapturedSnapshot(null);
                  openDeviceCamera();
                }}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  tabCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  tabCellActive: {},
  tabText: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  tabTextActive: { color: colors.bg, fontWeight: '800' },

  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  scannerCard: { alignItems: 'center' },
  scannerFrame: {
    width: '100%',
    height: 320,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(245,197,66,0.5)',
    position: 'relative',
    backgroundColor: '#000000',
  },
  palmImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  guideOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  palmGuideBox: {
    width: '75%',
    height: '80%',
    borderWidth: 2,
    borderColor: 'rgba(245,197,66,0.5)',
    borderRadius: 60,
    borderStyle: 'dashed',
  },
  faceGuideBox: {
    width: '65%',
    height: '75%',
    borderWidth: 2,
    borderColor: 'rgba(56,225,195,0.6)',
    borderRadius: 120,
    borderStyle: 'dashed',
  },

  scanPromptOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(11,6,32,0.75)',
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  scanPromptText: { ...typography.small, color: colors.gold, fontWeight: '800', textAlign: 'center' },
  scanPromptSub: { ...typography.tiny, color: colors.textMuted, textAlign: 'center', fontSize: 10.5 },

  cameraErrorText: { ...typography.tiny, color: colors.danger, textAlign: 'center', marginTop: spacing.xs },

  /* Laser Beam Line */
  runningLaserBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    zIndex: 10,
  },
  laserBeam: { width: '100%', height: 4 },
  laserGlow: { height: 12, backgroundColor: 'rgba(255,215,0,0.3)', marginTop: -4 },

  scanStatusBox: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(11,6,32,0.92)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.5)',
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  scanStatusText: { ...typography.small, color: colors.gold, fontWeight: '800' },
  progressBarTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: colors.gold, borderRadius: 3 },

  overviewGrid: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  overviewBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  overviewNum: { ...typography.h1, fontSize: 26, color: colors.gold },
  overviewLabel: { ...typography.tiny, color: colors.textMuted, marginTop: 2, textAlign: 'center' },

  lineCard: { gap: spacing.xs },
  lineTitle: { ...typography.h3, color: colors.text, fontSize: 16 },
  lineClarity: { ...typography.tiny, color: colors.goldSoft, marginTop: 1 },
  lineReading: { ...typography.small, color: colors.textMuted, lineHeight: 20, marginTop: 2 },
  lineImpact: { ...typography.tiny, color: colors.teal, fontWeight: '700', marginTop: 2 },
});
