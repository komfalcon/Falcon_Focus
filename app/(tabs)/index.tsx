import { ScrollView, Text, View, Pressable, RefreshControl } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useStudy } from '@/lib/study-context';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const FALCON_TIPS = [
  'Your Chemistry kinetics is weak before exam — try this 25-min targeted dive',
  'You\'re crushing it! 7-day streak incoming. Keep the momentum.',
  'Energy is high today — perfect for deep focus sessions.',
  'Take a break! Your energy is declining. A 10-min walk helps.',
  'Review yesterday\'s notes before starting today\'s session.',
];

export default function HomeScreen() {
  const colors = useColors();
  const { tasks, userProgress, getAltitudePercentage, getStreakCount } = useStudy();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setCurrentTipIndex(Math.floor(Math.random() * FALCON_TIPS.length));
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 1000);
  }, []);

  const altitudePercentage = getAltitudePercentage();
  const streakCount = getStreakCount();
  const todayStudyHours = 3.4; // Mock data
  const energyLevel = 4; // Mock data (1-5)

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
            <Text className="text-3xl font-bold text-foreground">Falcon Focus</Text>
            <Text className="text-xs text-muted mt-1">By Korede Omotosho</Text>
          </View>

          {/* Altitude Meter */}
          <View className="bg-gradient-to-r from-secondary to-primary rounded-lg p-6 mb-6 border border-primary/30">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-sm font-semibold text-white">Altitude</Text>
              <Text className="text-3xl font-bold text-white">{altitudePercentage}%</Text>
            </View>
            <View className="bg-white/20 rounded-full h-2 overflow-hidden">
              <View
                className="bg-white h-full rounded-full"
                style={{ width: `${altitudePercentage}%` }}
              />
            </View>
            <Text className="text-xs text-white/80 mt-2">Your learning progress today</Text>
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-3 mb-6">
            {/* Streak */}
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-2">STREAK</Text>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-2xl font-bold text-foreground">{streakCount}</Text>
                <Text className="text-lg">🔥</Text>
              </View>
              <Text className="text-xs text-muted mt-1">days</Text>
            </View>

            {/* Today's Study */}
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-2">TODAY</Text>
              <Text className="text-2xl font-bold text-foreground">{todayStudyHours}h</Text>
              <Text className="text-xs text-muted mt-1">studied</Text>
            </View>

            {/* Energy */}
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-2">ENERGY</Text>
              <View className="flex-row gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <View
                    key={i}
                    className={`flex-1 h-2 rounded-full ${
                      i <= energyLevel ? 'bg-success' : 'bg-border'
                    }`}
                  />
                ))}
              </View>
              <Text className="text-xs text-muted mt-1">{energyLevel}/5</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-6">
            <Pressable
              className="flex-1 bg-primary rounded-lg p-3 active:opacity-80"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text className="text-center font-semibold text-white text-sm">Start Focus</Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-surface rounded-lg p-3 border border-border active:opacity-80"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text className="text-center font-semibold text-foreground text-sm">Add Task</Text>
            </Pressable>
          </View>

          {/* Falcon Coach Tip */}
          <View className="bg-secondary/10 rounded-lg p-4 border border-secondary/30 mb-6">
            <View className="flex-row gap-3 mb-2">
              <Text className="text-2xl">🦅</Text>
              <Text className="text-sm font-semibold text-secondary flex-1">Falcon Coach Tip</Text>
            </View>
            <Text className="text-sm text-foreground leading-relaxed">
              {FALCON_TIPS[currentTipIndex]}
            </Text>
          </View>

          {/* Energy Forecast */}
          <View className="bg-surface rounded-lg p-4 border border-border mb-6">
            <Text className="text-sm font-semibold text-foreground mb-2">Energy Forecast</Text>
            <View className="bg-success/10 rounded p-2 border border-success/20">
              <Text className="text-xs text-success font-semibold">
                High energy detected! Perfect for deep focus sessions.
              </Text>
            </View>
          </View>

          {/* Today's Schedule */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-3">Today's Schedule</Text>
            <View className="gap-2">
              <View className="bg-surface rounded-lg p-3 border border-border">
                <Text className="text-sm font-semibold text-foreground">Mathematics Lecture</Text>
                <Text className="text-xs text-muted mt-1">10:00 AM - 11:30 AM</Text>
              </View>
              <View className="bg-surface rounded-lg p-3 border border-border">
                <Text className="text-sm font-semibold text-foreground">Chemistry Study</Text>
                <Text className="text-xs text-muted mt-1">2:00 PM - 3:30 PM</Text>
              </View>
              <View className="bg-surface rounded-lg p-3 border border-border">
                <Text className="text-sm font-semibold text-foreground">Review Session</Text>
                <Text className="text-xs text-muted mt-1">5:00 PM - 6:00 PM</Text>
              </View>
            </View>
          </View>

          {/* Motivational Quote */}
          <View className="bg-secondary/5 rounded-lg p-4 border border-secondary/20 items-center">
            <Text className="text-sm italic text-foreground text-center leading-relaxed">
              "Every soar begins with a single flap of the wings."
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
