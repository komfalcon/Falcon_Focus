import { ScrollView, Text, View, Pressable, RefreshControl, Animated } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useStudy } from '@/lib/study-context';
import { useState, useCallback, useEffect, useRef } from 'react';

import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
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
  const router = useRouter();
  const { tasks, userProgress, getAltitudePercentage, getStreakCount, energyLogs } = useStudy();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [quests, setQuests] = useState(DAILY_QUESTS);
  const [burnoutIndicators, setBurnoutIndicators] = useState(BurnoutGuardian.analyzeBurnoutRisk([]));
  const [energyForecast, setEnergyForecast] = useState(BurnoutGuardian.generateEnergyForecast([], 0));

  // Breathing animation for falcon mascot
  const breatheAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
        Animated.timing(breatheAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breatheAnim]);

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
            <Text className="text-3xl font-bold text-foreground tracking-tight">Falcon Focus</Text>
            <Text className="text-xs text-muted mt-1">By Korede Omotosho</Text>
          </View>

          {/* Altitude Meter - Gamification */}
          <View
            className="rounded-2xl p-6 mb-6 overflow-hidden"
            style={{
              backgroundColor: colors.secondary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.18,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>Altitude</Text>
                <Text className="text-3xl font-bold text-white mt-1">{altitudeLevel}</Text>
              </View>
              <Animated.Text style={{ fontSize: 48, transform: [{ scale: breatheAnim }] }}>🦅</Animated.Text>
            </View>
            <View className="rounded-full h-3 overflow-hidden mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
              <View
                className="h-full rounded-full"
                style={{ width: `${altitudePercentageXP}%`, backgroundColor: colors.accent }}
              />
            </View>
            <Text className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{userProgress.xp} / {userProgress.xp + xpToNextLevel} XP</Text>
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-3 mb-6">
            {/* Streak */}
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
              <Text className="text-xs text-muted font-semibold mb-2">STREAK</Text>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-2xl font-bold text-foreground">{streakCount}</Text>
                <Text className="text-lg">🔥</Text>
              </View>
              <Text className="text-xs text-muted mt-1">days</Text>
            </View>

            {/* Feathers/XP */}
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
              <Text className="text-xs text-muted font-semibold mb-2">FEATHERS</Text>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-2xl font-bold text-foreground">{Math.floor(userProgress.xp / 10)}</Text>
                <Text className="text-lg">🪶</Text>
              </View>
              <Text className="text-xs text-muted mt-1">earned</Text>
            </View>

            {/* Soar or Glide */}
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
              <Text className="text-xs text-muted font-semibold mb-2">STATUS</Text>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-2xl font-bold text-foreground">{soarOrGlide.status}</Text>
                <Text className="text-lg">{soarOrGlide.emoji}</Text>
              </View>
              <Text className="text-xs text-muted mt-1">{burnoutIndicators.status}</Text>
            </View>
          </View>

          {/* Soar or Glide Recommendation */}
          <View
            className="rounded-2xl p-4 mb-6"
            style={{
              backgroundColor: soarOrGlide.status === 'Soar' ? colors.secondary + '14' : colors.primary + '14',
              borderWidth: 1,
              borderColor: soarOrGlide.status === 'Soar' ? colors.secondary + '30' : colors.primary + '30',
            }}
          >
            <Text className="text-sm font-semibold text-foreground mb-1">{soarOrGlide.emoji} {soarOrGlide.status} or Glide</Text>
            <Text className="text-xs text-muted leading-relaxed">{soarOrGlide.message}</Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-6">
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
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/focus');
              }}
            >
              <Text className="text-center font-bold text-white text-base">Start Focus</Text>
            </Pressable>
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
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/planner');
              }}
            >
              <Text className="text-center font-bold text-foreground text-base">Add Task</Text>
            </Pressable>
          </View>

          {/* Daily Quests */}
          <View className="mb-6">
            <Text className="text-base font-bold text-foreground mb-3">Daily Quests</Text>
            <View className="gap-3">
              {quests.map((quest) => (
                <Pressable
                  key={quest.id}
                  className="rounded-2xl p-4 active:opacity-90"
                  style={{
                    backgroundColor: quest.completed ? colors.success + '12' : colors.surface,
                    borderWidth: 1,
                    borderColor: quest.completed ? colors.success + '30' : colors.border,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.03,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                  onPress={() => !quest.completed && completeQuest(quest.id)}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">{quest.title}</Text>
                      <Text className="text-xs text-muted mt-1">{quest.description}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs font-bold" style={{ color: colors.accent }}>+{quest.reward} XP</Text>
                      {quest.completed && <Text className="text-lg mt-1">✓</Text>}
                    </View>
                  </View>
                  {!quest.completed && (
                    <View className="rounded-full h-1.5 mt-3 overflow-hidden" style={{ backgroundColor: colors.border }}>
                      <View
                        className="h-full rounded-full"
                        style={{ width: `${(quest.progress / quest.target) * 100}%`, backgroundColor: colors.primary }}
                      />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Falcon Coach Tip */}
          <View
            className="rounded-2xl p-4 mb-6"
            style={{
              backgroundColor: colors.secondary + '10',
              borderWidth: 1,
              borderColor: colors.secondary + '25',
            }}
          >
            <View className="flex-row gap-3 mb-2">
              <Animated.Text style={{ fontSize: 24, transform: [{ scale: breatheAnim }] }}>🦅</Animated.Text>
              <Text className="text-sm font-bold flex-1" style={{ color: colors.accent }}>Falcon Coach Tip</Text>
            </View>
            <Text className="text-sm text-foreground leading-relaxed">
              {FALCON_TIPS[currentTipIndex]}
            </Text>
          </View>

          {/* Energy Forecast - Burnout Guardian */}
          <View
            className="rounded-2xl p-4 mb-6"
            style={{
              backgroundColor: colors.surface,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text className="text-base font-bold text-foreground mb-3">Energy Forecast</Text>
            <View
              className="rounded-xl p-3"
              style={{
                backgroundColor:
                  burnoutIndicators.riskLevel === 'high'
                    ? colors.error + '12'
                    : burnoutIndicators.riskLevel === 'medium'
                    ? colors.warning + '12'
                    : colors.success + '12',
                borderWidth: 1,
                borderColor:
                  burnoutIndicators.riskLevel === 'high'
                    ? colors.error + '25'
                    : burnoutIndicators.riskLevel === 'medium'
                    ? colors.warning + '25'
                    : colors.success + '25',
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{
                  color:
                    burnoutIndicators.riskLevel === 'high'
                      ? colors.error
                      : burnoutIndicators.riskLevel === 'medium'
                      ? colors.warning
                      : colors.success,
                }}
              >
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
                      className="flex-1 h-2 rounded-full"
                      style={{ backgroundColor: i <= energyForecast.today ? colors.success : colors.border }}
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
                      className="flex-1 h-2 rounded-full"
                      style={{ backgroundColor: i <= energyForecast.tomorrow ? colors.primary : colors.border }}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Today's Schedule */}
          <View className="mb-6">
            <Text className="text-base font-bold text-foreground mb-3">Today's Schedule</Text>
            <View className="gap-3">
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
                <Text className="text-sm font-semibold text-foreground">Mathematics Lecture</Text>
                <Text className="text-xs text-muted mt-1">10:00 AM - 11:30 AM</Text>
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
                <Text className="text-sm font-semibold text-foreground">Chemistry Study</Text>
                <Text className="text-xs text-muted mt-1">2:00 PM - 3:30 PM</Text>
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
                <Text className="text-sm font-semibold text-foreground">Review Session</Text>
                <Text className="text-xs text-muted mt-1">5:00 PM - 6:00 PM</Text>
              </View>
            </View>
          </View>

          {/* Motivational Quote */}
          <View
            className="rounded-2xl p-5 items-center"
            style={{
              backgroundColor: colors.secondary + '08',
              borderWidth: 1,
              borderColor: colors.accent + '20',
            }}
          >
            <Text className="text-sm italic text-foreground text-center leading-relaxed">
              "Every soar begins with a single flap of the wings."
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
