import { ScrollView, Text, View, Pressable, Modal } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useStudy } from '@/lib/study-context';
import { GamificationEngine } from '@/lib/gamification-engine';
import { useState, useEffect, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import type { StudySession } from '@/lib/types';

type TimerMode = 'work' | 'break' | 'idle';
type AmbientSound = 'forest' | 'rain' | 'cafe' | 'binaural' | 'silent';

const AMBIENT_OPTIONS: { key: AmbientSound; label: string }[] = [
  { key: 'forest', label: '🌲 Forest' },
  { key: 'rain', label: '🌧️ Rain' },
  { key: 'cafe', label: '☕ Café' },
  { key: 'binaural', label: '🎵 Binaural' },
  { key: 'silent', label: '🔇 Silent' },
];

const RING_SIZE = 220;
const RING_BORDER = 8;
const CONFETTI_TRAVEL_DISTANCE = 600;
const CONFETTI_PIECE_COUNT = 18;
const DISTRACTION_PENALTY_POINTS = 15;

interface ConfettiPiece {
  id: number;
  emoji: string;
  x: number;
}

function ConfettiEmoji({ emoji, x, delay }: { emoji: string; x: number; delay: number }) {
  const translateY = useSharedValue(-40);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(CONFETTI_TRAVEL_DISTANCE, { duration: 2000 + delay, easing: Easing.out(Easing.quad) });
    opacity.value = withTiming(0, { duration: 2200 + delay });
  }, [translateY, opacity, delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[{ position: 'absolute', top: 0, left: x, fontSize: 28 }, style]}>
      {emoji}
    </Animated.Text>
  );
}

export default function FocusScreen() {
  const colors = useColors();
  const { studyBlocks, addStudySession, updateUserProgress, userProgress, logEnergy } = useStudy();

  const [mode, setMode] = useState<'pomodoro' | 'falcon_dive'>('pomodoro');
  const [timerMode, setTimerMode] = useState<TimerMode>('idle');
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [totalDuration, setTotalDuration] = useState(25 * 60);
  const [distractionCount, setDistractionCount] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSound, setSelectedSound] = useState<AmbientSound>('silent');
  const [showPicker, setShowPicker] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Falcon soaring animation
  const falconY = useSharedValue(120);
  const falconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: falconY.value }],
  }));

  // Summary modal slide
  const summarySlide = useSharedValue(400);
  const summaryStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: summarySlide.value }],
  }));

  const workMinutes = mode === 'pomodoro' ? 25 : 50;
  const breakMinutes = mode === 'pomodoro' ? 5 : 10;

  const progress = totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0;
  const focusScore = Math.max(0, Math.round(100 - distractionCount * DISTRACTION_PENALTY_POINTS));

  // Update falcon position based on progress
  useEffect(() => {
    const target = 120 - (progress / 100) * 160;
    falconY.value = withTiming(target, { duration: 800, easing: Easing.out(Easing.quad) });
  }, [progress, falconY]);

  // Timer countdown
  useEffect(() => {
    if (timerMode === 'idle' || isPaused) return;

    timerInterval.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (timerMode === 'work') {
            setTimerMode('break');
            setTotalDuration(breakMinutes * 60);
            return breakMinutes * 60;
          } else {
            handleEndSession();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [timerMode, isPaused, breakMinutes]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimerMode('work');
    setTimeRemaining(workMinutes * 60);
    setTotalDuration(workMinutes * 60);
    setSessionStartTime(Date.now());
    setDistractionCount(0);
    setIsPaused(false);
  };

  const togglePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused((p) => !p);
  };

  const skipBreak = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (timerMode === 'break') {
      handleEndSession();
    }
  };

  const handleEndSession = useCallback(() => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    const now = Date.now();
    const elapsedMs = now - (sessionStartTime || now);
    setElapsed(elapsedMs);

    const reward = GamificationEngine.getFeatherReward('complete_session');
    const earnedXp = reward?.xp ?? 25;
    setXpEarned(earnedXp);

    setTimerMode('idle');
    setIsPaused(false);
    summarySlide.value = withSpring(0, { damping: 20, stiffness: 120 });
    setShowSummary(true);
  }, [sessionStartTime, summarySlide]);

  const endSession = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleEndSession();
  };

  const logDistraction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDistractionCount((d) => d + 1);
  };

  const claimXp = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const session: StudySession = {
      id: Date.now().toString(),
      title: selectedSubject || 'Free Study',
      subject: selectedSubject || 'Free Study',
      duration: elapsed / 60000,
      startedAt: sessionStartTime,
      completedAt: Date.now(),
      distractionsLogged: distractionCount,
      focusLevel: distractionCount === 0 ? 'high' : distractionCount < 3 ? 'medium' : 'low',
    };
    await addStudySession(session);
    await updateUserProgress({ xp: (userProgress?.xp ?? 0) + xpEarned });
    await logEnergy(distractionCount === 0 ? 4 : distractionCount < 3 ? 3 : 2);

    // Trigger confetti
    const emojis = ['🦅', '⭐', '🔥', '✨', '🏆', '💎'];
    const pieces: ConfettiPiece[] = Array.from({ length: CONFETTI_PIECE_COUNT }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      x: Math.random() * 300 + 20,
    }));
    setConfettiPieces(pieces);
    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
      setConfettiPieces([]);
      setShowSummary(false);
      summarySlide.value = 400;
      setDistractionCount(0);
      setElapsed(0);
    }, 2500);
  };

  const todayBlocks = studyBlocks.filter((b) => {
    const today = new Date().getDay();
    return b.dayOfWeek === today;
  });

  const modeLabel = mode === 'pomodoro' ? 'POMODORO' : 'FALCON DIVE';
  const displaySubject = selectedSubject || 'Free Study';

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 items-center px-4 pt-4 pb-8" style={{ backgroundColor: colors.secondary }}>
          {/* Mode Switcher */}
          <View className="flex-row gap-2 mb-4 w-full">
            <Pressable
              className="flex-1 rounded-2xl py-3 active:opacity-90"
              style={{ backgroundColor: mode === 'pomodoro' ? colors.accent : 'rgba(255,255,255,0.12)' }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMode('pomodoro');
                if (timerMode === 'idle') {
                  setTimeRemaining(25 * 60);
                  setTotalDuration(25 * 60);
                }
              }}
            >
              <Text className="text-center font-bold text-sm text-white">Pomodoro</Text>
            </Pressable>
            <Pressable
              className="flex-1 rounded-2xl py-3 active:opacity-90"
              style={{ backgroundColor: mode === 'falcon_dive' ? colors.accent : 'rgba(255,255,255,0.12)' }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMode('falcon_dive');
                if (timerMode === 'idle') {
                  setTimeRemaining(50 * 60);
                  setTotalDuration(50 * 60);
                }
              }}
            >
              <Text className="text-center font-bold text-sm text-white">Falcon Dive</Text>
            </Pressable>
          </View>

          {/* Session Selector */}
          <Pressable
            className="rounded-xl px-5 py-2 mb-6 active:opacity-80"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowPicker(true);
            }}
          >
            <Text className="text-white text-sm font-semibold">📋 {displaySubject} ▾</Text>
          </Pressable>

          {/* Progress Ring */}
          <View className="items-center justify-center mb-2" style={{ width: RING_SIZE, height: RING_SIZE }}>
            {/* Outer ring background */}
            <View
              className="absolute rounded-full"
              style={{
                width: RING_SIZE,
                height: RING_SIZE,
                borderWidth: RING_BORDER,
                borderColor: 'rgba(255,255,255,0.15)',
              }}
            />
            {/* Progress arc (simulated with border + clip) */}
            <View
              className="absolute rounded-full"
              style={{
                width: RING_SIZE,
                height: RING_SIZE,
                borderWidth: RING_BORDER,
                borderColor: colors.accent,
                opacity: progress / 100,
              }}
            />
            {/* Center content */}
            <View className="items-center justify-center">
              <Text style={{ fontSize: 64, fontWeight: 'bold', color: '#FFFFFF' }}>{formatTime(timeRemaining)}</Text>
              <Text className="text-sm font-semibold mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {timerMode === 'break' ? '☕ BREAK' : modeLabel}
              </Text>
              <Text className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {Math.round(progress)}%
              </Text>
            </View>
          </View>

          {/* Falcon soaring */}
          <Animated.Text style={[{ fontSize: 36 }, falconAnimStyle]}>🦅</Animated.Text>

          {/* Controls */}
          <View className="flex-row items-center gap-4 mt-4 mb-4">
            {timerMode === 'idle' ? (
              <Pressable
                className="rounded-full items-center justify-center active:opacity-80"
                style={{ width: 64, height: 64, backgroundColor: colors.accent }}
                onPress={startTimer}
              >
                <Text className="text-white text-2xl font-bold">▶</Text>
              </Pressable>
            ) : (
              <Pressable
                className="rounded-full items-center justify-center active:opacity-80"
                style={{ width: 64, height: 64, backgroundColor: colors.accent }}
                onPress={togglePause}
              >
                <Text className="text-white text-2xl font-bold">{isPaused ? '▶' : '⏸'}</Text>
              </Pressable>
            )}
          </View>

          {timerMode === 'break' && (
            <Pressable
              className="rounded-full px-6 py-2 mb-3 active:opacity-80"
              style={{ borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)' }}
              onPress={skipBreak}
            >
              <Text className="text-white text-sm font-semibold">Skip Break →</Text>
            </Pressable>
          )}

          {/* Distraction Logger */}
          <Pressable
            className="flex-row items-center rounded-full px-5 py-2 mb-4 active:opacity-80"
            style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
            onPress={logDistraction}
          >
            <Text className="text-white text-sm">😵‍💫 I got distracted</Text>
            {distractionCount > 0 && (
              <View
                className="ml-2 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.error, width: 22, height: 22 }}
              >
                <Text className="text-white text-xs font-bold">{distractionCount}</Text>
              </View>
            )}
          </Pressable>

          {/* Ambient Sounds */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
            contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
          >
            {AMBIENT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                className="rounded-full px-4 py-2 active:opacity-80"
                style={{
                  backgroundColor: selectedSound === opt.key ? colors.accent : 'rgba(255,255,255,0.10)',
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedSound(opt.key);
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: selectedSound === opt.key ? '#FFFFFF' : 'rgba(255,255,255,0.7)' }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* End Session */}
          {timerMode !== 'idle' && (
            <Pressable className="mt-2 mb-2 active:opacity-70" onPress={endSession}>
              <Text className="text-sm font-semibold" style={{ color: colors.error }}>
                End Session
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Session Picker Modal */}
      <Modal visible={showPicker} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowPicker(false)}
        >
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.surface }}
            onStartShouldSetResponder={() => true}
          >
            <Text className="text-lg font-bold mb-4" style={{ color: colors.foreground }}>
              Select Session
            </Text>
            <Pressable
              className="rounded-xl p-4 mb-2 active:opacity-80"
              style={{
                backgroundColor: !selectedSubject ? colors.accent + '20' : colors.background,
                borderWidth: !selectedSubject ? 1.5 : 1,
                borderColor: !selectedSubject ? colors.accent : colors.border,
              }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedSubject('');
                setShowPicker(false);
              }}
            >
              <Text className="font-semibold" style={{ color: colors.foreground }}>
                📝 Free Study
              </Text>
            </Pressable>
            {todayBlocks.map((block) => (
              <Pressable
                key={block.id}
                className="rounded-xl p-4 mb-2 active:opacity-80"
                style={{
                  backgroundColor: selectedSubject === block.subject ? colors.accent + '20' : colors.background,
                  borderWidth: selectedSubject === block.subject ? 1.5 : 1,
                  borderColor: selectedSubject === block.subject ? colors.accent : colors.border,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedSubject(block.subject);
                  setShowPicker(false);
                }}
              >
                <Text className="font-semibold" style={{ color: colors.foreground }}>
                  {block.title}
                </Text>
                <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                  {block.startTime} – {block.endTime}
                </Text>
              </Pressable>
            ))}
            <Pressable
              className="rounded-xl py-3 mt-2 active:opacity-80"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowPicker(false);
              }}
            >
              <Text className="text-center font-semibold" style={{ color: colors.muted }}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Session Summary Modal */}
      <Modal visible={showSummary} transparent animationType="none">
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          {showConfetti && (
            <View className="absolute top-0 left-0 right-0 bottom-0" pointerEvents="none">
              {confettiPieces.map((p) => (
                <ConfettiEmoji key={p.id} emoji={p.emoji} x={p.x} delay={p.id * 80} />
              ))}
            </View>
          )}
          <Animated.View
            className="rounded-t-3xl p-6 pt-8"
            style={[{ backgroundColor: colors.surface }, summaryStyle]}
          >
            <Text className="text-2xl font-bold text-center mb-6" style={{ color: colors.foreground }}>
              🦅 Session Complete!
            </Text>

            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 rounded-2xl p-4 items-center" style={{ backgroundColor: colors.background }}>
                <Text className="text-xs font-semibold mb-1" style={{ color: colors.muted }}>DURATION</Text>
                <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
                  {Math.round(elapsed / 60000)}m
                </Text>
              </View>
              <View className="flex-1 rounded-2xl p-4 items-center" style={{ backgroundColor: colors.background }}>
                <Text className="text-xs font-semibold mb-1" style={{ color: colors.muted }}>DISTRACTIONS</Text>
                <Text className="text-xl font-bold" style={{ color: colors.error }}>
                  {distractionCount}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 rounded-2xl p-4 items-center" style={{ backgroundColor: colors.background }}>
                <Text className="text-xs font-semibold mb-1" style={{ color: colors.muted }}>FOCUS SCORE</Text>
                <Text className="text-xl font-bold" style={{ color: colors.success }}>
                  {focusScore}%
                </Text>
              </View>
              <View className="flex-1 rounded-2xl p-4 items-center" style={{ backgroundColor: colors.background }}>
                <Text className="text-xs font-semibold mb-1" style={{ color: colors.muted }}>XP EARNED</Text>
                <Text className="text-xl font-bold" style={{ color: colors.warning }}>
                  +{xpEarned}
                </Text>
              </View>
            </View>

            <Pressable
              className="rounded-2xl py-4 active:opacity-80"
              style={{ backgroundColor: colors.accent }}
              onPress={claimXp}
            >
              <Text className="text-center text-white font-bold text-base">🏆 Claim XP</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
