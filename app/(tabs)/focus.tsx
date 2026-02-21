import { ScrollView, Text, View, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';

export default function FocusScreen() {
  const colors = useColors();
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'dive'>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground mb-1">Focus</Text>
            <Text className="text-xs text-muted">Deep work sessions</Text>
          </View>

          {/* Mode Toggle */}
          <View className="flex-row gap-2 mb-6">
            <Pressable
              className={`flex-1 rounded-lg p-3 active:opacity-80 ${
                timerMode === 'pomodoro' ? 'bg-primary' : 'bg-surface border border-border'
              }`}
              onPress={() => setTimerMode('pomodoro')}
            >
              <Text
                className={`text-sm font-semibold text-center ${
                  timerMode === 'pomodoro' ? 'text-white' : 'text-foreground'
                }`}
              >
                Pomodoro
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 rounded-lg p-3 active:opacity-80 ${
                timerMode === 'dive' ? 'bg-primary' : 'bg-surface border border-border'
              }`}
              onPress={() => setTimerMode('dive')}
            >
              <Text
                className={`text-sm font-semibold text-center ${
                  timerMode === 'dive' ? 'text-white' : 'text-foreground'
                }`}
              >
                Falcon Dive
              </Text>
            </Pressable>
          </View>

          {/* Timer Display */}
          <View className="bg-gradient-to-b from-secondary to-primary rounded-2xl p-8 mb-6 items-center justify-center">
            <Text className="text-6xl font-bold text-white mb-2">25:00</Text>
            <Text className="text-lg text-white/80">
              {timerMode === 'pomodoro' ? 'Focus Session' : 'Falcon Dive'}
            </Text>
          </View>

          {/* Control Buttons */}
          <View className="flex-row gap-3 mb-6">
            <Pressable
              className="flex-1 bg-primary rounded-lg p-4 active:opacity-80"
              onPress={() => setIsRunning(!isRunning)}
            >
              <Text className="text-center font-semibold text-white">
                {isRunning ? 'Pause' : 'Start'}
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-surface rounded-lg p-4 border border-border active:opacity-80"
              onPress={() => {}}
            >
              <Text className="text-center font-semibold text-foreground">Reset</Text>
            </Pressable>
          </View>

          {/* Session Info */}
          <View className="bg-surface rounded-lg p-4 mb-6 border border-border">
            <Text className="text-sm font-semibold text-foreground mb-3">Session Info</Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Subject</Text>
                <Text className="text-sm font-semibold text-foreground">Mathematics</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Focus Level</Text>
                <Text className="text-sm font-semibold text-accent">High 🔥</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Distractions Logged</Text>
                <Text className="text-sm font-semibold text-foreground">0</Text>
              </View>
            </View>
          </View>

          {/* Visual Soaring Circle */}
          <View className="bg-accent/10 rounded-lg p-6 border border-accent items-center justify-center mb-6">
            <View className="w-32 h-32 rounded-full border-2 border-accent items-center justify-center mb-4">
              <Text className="text-5xl">🦅</Text>
            </View>
            <Text className="text-sm text-accent font-semibold text-center">
              Soaring Progress
            </Text>
          </View>

          {/* Ambient Sounds */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-sm font-semibold text-foreground mb-3">Ambient Sounds</Text>
            <View className="flex-row gap-2">
              <Pressable className="flex-1 bg-primary/10 rounded-lg p-3 active:opacity-80 border border-primary">
                <Text className="text-xs font-semibold text-primary text-center">🎵 Rain</Text>
              </Pressable>
              <Pressable className="flex-1 bg-border rounded-lg p-3 active:opacity-80">
                <Text className="text-xs font-semibold text-muted text-center">🎵 Cafe</Text>
              </Pressable>
              <Pressable className="flex-1 bg-border rounded-lg p-3 active:opacity-80">
                <Text className="text-xs font-semibold text-muted text-center">🎵 Forest</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
