import { ScrollView, Text, View, Pressable, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

export default function LearnScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards'>('notes');

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground dark:text-foreground-dark mb-1 tracking-tight">Learn</Text>
            <Text className="text-xs text-muted dark:text-muted-dark">Notes & Flashcards</Text>
          </View>

          {/* Tab Toggle */}
          <View className="flex-row gap-2 mb-6">
            <Pressable
              className="flex-1 rounded-2xl py-3 active:opacity-90"
              style={{
                backgroundColor: activeTab === 'notes' ? colors.primary : colors.surface,
                shadowColor: activeTab === 'notes' ? colors.primary : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: activeTab === 'notes' ? 0.25 : 0.04,
                shadowRadius: 6,
                elevation: activeTab === 'notes' ? 3 : 1,
              }}
              onPress={() => {
                setActiveTab('notes');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                className={`text-sm font-bold text-center ${
                  activeTab === 'notes' ? 'text-white' : 'text-foreground dark:text-foreground-dark'
                }`}
              >
                Notes
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 rounded-2xl py-3 active:opacity-90"
              style={{
                backgroundColor: activeTab === 'flashcards' ? colors.primary : colors.surface,
                shadowColor: activeTab === 'flashcards' ? colors.primary : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: activeTab === 'flashcards' ? 0.25 : 0.04,
                shadowRadius: 6,
                elevation: activeTab === 'flashcards' ? 3 : 1,
              }}
              onPress={() => {
                setActiveTab('flashcards');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                className={`text-sm font-bold text-center ${
                  activeTab === 'flashcards' ? 'text-white' : 'text-foreground dark:text-foreground-dark'
                }`}
              >
                Flashcards
              </Text>
            </Pressable>
          </View>

          {/* Notes Section */}
          {activeTab === 'notes' && (
            <View>
              <Pressable
                className="rounded-2xl py-4 mb-6 active:opacity-80"
                style={{
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    "Create Note",
                    "Rich text note creation with voice-to-text is coming in the next update!",
                    [{ text: "Got it", style: "default" }]
                  );
                }}
              >
                <Text className="text-center font-bold text-white text-base">+ New Note</Text>
              </Pressable>

              <View className="gap-3">
                <Pressable
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
                    Alert.alert("Open Note", "Full note editor with rich text coming soon!", [{ text: "OK" }]);
                  }}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-foreground dark:text-foreground-dark">Calculus Derivatives</Text>
                      <Text className="text-xs text-muted dark:text-muted-dark mt-1">Mathematics</Text>
                    </View>
                    <Text className="text-xs text-muted dark:text-muted-dark">Today</Text>
                  </View>
                  <Text className="text-xs text-muted dark:text-muted-dark leading-relaxed">
                    The derivative of a function measures how the function changes as its input changes...
                  </Text>
                  <View className="flex-row gap-2 mt-3">
                    <View className="rounded-lg px-2.5 py-1" style={{ backgroundColor: colors.primary + '14' }}>
                      <Text className="text-xs font-bold" style={{ color: colors.primary }}>Rich Text</Text>
                    </View>
                    <View className="rounded-lg px-2.5 py-1" style={{ backgroundColor: colors.primary + '14' }}>
                      <Text className="text-xs font-bold" style={{ color: colors.primary }}>Images</Text>
                    </View>
                  </View>
                </Pressable>

                <Pressable
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
                    Alert.alert("Open Note", "Full note editor with rich text coming soon!", [{ text: "OK" }]);
                  }}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-foreground dark:text-foreground-dark">Biology Photosynthesis</Text>
                      <Text className="text-xs text-muted dark:text-muted-dark mt-1">Biology</Text>
                    </View>
                    <Text className="text-xs text-muted dark:text-muted-dark">Yesterday</Text>
                  </View>
                  <Text className="text-xs text-muted dark:text-muted-dark leading-relaxed">
                    Photosynthesis is the process by which plants convert light energy into chemical energy...
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Flashcards Section */}
          {activeTab === 'flashcards' && (
            <View>
              <Pressable
                className="rounded-2xl py-4 mb-6 active:opacity-80"
                style={{
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    "Create Flashcard Deck",
                    "Spaced repetition flashcard decks are coming in the next update!",
                    [{ text: "Got it", style: "default" }]
                  );
                }}
              >
                <Text className="text-center font-bold text-white text-base">+ New Deck</Text>
              </Pressable>

              <View className="gap-3">
                <View
                  className="rounded-2xl p-4"
                  style={{
                    backgroundColor: colors.secondary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.12,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-white">Spanish Vocabulary</Text>
                      <Text className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>Languages</Text>
                    </View>
                    <Text className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>24 cards</Text>
                  </View>
                  <View className="flex-row gap-2 mt-3">
                    <Pressable
                      className="flex-1 rounded-xl p-2.5 active:opacity-80"
                      style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Alert.alert("Study Deck", "Spaced repetition study mode coming soon!", [{ text: "OK" }]);
                      }}
                    >
                      <Text className="text-xs font-bold text-white text-center">Study</Text>
                    </Pressable>
                    <Pressable
                      className="flex-1 rounded-xl p-2.5 active:opacity-80"
                      style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Alert.alert("Edit Deck", "Deck editing is coming soon!", [{ text: "OK" }]);
                      }}
                    >
                      <Text className="text-xs font-bold text-white text-center">Edit</Text>
                    </Pressable>
                  </View>
                </View>

                <View
                  className="rounded-2xl p-4"
                  style={{
                    backgroundColor: colors.surface,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.03,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-foreground dark:text-foreground-dark">Chemistry Elements</Text>
                      <Text className="text-xs text-muted dark:text-muted-dark mt-1">Science</Text>
                    </View>
                    <Text className="text-xs text-muted dark:text-muted-dark">18 cards</Text>
                  </View>
                  <View className="flex-row gap-2 mt-3">
                    <Pressable
                      className="flex-1 rounded-xl p-2.5 active:opacity-80"
                      style={{ backgroundColor: colors.primary + '14', borderWidth: 1, borderColor: colors.primary + '40' }}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Alert.alert("Study Deck", "Spaced repetition study mode coming soon!", [{ text: "OK" }]);
                      }}
                    >
                      <Text className="text-xs font-bold text-center" style={{ color: colors.primary }}>Study</Text>
                    </Pressable>
                    <Pressable
                      className="flex-1 rounded-xl p-2.5 active:opacity-80"
                      style={{ backgroundColor: colors.border + '40' }}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Alert.alert("Edit Deck", "Deck editing is coming soon!", [{ text: "OK" }]);
                      }}
                    >
                      <Text className="text-xs font-bold text-muted dark:text-muted-dark text-center">Edit</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
