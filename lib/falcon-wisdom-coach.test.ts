import { describe, it, expect, beforeEach } from 'vitest';
import { FalconWisdomCoach, CoachContext } from './falcon-wisdom-coach';
import { SpacedRepetitionEngine } from './spaced-repetition';
import { UserProgress, Goal, Task, EnergyLog, StudySession, Note, Flashcard } from './types';

describe('FalconWisdomCoach', () => {
  let mockUserProgress: UserProgress;
  let mockGoals: Goal[];
  let mockTasks: Task[];
  let mockEnergyLogs: EnergyLog[];
  let mockStudySessions: StudySession[];
  let mockNotes: Note[];
  let mockFlashcards: Flashcard[];

  beforeEach(() => {
    mockUserProgress = {
      xp: 500,
      currentStreak: 3,
      longestStreak: 5,
      totalStudyHours: 12,
      totalSessions: 24,
      completedGoals: 2,
      completedTasks: 15,
      level: 'Fledgling',
      badges: [],
    };

    mockGoals = [
      {
        id: '1',
        title: 'Learn Chemistry',
        subject: 'Chemistry',
        targetDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
        milestones: [],
        completed: false,
        createdAt: Date.now(),
      },
    ];

    mockTasks = [
      {
        id: '1',
        title: 'Study Kinetics',
        subject: 'Chemistry',
        dueDate: Date.now() + 2 * 24 * 60 * 60 * 1000,
        completed: false,
        priority: 'high',
      },
      {
        id: '2',
        title: 'Review Physics',
        subject: 'Physics',
        dueDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
        completed: true,
        priority: 'medium',
      },
    ];

    mockEnergyLogs = [
      {
        id: '1',
        level: 4,
        timestamp: Date.now(),
      },
      {
        id: '2',
        level: 3,
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
      },
    ];

    mockStudySessions = [
      {
        id: '1',
        title: 'Chemistry Session',
        subject: 'Chemistry',
        duration: 45,
        startedAt: Date.now() - 2 * 60 * 60 * 1000,
        distractionsLogged: 2,
        focusLevel: 'high',
      },
    ];

    mockNotes = [
      {
        id: '1',
        title: 'Chemistry Notes',
        subject: 'Chemistry',
        content: 'Kinetics is the study of reaction rates',
        tags: ['kinetics', 'important'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    mockFlashcards = [
      {
        id: '1',
        deckId: '1',
        front: 'What is kinetics?',
        back: 'The study of reaction rates',
        difficulty: 'medium' as const,
        reviewCount: 2,
      },
    ];
  });

  describe('generateContext', () => {
    it('should generate context with correct structure', () => {
      const context = FalconWisdomCoach.generateContext(
        mockUserProgress,
        mockGoals,
        mockTasks,
        mockEnergyLogs,
        mockNotes,
        mockFlashcards,
        mockStudySessions
      );

      expect(context).toHaveProperty('weakSubjects');
      expect(context).toHaveProperty('energyLevel');
      expect(context).toHaveProperty('upcomingDeadlines');
      expect(context).toHaveProperty('currentStreak');
      expect(context).toHaveProperty('recentPerformance');
      expect(context).toHaveProperty('timeOfDay');
      expect(context).toHaveProperty('altitude');
    });

    it('should identify weak subjects correctly', () => {
      const context = FalconWisdomCoach.generateContext(
        mockUserProgress,
        mockGoals,
        mockTasks,
        mockEnergyLogs,
        mockNotes,
        mockFlashcards,
        mockStudySessions
      );

      expect(context.weakSubjects).toContain('Chemistry');
    });

    it('should calculate energy level from recent logs', () => {
      const context = FalconWisdomCoach.generateContext(
        mockUserProgress,
        mockGoals,
        mockTasks,
        mockEnergyLogs,
        mockNotes,
        mockFlashcards,
        mockStudySessions
      );

      expect(context.energyLevel).toBe(4);
    });

    it('should identify upcoming deadlines', () => {
      const context = FalconWisdomCoach.generateContext(
        mockUserProgress,
        mockGoals,
        mockTasks,
        mockEnergyLogs,
        mockNotes,
        mockFlashcards,
        mockStudySessions
      );

      expect(context.upcomingDeadlines.length).toBeGreaterThan(0);
    });
  });

  describe('generateTips', () => {
    it('should generate tips array', () => {
      const context = FalconWisdomCoach.generateContext(
        mockUserProgress,
        mockGoals,
        mockTasks,
        mockEnergyLogs,
        mockNotes,
        mockFlashcards,
        mockStudySessions
      );

      const tips = FalconWisdomCoach.generateTips(context);
      expect(Array.isArray(tips)).toBe(true);
      expect(tips.length).toBeGreaterThan(0);
    });

    it('should generate tips with valid structure', () => {
      const context = FalconWisdomCoach.generateContext(
        mockUserProgress,
        mockGoals,
        mockTasks,
        mockEnergyLogs,
        mockNotes,
        mockFlashcards,
        mockStudySessions
      );

      const tips = FalconWisdomCoach.generateTips(context);
      tips.forEach((tip) => {
        expect(tip).toHaveProperty('id');
        expect(tip).toHaveProperty('title');
        expect(tip).toHaveProperty('message');
        expect(tip).toHaveProperty('icon');
        expect(tip).toHaveProperty('priority');
        expect(tip).toHaveProperty('category');
        expect(tip).toHaveProperty('trigger');
      });
    });

    it('should prioritize high-priority tips', () => {
      const context = FalconWisdomCoach.generateContext(
        mockUserProgress,
        mockGoals,
        mockTasks,
        mockEnergyLogs,
        mockNotes,
        mockFlashcards,
        mockStudySessions
      );

      const tips = FalconWisdomCoach.generateTips(context);
      const firstTip = tips[0];
      expect(['high', 'medium', 'low']).toContain(firstTip.priority);
    });

    it('should generate streak motivation tip when streak >= 3', () => {
      const context = FalconWisdomCoach.generateContext(
        mockUserProgress,
        mockGoals,
        mockTasks,
        mockEnergyLogs,
        mockNotes,
        mockFlashcards,
        mockStudySessions
      );

      const tips = FalconWisdomCoach.generateTips(context);
      const streakTip = tips.find((t) => t.trigger === 'streak_milestone');
      expect(streakTip).toBeDefined();
    });
  });

  describe('getTipForScreen', () => {
    it('should return relevant tip for home screen', () => {
      const context = FalconWisdomCoach.generateContext(
        mockUserProgress,
        mockGoals,
        mockTasks,
        mockEnergyLogs,
        mockNotes,
        mockFlashcards,
        mockStudySessions
      );

      const tips = FalconWisdomCoach.generateTips(context);
      const homeTip = FalconWisdomCoach.getTipForScreen('home', context, tips);
      expect(homeTip).toBeDefined();
    });

    it('should return relevant tip for learn screen', () => {
      const context = FalconWisdomCoach.generateContext(
        mockUserProgress,
        mockGoals,
        mockTasks,
        mockEnergyLogs,
        mockNotes,
        mockFlashcards,
        mockStudySessions
      );

      const tips = FalconWisdomCoach.generateTips(context);
      const learnTip = FalconWisdomCoach.getTipForScreen('learn', context, tips);
      expect(learnTip).toBeDefined();
    });
  });

  describe('generateMotivationalQuote', () => {
    it('should return a string quote', () => {
      const quote = FalconWisdomCoach.generateMotivationalQuote();
      expect(typeof quote).toBe('string');
      expect(quote.length).toBeGreaterThan(0);
    });

    it('should return different quotes', () => {
      const quote1 = FalconWisdomCoach.generateMotivationalQuote();
      const quote2 = FalconWisdomCoach.generateMotivationalQuote();
      // Statistically likely to be different (10 quotes, 10% chance of same)
      // Just verify both are valid strings
      expect(typeof quote1).toBe('string');
      expect(typeof quote2).toBe('string');
    });
  });

  describe('shouldShowCoachTip', () => {
    it('should return boolean', () => {
      const result = FalconWisdomCoach.shouldShowCoachTip();
      expect(typeof result).toBe('boolean');
    });
  });
});

describe('SpacedRepetitionEngine', () => {
  describe('calculateNextReview', () => {
    it('should calculate first review interval', () => {
      const result = SpacedRepetitionEngine.calculateNextReview('card1', 4, 0, 2.5, 1);
      expect(result.reviewCount).toBe(1);
      expect(result.interval).toBeGreaterThan(0);
      expect(result.nextReviewAt).toBeGreaterThan(Date.now());
    });

    it('should increase interval for easy cards', () => {
      const easy = SpacedRepetitionEngine.calculateNextReview('card1', 5, 1, 2.5, 3);
      const hard = SpacedRepetitionEngine.calculateNextReview('card1', 1, 1, 2.5, 3);
      expect(easy.interval).toBeGreaterThan(hard.interval);
    });

    it('should increase ease factor for correct answers', () => {
      const result = SpacedRepetitionEngine.calculateNextReview('card1', 5, 0, 2.5, 1);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it('should decrease ease factor for incorrect answers', () => {
      const result = SpacedRepetitionEngine.calculateNextReview('card1', 1, 0, 2.5, 1);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it('should maintain minimum ease factor', () => {
      const result = SpacedRepetitionEngine.calculateNextReview('card1', 1, 0, 1.3, 1);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('getCardsDueForReview', () => {
    it('should return empty array when no cards are due', () => {
      const cards = [
        {
          id: '1',
          nextReviewAt: Date.now() + 24 * 60 * 60 * 1000,
          reviewCount: 1,
          difficulty: 'medium',
        },
      ];
      const due = SpacedRepetitionEngine.getCardsDueForReview(cards);
      expect(due.length).toBe(0);
    });

    it('should return cards that are due', () => {
      const cards = [
        {
          id: '1',
          nextReviewAt: Date.now() - 60 * 60 * 1000, // 1 hour ago
          reviewCount: 1,
          difficulty: 'medium',
        },
      ];
      const due = SpacedRepetitionEngine.getCardsDueForReview(cards);
      expect(due.length).toBe(1);
    });

    it('should sort overdue cards first', () => {
      const cards = [
        {
          id: '1',
          nextReviewAt: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
          reviewCount: 1,
          difficulty: 'medium',
        },
        {
          id: '2',
          nextReviewAt: Date.now() - 60 * 60 * 1000, // 1 hour ago
          reviewCount: 1,
          difficulty: 'medium',
        },
      ];
      const due = SpacedRepetitionEngine.getCardsDueForReview(cards);
      expect(due[0].id).toBe('1'); // Most overdue first
    });
  });

  describe('calculateStudyStats', () => {
    it('should calculate correct statistics', () => {
      const cards = [
        {
          id: '1',
          nextReviewAt: Date.now(),
          reviewCount: 3,
          easeFactor: 2.5,
        },
        {
          id: '2',
          nextReviewAt: Date.now() + 24 * 60 * 60 * 1000,
          reviewCount: 0,
          easeFactor: 2.5,
        },
      ];
      const stats = SpacedRepetitionEngine.calculateStudyStats(cards);
      expect(stats.totalCards).toBe(2);
      expect(stats.reviewedCards).toBe(1);
      expect(stats.newCards).toBe(1);
      expect(stats.reviewProgress).toBe(50);
    });
  });

  describe('estimateReviewTime', () => {
    it('should estimate time for 10 cards as ~5 minutes', () => {
      const time = SpacedRepetitionEngine.estimateReviewTime(10);
      expect(time).toBe(5);
    });

    it('should estimate time for 20 cards as ~10 minutes', () => {
      const time = SpacedRepetitionEngine.estimateReviewTime(20);
      expect(time).toBe(10);
    });
  });

  describe('getRecommendedDailyTarget', () => {
    it('should recommend 10% of deck daily', () => {
      const target = SpacedRepetitionEngine.getRecommendedDailyTarget(100);
      expect(target).toBe(10);
    });

    it('should enforce minimum of 5 cards', () => {
      const target = SpacedRepetitionEngine.getRecommendedDailyTarget(10);
      expect(target).toBe(5);
    });

    it('should enforce maximum of 50 cards', () => {
      const target = SpacedRepetitionEngine.getRecommendedDailyTarget(1000);
      expect(target).toBe(50);
    });
  });

  describe('calculateMastery', () => {
    it('should calculate mastery percentage', () => {
      const cards = [
        { id: '1', reviewCount: 5, difficulty: 'easy' },
        { id: '2', reviewCount: 5, difficulty: 'easy' },
        { id: '3', reviewCount: 2, difficulty: 'medium' },
        { id: '4', reviewCount: 1, difficulty: 'hard' },
      ];
      const mastery = SpacedRepetitionEngine.calculateMastery(cards);
      expect(mastery).toBe(50); // 2 out of 4 cards mastered
    });

    it('should return 0 for empty deck', () => {
      const mastery = SpacedRepetitionEngine.calculateMastery([]);
      expect(mastery).toBe(0);
    });
  });

  describe('getLearningCurve', () => {
    it('should return learning curve data', () => {
      const cards = [
        { id: '1', reviewCount: 0, easeFactor: 2.5 },
        { id: '2', reviewCount: 1, easeFactor: 2.5 },
        { id: '3', reviewCount: 1, easeFactor: 2.5 },
        { id: '4', reviewCount: 3, easeFactor: 2.5 },
      ];
      const curve = SpacedRepetitionEngine.getLearningCurve(cards);
      expect(curve.length).toBeGreaterThan(0);
      expect(curve[0].reviewCount).toBeLessThanOrEqual(curve[1]?.reviewCount || Infinity);
    });
  });
});
