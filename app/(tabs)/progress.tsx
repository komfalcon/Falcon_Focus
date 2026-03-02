import { ScrollView, Text, View, Pressable, Animated } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useStudy } from '@/lib/study-context';
import { GamificationEngine } from '@/lib/gamification-engine';
import { useEffect, useRef, useMemo } from 'react';
import * as Haptics from 'expo-haptics';

const BADGE_DEFINITIONS = [
  { id: 'first_flight', name: 'First Flight', icon: '🦅' },
  { id: 'week_warrior', name: 'Week Warrior', icon: '⚔️' },
  { id: 'century_club', name: 'Century Club', icon: '💯' },
  { id: 'night_owl', name: 'Night Owl', icon: '🌙' },
  { id: 'speed_demon', name: 'Speed Demon', icon: '⚡' },
  { id: 'consistency_king', name: 'Consistency King', icon: '👑' },
];

export default function ProgressScreen() {
  const colors = useColors();
  const { userProgress, tasks, studySessions, goals } = useStudy();

  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const altitudePercentage = GamificationEngine.getAltitudePercentage(userProgress.xp);
  const xpToNextLevel = GamificationEngine.getXpToNextLevel(userProgress.xp);

  // Compute subject mastery from real study sessions
  const subjectMastery = useMemo(() => {
    const subjectHours: Record<string, number> = {};
    for (const session of studySessions) {
      if (session.subject) {
        const hours = session.duration / 60; // duration is in minutes, convert to hours
        subjectHours[session.subject] = (subjectHours[session.subject] || 0) + hours;
      }
    }
    const colorPalette = [colors.primary, colors.success, colors.accent, colors.warning, colors.error];
    return Object.entries(subjectHours).map(([subject, totalHours], idx) => ({
      subject,
      progress: Math.min(Math.round((totalHours / 10) * 100), 100),
      color: colorPalette[idx % colorPalette.length],
    }));
  }, [studySessions, colors]);

  // Compute real goals progress
  const goalsWithProgress = useMemo(() => {
    return goals.map((goal) => {
      const completedMilestones = goal.milestones.filter((m) => m.completed).length;
      const totalMilestones = goal.milestones.length;
      const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : (goal.completed ? 100 : 0);
      return { title: goal.title, progress };
    });
  }, [goals]);

  // Compute badge unlock states from real data
  const badges = useMemo(() => {
    const hasSession = studySessions.length > 0;
    const hasWeekStreak = userProgress.currentStreak >= 7;
    const hasCenturyHours = userProgress.totalStudyHours >= 100;
    const hasNightSession = studySessions.some((s) => {
      const hour = new Date(s.startedAt).getHours();
      return hour >= 22 || hour < 4;
    });
    const hasZeroDistractions = studySessions.some((s) => s.distractionsLogged === 0 && s.completedAt);
    const hasMonthStreak = userProgress.currentStreak >= 30;

    const unlockMap: Record<string, boolean> = {
      first_flight: hasSession,
      week_warrior: hasWeekStreak,
      century_club: hasCenturyHours,
      night_owl: hasNightSession,
      speed_demon: hasZeroDistractions,
      consistency_king: hasMonthStreak,
    };

    return BADGE_DEFINITIONS.map((b) => ({
      ...b,
      unlocked: unlockMap[b.id] ?? false,
    }));
  }, [studySessions, userProgress]);

  // Compute weekly activity from real sessions
  const weeklyActivity = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(now.getDate() + mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    return days.map((day, index) => {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + index);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const daySessions = studySessions.filter((s) => {
        const sessionDate = new Date(s.startedAt);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      });

      const totalMinutes = daySessions.reduce((sum, s) => sum + s.duration, 0);
      let color = colors.border; // no study
      if (totalMinutes >= 25) color = colors.success; // studied
      else if (totalMinutes > 0) color = colors.warning; // partial

      return { day, color };
    });
  }, [studySessions, colors]);

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

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          {/* Header */}
          <Text className="text-3xl font-bold text-foreground dark:text-foreground-dark mb-6 tracking-tight">Progress</Text>

          {/* Level Card */}
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
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>Current Level</Text>
                <Text className="text-3xl font-bold text-white mt-1">{userProgress.level}</Text>
              </View>
              <Animated.Text style={{ fontSize: 48, transform: [{ scale: breatheAnim }] }}>🦅</Animated.Text>
            </View>
            <View className="rounded-full h-2.5 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
              <View className="h-full rounded-full" style={{ width: `${altitudePercentage}%`, backgroundColor: colors.accent }} />
            </View>
            <Text className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>{userProgress.xp} / {userProgress.xp + xpToNextLevel} XP to next level</Text>
          </View>

          {/* Stats Grid */}
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
              <Text className="text-xs text-muted dark:text-muted-dark font-semibold mb-2">TOTAL STUDY</Text>
              <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">{userProgress.totalStudyHours}h</Text>
              <Text className="text-xs text-muted dark:text-muted-dark mt-1">hours</Text>
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
              <Text className="text-xs text-muted dark:text-muted-dark font-semibold mb-2">SESSIONS</Text>
              <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">{userProgress.totalSessions}</Text>
              <Text className="text-xs text-muted dark:text-muted-dark mt-1">completed</Text>
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
              <Text className="text-xs text-muted dark:text-muted-dark font-semibold mb-2">COMPLETION</Text>
              <Text className="text-2xl font-bold text-success dark:text-success-dark">{completionRate}%</Text>
              <Text className="text-xs text-muted dark:text-muted-dark mt-1">tasks done</Text>
            </View>
          </View>

          {/* Mastery Tracking */}
          <View className="mb-6">
            <Text className="text-base font-bold text-foreground dark:text-foreground-dark mb-3">Subject Mastery</Text>
            {subjectMastery.length === 0 ? (
              <View
                className="rounded-2xl p-4 items-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Text style={{ fontSize: 24, marginBottom: 8 }}>📚</Text>
                <Text className="text-sm text-center" style={{ color: colors.muted }}>
                  Complete study sessions to see subject mastery
                </Text>
              </View>
            ) : (
            <View className="gap-3">
              {subjectMastery.map((item) => (
                <View
                  key={item.subject}
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
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">{item.subject}</Text>
                    <Text className="text-xs font-bold text-foreground dark:text-foreground-dark">{item.progress}%</Text>
                  </View>
                  <View className="rounded-full h-2 overflow-hidden" style={{ backgroundColor: colors.border }}>
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${item.progress}%`, backgroundColor: item.color }}
                    />
                  </View>
                </View>
              ))}
            </View>
            )}
          </View>

          {/* Badges */}
          <View className="mb-6">
            <Text className="text-base font-bold text-foreground dark:text-foreground-dark mb-3">Badges Earned</Text>
            <View className="flex-row flex-wrap gap-3">
              {badges.map((badge) => (
                <Pressable
                  key={badge.id}
                  className="w-1/3 aspect-square items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: badge.unlocked ? colors.accent + '14' : colors.surface,
                    borderWidth: 1.5,
                    borderColor: badge.unlocked ? colors.accent + '40' : colors.border,
                    opacity: badge.unlocked ? 1 : 0.5,
                    shadowColor: badge.unlocked ? colors.accent : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: badge.unlocked ? 0.15 : 0.03,
                    shadowRadius: 6,
                    elevation: badge.unlocked ? 3 : 1,
                  }}
                  onPress={() => badge.unlocked && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <View className="items-center">
                    <Text className="text-3xl mb-1">{badge.unlocked ? badge.icon : '🔒'}</Text>
                    <Text className="text-xs font-bold text-foreground dark:text-foreground-dark text-center">{badge.name}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Weekly Heatmap */}
          <View className="mb-6">
            <Text className="text-base font-bold text-foreground dark:text-foreground-dark mb-3">Weekly Activity</Text>
            <View
              className="rounded-2xl p-4"
              style={{
                backgroundColor: colors.surface,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="flex-row justify-between gap-2">
                {weeklyActivity.map((item) => (
                  <View key={item.day} className="flex-1 items-center">
                    <View
                      className="w-full aspect-square rounded-xl mb-2"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />
                    <Text className="text-xs text-muted dark:text-muted-dark font-semibold">{item.day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Goals Summary */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base font-bold text-foreground dark:text-foreground-dark">Goals Progress</Text>
              <Pressable
                className="rounded-xl px-4 py-2 active:opacity-80"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-xs font-bold text-white">View All</Text>
              </Pressable>
            </View>

            <View className="gap-3">
              {goalsWithProgress.length === 0 ? (
                <View
                  className="rounded-2xl p-4 items-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text style={{ fontSize: 24, marginBottom: 8 }}>🎯</Text>
                  <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark mb-1">No goals set yet</Text>
                  <Text className="text-xs text-center" style={{ color: colors.muted }}>
                    Set your first study goal to track progress
                  </Text>
                </View>
              ) : (
              goalsWithProgress.map((goal, index) => (
                <View
                  key={index}
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
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">{goal.title}</Text>
                    <Text className="text-xs font-bold text-foreground dark:text-foreground-dark">{goal.progress}%</Text>
                  </View>
                  <View className="rounded-full h-2 overflow-hidden" style={{ backgroundColor: colors.border }}>
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${goal.progress}%`, backgroundColor: colors.primary }}
                    />
                  </View>
                </View>
              )))}
            </View>
          </View>

          {/* Flight Report */}
          <Pressable
            className="rounded-2xl p-4 active:opacity-80"
            style={{
              backgroundColor: colors.secondary + '12',
              borderWidth: 1,
              borderColor: colors.accent + '30',
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center gap-3">
              <Text className="text-lg">📊</Text>
              <View className="flex-1">
                <Text className="text-sm font-bold" style={{ color: colors.accent }}>Generate Flight Report</Text>
                <Text className="text-xs text-muted dark:text-muted-dark">Download detailed progress analysis</Text>
              </View>
              <Text className="text-lg text-muted dark:text-muted-dark">→</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
