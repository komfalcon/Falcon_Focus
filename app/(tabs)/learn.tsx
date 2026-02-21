import { ScrollView, Text, View, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';

export default function LearnScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards'>('notes');

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground mb-1">Learn</Text>
            <Text className="text-xs text-muted">Notes & Flashcards</Text>
          </View>

          {/* Tab Toggle */}
          <View className="flex-row gap-2 mb-6">
            <Pressable
              className={`flex-1 rounded-lg p-3 active:opacity-80 ${
                activeTab === 'notes' ? 'bg-primary' : 'bg-surface border border-border'
              }`}
              onPress={() => setActiveTab('notes')}
            >
              <Text
                className={`text-sm font-semibold text-center ${
                  activeTab === 'notes' ? 'text-white' : 'text-foreground'
                }`}
              >
                Notes
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 rounded-lg p-3 active:opacity-80 ${
                activeTab === 'flashcards' ? 'bg-primary' : 'bg-surface border border-border'
              }`}
              onPress={() => setActiveTab('flashcards')}
            >
              <Text
                className={`text-sm font-semibold text-center ${
                  activeTab === 'flashcards' ? 'text-white' : 'text-foreground'
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
                className="bg-primary rounded-lg p-4 mb-6 active:opacity-80"
                onPress={() => {}}
              >
                <Text className="text-center font-semibold text-white">+ New Note</Text>
              </Pressable>

              <View className="gap-3">
                <View className="bg-surface rounded-lg p-4 border border-border">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">Calculus Derivatives</Text>
                      <Text className="text-xs text-muted mt-1">Mathematics</Text>
                    </View>
                    <Text className="text-xs text-muted">Today</Text>
                  </View>
                  <Text className="text-xs text-muted leading-relaxed">
                    The derivative of a function measures how the function changes as its input changes...
                  </Text>
                  <View className="flex-row gap-2 mt-3">
                    <View className="bg-primary/10 rounded px-2 py-1">
                      <Text className="text-xs text-primary font-semibold">Rich Text</Text>
                    </View>
                    <View className="bg-primary/10 rounded px-2 py-1">
                      <Text className="text-xs text-primary font-semibold">Images</Text>
                    </View>
                  </View>
                </View>

                <View className="bg-surface rounded-lg p-4 border border-border">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">Biology Photosynthesis</Text>
                      <Text className="text-xs text-muted mt-1">Biology</Text>
                    </View>
                    <Text className="text-xs text-muted">Yesterday</Text>
                  </View>
                  <Text className="text-xs text-muted leading-relaxed">
                    Photosynthesis is the process by which plants convert light energy into chemical energy...
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Flashcards Section */}
          {activeTab === 'flashcards' && (
            <View>
              <Pressable
                className="bg-primary rounded-lg p-4 mb-6 active:opacity-80"
                onPress={() => {}}
              >
                <Text className="text-center font-semibold text-white">+ New Deck</Text>
              </Pressable>

              <View className="gap-3">
                <View className="bg-gradient-to-r from-primary to-accent rounded-lg p-4 border border-primary">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-white">Spanish Vocabulary</Text>
                      <Text className="text-xs text-white/70 mt-1">Languages</Text>
                    </View>
                    <Text className="text-xs text-white/70">24 cards</Text>
                  </View>
                  <View className="flex-row gap-2 mt-3">
                    <Pressable className="flex-1 bg-white/20 rounded p-2 active:opacity-80">
                      <Text className="text-xs font-semibold text-white text-center">Study</Text>
                    </Pressable>
                    <Pressable className="flex-1 bg-white/20 rounded p-2 active:opacity-80">
                      <Text className="text-xs font-semibold text-white text-center">Edit</Text>
                    </Pressable>
                  </View>
                </View>

                <View className="bg-surface rounded-lg p-4 border border-border">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">Chemistry Elements</Text>
                      <Text className="text-xs text-muted mt-1">Science</Text>
                    </View>
                    <Text className="text-xs text-muted">18 cards</Text>
                  </View>
                  <View className="flex-row gap-2 mt-3">
                    <Pressable className="flex-1 bg-primary/10 rounded p-2 active:opacity-80 border border-primary">
                      <Text className="text-xs font-semibold text-primary text-center">Study</Text>
                    </Pressable>
                    <Pressable className="flex-1 bg-border rounded p-2 active:opacity-80">
                      <Text className="text-xs font-semibold text-muted text-center">Edit</Text>
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
