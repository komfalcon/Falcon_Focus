import { ScrollView, Text, View, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useStudy } from '@/lib/study-context';
import { GamificationEngine } from '@/lib/gamification-engine';
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

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          {/* Header */}
          <Text className="text-3xl font-bold text-foreground mb-6">Progress</Text>

          {/* Level Card */}
          <View className="bg-gradient-to-r from-secondary to-primary rounded-lg p-6 mb-6 border border-primary/30">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-sm font-semibold text-white/80">Current Level</Text>
                <Text className="text-3xl font-bold text-white mt-1">{userProgress.level}</Text>
              </View>
              <Text className="text-5xl">🦅</Text>
            </View>
            <View className="bg-white/20 rounded-full h-2 overflow-hidden">
              <View className="bg-white h-full rounded-full" style={{ width: `${altitudePercentage}%` }} />
            </View>
            <Text className="text-xs text-white/80 mt-2">{userProgress.xp} / {userProgress.xp + xpToNextLevel} XP to next level</Text>
          </View>

          {/* Stats Grid */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-2">TOTAL STUDY</Text>
              <Text className="text-2xl font-bold text-foreground">{userProgress.totalStudyHours}h</Text>
              <Text className="text-xs text-muted mt-1">hours</Text>
            </View>

            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-2">SESSIONS</Text>
              <Text className="text-2xl font-bold text-foreground">{userProgress.totalSessions}</Text>
              <Text className="text-xs text-muted mt-1">completed</Text>
            </View>

            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-2">COMPLETION</Text>
              <Text className="text-2xl font-bold text-success">{completionRate}%</Text>
              <Text className="text-xs text-muted mt-1">tasks done</Text>
            </View>
          </View>

          {/* Mastery Tracking */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-3">Subject Mastery</Text>
            <View className="gap-3">
              {[
                { subject: 'Mathematics', progress: 75, color: '#0a7ea4' },
                { subject: 'Chemistry', progress: 60, color: '#22C55E' },
                { subject: 'English', progress: 85, color: '#F59E0B' },
              ].map((item) => (
                <View key={item.subject} className="bg-surface rounded-lg p-3 border border-border">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm font-semibold text-foreground">{item.subject}</Text>
                    <Text className="text-xs font-bold text-foreground">{item.progress}%</Text>
                  </View>
                  <View className="bg-background rounded-full h-2 overflow-hidden">
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
            <Text className="text-sm font-semibold text-foreground mb-3">Badges Earned</Text>
            <View className="flex-row flex-wrap gap-2">
              {BADGES.map((badge) => (
                <Pressable
                  key={badge.id}
                  className={`w-1/3 aspect-square items-center justify-center rounded-lg border ${
                    badge.unlocked
                      ? 'bg-secondary/10 border-secondary/30'
                      : 'bg-surface border-border opacity-50'
                  }`}
                  onPress={() => badge.unlocked && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <View className="items-center">
                    <Text className="text-3xl mb-1">{badge.icon}</Text>
                    <Text className="text-xs font-semibold text-foreground text-center">{badge.name}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Weekly Heatmap */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-3">Weekly Activity</Text>
            <View className="bg-surface rounded-lg p-4 border border-border">
              <View className="flex-row justify-between gap-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <View key={day} className="flex-1 items-center">
                    <View
                      className="w-full aspect-square rounded-lg mb-2"
                      style={{
                        backgroundColor:
                          index < 3
                            ? '#22C55E'
                            : index < 5
                            ? '#F59E0B'
                            : '#E5E7EB',
                      }}
                    />
                    <Text className="text-xs text-muted">{day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Goals Summary */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-semibold text-foreground">Goals Progress</Text>
              <Pressable className="bg-primary rounded-lg px-3 py-1 active:opacity-80">
                <Text className="text-xs font-semibold text-white">View All</Text>
              </Pressable>
            </View>

            <View className="gap-2">
              {[
                { title: 'Master Calculus', progress: 70 },
                { title: 'Learn Spanish', progress: 45 },
                { title: 'Complete Python Course', progress: 90 },
              ].map((goal, index) => (
                <View key={index} className="bg-surface rounded-lg p-3 border border-border">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm font-semibold text-foreground">{goal.title}</Text>
                    <Text className="text-xs font-bold text-foreground">{goal.progress}%</Text>
                  </View>
                  <View className="bg-background rounded-full h-2 overflow-hidden">
                    <View
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Flight Report */}
          <Pressable className="bg-secondary/10 rounded-lg p-4 border border-secondary/30 active:opacity-80">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg">📊</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-secondary">Generate Flight Report</Text>
                <Text className="text-xs text-muted">Download detailed progress analysis</Text>
              </View>
              <Text className="text-lg">→</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
