import { Text, View, Pressable, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { FlashcardDeck, Flashcard } from '@/lib/types';

const STORAGE_KEY = 'falcon_focus_data';

const DIFFICULTY_MAP: Record<number, Flashcard['difficulty']> = {
  1: 'hard',
  2: 'hard',
  3: 'medium',
  4: 'easy',
  5: 'easy',
};

export default function FlashcardStudyScreen() {
  const colors = useColors();
  const router = useRouter();
  const { deckId } = useLocalSearchParams<{ deckId: string }>();

  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  const flipProgress = useSharedValue(0);

  const loadDeck = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setLoading(false);
        return;
      }
      const data = JSON.parse(stored) as Record<string, unknown>;
      const decks = (data.flashcardDecks as FlashcardDeck[]) ?? [];
      const found = decks.find((d) => d.id === deckId);
      if (found) setDeck(found);
    } catch (e) {
      console.error('Error loading deck:', e);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  const frontAnimStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden' as const,
    };
  });

  const backAnimStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden' as const,
    };
  });

  const handleFlip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = isFlipped ? 0 : 1;
    flipProgress.value = withTiming(next, { duration: 300 });
    setIsFlipped(!isFlipped);
  }, [isFlipped, flipProgress]);

  const handleRating = useCallback(
    async (rating: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (!deck) return;

      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        const data = JSON.parse(stored) as Record<string, unknown>;
        const decks = (data.flashcardDecks as FlashcardDeck[]) ?? [];
        const deckIndex = decks.findIndex((d) => d.id === deck.id);
        if (deckIndex === -1) return;

        const updatedCards = [...deck.cards];
        const card = updatedCards[currentIndex];
        if (card) {
          updatedCards[currentIndex] = {
            ...card,
            difficulty: DIFFICULTY_MAP[rating] ?? 'medium',
            lastReviewedAt: Date.now(),
            reviewCount: card.reviewCount + 1,
          };
        }

        const updatedDeck: FlashcardDeck = {
          ...deck,
          cards: updatedCards,
          updatedAt: Date.now(),
        };
        decks[deckIndex] = updatedDeck;
        data.flashcardDecks = decks;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setDeck(updatedDeck);
      } catch (e) {
        console.error('Error saving rating:', e);
      }

      // Move to next card
      flipProgress.value = withTiming(0, { duration: 200 });
      setIsFlipped(false);

      if (currentIndex < deck.cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        router.back();
      }
    },
    [deck, currentIndex, flipProgress, router],
  );

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  if (loading) {
    return (
      <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!deck || deck.cards.length === 0) {
    return (
      <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
        <View
          className="flex-row items-center px-4 py-3"
          style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          <Pressable className="active:opacity-70" onPress={handleBack}>
            <Text className="text-base" style={{ color: colors.primary }}>
              ← Back
            </Text>
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-5xl mb-4">🃏</Text>
          <Text
            className="text-lg font-bold text-center mb-2"
            style={{ color: colors.foreground }}
          >
            No Cards in This Deck
          </Text>
          <Text
            className="text-sm text-center"
            style={{ color: colors.muted }}
          >
            Add cards to this deck before starting a study session.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const card = deck.cards[currentIndex];
  const progress = (currentIndex + 1) / deck.cards.length;

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        <Pressable className="active:opacity-70" onPress={handleBack}>
          <Text className="text-base" style={{ color: colors.primary }}>
            ← Back
          </Text>
        </Pressable>
        <Text
          className="text-sm font-bold"
          style={{ color: colors.foreground }}
        >
          {deck.title}
        </Text>
        <Pressable
          className="rounded-xl px-4 py-2 active:opacity-80"
          style={{ backgroundColor: colors.surface }}
          onPress={handleBack}
        >
          <Text className="text-xs font-bold" style={{ color: colors.error }}>
            End
          </Text>
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xs font-bold" style={{ color: colors.muted }}>
            {currentIndex + 1} of {deck.cards.length}
          </Text>
          <Text className="text-xs" style={{ color: colors.muted }}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
        <View
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: colors.border }}
        >
          <View
            className="h-2 rounded-full"
            style={{
              backgroundColor: colors.primary,
              width: `${progress * 100}%`,
            }}
          />
        </View>
      </View>

      {/* Card */}
      <View className="flex-1 px-4 py-6 justify-center">
        <Pressable onPress={handleFlip} className="items-center">
          <View style={{ width: '100%', height: 300 }}>
            {/* Front Face */}
            <Animated.View
              className="absolute inset-0 rounded-2xl items-center justify-center p-6"
              style={[
                {
                  backgroundColor: colors.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 4,
                  width: '100%',
                  height: '100%',
                },
                frontAnimStyle,
              ]}
            >
              <Text
                className="text-xs font-bold mb-4"
                style={{ color: colors.muted }}
              >
                QUESTION
              </Text>
              <Text
                className="text-lg font-bold text-center leading-relaxed"
                style={{ color: colors.foreground }}
              >
                {card?.front ?? ''}
              </Text>
              <Text
                className="text-xs mt-6"
                style={{ color: colors.muted }}
              >
                Tap to reveal
              </Text>
            </Animated.View>

            {/* Back Face */}
            <Animated.View
              className="absolute inset-0 rounded-2xl items-center justify-center p-6"
              style={[
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: 4,
                  width: '100%',
                  height: '100%',
                },
                backAnimStyle,
              ]}
            >
              <Text className="text-xs font-bold mb-4 text-white opacity-70">
                ANSWER
              </Text>
              <Text className="text-lg font-bold text-center text-white leading-relaxed">
                {card?.back ?? ''}
              </Text>
            </Animated.View>
          </View>
        </Pressable>

        {/* Rating Row (visible after flip) */}
        {isFlipped && (
          <View className="mt-8">
            <Text
              className="text-xs font-bold text-center mb-3"
              style={{ color: colors.muted }}
            >
              How well did you know this?
            </Text>
            <View className="flex-row justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  className="w-12 h-12 rounded-full items-center justify-center active:opacity-80"
                  style={{
                    backgroundColor:
                      star <= 2
                        ? colors.error + '20'
                        : star === 3
                          ? colors.warning + '20'
                          : colors.success + '20',
                    borderWidth: 1,
                    borderColor:
                      star <= 2
                        ? colors.error + '40'
                        : star === 3
                          ? colors.warning + '40'
                          : colors.success + '40',
                  }}
                  onPress={() => handleRating(star)}
                >
                  <Text className="text-lg">{'⭐'}</Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row justify-between px-2 mt-2">
              <Text className="text-xs" style={{ color: colors.error }}>
                Hard
              </Text>
              <Text className="text-xs" style={{ color: colors.success }}>
                Easy
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
