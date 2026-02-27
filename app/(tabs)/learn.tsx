import { ScrollView, Text, View, Pressable, Alert, Modal, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { EmptyState } from '@/components/empty-state';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { Note, FlashcardDeck } from '@/lib/types';

const STORAGE_KEY = 'falcon_focus_data';

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: '#6366f1',
  Science: '#10b981',
  English: '#f59e0b',
  History: '#ef4444',
  Languages: '#8b5cf6',
  Biology: '#14b8a6',
  Chemistry: '#f97316',
  Physics: '#3b82f6',
  Art: '#ec4899',
  Music: '#a855f7',
  Other: '#64748b',
};

function getSubjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] ?? SUBJECT_COLORS.Other;
}

function formatDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function LearnScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards'>('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>([]);
  const [deckModalVisible, setDeckModalVisible] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('');

  const indicatorX = useSharedValue(0);
  const TAB_WIDTH_FRACTION = 0.5;

  useLayoutEffect(() => {
    indicatorX.value = activeTab === 'notes' ? 0 : 1;
  }, [activeTab, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${indicatorX.value * TAB_WIDTH_FRACTION * 100}%`,
    width: `${TAB_WIDTH_FRACTION * 100}%`,
  }));

  const loadData = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as Record<string, unknown>;
        setNotes((data.notes as Note[]) ?? []);
        setFlashcardDecks((data.flashcardDecks as FlashcardDeck[]) ?? []);
      }
    } catch (e) {
      console.error('Error loading learn data:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const deleteNote = useCallback(async (noteId: string) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const data = JSON.parse(stored) as Record<string, unknown>;
      const currentNotes = (data.notes as Note[]) ?? [];
      data.notes = currentNotes.filter((n) => n.id !== noteId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setNotes(data.notes as Note[]);
    } catch (e) {
      console.error('Error deleting note:', e);
    }
  }, []);

  const deleteDeck = useCallback(async (deckId: string) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const data = JSON.parse(stored) as Record<string, unknown>;
      const currentDecks = (data.flashcardDecks as FlashcardDeck[]) ?? [];
      data.flashcardDecks = currentDecks.filter((d) => d.id !== deckId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setFlashcardDecks(data.flashcardDecks as FlashcardDeck[]);
    } catch (e) {
      console.error('Error deleting deck:', e);
    }
  }, []);

  const createDeck = useCallback(async () => {
    if (!newDeckTitle.trim()) return;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const data = stored ? (JSON.parse(stored) as Record<string, unknown>) : {};
      const currentDecks = (data.flashcardDecks as FlashcardDeck[]) ?? [];
      const newDeck: FlashcardDeck = {
        id: Date.now().toString(),
        title: newDeckTitle.trim(),
        subject: newDeckSubject.trim() || 'Other',
        cards: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      data.flashcardDecks = [...currentDecks, newDeck];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setFlashcardDecks(data.flashcardDecks as FlashcardDeck[]);
      setNewDeckTitle('');
      setNewDeckSubject('');
      setDeckModalVisible(false);
    } catch (e) {
      console.error('Error creating deck:', e);
    }
  }, [newDeckTitle, newDeckSubject]);

  const handleTabSwitch = useCallback((tab: 'notes' | 'flashcards') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    indicatorX.value = withTiming(tab === 'notes' ? 0 : 1, { duration: 200 });
  }, [indicatorX]);

  const handleNotePress = useCallback((noteId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(screens)/note-editor?noteId=${noteId}`);
  }, [router]);

  const handleNoteLongPress = useCallback((note: Note) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(note.title, undefined, [
      {
        text: 'Edit',
        onPress: () => router.push(`/(screens)/note-editor?noteId=${note.id}`),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteNote(note.id),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [router, deleteNote]);

  const handleDeckLongPress = useCallback((deck: FlashcardDeck) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(deck.title, undefined, [
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteDeck(deck.id),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [deleteDeck]);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground dark:text-foreground-dark mb-1 tracking-tight">Learn</Text>
            <Text className="text-xs text-muted dark:text-muted-dark">Notes & Flashcards</Text>
          </View>

          {/* Animated Tab Switcher */}
          <View
            className="flex-row rounded-2xl p-1 mb-6 relative"
            style={{ backgroundColor: colors.surface }}
          >
            <Animated.View
              className="absolute top-1 bottom-1 rounded-xl"
              style={[{ backgroundColor: colors.primary }, indicatorStyle]}
            />
            <Pressable
              className="flex-1 py-3 z-10"
              onPress={() => handleTabSwitch('notes')}
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
              className="flex-1 py-3 z-10"
              onPress={() => handleTabSwitch('flashcards')}
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
                  router.push('/(screens)/note-editor');
                }}
              >
                <Text className="text-center font-bold text-white text-base">+ New Note</Text>
              </Pressable>

              {notes.length === 0 ? (
                <EmptyState
                  emoji="📝"
                  title="No Notes Yet"
                  subtitle="Create your first note to start organizing your study material."
                  actionLabel="Create Note"
                  onAction={() => router.push('/(screens)/note-editor')}
                />
              ) : (
                <View className="gap-3">
                  {notes.map((note) => (
                    <Pressable
                      key={note.id}
                      className="rounded-2xl overflow-hidden active:opacity-90"
                      style={{
                        backgroundColor: colors.surface,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.03,
                        shadowRadius: 4,
                        elevation: 1,
                      }}
                      onPress={() => handleNotePress(note.id)}
                      onLongPress={() => handleNoteLongPress(note)}
                    >
                      <View className="flex-row">
                        <View style={{ width: 3, backgroundColor: getSubjectColor(note.subject) }} />
                        <View className="flex-1 p-4">
                          <View className="flex-row justify-between items-start mb-2">
                            <Text
                              className="text-sm font-bold text-foreground dark:text-foreground-dark flex-1 mr-2"
                              numberOfLines={1}
                            >
                              {note.title || 'Untitled'}
                            </Text>
                            <Text className="text-xs text-muted dark:text-muted-dark">
                              {formatDate(note.updatedAt)}
                            </Text>
                          </View>
                          {note.content ? (
                            <Text
                              className="text-xs text-muted dark:text-muted-dark leading-relaxed mb-3"
                              numberOfLines={2}
                            >
                              {note.content}
                            </Text>
                          ) : null}
                          <View className="flex-row items-center">
                            <View
                              className="rounded-lg px-2.5 py-1"
                              style={{ backgroundColor: getSubjectColor(note.subject) + '18' }}
                            >
                              <Text
                                className="text-xs font-bold"
                                style={{ color: getSubjectColor(note.subject) }}
                              >
                                {note.subject}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
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
                  setDeckModalVisible(true);
                }}
              >
                <Text className="text-center font-bold text-white text-base">+ New Deck</Text>
              </Pressable>

              {flashcardDecks.length === 0 ? (
                <EmptyState
                  emoji="🃏"
                  title="No Flashcard Decks"
                  subtitle="Create a deck to start studying with spaced repetition."
                  actionLabel="Create Deck"
                  onAction={() => setDeckModalVisible(true)}
                />
              ) : (
                <View className="gap-3">
                  {flashcardDecks.map((deck) => (
                    <Pressable
                      key={deck.id}
                      className="rounded-2xl p-4 active:opacity-90"
                      style={{
                        backgroundColor: colors.surface,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.03,
                        shadowRadius: 4,
                        elevation: 1,
                      }}
                      onLongPress={() => handleDeckLongPress(deck)}
                    >
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                          <Text className="text-sm font-bold text-foreground dark:text-foreground-dark">
                            {deck.title}
                          </Text>
                          <Text className="text-xs text-muted dark:text-muted-dark mt-1">
                            {deck.subject}
                          </Text>
                        </View>
                        <Text className="text-xs text-muted dark:text-muted-dark">
                          {deck.cards.length} {deck.cards.length === 1 ? 'card' : 'cards'}
                        </Text>
                      </View>
                      <View className="flex-row gap-2 mt-3">
                        <Pressable
                          className="flex-1 rounded-xl p-2.5 active:opacity-80"
                          style={{
                            backgroundColor: colors.primary + '14',
                            borderWidth: 1,
                            borderColor: colors.primary + '40',
                          }}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push(`/(screens)/flashcard-study?deckId=${deck.id}`);
                          }}
                        >
                          <Text
                            className="text-xs font-bold text-center"
                            style={{ color: colors.primary }}
                          >
                            Study
                          </Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* New Deck Modal */}
      <Modal
        visible={deckModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeckModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setDeckModalVisible(false)}
        >
          <Pressable
            className="w-[85%] rounded-2xl p-6"
            style={{ backgroundColor: colors.background }}
            onPress={() => {}}
          >
            <Text
              className="text-lg font-bold mb-4"
              style={{ color: colors.foreground }}
            >
              New Flashcard Deck
            </Text>
            <TextInput
              className="rounded-xl px-4 py-3 text-sm mb-3"
              style={{
                backgroundColor: colors.surface,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              placeholder="Deck name"
              placeholderTextColor={colors.muted}
              value={newDeckTitle}
              onChangeText={setNewDeckTitle}
            />
            <TextInput
              className="rounded-xl px-4 py-3 text-sm mb-5"
              style={{
                backgroundColor: colors.surface,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              placeholder="Subject (e.g. Mathematics)"
              placeholderTextColor={colors.muted}
              value={newDeckSubject}
              onChangeText={setNewDeckSubject}
            />
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 rounded-xl py-3 active:opacity-80"
                style={{ backgroundColor: colors.surface }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDeckModalVisible(false);
                  setNewDeckTitle('');
                  setNewDeckSubject('');
                }}
              >
                <Text
                  className="text-sm font-bold text-center"
                  style={{ color: colors.foreground }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 rounded-xl py-3 active:opacity-80"
                style={{ backgroundColor: colors.primary }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  createDeck();
                }}
              >
                <Text className="text-sm font-bold text-center text-white">Create</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
