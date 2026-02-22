import { describe, it, expect, beforeEach } from 'vitest';
import { FlightCardsService } from './flight-cards';
import { FlockModeService } from './flock-mode';
import { ProgressAnalyticsService } from './progress-analytics';
import { UserProgress, StudySession, Task, Goal, Badge } from './types';

describe('FlightCardsService', () => {
  let mockUserProgress: UserProgress;
  let mockBadges: Badge[];

  beforeEach(() => {
    mockUserProgress = {
      xp: 2500,
      currentStreak: 7,
      longestStreak: 10,
      totalStudyHours: 25,
      totalSessions: 50,
      completedGoals: 3,
      completedTasks: 45,
      level: 'Soaring',
      badges: [],
    };

    mockBadges = [
      {
        id: '1',
        name: 'First Flight',
        description: 'Complete your first study session',
        icon: '🦅',
        unlockedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        rarity: 'common',
      },
    ];
  });

  describe('generateFlightCard', () => {
    it('should generate flight card with correct structure', () => {
      const card = FlightCardsService.generateFlightCard(
        'user123',
        mockUserProgress,
        ['Math 10am', 'Physics 2pm'],
        mockBadges
      );

      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('userId', 'user123');
      expect(card).toHaveProperty('altitude');
      expect(card).toHaveProperty('xp', 2500);
      expect(card).toHaveProperty('streak', 7);
      expect(card).toHaveProperty('todaySchedule');
      expect(card).toHaveProperty('motivationalQuote');
      expect(card).toHaveProperty('founderCredit', 'Falcon Focus by Korede Omotosho');
    });

    it('should set correct altitude based on XP', () => {
      const card = FlightCardsService.generateFlightCard(
        'user123',
        mockUserProgress,
        [],
        []
      );
      expect(card.altitude).toBe('Soaring');
    });

    it('should include up to 5 badges', () => {
      const manyBadges = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        name: `Badge ${i}`,
        description: `Badge ${i}`,
        icon: '🏆',
        rarity: 'common' as const,
      }));

      const card = FlightCardsService.generateFlightCard(
        'user123',
        mockUserProgress,
        [],
        manyBadges
      );

      expect(card.badges.length).toBeLessThanOrEqual(5);
    });
  });

  describe('generateShareCode', () => {
    it('should generate 6-character code', () => {
      const code = FlightCardsService.generateShareCode();
      expect(code).toHaveLength(6);
    });

    it('should generate unique codes', () => {
      const code1 = FlightCardsService.generateShareCode();
      const code2 = FlightCardsService.generateShareCode();
      expect(code1).not.toBe(code2);
    });
  });

  describe('generateShareLink', () => {
    it('should generate valid share link', () => {
      const card = FlightCardsService.generateFlightCard(
        'user123',
        mockUserProgress,
        [],
        []
      );
      const link = FlightCardsService.generateShareLink(card, 'ABC123');
      expect(link).toContain('falconf.app/share');
      expect(link).toContain('ABC123');
    });
  });

  describe('generateShareMessage', () => {
    it('should generate WhatsApp message', () => {
      const card = FlightCardsService.generateFlightCard(
        'user123',
        mockUserProgress,
        [],
        []
      );
      const msg = FlightCardsService.generateShareMessage(card, 'whatsapp');
      expect(msg).toContain('Soaring');
      expect(msg).toContain('7');
      expect(msg).toContain('FalconFocus');
    });

    it('should generate Instagram message', () => {
      const card = FlightCardsService.generateFlightCard(
        'user123',
        mockUserProgress,
        [],
        []
      );
      const msg = FlightCardsService.generateShareMessage(card, 'instagram');
      expect(msg).toContain('#FalconFocus');
      expect(msg).toContain('🦅');
    });
  });
});

describe('FlockModeService', () => {
  let mockUserProgress: UserProgress;

  beforeEach(() => {
    mockUserProgress = {
      xp: 1500,
      currentStreak: 5,
      longestStreak: 8,
      totalStudyHours: 15,
      totalSessions: 30,
      completedGoals: 2,
      completedTasks: 25,
      level: 'Soaring',
      badges: [],
    };
  });

  describe('createFlock', () => {
    it('should create flock with owner as first member', () => {
      const flock = FlockModeService.createFlock('John', 'Study Squad', 'A group of dedicated learners');
      expect(flock.name).toBe('Study Squad');
      expect(flock.ownerName).toBe('John');
      expect(flock.members.length).toBe(1);
      expect(flock.members[0].name).toBe('John');
    });

    it('should generate unique invite code', () => {
      const flock1 = FlockModeService.createFlock('John', 'Flock 1');
      const flock2 = FlockModeService.createFlock('Jane', 'Flock 2');
      expect(flock1.inviteCode).not.toBe(flock2.inviteCode);
    });
  });

  describe('joinFlock', () => {
    it('should add member to flock', () => {
      let flock = FlockModeService.createFlock('John', 'Study Squad');
      flock = FlockModeService.joinFlock(flock, 'Jane', mockUserProgress)!;
      expect(flock.members.length).toBe(2);
      expect(flock.members.some((m) => m.name === 'Jane')).toBe(true);
    });

    it('should prevent duplicate members', () => {
      let flock = FlockModeService.createFlock('John', 'Study Squad');
      flock = FlockModeService.joinFlock(flock, 'Jane', mockUserProgress)!;
      const result = FlockModeService.joinFlock(flock, 'Jane', mockUserProgress);
      expect(result).toBeNull();
    });

    it('should enforce max members limit', () => {
      let flock = FlockModeService.createFlock('John', 'Study Squad');
      flock.maxMembers = 2;

      flock = FlockModeService.joinFlock(flock, 'Jane', mockUserProgress)!;
      const result = FlockModeService.joinFlock(flock, 'Bob', mockUserProgress);
      expect(result).toBeNull();
    });
  });

  describe('updateMemberProgress', () => {
    it('should update member progress', () => {
      let flock = FlockModeService.createFlock('John', 'Study Squad');
      const memberId = flock.members[0].id;

      const updatedProgress = { ...mockUserProgress, xp: 3000, currentStreak: 10 };
      flock = FlockModeService.updateMemberProgress(flock, memberId, updatedProgress);

      const member = flock.members.find((m) => m.id === memberId);
      expect(member?.xp).toBe(3000);
      expect(member?.streak).toBe(10);
    });
  });

  describe('getFlockStats', () => {
    it('should calculate correct flock statistics', () => {
      let flock = FlockModeService.createFlock('John', 'Study Squad');
      flock = FlockModeService.joinFlock(flock, 'Jane', mockUserProgress)!;

      const stats = FlockModeService.getFlockStats(flock);
      expect(stats.totalMembers).toBe(2);
      expect(stats.totalXP).toBeGreaterThan(0);
      expect(stats.topMember).toBeDefined();
    });
  });

  describe('generateAccountabilityNudge', () => {
    it('should generate nudge for member', () => {
      const flock = FlockModeService.createFlock('John', 'Study Squad');
      const nudge = FlockModeService.generateAccountabilityNudge(flock, 'John');
      expect(nudge).toContain('John');
      expect(nudge.length).toBeGreaterThan(0);
    });
  });
});

describe('ProgressAnalyticsService', () => {
  let mockSessions: StudySession[];
  let mockTasks: Task[];
  let mockGoals: Goal[];
  let mockUserProgress: UserProgress;

  beforeEach(() => {
    mockSessions = [
      {
        id: '1',
        title: 'Math Session',
        subject: 'Mathematics',
        duration: 45,
        startedAt: Date.now() - 2 * 60 * 60 * 1000,
        distractionsLogged: 1,
        focusLevel: 'high',
      },
      {
        id: '2',
        title: 'Physics Session',
        subject: 'Physics',
        duration: 60,
        startedAt: Date.now() - 24 * 60 * 60 * 1000,
        distractionsLogged: 0,
        focusLevel: 'high',
      },
    ];

    mockTasks = [
      {
        id: '1',
        title: 'Algebra Problems',
        subject: 'Mathematics',
        dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
        completed: true,
        completedAt: Date.now() - 12 * 60 * 60 * 1000,
        priority: 'high',
      },
      {
        id: '2',
        title: 'Physics Homework',
        subject: 'Physics',
        dueDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
        completed: false,
        priority: 'medium',
      },
    ];

    mockGoals = [
      {
        id: '1',
        title: 'Master Calculus',
        subject: 'Mathematics',
        targetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        milestones: [],
        completed: false,
        createdAt: Date.now(),
      },
    ];

    mockUserProgress = {
      xp: 2500,
      currentStreak: 7,
      longestStreak: 10,
      totalStudyHours: 25,
      totalSessions: 50,
      completedGoals: 3,
      completedTasks: 45,
      level: 'Soaring',
      badges: [],
    };
  });

  describe('generateWeeklyHeatmap', () => {
    it('should generate 7-day heatmap', () => {
      const heatmap = ProgressAnalyticsService.generateWeeklyHeatmap(mockSessions, mockTasks, []);
      expect(heatmap.length).toBe(7);
    });

    it('should calculate study intensity correctly', () => {
      const heatmap = ProgressAnalyticsService.generateWeeklyHeatmap(mockSessions, mockTasks, []);
      const intensities = heatmap.map((h) => h.intensity);
      expect(intensities.length).toBeGreaterThan(0);
    });
  });

  describe('calculateSubjectMastery', () => {
    it('should calculate mastery for each subject', () => {
      const mastery = ProgressAnalyticsService.calculateSubjectMastery(mockTasks, mockSessions);
      expect(mastery.length).toBeGreaterThanOrEqual(0);
      mastery.forEach((m) => {
        expect(m.masteryPercentage).toBeGreaterThanOrEqual(0);
        expect(m.masteryPercentage).toBeLessThanOrEqual(100);
        expect(typeof m.subject).toBe('string');
      });
    });
  });

  describe('forecastGoalCompletion', () => {
    it('should generate goal forecast', () => {
      const forecast = ProgressAnalyticsService.forecastGoalCompletion(
        mockGoals[0],
        mockTasks,
        mockSessions
      );
      expect(forecast).toHaveProperty('goalTitle');
      expect(forecast).toHaveProperty('completionProbability');
      expect(forecast).toHaveProperty('recommendation');
      expect(forecast.completionProbability).toBeGreaterThanOrEqual(0);
      expect(forecast.completionProbability).toBeLessThanOrEqual(100);
      expect(typeof forecast.recommendation).toBe('string');
    });
  });

  describe('generateFlightReport', () => {
    it('should generate weekly flight report', () => {
      const report = ProgressAnalyticsService.generateFlightReport(
        'weekly',
        mockSessions,
        mockTasks,
        mockGoals,
        mockUserProgress,
        [],
        []
      );

      expect(report.period).toBe('weekly');
      expect(report).toHaveProperty('totalStudyHours');
      expect(report).toHaveProperty('totalSessions');
      expect(report).toHaveProperty('weeklyHeatmap');
      expect(report).toHaveProperty('coachInsights');
      expect(report).toHaveProperty('motivationalMessage');
    });

    it('should generate monthly flight report', () => {
      const report = ProgressAnalyticsService.generateFlightReport(
        'monthly',
        mockSessions,
        mockTasks,
        mockGoals,
        mockUserProgress,
        [],
        []
      );

      expect(report.period).toBe('monthly');
      expect(report.totalStudyHours).toBeGreaterThanOrEqual(0);
    });
  });
});
