import { ScrollView, Text, View, Pressable, RefreshControl } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useStudy } from '@/lib/study-context';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GamificationEngine, Quest } from '@/lib/gamification-engine';
import { BurnoutGuardian, EnergyLevel } from '@/lib/burnout-guardian';
import { SkeletonCard, SkeletonStatCard } from '@/components/skeleton';
import { EmptyState } from '@/components/empty-state';

const FALCON_TIPS = [
  'Your Chemistry kinetics is weak before exam — try this 25-min targeted dive.',
  "You're crushing it! 7-day streak incoming. Keep the momentum.",
  'Energy is high today — perfect for deep focus sessions.',
  'Take a break! Your energy is declining. A 10-min walk helps.',
  "Review yesterday's notes before starting today's session.",
];

const QUEST_COLORS = ['#0a7ea4', '#FFB81C', '#e74c3c', '#2ecc71', '#9b59b6'];

const INITIAL_QUESTS = GamificationEngine.generateDailyQuests();

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${suffix}`;
}

function getEnergyEmoji(level: number): string {
  if (level >= 4) return '🔋';
  if (level === 3) return '⚡';
  return '🪫';
}

function getEnergyLabel(level: number): string {
  if (level >= 4) return 'High';
  if (level === 3) return 'Moderate';
  if (level === 2) return 'Low';
  return 'Critical';
}

function getQuestResetCountdown(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const {
    tasks,
    userProgress,
    getAltitudePercentage,
    getStreakCount,
    energyLogs,
    studyBlocks,
  } = useStudy();

  const [refreshing, setRefreshing] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [burnoutIndicators, setBurnoutIndicators] = useState(
    BurnoutGuardian.analyzeBurnoutRisk([]),
  );
  const [energyForecast, setEnergyForecast] = useState(
    BurnoutGuardian.generateEnergyForecast([], 0),
  );

  // Pulsing falcon animation with Reanimated
  const falconScale = useSharedValue(1);
  useEffect(() => {
    falconScale.value = withRepeat(
      withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [falconScale]);

  const falconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: falconScale.value }],
  }));

  // Format energy logs for BurnoutGuardian
  const formattedLogs = useMemo(
    () =>
      energyLogs.map((log) => ({
        level: log.level as EnergyLevel,
        timestamp: log.timestamp,
      })),
    [energyLogs],
  );

  useFocusEffect(
    useCallback(() => {
      setCurrentTipIndex(Math.floor(Math.random() * FALCON_TIPS.length));
      setBurnoutIndicators(BurnoutGuardian.analyzeBurnoutRisk(formattedLogs));
      setEnergyForecast(
        BurnoutGuardian.generateEnergyForecast(formattedLogs, tasks.length),
      );
    }, [formattedLogs, tasks.length]),
  );

  useEffect(() => {
    setBurnoutIndicators(BurnoutGuardian.analyzeBurnoutRisk(formattedLogs));
    setEnergyForecast(
      BurnoutGuardian.generateEnergyForecast(formattedLogs, tasks.length),
    );
  }, [formattedLogs, tasks.length]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setBurnoutIndicators(BurnoutGuardian.analyzeBurnoutRisk(formattedLogs));
      setEnergyForecast(
        BurnoutGuardian.generateEnergyForecast(formattedLogs, tasks.length),
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 1000);
  }, [formattedLogs, tasks.length]);

  // Gamification metrics
  const streakCount = getStreakCount();
  const altitudeLevel = GamificationEngine.getAltitudeLevel(userProgress.xp);
  const altitudePercentageXP = GamificationEngine.getAltitudePercentage(
    userProgress.xp,
  );
  const xpToNextLevel = GamificationEngine.getXpToNextLevel(userProgress.xp);
  const totalXpForBar = userProgress.xp + xpToNextLevel;
  const soarOrGlide = BurnoutGuardian.getSoarOrGlideStatus(burnoutIndicators);
  const isSoaring = soarOrGlide.status === 'Soar';

  // Estimate days to level up (rough: 50 XP/day average)
  const daysToLevelUp = Math.max(1, Math.ceil(xpToNextLevel / 50));

  // Today's study blocks
  const todayDow = new Date().getDay();
  const todayBlocks = useMemo(
    () =>
      studyBlocks
        .filter((b) => b.dayOfWeek === todayDow)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [studyBlocks, todayDow],
  );

  const completeQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) =>
        q.id === questId ? { ...q, completed: true, progress: q.target } : q,
      ),
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const refreshTip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentTipIndex((prev) => (prev + 1) % FALCON_TIPS.length);
  };

  // Energy color helper
  const energyColor = (level: number): string => {
    if (level >= 4) return colors.success;
    if (level === 3) return colors.warning;
    return colors.error;
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ─── 1. Hero Section ─── */}
        <View
          className="rounded-2xl p-6 mx-4 mt-4 mb-4 overflow-hidden"
          style={{ backgroundColor: colors.secondary }}
        >
          {/* Teal tint overlay */}
          <View
            className="absolute inset-0"
            style={{ backgroundColor: colors.primary, opacity: 0.15 }}
          />

          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text
                className="text-sm font-semibold"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                Altitude
              </Text>
              <Text className="text-3xl font-bold mt-1" style={{ color: '#fff' }}>
                {altitudeLevel}
              </Text>
            </View>
            <Animated.View style={falconAnimatedStyle}>
              <Text style={{ fontSize: 48 }}>🦅</Text>
            </Animated.View>
          </View>

          {/* XP progress bar */}
          <View
            className="rounded-full h-3 overflow-hidden mb-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${altitudePercentageXP}%`,
                backgroundColor: colors.primary,
              }}
            />
          </View>
          <Text className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {userProgress.xp} / {totalXpForBar} XP
          </Text>
          <Text className="text-xs mt-1" style={{ color: colors.muted }}>
            Level up in ~{daysToLevelUp} day{daysToLevelUp !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* ─── 2. Metrics Row ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          className="mb-4"
        >
          {refreshing ? (
            <>
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </>
          ) : (
            <>
              {/* Streak */}
              <View
                className="rounded-2xl p-3 items-center justify-center"
                style={{
                  width: 100,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 22 }}>🔥</Text>
                <Text
                  className="text-xl font-bold mt-1"
                  style={{ color: colors.foreground }}
                >
                  {streakCount}
                </Text>
                <Text style={{ fontSize: 11, color: colors.muted }}>Streak</Text>
              </View>

              {/* Feathers */}
              <View
                className="rounded-2xl p-3 items-center justify-center"
                style={{
                  width: 100,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 22 }}>🪶</Text>
                <Text
                  className="text-xl font-bold mt-1"
                  style={{ color: colors.foreground }}
                >
                  {Math.floor(userProgress.xp / 10)}
                </Text>
                <Text style={{ fontSize: 11, color: colors.muted }}>Feathers</Text>
              </View>

              {/* Status */}
              <View
                className="rounded-2xl p-3 items-center justify-center"
                style={{
                  width: 100,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 22 }}>⚡</Text>
                <Text
                  className="text-xl font-bold mt-1"
                  style={{ color: colors.foreground }}
                >
                  {soarOrGlide.status}
                </Text>
                <Text style={{ fontSize: 11, color: colors.muted }}>Status</Text>
              </View>
            </>
          )}
        </ScrollView>

        {/* ─── 3. Soar or Glide Card ─── */}
        <View
          className="rounded-2xl p-5 mx-4 mb-4"
          style={{
            backgroundColor: isSoaring ? colors.primary : colors.secondary,
          }}
        >
          <View className="flex-row items-center mb-2">
            <Text style={{ fontSize: 24 }}>{isSoaring ? '🦅' : '🕊️'}</Text>
            <Text
              className="text-lg font-bold ml-2"
              style={{ color: isSoaring ? '#fff' : colors.muted }}
            >
              {isSoaring ? 'Soaring' : 'Gliding'}
            </Text>
          </View>
          <Text
            className="text-sm leading-relaxed mb-3"
            style={{ color: isSoaring ? 'rgba(255,255,255,0.9)' : colors.muted }}
          >
            {soarOrGlide.message}
          </Text>
          <Pressable
            className="rounded-xl py-2.5 px-4 self-start active:opacity-80"
            style={{
              backgroundColor: isSoaring
                ? 'rgba(255,255,255,0.2)'
                : colors.primary,
            }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/energy' as never);
            }}
          >
            <Text className="text-sm font-semibold" style={{ color: '#fff' }}>
              Log Energy
            </Text>
          </Pressable>
        </View>

        {/* ─── 4. Daily Quests Section ─── */}
        <View className="mx-4 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold" style={{ color: colors.foreground }}>
              Daily Quests
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              Reset in {getQuestResetCountdown()}
            </Text>
          </View>

          {refreshing ? (
            <View className="gap-3">
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <View className="gap-3">
              {quests.map((quest, idx) => {
                const dotColor = QUEST_COLORS[idx % QUEST_COLORS.length];
                return (
                  <Pressable
                    key={quest.id}
                    className="rounded-2xl p-4 active:opacity-90"
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      opacity: quest.completed ? 0.6 : 1,
                    }}
                    onPress={() => {
                      if (!quest.completed) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        completeQuest(quest.id);
                      }
                    }}
                  >
                    <View className="flex-row items-center">
                      {/* Colored circle */}
                      <View
                        className="rounded-full mr-3 items-center justify-center"
                        style={{
                          width: 32,
                          height: 32,
                          backgroundColor: quest.completed
                            ? colors.success
                            : dotColor,
                        }}
                      >
                        {quest.completed ? (
                          <Text
                            className="text-sm font-bold"
                            style={{ color: '#fff' }}
                          >
                            ✓
                          </Text>
                        ) : (
                          <Text
                            className="text-xs font-bold"
                            style={{ color: '#fff' }}
                          >
                            {quest.progress}/{quest.target}
                          </Text>
                        )}
                      </View>

                      <View className="flex-1">
                        <Text
                          className="text-sm font-semibold"
                          style={{ color: colors.foreground }}
                        >
                          {quest.title}
                        </Text>
                        <Text
                          className="text-xs mt-0.5"
                          style={{ color: colors.muted }}
                        >
                          {quest.description}
                        </Text>
                      </View>

                      {/* XP badge pill */}
                      <View
                        className="rounded-full px-2.5 py-1 ml-2"
                        style={{ backgroundColor: colors.accent + '22' }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: colors.accent }}
                        >
                          +{quest.reward} XP
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* ─── 5. Falcon Coach Tip Card ─── */}
        <View
          className="rounded-2xl p-4 mx-4 mb-4"
          style={{
            backgroundColor: colors.accent + '1A',
            borderWidth: 1,
            borderColor: colors.accent + '4D',
          }}
        >
          {/* Refresh tip button – top right */}
          <Pressable
            className="absolute top-3 right-3 rounded-full items-center justify-center active:opacity-70"
            style={{
              width: 30,
              height: 30,
              backgroundColor: colors.accent + '22',
            }}
            onPress={refreshTip}
          >
            <Text style={{ fontSize: 14 }}>🔄</Text>
          </Pressable>

          <View className="flex-row items-center mb-2 pr-8">
            <Text style={{ fontSize: 24 }}>🦅</Text>
            <Text
              className="text-sm font-bold ml-2"
              style={{ color: colors.accent }}
            >
              Falcon Coach Tip
            </Text>
          </View>
          <Text
            className="text-sm leading-relaxed mb-2"
            style={{ color: colors.foreground }}
          >
            {FALCON_TIPS[currentTipIndex]}
          </Text>
          <Pressable
            className="self-start active:opacity-70"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/focus' as never);
            }}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
              Act on this →
            </Text>
          </Pressable>
        </View>

        {/* ─── 6. Today's Schedule ─── */}
        <View className="mx-4 mb-4">
          <Text
            className="text-base font-bold mb-3"
            style={{ color: colors.foreground }}
          >
            {"Today's Schedule"}
          </Text>

          {refreshing ? (
            <View className="gap-3">
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : todayBlocks.length === 0 ? (
            <EmptyState
              emoji="📅"
              title="No sessions today"
              subtitle="Add study blocks to fill your schedule."
              actionLabel="Add Session"
              onAction={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/planner');
              }}
            />
          ) : (
            <View>
              {todayBlocks.map((block, idx) => (
                <View key={block.id} className="flex-row mb-3">
                  {/* Timeline line */}
                  <View className="items-center mr-3" style={{ width: 20 }}>
                    <View
                      className="rounded-full"
                      style={{
                        width: 10,
                        height: 10,
                        backgroundColor: block.color || colors.primary,
                        marginTop: 6,
                      }}
                    />
                    {idx < todayBlocks.length - 1 && (
                      <View
                        className="flex-1"
                        style={{
                          width: 2,
                          backgroundColor: colors.border,
                          marginTop: 4,
                        }}
                      />
                    )}
                  </View>

                  {/* Session card */}
                  <View
                    className="flex-1 rounded-2xl p-4"
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: colors.foreground }}
                    >
                      {block.title}
                    </Text>
                    <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                      {formatTime(block.startTime)} – {formatTime(block.endTime)}
                    </Text>
                    {block.subject ? (
                      <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
                        {block.subject}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}

              {/* Add Session ghost button */}
              <Pressable
                className="rounded-2xl py-3 mt-1 items-center active:opacity-70"
                style={{ borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/planner');
                }}
              >
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                  + Add Session
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* ─── 7. Energy Forecast Row ─── */}
        <View className="flex-row gap-3 mx-4 mb-6">
          {/* Today */}
          <View
            className="flex-1 rounded-2xl p-4"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-xs font-semibold mb-2" style={{ color: colors.muted }}>
              Today
            </Text>
            <Text style={{ fontSize: 28 }}>{getEnergyEmoji(energyForecast.today)}</Text>
            <Text
              className="text-sm font-bold mt-1"
              style={{ color: energyColor(energyForecast.today) }}
            >
              {getEnergyLabel(energyForecast.today)}
            </Text>
            <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
              Energy {energyForecast.today}/5
            </Text>
          </View>

          {/* Tomorrow */}
          <View
            className="flex-1 rounded-2xl p-4"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-xs font-semibold mb-2" style={{ color: colors.muted }}>
              Tomorrow
            </Text>
            <Text style={{ fontSize: 28 }}>
              {getEnergyEmoji(energyForecast.tomorrow)}
            </Text>
            <Text
              className="text-sm font-bold mt-1"
              style={{ color: energyColor(energyForecast.tomorrow) }}
            >
              {getEnergyLabel(energyForecast.tomorrow)}
            </Text>
            <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
              Energy {energyForecast.tomorrow}/5
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
