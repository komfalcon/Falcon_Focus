import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useStudy } from '@/lib/study-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';

export default function CreateTaskScreen() {
  const { goals, addTask, updateTask } = useStudy();
  const router = useRouter();
  const params = useLocalSearchParams();
  const colors = useColors();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const goalId = params.goalId as string;
  const taskId = params.taskId as string;
  const goal = goals.find((g) => g.id === goalId);
  const task = goal?.tasks.find((t) => t.id === taskId);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setIsEditing(true);
    }
  }, [task]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isEditing && taskId) {
      updateTask(goalId, taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
    } else {
      addTask(goalId, {
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
      });
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

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

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1">
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground mb-1">
              {isEditing ? 'Edit Task' : 'Create Task'}
            </Text>
            <Text className="text-sm text-muted mb-2">
              {isEditing ? 'Update your task' : 'Add a task to your goal'}
            </Text>
            <Text className="text-sm font-semibold text-primary">{goal.title}</Text>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-2">Task Title *</Text>
            <TextInput
              placeholder="e.g., Watch React Hooks tutorial"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={setTitle}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              returnKeyType="next"
            />
          </View>

          <View className="mb-8">
            <Text className="text-sm font-semibold text-foreground mb-2">Description (Optional)</Text>
            <TextInput
              placeholder="Add more details about this task..."
              placeholderTextColor={colors.muted}
              value={description}
              onChangeText={setDescription}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              multiline
              numberOfLines={4}
              returnKeyType="default"
              textAlignVertical="top"
            />
          </View>

          <View className="flex-1" />

          <View className="gap-3">
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.9}
              className="bg-primary rounded-lg py-3 items-center"
            >
              <Text className="text-background font-semibold text-base">
                {isEditing ? 'Update Task' : 'Create Task'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancel}
              activeOpacity={0.9}
              className="bg-surface border border-border rounded-lg py-3 items-center"
            >
              <Text className="text-foreground font-semibold text-base">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
