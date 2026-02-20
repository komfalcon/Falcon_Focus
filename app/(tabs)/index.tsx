import { ScrollView, Text, View, TouchableOpacity, FlatList, RefreshControl, Alert, StyleSheet, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useStudy } from '@/lib/study-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function HomeScreen() {
  const { goals, isLoading, deleteGoal } = useStudy();
  const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate a refresh delay
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleCreateGoal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/create-goal' as any);
  };

  const handleGoalPress = (goalId: string) => {
    router.push(`/(tabs)/goal-detail?id=${goalId}` as any);
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            deleteGoal(goalId);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  const renderGoalCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleGoalPress(item.id)}
      activeOpacity={0.7}
    >
      <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="flex-1 text-lg font-semibold text-foreground pr-2">{item.title}</Text>
          <TouchableOpacity
            onPress={() => handleDeleteGoal(item.id)}
            activeOpacity={0.6}
          >
            <IconSymbol name="trash.fill" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        {item.description && (
          <Text className="text-sm text-muted mb-3 leading-relaxed">{item.description}</Text>
        )}

        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-muted">
              {item.completedTasks} of {item.totalTasks} tasks
            </Text>
            <Text className="text-xs font-semibold text-primary">
              {Math.round(item.progressPercentage)}%
            </Text>
          </View>
          <View className="h-2 bg-border rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${item.progressPercentage}%` }}
            />
          </View>
        </View>

        {item.targetDate && (
          <Text className="text-xs text-muted">
            Due: {new Date(item.targetDate).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ScreenContainer className="p-4 justify-center items-center">
        <Text className="text-lg text-muted">Loading your goals...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <FlatList
        data={activeGoals}
        renderItem={renderGoalCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground mb-1">Study Planner</Text>
            <Text className="text-sm text-muted">
              {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-lg font-semibold text-foreground mb-2">No goals yet</Text>
            <Text className="text-sm text-muted text-center mb-6">
              Create your first learning goal to get started
            </Text>
            <TouchableOpacity
              onPress={handleCreateGoal}
              activeOpacity={0.9}
              className="bg-primary px-6 py-3 rounded-full"
            >
              <Text className="text-background font-semibold">Create Goal</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        scrollEnabled={activeGoals.length > 0}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleCreateGoal}
        activeOpacity={0.85}
        style={styles.fab}
      >
        <IconSymbol name="plus.circle.fill" size={32} color="white" />
      </TouchableOpacity>
    </ScreenContainer>
  );
}
