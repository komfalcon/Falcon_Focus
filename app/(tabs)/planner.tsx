import { ScrollView, Text, View, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useStudy } from '@/lib/study-context';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PlannerScreen() {
  const colors = useColors();
  const { studyBlocks } = useStudy();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDateSelect = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Generate calendar days
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number | null) => {
    if (!day) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Mock study blocks for selected date
  const selectedDateBlocks = [
    { id: '1', title: 'Mathematics Lecture', startTime: '10:00', endTime: '11:30', color: '#0a7ea4' },
    { id: '2', title: 'Chemistry Study', startTime: '14:00', endTime: '15:30', color: '#22C55E' },
    { id: '3', title: 'Review Session', startTime: '17:00', endTime: '18:00', color: '#F59E0B' },
  ];

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          {/* Header */}
          <Text className="text-3xl font-bold text-foreground mb-6">Planner</Text>

          {/* Calendar Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Pressable onPress={handlePreviousMonth} className="p-2 active:opacity-80">
              <Text className="text-2xl">←</Text>
            </Pressable>
            <Text className="text-lg font-bold text-foreground">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <Pressable onPress={handleNextMonth} className="p-2 active:opacity-80">
              <Text className="text-2xl">→</Text>
            </Pressable>
          </View>

          {/* Day Headers */}
          <View className="flex-row gap-1 mb-2">
            {DAYS_OF_WEEK.map((day) => (
              <View key={day} className="flex-1 items-center py-2">
                <Text className="text-xs font-semibold text-muted">{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="bg-surface rounded-lg p-3 border border-border mb-6">
            <View className="flex-row flex-wrap">
              {calendarDays.map((day, index) => (
                <Pressable
                  key={index}
                  className={`items-center justify-center rounded-lg mb-1 aspect-square ${
                    day === null
                      ? ''
                      : isSelected(day)
                      ? 'bg-primary'
                      : isToday(day)
                      ? 'bg-secondary/20 border border-secondary'
                      : 'bg-background'
                  }`}
                  onPress={() => day && handleDateSelect(day)}
                  style={{ width: '14.28%' }}
                >
                  {day && (
                    <Text
                      className={`text-sm font-semibold ${
                        isSelected(day)
                          ? 'text-white'
                          : isToday(day)
                          ? 'text-secondary'
                          : 'text-foreground'
                      }`}
                    >
                      {day}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Selected Date Study Blocks */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-semibold text-foreground">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </Text>
              <Pressable className="bg-primary rounded-lg px-3 py-1 active:opacity-80">
                <Text className="text-xs font-semibold text-white">+ Add</Text>
              </Pressable>
            </View>

            <View className="gap-2">
              {selectedDateBlocks.length > 0 ? (
                selectedDateBlocks.map((block) => (
                  <Pressable
                    key={block.id}
                    className="bg-surface rounded-lg p-3 border border-border active:opacity-80"
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <View className="flex-row gap-3 items-start">
                      <View
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: block.color }}
                      />
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">{block.title}</Text>
                        <Text className="text-xs text-muted mt-1">
                          {block.startTime} - {block.endTime}
                        </Text>
                      </View>
                      <Pressable className="p-2 active:opacity-80">
                        <Text className="text-lg">⋯</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                ))
              ) : (
                <View className="bg-surface rounded-lg p-4 border border-border items-center">
                  <Text className="text-sm text-muted">No study blocks scheduled</Text>
                </View>
              )}
            </View>
          </View>

          {/* Flight Card Export */}
          <Pressable className="bg-gradient-to-r from-secondary to-primary rounded-lg p-4 active:opacity-80">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg">📸</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-white">Export as Flight Card</Text>
                <Text className="text-xs text-white/80">Share your schedule with friends</Text>
              </View>
              <Text className="text-lg">→</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
