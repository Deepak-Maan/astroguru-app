import React, { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { ChatBubble } from '../src/components/ChatBubble';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { useChatStore } from '../src/store/chatStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUserStore } from '../src/store/userStore';
import { SUGGESTED_QUESTIONS, askAstrologer } from '../src/services/ai/anthropic';

let seq = 0;
const nextId = () => `ai-${Date.now()}-${seq++}`;

export default function AiChat() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const messages = useChatStore((s) => s.aiMessages);
  const addAiMessage = useChatStore((s) => s.addAiMessage);
  const replaceAiMessage = useChatStore((s) => s.replaceAiMessage);

  const apiKey = useSettingsStore((s) => s.apiKey);
  const profile = useUserStore((s) => s.profile);
  const kundli = useUserStore((s) => s.kundli);

  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, []);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;

    setDraft('');
    setBusy(true);

    addAiMessage({ id: nextId(), role: 'user', text: question, at: Date.now() });

    const placeholderId = nextId();
    addAiMessage({
      id: placeholderId,
      role: 'assistant',
      text: '',
      at: Date.now(),
      pending: true,
    });
    scrollToEnd();

    const history = useChatStore.getState().aiMessages.filter((m) => m.id !== placeholderId);

    const result = await askAstrologer({
      apiKey,
      profile,
      kundli,
      history: history.slice(0, -1),
      question,
    });

    replaceAiMessage(placeholderId, {
      text: result.text,
      pending: false,
      at: Date.now(),
    });
    setBusy(false);
    scrollToEnd();
  }

  const empty = messages.length === 0;

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader
          title="AI Jyotishi"
          subtitle={apiKey ? 'Powered by Claude · reads your chart' : 'Add an API key in Settings'}
          showBack
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scroll}
            onContentSizeChange={scrollToEnd}
            showsVerticalScrollIndicator={false}
          >
            {empty && (
              <View style={styles.intro}>
                {/* Hero icon with glow */}
                <View style={styles.introIconWrap}>
                  <LinearGradient
                    colors={['rgba(245,197,66,0.25)', 'rgba(255,138,61,0.10)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.introIcon}>✨</Text>
                </View>

                <Text style={styles.introTitle}>Ask about your chart</Text>
                <Text style={styles.introText}>
                  {kundli
                    ? 'Your Lagna, Rashi, Nakshatra and all nine planetary placements are sent as context — answers are personalised to your kundli.'
                    : 'Add your birth details first so readings can be based on your actual chart.'}
                </Text>

                {!apiKey && (
                  <Pressable onPress={() => router.push('/settings')} style={styles.keyBanner}>
                    <LinearGradient
                      colors={['rgba(245,197,66,0.15)', 'rgba(245,197,66,0.05)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.keyBannerIcon}>🔑</Text>
                    <Text style={styles.keyBannerText}>
                      No API key yet — tap to add one in Settings
                    </Text>
                    <Text style={styles.keyBannerArrow}>›</Text>
                  </Pressable>
                )}
                {!kundli && (
                  <Pressable
                    onPress={() => router.push('/(onboarding)/birth-details')}
                    style={styles.keyBanner}
                  >
                    <LinearGradient
                      colors={['rgba(122,60,255,0.15)', 'rgba(194,75,255,0.05)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.keyBannerIcon}>🪐</Text>
                    <Text style={styles.keyBannerText}>
                      Add birth details for a personalised reading
                    </Text>
                    <Text style={styles.keyBannerArrow}>›</Text>
                  </Pressable>
                )}
              </View>
            )}

            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} authorLabel="AI Jyotishi" />
            ))}
          </ScrollView>

          {/* Suggestions strip wrapper with fixed height */}
          {empty && (
            <View style={styles.suggestionsWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestions}
                style={{ flexGrow: 0 }}
              >
                {SUGGESTED_QUESTIONS.map((q) => (
                  <Pressable
                    key={q}
                    onPress={() => send(q)}
                    style={({ pressed }) => [styles.suggestion, pressed && { opacity: 0.7 }]}
                  >
                    <LinearGradient
                      colors={['rgba(122,60,255,0.22)', 'rgba(194,75,255,0.10)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.suggestionText}>{q}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Composer */}
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Ask the Jyotishi anything…"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
              multiline
              maxLength={800}
              onSubmitEditing={() => send(draft)}
              blurOnSubmit={false}
            />
            <Pressable
              onPress={() => send(draft)}
              disabled={!draft.trim() || busy}
              style={({ pressed }) => [
                styles.sendBtn,
                pressed && { opacity: 0.75 },
              ]}
            >
              <LinearGradient
                colors={
                  draft.trim() && !busy
                    ? [colors.auroraA, colors.auroraB]
                    : ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.06)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.sendIcon}>{busy ? '…' : '↑'}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.md, flexGrow: 1 },

  intro: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },

  introIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.35)',
  },
  introIcon: { fontSize: 42 },
  introTitle: { ...typography.h1, fontSize: 24, color: colors.text, textAlign: 'center' },
  introText: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.xl,
  },

  keyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.35)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  keyBannerIcon: { fontSize: 18 },
  keyBannerText: { ...typography.small, color: colors.gold, fontWeight: '700', flex: 1 },
  keyBannerArrow: { fontSize: 22, color: colors.gold },

  suggestionsWrapper: {
    height: 42,
    marginBottom: spacing.xs,
  },
  suggestions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  suggestion: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(122,60,255,0.35)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  suggestionText: { ...typography.small, color: colors.textMuted, fontSize: 12.5 },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: 'rgba(11,6,32,0.95)',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: 11,
    paddingBottom: 11,
    color: colors.text,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sendIcon: { color: colors.white, fontSize: 20, fontWeight: '800' },
});
