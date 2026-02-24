import { ScrollView, Text, View, Pressable, Switch, Animated } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useStudy } from '@/lib/study-context';
import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';

type TimerMode = 'work' | 'break' | 'idle';

export default function FocusScreen() {
  const colors = useColors();
  const { completeStudySession, logEnergy } = useStudy();
  const [mode, setMode] = useState<'pomodoro' | 'falcon_dive'>('pomodoro');
  const [timerMode, setTimerMode] = useState<TimerMode>('idle');
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [distractions, setDistractions] = useState(0);
  const [focusLevel, setFocusLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [ambientSounds, setAmbientSounds] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerMode === 'idle') return;

    timerInterval.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
          if (timerMode === 'work') {
            setSessionsCompleted((s) => s + 1);
            setTimerMode('break');
            return breakDuration * 60;
          } else {
            setTimerMode('work');
            return workDuration * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [timerMode, workDuration, breakDuration]);

  const startTimer = () => {
    setTimerMode('work');
    setTimeRemaining(workDuration * 60);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const pauseTimer = () => {
    setTimerMode('idle');
    if (timerInterval.current) clearInterval(timerInterval.current);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const resetTimer = () => {
    setTimerMode('idle');
    if (timerInterval.current) clearInterval(timerInterval.current);
    setTimeRemaining(workDuration * 60);
    setSessionsCompleted(0);
    setDistractions(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const logDistraction = () => {
    setDistractions((d) => d + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const completeSession = async () => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    
    const sessionId = Date.now().toString();
    await completeStudySession(sessionId);
    await logEnergy(focusLevel === 'high' ? 4 : focusLevel === 'medium' ? 3 : 2);
    
    resetTimer();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const soaringPercentage = timerMode === 'work' 
    ? ((workDuration * 60 - timeRemaining) / (workDuration * 60)) * 100 
    : 100;

  if (fullscreen && timerMode !== 'idle') {
    return (
      <ScreenContainer className="p-4">
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.secondary }}>
          <Text className="text-6xl mb-8">🦅</Text>
          <Text className="text-5xl font-bold text-white mb-4">{formatTime(timeRemaining)}</Text>
          <Text className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {timerMode === 'work' ? 'Focus Time' : 'Break Time'}
          </Text>

          <View
            className="w-48 h-48 rounded-full items-center justify-center mb-8"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 4, borderColor: 'rgba(255,255,255,0.25)' }}
          >
            <View
              className="w-40 h-40 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)', opacity: 0.5 + (soaringPercentage / 200) }}
            >
              <Text className="text-5xl">✨</Text>
            </View>
          </View>

          <View className="flex-row gap-4">
            <Pressable
              className="rounded-2xl px-8 py-4 active:opacity-80"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              onPress={pauseTimer}
            >
              <Text className="text-white font-bold text-base">Pause</Text>
            </Pressable>
            <Pressable
              className="bg-white rounded-2xl px-8 py-4 active:opacity-80"
              onPress={completeSession}
            >
              <Text className="font-bold text-base" style={{ color: colors.secondary }}>Finish</Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-6 tracking-tight">Focus</Text>

          <View className="flex-row gap-2 mb-6">
            <Pressable
              className="flex-1 rounded-2xl py-3 active:opacity-90"
              style={{
                backgroundColor: mode === 'pomodoro' ? colors.primary : colors.surface,
                shadowColor: mode === 'pomodoro' ? colors.primary : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: mode === 'pomodoro' ? 0.25 : 0.04,
                shadowRadius: 6,
                elevation: mode === 'pomodoro' ? 3 : 1,
              }}
              onPress={() => setMode('pomodoro')}
            >
              <Text
                className={`text-center font-bold text-sm ${
                  mode === 'pomodoro' ? 'text-white' : 'text-foreground'
                }`}
              >
                Pomodoro
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 rounded-2xl py-3 active:opacity-90"
              style={{
                backgroundColor: mode === 'falcon_dive' ? colors.primary : colors.surface,
                shadowColor: mode === 'falcon_dive' ? colors.primary : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: mode === 'falcon_dive' ? 0.25 : 0.04,
                shadowRadius: 6,
                elevation: mode === 'falcon_dive' ? 3 : 1,
              }}
              onPress={() => setMode('falcon_dive')}
            >
              <Text
                className={`text-center font-bold text-sm ${
                  mode === 'falcon_dive' ? 'text-white' : 'text-foreground'
                }`}
              >
                Falcon Dive
              </Text>
            </Pressable>
          </View>

          <View
            className="rounded-2xl p-8 mb-6 items-center overflow-hidden"
            style={{
              backgroundColor: colors.secondary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.18,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Text className="text-6xl font-bold text-white mb-2">{formatTime(timeRemaining)}</Text>
            <Text className="text-lg" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {timerMode === 'work' ? '🎯 Focus Time' : timerMode === 'break' ? '☕ Break Time' : 'Ready to Soar?'}
            </Text>
          </View>

          <View className="items-center mb-6">
            <View
              className="w-40 h-40 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary + '18', borderWidth: 4, borderColor: colors.primary }}
            >
              <View
                className="w-32 h-32 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary + '30', opacity: 0.5 + (soaringPercentage / 200) }}
              >
                <Text className="text-4xl">🦅</Text>
              </View>
            </View>
            <Text className="text-xs text-muted mt-4">{Math.round(soaringPercentage)}% Soaring</Text>
          </View>

          <View className="flex-row gap-3 mb-6">
            <View
              className="flex-1 rounded-2xl p-4"
              style={{
                backgroundColor: colors.surface,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text className="text-xs text-muted font-semibold mb-2">SESSIONS</Text>
              <Text className="text-2xl font-bold text-foreground">{sessionsCompleted}</Text>
            </View>
            <View
              className="flex-1 rounded-2xl p-4"
              style={{
                backgroundColor: colors.surface,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text className="text-xs text-muted font-semibold mb-2">DISTRACTIONS</Text>
              <Text className="text-2xl font-bold text-error">{distractions}</Text>
            </View>
            <View
              className="flex-1 rounded-2xl p-4"
              style={{
                backgroundColor: colors.surface,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text className="text-xs text-muted font-semibold mb-2">FOCUS</Text>
              <Text className="text-2xl font-bold text-success">
                {focusLevel === 'high' ? '🔥' : focusLevel === 'medium' ? '💪' : '😴'}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3 mb-6">
            {timerMode === 'idle' ? (
              <Pressable
                className="flex-1 rounded-2xl py-4 active:opacity-80"
                style={{
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={startTimer}
              >
                <Text className="text-center font-bold text-white text-base">Start Focus</Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  className="flex-1 rounded-2xl py-4 active:opacity-80"
                  style={{
                    backgroundColor: colors.surface,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                  onPress={pauseTimer}
                >
                  <Text className="text-center font-bold text-foreground text-base">Pause</Text>
                </Pressable>
                <Pressable
                  className="flex-1 rounded-2xl py-4 active:opacity-80"
                  style={{
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  onPress={completeSession}
                >
                  <Text className="text-center font-bold text-white text-base">Finish</Text>
                </Pressable>
              </>
            )}
          </View>

          <Pressable
            className="rounded-2xl p-4 mb-6 active:opacity-80"
            style={{
              backgroundColor: colors.error + '10',
              borderWidth: 1,
              borderColor: colors.error + '25',
            }}
            onPress={logDistraction}
          >
            <Text className="text-sm font-bold text-error">+ Log Distraction ({distractions})</Text>
            <Text className="text-xs mt-1" style={{ color: colors.error + 'aa' }}>Track interruptions during focus sessions</Text>
          </Pressable>

          <View className="mb-6">
            <Text className="text-base font-bold text-foreground mb-3">Settings</Text>

            <View className="gap-3">
              <View
                className="rounded-2xl p-4 flex-row justify-between items-center"
                style={{
                  backgroundColor: colors.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.03,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View>
                  <Text className="text-sm font-semibold text-foreground">Work Duration</Text>
                  <Text className="text-xs text-muted mt-1">{workDuration} minutes</Text>
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    className="rounded-xl px-4 py-2 active:opacity-80"
                    style={{ backgroundColor: colors.primary }}
                    onPress={() => setWorkDuration(Math.max(5, workDuration - 5))}
                  >
                    <Text className="text-white font-bold">−</Text>
                  </Pressable>
                  <Pressable
                    className="rounded-xl px-4 py-2 active:opacity-80"
                    style={{ backgroundColor: colors.primary }}
                    onPress={() => setWorkDuration(Math.min(60, workDuration + 5))}
                  >
                    <Text className="text-white font-bold">+</Text>
                  </Pressable>
                </View>
              </View>

              <View
                className="rounded-2xl p-4 flex-row justify-between items-center"
                style={{
                  backgroundColor: colors.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.03,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View>
                  <Text className="text-sm font-semibold text-foreground">Break Duration</Text>
                  <Text className="text-xs text-muted mt-1">{breakDuration} minutes</Text>
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    className="rounded-xl px-4 py-2 active:opacity-80"
                    style={{ backgroundColor: colors.primary }}
                    onPress={() => setBreakDuration(Math.max(1, breakDuration - 1))}
                  >
                    <Text className="text-white font-bold">−</Text>
                  </Pressable>
                  <Pressable
                    className="rounded-xl px-4 py-2 active:opacity-80"
                    style={{ backgroundColor: colors.primary }}
                    onPress={() => setBreakDuration(Math.min(15, breakDuration + 1))}
                  >
                    <Text className="text-white font-bold">+</Text>
                  </Pressable>
                </View>
              </View>

              <View
                className="rounded-2xl p-4 flex-row justify-between items-center"
                style={{
                  backgroundColor: colors.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.03,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View>
                  <Text className="text-sm font-semibold text-foreground">Ambient Sounds</Text>
                  <Text className="text-xs text-muted mt-1">Background focus music</Text>
                </View>
                <Switch
                  value={ambientSounds}
                  onValueChange={setAmbientSounds}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={ambientSounds ? colors.primary : colors.muted}
                />
              </View>

              <View
                className="rounded-2xl p-4 flex-row justify-between items-center"
                style={{
                  backgroundColor: colors.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.03,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View>
                  <Text className="text-sm font-semibold text-foreground">Fullscreen Mode</Text>
                  <Text className="text-xs text-muted mt-1">Immersive focus experience</Text>
                </View>
                <Switch
                  value={fullscreen}
                  onValueChange={setFullscreen}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={fullscreen ? colors.primary : colors.muted}
                />
              </View>

              <View
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: colors.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.03,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <Text className="text-sm font-semibold text-foreground mb-3">Focus Level</Text>
                <View className="flex-row gap-2">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <Pressable
                      key={level}
                      className="flex-1 rounded-xl p-3 active:opacity-90"
                      style={{
                        backgroundColor: focusLevel === level ? colors.primary : colors.background,
                        borderWidth: focusLevel === level ? 0 : 1,
                        borderColor: colors.border,
                      }}
                      onPress={() => setFocusLevel(level)}
                    >
                      <Text
                        className={`text-center text-sm font-bold ${
                          focusLevel === level ? 'text-white' : 'text-foreground'
                        }`}
                      >
                        {level === 'low' ? '😴' : level === 'medium' ? '💪' : '🔥'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <Pressable
            className="rounded-2xl py-4 active:opacity-80"
            style={{
              backgroundColor: colors.surface,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.03,
              shadowRadius: 4,
              elevation: 1,
            }}
            onPress={resetTimer}
          >
            <Text className="text-center font-bold text-foreground">Reset Session</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
