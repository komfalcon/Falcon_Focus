// Spaced Repetition Algorithm for Flashcards
// Based on SM-2 algorithm with modifications for mobile learning

export interface CardReviewData {
  cardId: string;
  difficulty: 1 | 2 | 3 | 4 | 5; // User rating 1-5
  reviewCount: number;
  easeFactor: number;
  interval: number; // days until next review
  nextReviewAt: number; // timestamp
}

export class SpacedRepetitionEngine {
  // SM-2 algorithm parameters
  private static readonly INITIAL_EASE_FACTOR = 2.5;
  private static readonly MIN_EASE_FACTOR = 1.3;
  private static readonly INITIAL_INTERVAL = 1; // day

  /**
   * Calculate next review time based on SM-2 algorithm
   * @param difficulty User rating 1-5 (1=very difficult, 5=very easy)
   * @param reviewCount Number of times reviewed
   * @param currentEaseFactor Current ease factor
   * @param previousInterval Previous interval in days
   * @returns Updated CardReviewData
   */
  static calculateNextReview(
    cardId: string,
    difficulty: 1 | 2 | 3 | 4 | 5,
    reviewCount: number,
    currentEaseFactor: number,
    previousInterval: number = 1
  ): CardReviewData {
    // Calculate new ease factor
    let newEaseFactor = currentEaseFactor + (0.1 - (5 - difficulty) * (0.08 + (5 - difficulty) * 0.02));
    newEaseFactor = Math.max(this.MIN_EASE_FACTOR, newEaseFactor);

    // Calculate interval based on review count
    let interval: number;
    if (reviewCount === 0) {
      interval = this.INITIAL_INTERVAL;
    } else if (reviewCount === 1) {
      interval = 3; // 3 days
    } else {
      // Interval grows exponentially
      interval = Math.round(previousInterval * newEaseFactor);
    }

    // Adjust interval based on difficulty
    if (difficulty <= 2) {
      // Card is difficult, review sooner
      interval = Math.max(1, Math.round(interval * 0.5));
    } else if (difficulty >= 4) {
      // Card is easy, can review later
      interval = Math.round(interval * 1.2);
    }

    const nextReviewAt = Date.now() + interval * 24 * 60 * 60 * 1000;

    return {
      cardId,
      difficulty,
      reviewCount: reviewCount + 1,
      easeFactor: newEaseFactor,
      interval,
      nextReviewAt,
    };
  }

  /**
   * Get cards due for review, sorted by priority
   * @param cards All flashcards
   * @returns Cards due for review, sorted by priority (overdue first)
   */
  static getCardsDueForReview(
    cards: Array<{
      id: string;
      nextReviewAt?: number;
      reviewCount: number;
      difficulty: string;
    }>
  ) {
    const now = Date.now();
    const dueCards = cards.filter((card) => {
      const nextReview = card.nextReviewAt || 0;
      return nextReview <= now;
    });

    // Sort by: overdue first, then by review count (new cards first)
    return dueCards.sort((a, b) => {
      const aOverdue = now - (a.nextReviewAt || 0);
      const bOverdue = now - (b.nextReviewAt || 0);
      if (aOverdue !== bOverdue) return bOverdue - aOverdue; // Most overdue first
      return a.reviewCount - b.reviewCount; // New cards first
    });
  }

  /**
   * Calculate study statistics
   */
  static calculateStudyStats(
    cards: Array<{
      id: string;
      nextReviewAt?: number;
      reviewCount: number;
      easeFactor?: number;
    }>
  ) {
    const now = Date.now();
    const totalCards = cards.length;
    const reviewedCards = cards.filter((c) => c.reviewCount > 0).length;
    const dueCards = cards.filter((c) => (c.nextReviewAt || 0) <= now).length;
    const newCards = cards.filter((c) => c.reviewCount === 0).length;

    const averageEaseFactor =
      cards.length > 0
        ? cards.reduce((sum, c) => sum + (c.easeFactor || this.INITIAL_EASE_FACTOR), 0) / cards.length
        : this.INITIAL_EASE_FACTOR;

    return {
      totalCards,
      reviewedCards,
      dueCards,
      newCards,
      reviewProgress: Math.round((reviewedCards / totalCards) * 100),
      averageEaseFactor: Math.round(averageEaseFactor * 100) / 100,
    };
  }

  /**
   * Estimate time to review all due cards
   * @param dueCards Number of cards due for review
   * @returns Estimated minutes
   */
  static estimateReviewTime(dueCards: number): number {
    // Average 30 seconds per card
    return Math.round((dueCards * 30) / 60);
  }

  /**
   * Get recommended daily review target
   */
  static getRecommendedDailyTarget(totalCards: number): number {
    // Recommend reviewing 10% of deck daily, minimum 5, maximum 50
    return Math.max(5, Math.min(50, Math.round(totalCards * 0.1)));
  }

  /**
   * Calculate mastery percentage for a deck
   */
  static calculateMastery(
    cards: Array<{
      id: string;
      reviewCount: number;
      difficulty?: string;
    }>
  ): number {
    if (cards.length === 0) return 0;

    const masteredCards = cards.filter((c) => c.reviewCount >= 5).length;
    return Math.round((masteredCards / cards.length) * 100);
  }

  /**
   * Get learning curve data for visualization
   */
  static getLearningCurve(
    cards: Array<{
      id: string;
      reviewCount: number;
      easeFactor?: number;
    }>
  ) {
    const reviewCounts = new Map<number, number>();
    cards.forEach((card) => {
      const count = card.reviewCount;
      reviewCounts.set(count, (reviewCounts.get(count) || 0) + 1);
    });

    return Array.from(reviewCounts.entries())
      .map(([reviewCount, cardCount]) => ({
        reviewCount,
        cardCount,
        percentage: Math.round((cardCount / cards.length) * 100),
      }))
      .sort((a, b) => a.reviewCount - b.reviewCount);
  }
}
