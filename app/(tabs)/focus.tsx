import { ScrollView, Text, View, Pressable, Switch } from 'react-native';
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
      <ScreenContainer className="p-4 bg-gradient-to-b from-secondary to-primary">
        <View className="flex-1 items-center justify-center">
          <Text className="text-6xl mb-8">🦅</Text>
          <Text className="text-5xl font-bold text-white mb-4">{formatTime(timeRemaining)}</Text>
          <Text className="text-lg text-white/80 mb-8">
            {timerMode === 'work' ? 'Focus Time' : 'Break Time'}
          </Text>

          <View className="w-48 h-48 rounded-full bg-white/20 items-center justify-center mb-8 border-4 border-white/40">
            <View
              className="w-40 h-40 rounded-full bg-white/30 items-center justify-center"
              style={{ opacity: 0.5 + (soaringPercentage / 200) }}
            >
              <Text className="text-5xl">✨</Text>
            </View>
          </View>

          <View className="flex-row gap-4">
            <Pressable
              className="bg-white/20 rounded-lg px-6 py-3 active:opacity-80"
              onPress={pauseTimer}
            >
              <Text className="text-white font-semibold">Pause</Text>
            </Pressable>
            <Pressable
              className="bg-white rounded-lg px-6 py-3 active:opacity-80"
              onPress={completeSession}
            >
              <Text className="text-secondary font-semibold">Finish</Text>
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
          <Text className="text-3xl font-bold text-foreground mb-6">Focus</Text>

          <View className="flex-row gap-2 mb-6">
            <Pressable
              className={`flex-1 rounded-lg p-3 ${
                mode === 'pomodoro' ? 'bg-primary' : 'bg-surface border border-border'
              }`}
              onPress={() => setMode('pomodoro')}
            >
              <Text
                className={`text-center font-semibold text-sm ${
                  mode === 'pomodoro' ? 'text-white' : 'text-foreground'
                }`}
              >
                Pomodoro
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 rounded-lg p-3 ${
                mode === 'falcon_dive' ? 'bg-primary' : 'bg-surface border border-border'
              }`}
              onPress={() => setMode('falcon_dive')}
            >
              <Text
                className={`text-center font-semibold text-sm ${
                  mode === 'falcon_dive' ? 'text-white' : 'text-foreground'
                }`}
              >
                Falcon Dive
              </Text>
            </Pressable>
          </View>

          <View className="bg-gradient-to-r from-secondary to-primary rounded-lg p-8 mb-6 items-center border border-primary/30">
            <Text className="text-6xl font-bold text-white mb-2">{formatTime(timeRemaining)}</Text>
            <Text className="text-lg text-white/80">
              {timerMode === 'work' ? '🎯 Focus Time' : timerMode === 'break' ? '☕ Break Time' : 'Ready to Soar?'}
            </Text>
          </View>

          <View className="items-center mb-6">
            <View className="w-40 h-40 rounded-full bg-secondary/20 items-center justify-center border-4 border-secondary">
              <View
                className="w-32 h-32 rounded-full bg-secondary/40 items-center justify-center"
                style={{ opacity: 0.5 + (soaringPercentage / 200) }}
              >
                <Text className="text-4xl">🦅</Text>
              </View>
            </View>
            <Text className="text-xs text-muted mt-4">{Math.round(soaringPercentage)}% Soaring</Text>
          </View>

          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-2">SESSIONS</Text>
              <Text className="text-2xl font-bold text-foreground">{sessionsCompleted}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-2">DISTRACTIONS</Text>
              <Text className="text-2xl font-bold text-error">{distractions}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-2">FOCUS</Text>
              <Text className="text-2xl font-bold text-success">
                {focusLevel === 'high' ? '🔥' : focusLevel === 'medium' ? '💪' : '😴'}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3 mb-6">
            {timerMode === 'idle' ? (
              <Pressable
                className="flex-1 bg-primary rounded-lg p-4 active:opacity-80"
                onPress={startTimer}
              >
                <Text className="text-center font-semibold text-white">Start Focus</Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  className="flex-1 bg-surface rounded-lg p-4 border border-border active:opacity-80"
                  onPress={pauseTimer}
                >
                  <Text className="text-center font-semibold text-foreground">Pause</Text>
                </Pressable>
                <Pressable
                  className="flex-1 bg-primary rounded-lg p-4 active:opacity-80"
                  onPress={completeSession}
                >
                  <Text className="text-center font-semibold text-white">Finish</Text>
                </Pressable>
              </>
            )}
          </View>

          <Pressable
            className="bg-error/10 rounded-lg p-4 border border-error/20 mb-6 active:opacity-80"
            onPress={logDistraction}
          >
            <Text className="text-sm font-semibold text-error">+ Log Distraction ({distractions})</Text>
            <Text className="text-xs text-error/80 mt-1">Track interruptions during focus sessions</Text>
          </Pressable>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-3">Settings</Text>

            <View className="gap-3">
              <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
                <View>
                  <Text className="text-sm font-semibold text-foreground">Work Duration</Text>
                  <Text className="text-xs text-muted mt-1">{workDuration} minutes</Text>
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    className="bg-primary rounded px-3 py-1 active:opacity-80"
                    onPress={() => setWorkDuration(Math.max(5, workDuration - 5))}
                  >
                    <Text className="text-white font-semibold">−</Text>
                  </Pressable>
                  <Pressable
                    className="bg-primary rounded px-3 py-1 active:opacity-80"
                    onPress={() => setWorkDuration(Math.min(60, workDuration + 5))}
                  >
                    <Text className="text-white font-semibold">+</Text>
                  </Pressable>
                </View>
              </View>

              <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
                <View>
                  <Text className="text-sm font-semibold text-foreground">Break Duration</Text>
                  <Text className="text-xs text-muted mt-1">{breakDuration} minutes</Text>
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    className="bg-primary rounded px-3 py-1 active:opacity-80"
                    onPress={() => setBreakDuration(Math.max(1, breakDuration - 1))}
                  >
                    <Text className="text-white font-semibold">−</Text>
                  </Pressable>
                  <Pressable
                    className="bg-primary rounded px-3 py-1 active:opacity-80"
                    onPress={() => setBreakDuration(Math.min(15, breakDuration + 1))}
                  >
                    <Text className="text-white font-semibold">+</Text>
                  </Pressable>
                </View>
              </View>

              <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
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

              <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
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

              <View className="bg-surface rounded-lg p-4 border border-border">
                <Text className="text-sm font-semibold text-foreground mb-3">Focus Level</Text>
                <View className="flex-row gap-2">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <Pressable
                      key={level}
                      className={`flex-1 rounded-lg p-2 ${
                        focusLevel === level ? 'bg-primary' : 'bg-background border border-border'
                      }`}
                      onPress={() => setFocusLevel(level)}
                    >
                      <Text
                        className={`text-center text-xs font-semibold ${
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
            className="bg-surface rounded-lg p-4 border border-border active:opacity-80"
            onPress={resetTimer}
          >
            <Text className="text-center font-semibold text-foreground">Reset Session</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
