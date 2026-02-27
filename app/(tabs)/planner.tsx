import {
  ScrollView,
  Text,
  View,
  Pressable,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useStudy } from '@/lib/study-context';
import { EmptyState } from '@/components/empty-state';
import { SkeletonCard } from '@/components/skeleton';
import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import type { StudyBlock } from '@/lib/types';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DURATION_OPTIONS = [25, 45, 60, 90, 120] as const;
const REPEAT_OPTIONS = ['none', 'daily', 'weekly'] as const;
const SUBJECT_COLORS = [
  '#0d9488', '#f59e0b', '#6366f1', '#ec4899', '#22c55e', '#ef4444',
];

type RepeatOption = (typeof REPEAT_OPTIONS)[number];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

function getBlocksForDayOfWeek(blocks: StudyBlock[], dow: number): StudyBlock[] {
  return blocks.filter((b) => b.dayOfWeek === dow || b.recurring);
}

export default function PlannerScreen() {
  const colors = useColors();
  const router = useRouter();
  const { studyBlocks, addStudyBlock, updateStudyBlock, deleteStudyBlock } = useStudy();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formSubject, setFormSubject] = useState('');
  const [formDuration, setFormDuration] = useState<number>(45);
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formDifficulty, setFormDifficulty] = useState(3);
  const [formRepeat, setFormRepeat] = useState<RepeatOption>('none');

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(timer);
    }, []),
  );

  // Calendar helpers
  const daysInMonth = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(),
    [currentDate],
  );
  const firstDay = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(),
    [currentDate],
  );
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDay, daysInMonth]);

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  const isSelected = (day: number) =>
    day === selectedDate.getDate() &&
    currentDate.getMonth() === selectedDate.getMonth() &&
    currentDate.getFullYear() === selectedDate.getFullYear();

  const hasSession = useCallback(
    (day: number) => {
      const dow = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
      return getBlocksForDayOfWeek(studyBlocks, dow).length > 0;
    },
    [currentDate, studyBlocks],
  );

  const selectedDateBlocks = useMemo(
    () => getBlocksForDayOfWeek(studyBlocks, selectedDate.getDay()),
    [studyBlocks, selectedDate],
  );

  // Study load per day for the visible week row of selected date
  const dailyLoadHours = useMemo(() => {
    return Array.from({ length: 7 }, (_, dow) => {
      const blocks = getBlocksForDayOfWeek(studyBlocks, dow);
      const totalMin = blocks.reduce(
        (sum, b) => sum + Math.max(0, minutesBetween(b.startTime, b.endTime)),
        0,
      );
      return totalMin / 60;
    });
  }, [studyBlocks]);

  const loadBarColor = (hours: number): string => {
    if (hours > 6) return colors.error;
    if (hours >= 3) return colors.warning;
    return colors.success;
  };

  // Navigation
  const handlePreviousMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };
  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };
  const handleDateSelect = (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  // Form helpers
  const resetForm = () => {
    setFormSubject('');
    setFormDuration(45);
    setFormStartTime('09:00');
    setFormDifficulty(3);
    setFormRepeat('none');
    setEditingBlock(null);
  };

  const openAddModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (block: StudyBlock) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingBlock(block);
    setFormSubject(block.subject);
    setFormStartTime(block.startTime);
    setFormDuration(minutesBetween(block.startTime, block.endTime));
    setFormDifficulty(
      block.notes?.includes('difficulty:')
        ? parseInt(block.notes.split('difficulty:')[1], 10) || 3
        : 3,
    );
    const repeatMatch = block.notes?.match(/repeat:(none|daily|weekly)/);
    setFormRepeat(repeatMatch ? (repeatMatch[1] as RepeatOption) : block.recurring ? 'weekly' : 'none');
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formSubject.trim()) {
      Alert.alert('Missing Subject', 'Please enter a subject name.');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(formStartTime)) {
      Alert.alert('Invalid Time', 'Please enter time in HH:MM format.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(true);

    const endTime = addMinutesToTime(formStartTime, formDuration);
    const colorIndex = formSubject.trim().length % SUBJECT_COLORS.length;

    const block: StudyBlock = {
      id: editingBlock?.id ?? generateId(),
      title: formSubject.trim(),
      subject: formSubject.trim(),
      startTime: formStartTime,
      endTime,
      dayOfWeek: editingBlock?.dayOfWeek ?? selectedDate.getDay(),
      recurring: formRepeat !== 'none',
      color: editingBlock?.color ?? SUBJECT_COLORS[colorIndex],
      notes: `difficulty:${formDifficulty},repeat:${formRepeat}`,
    };

    try {
      if (editingBlock) {
        await updateStudyBlock(block);
      } else {
        await addStudyBlock(block);

        // For daily repeat, add blocks for all other days
        if (formRepeat === 'daily') {
          for (let d = 0; d < 7; d++) {
            if (d !== selectedDate.getDay()) {
              await addStudyBlock({ ...block, id: generateId(), dayOfWeek: d });
            }
          }
        }
      }
    } finally {
      setSubmitting(false);
      setShowAddModal(false);
      resetForm();
    }
  };

  const handleDelete = (block: StudyBlock) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Delete Session', `Remove "${block.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await deleteStudyBlock(block.id);
        },
      },
    ]);
  };

  // Flight card export
  const handleExport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const lines: string[] = ['📋 Weekly Study Schedule\n'];
    DAYS_OF_WEEK.forEach((dayName, dow) => {
      const blocks = getBlocksForDayOfWeek(studyBlocks, dow);
      lines.push(`${dayName}:`);
      if (blocks.length === 0) {
        lines.push('  (no sessions)');
      } else {
        blocks.forEach((b) => {
          const dur = minutesBetween(b.startTime, b.endTime);
          lines.push(`  • ${b.subject} ${b.startTime}-${b.endTime} (${dur}min)`);
        });
      }
    });
    const totalWeekMin = studyBlocks.reduce(
      (s, b) => s + Math.max(0, minutesBetween(b.startTime, b.endTime)),
      0,
    );
    lines.push(`\nTotal: ${(totalWeekMin / 60).toFixed(1)}h / week`);
    Alert.alert('Flight Card', lines.join('\n'));
  };

  // --- RENDER ---

  if (loading) {
    return (
      <ScreenContainer className="p-4">
        <Text className="text-3xl font-bold text-foreground dark:text-foreground-dark mb-6 tracking-tight">
          Planner
        </Text>
        <View className="gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          {/* Header */}
          <Text className="text-3xl font-bold text-foreground dark:text-foreground-dark mb-6 tracking-tight">
            Planner
          </Text>

          {/* Calendar Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Pressable onPress={handlePreviousMonth} className="p-3 active:opacity-80">
              <Text className="text-2xl" style={{ color: colors.muted }}>←</Text>
            </Pressable>
            <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <Pressable onPress={handleNextMonth} className="p-3 active:opacity-80">
              <Text className="text-2xl" style={{ color: colors.muted }}>→</Text>
            </Pressable>
          </View>

          {/* Day Headers */}
          <View className="flex-row gap-1 mb-2">
            {DAYS_OF_WEEK.map((day) => (
              <View key={day} className="flex-1 items-center py-2">
                <Text className="text-xs font-bold" style={{ color: colors.muted }}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View
            className="rounded-2xl p-3 mb-2"
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
              {calendarDays.map((day, index) => {
                const teal = '#0d9488';
                const selected = day !== null && isSelected(day);
                const todayDay = day !== null && isToday(day);
                const hasSess = day !== null && hasSession(day);

                return (
                  <Pressable
                    key={index}
                    className="items-center justify-center rounded-xl mb-1"
                    style={{
                      width: '14.28%',
                      aspectRatio: 1,
                      backgroundColor:
                        day === null
                          ? 'transparent'
                          : selected
                            ? teal
                            : todayDay
                              ? teal + '18'
                              : colors.background,
                      borderWidth: todayDay && !selected ? 1.5 : 0,
                      borderColor: teal,
                    }}
                    onPress={() => day !== null && handleDateSelect(day)}
                  >
                    {day !== null && (
                      <>
                        <Text
                          className="text-sm font-semibold"
                          style={{
                            color: selected ? '#ffffff' : todayDay ? teal : colors.foreground,
                          }}
                        >
                          {day}
                        </Text>
                        {hasSess && !selected && (
                          <View
                            className="rounded-full mt-0.5"
                            style={{ width: 5, height: 5, backgroundColor: '#f59e0b' }}
                          />
                        )}
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Study Load Indicator */}
          <View className="flex-row gap-1 mb-6 px-1">
            {dailyLoadHours.map((hours, i) => (
              <View key={i} className="flex-1 items-center">
                <View
                  className="rounded-full"
                  style={{
                    height: 4,
                    width: '100%',
                    backgroundColor: hours > 0 ? loadBarColor(hours) : colors.border,
                    opacity: hours > 0 ? 1 : 0.3,
                  }}
                />
                {hours > 0 && (
                  <Text className="text-center mt-0.5" style={{ fontSize: 8, color: colors.muted }}>
                    {hours.toFixed(1)}h
                  </Text>
                )}
              </View>
            ))}
          </View>

          {/* Selected Date Sessions */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-bold" style={{ color: colors.foreground }}>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <Pressable
                className="rounded-xl px-4 py-2 active:opacity-80"
                style={{ backgroundColor: '#0d9488' }}
                onPress={openAddModal}
              >
                <Text className="text-xs font-bold text-white">+ Add</Text>
              </Pressable>
            </View>

            <View className="gap-3">
              {selectedDateBlocks.length > 0 ? (
                selectedDateBlocks.map((block) => {
                  const dur = minutesBetween(block.startTime, block.endTime);
                  return (
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
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push('/(tabs)/focus');
                      }}
                      onLongPress={() => openEditModal(block)}
                    >
                      <View className="flex-row gap-3 items-start">
                        <View
                          className="w-1 h-12 rounded-full"
                          style={{ backgroundColor: block.color }}
                        />
                        <View className="flex-1">
                          <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                            {block.subject}
                          </Text>
                          <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                            {block.startTime} – {block.endTime}  •  {dur} min
                          </Text>
                        </View>
                        <Pressable
                          className="p-2 active:opacity-80"
                          onPress={() => handleDelete(block)}
                        >
                          <Text className="text-lg" style={{ color: colors.error }}>✕</Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <EmptyState
                  emoji="📅"
                  title="No study sessions"
                  subtitle='Tap "+ Add" to plan your study session'
                  actionLabel="+ Add Session"
                  onAction={openAddModal}
                />
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
            onPress={handleExport}
          >
            <View className="flex-row items-center gap-3">
              <Text className="text-lg">📸</Text>
              <View className="flex-1">
                <Text className="text-sm font-bold text-white">Export as Flight Card</Text>
                <Text className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Share your weekly schedule
                </Text>
              </View>
              <Text className="text-lg text-white">→</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
        <Pressable
          className="flex-1"
          onPress={() => {
            setShowAddModal(false);
            resetForm();
          }}
        />
        <View
          className="rounded-t-3xl p-6 pb-10"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="items-center mb-4">
            <View className="w-10 h-1 rounded-full" style={{ backgroundColor: colors.border }} />
          </View>
          <Text className="text-lg font-bold mb-5" style={{ color: colors.foreground }}>
            {editingBlock ? 'Edit Session' : 'New Study Session'}
          </Text>

          {/* Subject */}
          <Text className="text-xs font-semibold mb-1" style={{ color: colors.muted }}>Subject</Text>
          <TextInput
            className="rounded-xl px-4 py-3 text-sm mb-4"
            style={{
              backgroundColor: colors.background,
              color: colors.foreground,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            placeholder="e.g. Mathematics"
            placeholderTextColor={colors.muted}
            value={formSubject}
            onChangeText={setFormSubject}
          />

          {/* Duration */}
          <Text className="text-xs font-semibold mb-2" style={{ color: colors.muted }}>Duration (min)</Text>
          <View className="flex-row gap-2 mb-4">
            {DURATION_OPTIONS.map((d) => (
              <Pressable
                key={d}
                className="flex-1 items-center py-2 rounded-xl"
                style={{
                  backgroundColor: formDuration === d ? '#0d9488' : colors.background,
                  borderWidth: 1,
                  borderColor: formDuration === d ? '#0d9488' : colors.border,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFormDuration(d);
                }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: formDuration === d ? '#fff' : colors.foreground }}
                >
                  {d}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Start Time */}
          <Text className="text-xs font-semibold mb-1" style={{ color: colors.muted }}>Start Time (HH:MM)</Text>
          <TextInput
            className="rounded-xl px-4 py-3 text-sm mb-4"
            style={{
              backgroundColor: colors.background,
              color: colors.foreground,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            placeholder="09:00"
            placeholderTextColor={colors.muted}
            value={formStartTime}
            onChangeText={setFormStartTime}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />

          {/* Difficulty */}
          <Text className="text-xs font-semibold mb-2" style={{ color: colors.muted }}>Difficulty</Text>
          <View className="flex-row gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFormDifficulty(star);
                }}
              >
                <Text className="text-2xl">
                  {star <= formDifficulty ? '★' : '☆'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Repeat */}
          <Text className="text-xs font-semibold mb-2" style={{ color: colors.muted }}>Repeat</Text>
          <View className="flex-row rounded-xl overflow-hidden mb-6" style={{ borderWidth: 1, borderColor: colors.border }}>
            {REPEAT_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                className="flex-1 items-center py-2.5"
                style={{
                  backgroundColor: formRepeat === opt ? '#0d9488' : colors.background,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFormRepeat(opt);
                }}
              >
                <Text
                  className="text-xs font-bold capitalize"
                  style={{ color: formRepeat === opt ? '#fff' : colors.foreground }}
                >
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Submit */}
          <Pressable
            className="rounded-xl py-3.5 items-center active:opacity-80"
            style={{ backgroundColor: '#0d9488', opacity: submitting ? 0.7 : 1 }}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-sm font-bold text-white">
                {editingBlock ? 'Save Changes' : 'Add Session'}
              </Text>
            )}
          </Pressable>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
