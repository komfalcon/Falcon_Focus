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

  // Filter study blocks for selected date
  const selectedDayOfWeek = selectedDate.getDay();
  const selectedDateBlocks = studyBlocks
    .filter((block) => block.dayOfWeek === selectedDayOfWeek)
    .map((block) => ({
      id: block.id,
      title: block.title,
      startTime: block.startTime,
      endTime: block.endTime,
      color: block.color,
    }));

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          {/* Header */}
          <Text className="text-3xl font-bold text-foreground dark:text-foreground-dark mb-6 tracking-tight">Planner</Text>

          {/* Calendar Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Pressable onPress={handlePreviousMonth} className="p-3 active:opacity-80">
              <Text className="text-2xl text-muted dark:text-muted-dark">←</Text>
            </Pressable>
            <Text className="text-lg font-bold text-foreground dark:text-foreground-dark">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <Pressable onPress={handleNextMonth} className="p-3 active:opacity-80">
              <Text className="text-2xl text-muted dark:text-muted-dark">→</Text>
            </Pressable>
          </View>

          {/* Day Headers */}
          <View className="flex-row gap-1 mb-2">
            {DAYS_OF_WEEK.map((day) => (
              <View key={day} className="flex-1 items-center py-2">
                <Text className="text-xs font-bold text-muted dark:text-muted-dark">{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View
            className="rounded-2xl p-3 mb-6"
            style={{
              backgroundColor: colors.surface,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row flex-wrap">
              {calendarDays.map((day, index) => (
                <Pressable
                  key={index}
                  className="items-center justify-center rounded-xl mb-1 aspect-square"
                  style={{
                    width: '14.28%',
                    backgroundColor: day === null
                      ? 'transparent'
                      : isSelected(day)
                      ? colors.primary
                      : isToday(day)
                      ? colors.primary + '18'
                      : colors.background,
                    borderWidth: isToday(day) && !isSelected(day) ? 1.5 : 0,
                    borderColor: colors.primary,
                  }}
                  onPress={() => day && handleDateSelect(day)}
                >
                  {day && (
                    <Text
                      className="text-sm font-semibold"
                      style={{
                        color: isSelected(day)
                          ? '#ffffff'
                          : isToday(day)
                          ? colors.primary
                          : colors.foreground,
                      }}
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
              <Text className="text-sm font-bold text-foreground dark:text-foreground-dark">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </Text>
              <Pressable
                className="rounded-xl px-4 py-2 active:opacity-80"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-xs font-bold text-white">+ Add</Text>
              </Pressable>
            </View>

            <View className="gap-3">
              {selectedDateBlocks.length > 0 ? (
                selectedDateBlocks.map((block) => (
                  <Pressable
                    key={block.id}
                    className="rounded-2xl p-4 active:opacity-90"
                    style={{
                      backgroundColor: colors.surface,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.03,
                      shadowRadius: 4,
                      elevation: 1,
                    }}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <View className="flex-row gap-3 items-start">
                      <View
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: block.color }}
                      />
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">{block.title}</Text>
                        <Text className="text-xs text-muted dark:text-muted-dark mt-1">
                          {block.startTime} - {block.endTime}
                        </Text>
                      </View>
                      <Pressable className="p-2 active:opacity-80">
                        <Text className="text-lg text-muted dark:text-muted-dark">⋯</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                ))
              ) : (
                <View
                  className="rounded-2xl p-6 items-center"
                  style={{
                    backgroundColor: colors.surface,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.03,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <Text className="text-3xl mb-3">📅</Text>
                  <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark mb-1">No study blocks scheduled</Text>
                  <Text className="text-xs text-muted dark:text-muted-dark text-center">Tap "+ Add" to plan your study session</Text>
                </View>
              )}
            </View>
          </View>

          {/* Flight Card Export */}
          <Pressable
            className="rounded-2xl p-4 active:opacity-80"
            style={{
              backgroundColor: colors.secondary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.18,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center gap-3">
              <Text className="text-lg">📸</Text>
              <View className="flex-1">
                <Text className="text-sm font-bold text-white">Export as Flight Card</Text>
                <Text className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Share your schedule with friends</Text>
              </View>
              <Text className="text-lg text-white">→</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
