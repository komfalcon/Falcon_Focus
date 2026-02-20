import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useStudy } from '@/lib/study-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';

export default function CreateGoalScreen() {
  const { goals, addGoal, updateGoal } = useStudy();
  const router = useRouter();
  const params = useLocalSearchParams();
  const colors = useColors();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // If editing, load the goal data
    if (params.id) {
      const goal = goals.find((g) => g.id === params.id);
      if (goal) {
        setTitle(goal.title);
        setDescription(goal.description || '');
        setTargetDate(goal.targetDate ? goal.targetDate.toISOString().split('T')[0] : '');
        setIsEditing(true);
      }
    }
  }, [params.id, goals]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isEditing && params.id) {
      updateGoal(params.id as string, {
        title: title.trim(),
        description: description.trim() || undefined,
        targetDate: targetDate ? new Date(targetDate) : undefined,
      });
    } else {
      addGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        status: 'active',
      });
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1">
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground mb-1">
              {isEditing ? 'Edit Goal' : 'Create Goal'}
            </Text>
            <Text className="text-sm text-muted">
              {isEditing ? 'Update your learning goal' : 'Set a new learning goal'}
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-2">Goal Title *</Text>
            <TextInput
              placeholder="e.g., Learn React Hooks"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={setTitle}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              returnKeyType="next"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-2">Description (Optional)</Text>
            <TextInput
              placeholder="What do you want to learn?"
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

          <View className="mb-8">
            <Text className="text-sm font-semibold text-foreground mb-2">Target Date (Optional)</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              value={targetDate}
              onChangeText={setTargetDate}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              returnKeyType="done"
            />
            <Text className="text-xs text-muted mt-1">Format: YYYY-MM-DD</Text>
          </View>

          <View className="flex-1" />

          <View className="gap-3">
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.9}
              className="bg-primary rounded-lg py-3 items-center"
            >
              <Text className="text-background font-semibold text-base">
                {isEditing ? 'Update Goal' : 'Create Goal'}
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
