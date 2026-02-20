import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useStudy } from '@/lib/study-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

export default function GoalDetailScreen() {
  const { goals, addTask, deleteTask, toggleTask, updateGoal } = useStudy();
  const router = useRouter();
  const params = useLocalSearchParams();
  const colors = useColors();

  const goal = useMemo(() => {
    return goals.find((g) => g.id === params.id);
  }, [goals, params.id]);

  if (!goal) {
    return (
      <ScreenContainer className="p-4 justify-center items-center">
        <Text className="text-lg text-muted">Goal not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.9}
          className="mt-4 bg-primary px-6 py-2 rounded-lg"
        >
          <Text className="text-background font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const completedTasks = goal.tasks.filter((t) => t.completed);
  const pendingTasks = goal.tasks.filter((t) => !t.completed);

  const handleAddTask = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/create-task?goalId=${goal.id}` as any);
  };

  const handleToggleTask = (taskId: string) => {
    toggleTask(goal.id, taskId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            deleteTask(goal.id, taskId);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleEditGoal = () => {
    router.push(`/(tabs)/create-goal?id=${goal.id}` as any);
  };

  const handleDeleteGoal = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            updateGoal(goal.id, { status: 'archived' });
            router.back();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderTaskItem = ({ item }: { item: any }) => (
    <View className={`flex-row items-center p-4 mb-2 rounded-lg border ${
      item.completed ? 'bg-success/10 border-success' : 'bg-surface border-border'
    }`}>
      <TouchableOpacity
        onPress={() => handleToggleTask(item.id)}
        activeOpacity={0.7}
        className="mr-3"
      >
        <IconSymbol
          name={item.completed ? 'checkmark.circle.fill' : 'checkmark.circle.fill'}
          size={24}
          color={item.completed ? colors.success : colors.muted}
        />
      </TouchableOpacity>

      <View className="flex-1">
        <Text className={`font-semibold ${item.completed ? 'line-through text-muted' : 'text-foreground'}`}>
          {item.title}
        </Text>
        {item.description && (
          <Text className="text-xs text-muted mt-1">{item.description}</Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => handleDeleteTask(item.id)}
        activeOpacity={0.6}
      >
        <IconSymbol name="trash.fill" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer className="p-0">
      <FlatList
        data={[...pendingTasks, ...completedTasks]}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <View className="mb-6">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground mb-1">{goal.title}</Text>
                {goal.description && (
                  <Text className="text-sm text-muted">{goal.description}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={handleDeleteGoal}
                activeOpacity={0.6}
              >
                <IconSymbol name="trash.fill" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>

            {goal.targetDate && (
              <Text className="text-xs text-muted mb-4">
                Due: {new Date(goal.targetDate).toLocaleDateString()}
              </Text>
            )}

            <View className="mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-semibold text-foreground">
                  Progress: {goal.completedTasks} of {goal.totalTasks} tasks
                </Text>
                <Text className="text-sm font-semibold text-primary">
                  {Math.round(goal.progressPercentage)}%
                </Text>
              </View>
              <View className="h-3 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${goal.progressPercentage}%` }}
                />
              </View>
            </View>

            <View className="flex-row gap-2 mb-6">
              <TouchableOpacity
                onPress={handleEditGoal}
                activeOpacity={0.9}
                className="flex-1 bg-primary rounded-lg py-2 items-center"
              >
                <Text className="text-background font-semibold text-sm">Edit Goal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddTask}
                activeOpacity={0.9}
                className="flex-1 bg-surface border border-border rounded-lg py-2 items-center"
              >
                <Text className="text-foreground font-semibold text-sm">Add Task</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-sm font-semibold text-foreground mb-2">
              Tasks ({goal.tasks.length})
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <Text className="text-base font-semibold text-foreground mb-2">No tasks yet</Text>
            <Text className="text-sm text-muted text-center">
              Break this goal into tasks to get started
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleAddTask}
        activeOpacity={0.85}
        style={styles.fab}
      >
        <IconSymbol name="plus.circle.fill" size={32} color="white" />
      </TouchableOpacity>
    </ScreenContainer>
  );
}

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
