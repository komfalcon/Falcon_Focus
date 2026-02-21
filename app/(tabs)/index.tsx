import { ScrollView, Text, View, Pressable, RefreshControl } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useStudy } from '@/lib/study-context';
import { useState, useCallback, useEffect } from 'react';

import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { GamificationEngine } from '@/lib/gamification-engine';
import { BurnoutGuardian } from '@/lib/burnout-guardian';

const FALCON_TIPS = [
  'Your Chemistry kinetics is weak before exam — try this 25-min targeted dive',
  'You\'re crushing it! 7-day streak incoming. Keep the momentum.',
  'Energy is high today — perfect for deep focus sessions.',
  'Take a break! Your energy is declining. A 10-min walk helps.',
  'Review yesterday\'s notes before starting today\'s session.',
];

const DAILY_QUESTS = GamificationEngine.generateDailyQuests();

export default function HomeScreen() {
  const colors = useColors();
  const { tasks, userProgress, getAltitudePercentage, getStreakCount, energyLogs } = useStudy();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [quests, setQuests] = useState(DAILY_QUESTS);
  const [burnoutIndicators, setBurnoutIndicators] = useState(BurnoutGuardian.analyzeBurnoutRisk([]));
  const [energyForecast, setEnergyForecast] = useState(BurnoutGuardian.generateEnergyForecast([], 0));

  useFocusEffect(
    useCallback(() => {
      setCurrentTipIndex(Math.floor(Math.random() * FALCON_TIPS.length));
      // Update burnout indicators
      const formattedLogs = energyLogs.map(log => ({ level: log.level as any, timestamp: log.timestamp }));
      setBurnoutIndicators(BurnoutGuardian.analyzeBurnoutRisk(formattedLogs));
      setEnergyForecast(BurnoutGuardian.generateEnergyForecast(formattedLogs, tasks.length));
    }, [energyLogs, tasks])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      const formattedLogs = energyLogs.map(log => ({ level: (log.level as unknown as number) as any, timestamp: log.timestamp }));
      setBurnoutIndicators(BurnoutGuardian.analyzeBurnoutRisk(formattedLogs));
      setEnergyForecast(BurnoutGuardian.generateEnergyForecast(formattedLogs, tasks.length));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 1000);
  }, [energyLogs, tasks]);

  useEffect(() => {
    const formattedLogs = energyLogs.map(log => ({ level: (log.level as unknown as number) as any, timestamp: log.timestamp }));
    setBurnoutIndicators(BurnoutGuardian.analyzeBurnoutRisk(formattedLogs));
    setEnergyForecast(BurnoutGuardian.generateEnergyForecast(formattedLogs, tasks.length));
  }, [energyLogs, tasks]);

  const altitudePercentage = getAltitudePercentage();
  const streakCount = getStreakCount();
  const todayStudyHours = 3.4; // Mock data
  const energyLevel = 4; // Mock data (1-5)
  
  // Gamification metrics
  const altitudeLevel = GamificationEngine.getAltitudeLevel(userProgress.xp);
  const altitudePercentageXP = GamificationEngine.getAltitudePercentage(userProgress.xp);
  const xpToNextLevel = GamificationEngine.getXpToNextLevel(userProgress.xp);
  const soarOrGlide = BurnoutGuardian.getSoarOrGlideStatus(burnoutIndicators);

  const completeQuest = (questId: string) => {
    setQuests(quests.map(q => q.id === questId ? { ...q, completed: true, progress: q.target } : q));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="mb-8">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground">Falcon Focus</Text>
            <Text className="text-xs text-muted mt-1">By Korede Omotosho</Text>
          </View>

          {/* Altitude Meter - Gamification */}
          <View className="bg-gradient-to-r from-secondary to-primary rounded-lg p-6 mb-6 border border-primary/30">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-sm font-semibold text-white/80">Altitude</Text>
                <Text className="text-3xl font-bold text-white mt-1">{altitudeLevel}</Text>
              </View>
              <Text className="text-5xl">🦅</Text>
            </View>
            <View className="bg-white/20 rounded-full h-3 overflow-hidden mb-2">
              <View
                className="bg-white h-full rounded-full"
                style={{ width: `${altitudePercentageXP}%` }}
              />
            </View>
            <Text className="text-xs text-white/80">{userProgress.xp} / {userProgress.xp + xpToNextLevel} XP</Text>
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-3 mb-6">
            {/* Streak */}
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-2">STREAK</Text>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-2xl font-bold text-foreground">{streakCount}</Text>
                <Text className="text-lg">🔥</Text>
              </View>
              <Text className="text-xs text-muted mt-1">days</Text>
            </View>

            {/* Feathers/XP */}
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-2">FEATHERS</Text>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-2xl font-bold text-foreground">{Math.floor(userProgress.xp / 10)}</Text>
                <Text className="text-lg">🪶</Text>
              </View>
              <Text className="text-xs text-muted mt-1">earned</Text>
            </View>

            {/* Soar or Glide */}
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-2">STATUS</Text>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-2xl font-bold text-foreground">{soarOrGlide.status}</Text>
                <Text className="text-lg">{soarOrGlide.emoji}</Text>
              </View>
              <Text className="text-xs text-muted mt-1">{burnoutIndicators.status}</Text>
            </View>
          </View>

          {/* Soar or Glide Recommendation */}
          <View className={`rounded-lg p-4 mb-6 border ${
            soarOrGlide.status === 'Soar' 
              ? 'bg-secondary/10 border-secondary/30' 
              : 'bg-primary/10 border-primary/30'
          }`}>
            <Text className="text-sm font-semibold text-foreground mb-1">{soarOrGlide.emoji} {soarOrGlide.status} or Glide</Text>
            <Text className="text-xs text-muted">{soarOrGlide.message}</Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-6">
            <Pressable
              className="flex-1 bg-primary rounded-lg p-3 active:opacity-80"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text className="text-center font-semibold text-white text-sm">Start Focus</Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-surface rounded-lg p-3 border border-border active:opacity-80"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text className="text-center font-semibold text-foreground text-sm">Add Task</Text>
            </Pressable>
          </View>

          {/* Daily Quests */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-3">Daily Quests</Text>
            <View className="gap-2">
              {quests.map((quest) => (
                <Pressable
                  key={quest.id}
                  className={`rounded-lg p-3 border ${
                    quest.completed
                      ? 'bg-success/10 border-success/30'
                      : 'bg-surface border-border'
                  }`}
                  onPress={() => !quest.completed && completeQuest(quest.id)}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">{quest.title}</Text>
                      <Text className="text-xs text-muted mt-1">{quest.description}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs font-bold text-secondary">+{quest.reward} XP</Text>
                      {quest.completed && <Text className="text-lg">✓</Text>}
                    </View>
                  </View>
                  {!quest.completed && (
                    <View className="bg-background rounded-full h-1 mt-2 overflow-hidden">
                      <View
                        className="bg-secondary h-full"
                        style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                      />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Falcon Coach Tip */}
          <View className="bg-secondary/10 rounded-lg p-4 border border-secondary/30 mb-6">
            <View className="flex-row gap-3 mb-2">
              <Text className="text-2xl">🦅</Text>
              <Text className="text-sm font-semibold text-secondary flex-1">Falcon Coach Tip</Text>
            </View>
            <Text className="text-sm text-foreground leading-relaxed">
              {FALCON_TIPS[currentTipIndex]}
            </Text>
          </View>

          {/* Energy Forecast - Burnout Guardian */}
          <View className="bg-surface rounded-lg p-4 border border-border mb-6">
            <Text className="text-sm font-semibold text-foreground mb-3">Energy Forecast</Text>
            <View className={`rounded p-3 border ${
              burnoutIndicators.riskLevel === 'high'
                ? 'bg-error/10 border-error/20'
                : burnoutIndicators.riskLevel === 'medium'
                ? 'bg-warning/10 border-warning/20'
                : 'bg-success/10 border-success/20'
            }`}>
              <Text className={`text-xs font-semibold ${
                burnoutIndicators.riskLevel === 'high'
                  ? 'text-error'
                  : burnoutIndicators.riskLevel === 'medium'
                  ? 'text-warning'
                  : 'text-success'
              }`}>
                {energyForecast.recommendation}
              </Text>
            </View>
            <View className="flex-row gap-3 mt-3">
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Today</Text>
                <View className="flex-row gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <View
                      key={i}
                      className={`flex-1 h-2 rounded-full ${
                        i <= energyForecast.today ? 'bg-success' : 'bg-border'
                      }`}
                    />
                  ))}
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Tomorrow</Text>
                <View className="flex-row gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <View
                      key={i}
                      className={`flex-1 h-2 rounded-full ${
                        i <= energyForecast.tomorrow ? 'bg-secondary' : 'bg-border'
                      }`}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Today's Schedule */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-3">Today's Schedule</Text>
            <View className="gap-2">
              <View className="bg-surface rounded-lg p-3 border border-border">
                <Text className="text-sm font-semibold text-foreground">Mathematics Lecture</Text>
                <Text className="text-xs text-muted mt-1">10:00 AM - 11:30 AM</Text>
              </View>
              <View className="bg-surface rounded-lg p-3 border border-border">
                <Text className="text-sm font-semibold text-foreground">Chemistry Study</Text>
                <Text className="text-xs text-muted mt-1">2:00 PM - 3:30 PM</Text>
              </View>
              <View className="bg-surface rounded-lg p-3 border border-border">
                <Text className="text-sm font-semibold text-foreground">Review Session</Text>
                <Text className="text-xs text-muted mt-1">5:00 PM - 6:00 PM</Text>
              </View>
            </View>
          </View>

          {/* Motivational Quote */}
          <View className="bg-secondary/5 rounded-lg p-4 border border-secondary/20 items-center">
            <Text className="text-sm italic text-foreground text-center leading-relaxed">
              "Every soar begins with a single flap of the wings."
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
