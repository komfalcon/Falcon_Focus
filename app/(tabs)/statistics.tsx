import { View, Text, ScrollView, Dimensions } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useStudy } from '@/lib/study-context';
import { useColors } from '@/hooks/use-colors';

export default function StatisticsScreen() {
  const { getStatistics } = useStudy();
  const colors = useColors();
  const stats = getStatistics();

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32;
  const maxTasksInWeek = Math.max(...stats.weeklyActivity.map((d) => d.tasksCompleted), 1);
  const barHeight = 120;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">Falcon's Study Planner</Text>
          <Text className="text-sm text-muted mb-6">Founder: Korede Omotosho</Text>
          <Text className="text-2xl font-bold text-foreground mb-6">Statistics</Text>

          {/* Summary Cards */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-1">Total Goals</Text>
              <Text className="text-3xl font-bold text-primary">{stats.totalGoals}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-1">Completed</Text>
              <Text className="text-3xl font-bold text-success">{stats.completedGoals}</Text>
            </View>
          </View>

          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-1">Total Tasks</Text>
              <Text className="text-3xl font-bold text-primary">{stats.totalTasks}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-1">Completed</Text>
              <Text className="text-3xl font-bold text-success">{stats.completedTasks}</Text>
            </View>
          </View>

          {/* Completion Rate */}
          <View className="bg-surface rounded-lg p-4 border border-border mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-semibold text-foreground">Overall Completion Rate</Text>
              <Text className="text-2xl font-bold text-primary">
                {Math.round(stats.completionRate)}%
              </Text>
            </View>
            <View className="h-3 bg-border rounded-full overflow-hidden">
              <View
                className="h-full bg-primary rounded-full"
                style={{ width: `${stats.completionRate}%` }}
              />
            </View>
          </View>

          {/* Goals Status */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-1">On Track</Text>
              <Text className="text-3xl font-bold text-success">{stats.goalsOnTrack}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-1">Overdue</Text>
              <Text className="text-3xl font-bold text-warning">{stats.goalsOverdue}</Text>
            </View>
          </View>

          {/* Weekly Activity Chart */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-sm font-semibold text-foreground mb-4">Weekly Activity</Text>

            <View style={{ height: barHeight + 40 }}>
              <View style={{ height: barHeight, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                {stats.weeklyActivity.map((day, index) => {
                  const barHeightPercent = maxTasksInWeek > 0 ? (day.tasksCompleted / maxTasksInWeek) * barHeight : 0;
                  return (
                    <View key={index} style={{ flex: 1, alignItems: 'center' }}>
                      <View
                        style={{
                          width: '100%',
                          height: barHeightPercent,
                          backgroundColor: '#22C55E',
                          borderRadius: 4,
                          marginBottom: 8,
                        }}
                      />
                    </View>
                  );
                })}
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                {dayNames.map((day, index) => (
                  <View key={index} style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: colors.muted }}>{day}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mt-4 pt-4 border-t border-border">
              <Text className="text-xs text-muted">
                Tasks completed this week: {stats.weeklyActivity.reduce((sum, day) => sum + day.tasksCompleted, 0)}
              </Text>
            </View>
          </View>

          {/* Motivational Message */}
          <View className="bg-primary/10 rounded-lg p-4 mt-6 border border-primary">
            <Text className="text-sm font-semibold text-primary mb-2">Keep Going! 🚀</Text>
            <Text className="text-sm text-foreground leading-relaxed">
              {stats.completionRate >= 80
                ? "You're crushing it! Keep up the amazing progress!"
                : stats.completionRate >= 50
                ? "Great effort! You're making solid progress towards your goals."
                : stats.completionRate > 0
                ? "Every task completed is a step forward. Keep pushing!"
                : "Start by creating a goal and breaking it into tasks!"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
