import { ScrollView, Text, View, Pressable, Animated } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useStudy } from '@/lib/study-context';
import { GamificationEngine } from '@/lib/gamification-engine';
import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';

const BADGES = [
  { id: '1', name: 'First Flight', icon: '🦅', unlocked: true },
  { id: '2', name: 'Week Warrior', icon: '⚔️', unlocked: true },
  { id: '3', name: 'Century Club', icon: '💯', unlocked: false },
  { id: '4', name: 'Night Owl', icon: '🌙', unlocked: false },
  { id: '5', name: 'Speed Demon', icon: '⚡', unlocked: false },
  { id: '6', name: 'Consistency King', icon: '👑', unlocked: false },
];

export default function ProgressScreen() {
  const colors = useColors();
  const { userProgress, tasks } = useStudy();

  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const altitudePercentage = GamificationEngine.getAltitudePercentage(userProgress.xp);
  const xpToNextLevel = GamificationEngine.getXpToNextLevel(userProgress.xp);

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
            <View className="gap-3">
              {[
                { subject: 'Mathematics', progress: 75, color: colors.primary },
                { subject: 'Chemistry', progress: 60, color: colors.success },
                { subject: 'English', progress: 85, color: colors.accent },
              ].map((item) => (
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
          </View>

          {/* Badges */}
          <View className="mb-6">
            <Text className="text-base font-bold text-foreground dark:text-foreground-dark mb-3">Badges Earned</Text>
            <View className="flex-row flex-wrap gap-3">
              {BADGES.map((badge) => (
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
                    <Text className="text-3xl mb-1">{badge.icon}</Text>
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
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <View key={day} className="flex-1 items-center">
                    <View
                      className="w-full aspect-square rounded-xl mb-2"
                      style={{
                        backgroundColor:
                          index < 3
                            ? colors.success
                            : index < 5
                            ? colors.warning
                            : colors.border,
                      }}
                    />
                    <Text className="text-xs text-muted dark:text-muted-dark font-semibold">{day}</Text>
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
              {[
                { title: 'Master Calculus', progress: 70 },
                { title: 'Learn Spanish', progress: 45 },
                { title: 'Complete Python Course', progress: 90 },
              ].map((goal, index) => (
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
              ))}
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
