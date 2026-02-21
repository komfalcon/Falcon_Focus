import { describe, it, expect } from 'vitest';
import { GamificationEngine, BADGES, FEATHER_REWARDS } from './gamification-engine';
import { BurnoutGuardian } from './burnout-guardian';

describe('GamificationEngine', () => {
  describe('Altitude Levels', () => {
    it('should return Fledgling for XP < 1000', () => {
      expect(GamificationEngine.getAltitudeLevel(500)).toBe('Fledgling');
      expect(GamificationEngine.getAltitudeLevel(999)).toBe('Fledgling');
    });

    it('should return Soaring for 1000 <= XP < 5000', () => {
      expect(GamificationEngine.getAltitudeLevel(1000)).toBe('Soaring');
      expect(GamificationEngine.getAltitudeLevel(3000)).toBe('Soaring');
      expect(GamificationEngine.getAltitudeLevel(4999)).toBe('Soaring');
    });

    it('should return Apex for XP >= 5000', () => {
      expect(GamificationEngine.getAltitudeLevel(5000)).toBe('Apex');
      expect(GamificationEngine.getAltitudeLevel(10000)).toBe('Apex');
    });
  });

  describe('Altitude Percentage', () => {
    it('should calculate correct percentage for Fledgling level', () => {
      expect(GamificationEngine.getAltitudePercentage(0)).toBe(0);
      expect(GamificationEngine.getAltitudePercentage(500)).toBe(50);
      expect(GamificationEngine.getAltitudePercentage(999)).toBeLessThan(100);
    });

    it('should calculate correct percentage for Soaring level', () => {
      expect(GamificationEngine.getAltitudePercentage(1000)).toBe(0);
      expect(GamificationEngine.getAltitudePercentage(3000)).toBeCloseTo(50, 0);
      expect(GamificationEngine.getAltitudePercentage(4999)).toBeLessThan(100);
    });

    it('should calculate correct percentage for Apex level', () => {
      expect(GamificationEngine.getAltitudePercentage(5000)).toBe(0);
      expect(GamificationEngine.getAltitudePercentage(7500)).toBeCloseTo(50, 0);
      expect(GamificationEngine.getAltitudePercentage(10000)).toBe(100);
    });
  });

  describe('XP to Next Level', () => {
    it('should return correct XP needed for Fledgling', () => {
      expect(GamificationEngine.getXpToNextLevel(0)).toBe(1000);
      expect(GamificationEngine.getXpToNextLevel(500)).toBe(500);
      expect(GamificationEngine.getXpToNextLevel(999)).toBe(1);
    });

    it('should return correct XP needed for Soaring', () => {
      expect(GamificationEngine.getXpToNextLevel(1000)).toBe(4000);
      expect(GamificationEngine.getXpToNextLevel(3000)).toBe(2000);
      expect(GamificationEngine.getXpToNextLevel(4999)).toBe(1);
    });

    it('should return correct XP needed for Apex', () => {
      expect(GamificationEngine.getXpToNextLevel(5000)).toBe(5000);
      expect(GamificationEngine.getXpToNextLevel(7500)).toBe(2500);
      expect(GamificationEngine.getXpToNextLevel(10000)).toBe(0);
    });
  });

  describe('Feather Rewards', () => {
    it('should return correct reward for session completion', () => {
      const reward = GamificationEngine.getFeatherReward('complete_session');
      expect(reward).toBeDefined();
      expect(reward?.feathers).toBe(10);
      expect(reward?.xp).toBe(50);
    });

    it('should return correct reward for goal completion', () => {
      const reward = GamificationEngine.getFeatherReward('complete_goal');
      expect(reward).toBeDefined();
      expect(reward?.feathers).toBe(50);
      expect(reward?.xp).toBe(200);
    });

    it('should return undefined for unknown action', () => {
      const reward = GamificationEngine.getFeatherReward('unknown_action');
      expect(reward).toBeUndefined();
    });
  });

  describe('Badges', () => {
    it('should have 20+ badges defined', () => {
      expect(BADGES.length).toBeGreaterThanOrEqual(20);
    });

    it('should have unique badge IDs', () => {
      const ids = BADGES.map(b => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid rarity levels', () => {
      const validRarities = ['common', 'rare', 'epic', 'legendary'];
      BADGES.forEach(badge => {
        expect(validRarities).toContain(badge.rarity);
      });
    });
  });

  describe('Quests', () => {
    it('should generate daily quests', () => {
      const dailyQuests = GamificationEngine.generateDailyQuests();
      expect(dailyQuests.length).toBeGreaterThan(0);
      expect(dailyQuests.every(q => q.type === 'daily')).toBe(true);
    });

    it('should generate weekly quests', () => {
      const weeklyQuests = GamificationEngine.generateWeeklyQuests();
      expect(weeklyQuests.length).toBeGreaterThan(0);
      expect(weeklyQuests.every(q => q.type === 'weekly')).toBe(true);
    });

    it('should have valid quest structure', () => {
      const quests = GamificationEngine.generateDailyQuests();
      quests.forEach(quest => {
        expect(quest.id).toBeDefined();
        expect(quest.title).toBeDefined();
        expect(quest.reward).toBeGreaterThan(0);
        expect(quest.target).toBeGreaterThan(0);
        expect(quest.completed).toBe(false);
      });
    });
  });

  describe('Streak Calculation', () => {
    it('should return 0 for no last session', () => {
      expect(GamificationEngine.calculateStreakStatus()).toBe(0);
    });

    it('should return 1 for session today', () => {
      const today = Date.now();
      expect(GamificationEngine.calculateStreakStatus(today)).toBe(1);
    });

    it('should return 1 for session yesterday', () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;
      expect(GamificationEngine.calculateStreakStatus(yesterday)).toBe(1);
    });

    it('should return 0 for session 2+ days ago', () => {
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      expect(GamificationEngine.calculateStreakStatus(twoDaysAgo)).toBe(0);
    });
  });
});

describe('BurnoutGuardian', () => {
  describe('Burnout Risk Analysis', () => {
    it('should return low risk for high energy', () => {
      const logs = [
        { level: 4 as any, timestamp: Date.now() },
        { level: 5 as any, timestamp: Date.now() - 24 * 60 * 60 * 1000 },
        { level: 4 as any, timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
      ];
      const result = BurnoutGuardian.analyzeBurnoutRisk(logs);
      expect(result.riskLevel).toBe('low');
      expect(result.status).toBe('Soaring');
    });

    it('should return medium risk for moderate energy', () => {
      const logs = [
        { level: 3 as any, timestamp: Date.now() },
        { level: 3 as any, timestamp: Date.now() - 24 * 60 * 60 * 1000 },
        { level: 2 as any, timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
      ];
      const result = BurnoutGuardian.analyzeBurnoutRisk(logs);
      expect(result.riskLevel).toBe('medium');
      expect(['Gliding', 'Recovering']).toContain(result.status);
    });

    it('should return high risk for low energy', () => {
      const logs = [
        { level: 1 as any, timestamp: Date.now() },
        { level: 1 as any, timestamp: Date.now() - 24 * 60 * 60 * 1000 },
        { level: 2 as any, timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
      ];
      const result = BurnoutGuardian.analyzeBurnoutRisk(logs);
      expect(result.riskLevel).toBe('high');
      expect(result.status).toBe('Caution');
    });

    it('should handle empty logs', () => {
      const result = BurnoutGuardian.analyzeBurnoutRisk([]);
      expect(result.riskLevel).toBe('low');
      expect(result.status).toBe('Soaring');
      expect(result.averageEnergyThisWeek).toBe(3);
    });
  });

  describe('Energy Forecast', () => {
    it('should generate valid forecast', () => {
      const logs = [
        { level: 4 as any, timestamp: Date.now() },
        { level: 4 as any, timestamp: Date.now() - 24 * 60 * 60 * 1000 },
      ];
      const forecast = BurnoutGuardian.generateEnergyForecast(logs, 5);
      expect(forecast.today).toBeGreaterThanOrEqual(1);
      expect(forecast.today).toBeLessThanOrEqual(5);
      expect(forecast.tomorrow).toBeGreaterThanOrEqual(1);
      expect(forecast.tomorrow).toBeLessThanOrEqual(5);
      expect(['improving', 'stable', 'declining']).toContain(forecast.trend);
      expect(forecast.recommendation).toBeDefined();
    });

    it('should predict improving trend', () => {
      const logs = [
        { level: 1 as any, timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000 },
        { level: 2 as any, timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
        { level: 3 as any, timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000 },
        { level: 4 as any, timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
        { level: 4 as any, timestamp: Date.now() - 24 * 60 * 60 * 1000 },
        { level: 5 as any, timestamp: Date.now() },
      ];
      const forecast = BurnoutGuardian.generateEnergyForecast(logs, 5);
      expect(forecast.trend).toBe('improving');
    });

    it('should predict declining trend', () => {
      const logs = [
        { level: 5 as any, timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000 },
        { level: 4 as any, timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
        { level: 3 as any, timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000 },
        { level: 2 as any, timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
        { level: 2 as any, timestamp: Date.now() - 24 * 60 * 60 * 1000 },
        { level: 1 as any, timestamp: Date.now() },
      ];
      const forecast = BurnoutGuardian.generateEnergyForecast(logs, 5);
      expect(forecast.trend).toBe('declining');
    });
  });

  describe('Break Suggestions', () => {
    it('should suggest stop for critical energy', () => {
      const suggestion = BurnoutGuardian.getBreakSuggestion(1 as any, 60, 3);
      expect(suggestion).toContain('Stop');
    });

    it('should suggest break for low energy', () => {
      const suggestion = BurnoutGuardian.getBreakSuggestion(2 as any, 60, 2);
      expect(suggestion).toContain('break');
    });

    it('should suggest break after 2 hours', () => {
      const suggestion = BurnoutGuardian.getBreakSuggestion(4 as any, 120, 1);
      expect(suggestion).toContain('break');
    });

    it('should suggest break after 4 sessions', () => {
      const suggestion = BurnoutGuardian.getBreakSuggestion(4 as any, 30, 4);
      expect(suggestion).toContain('break');
    });
  });

  describe('Soar or Glide Status', () => {
    it('should return Soar for high energy and low risk', () => {
      const indicators = BurnoutGuardian.analyzeBurnoutRisk([
        { level: 5 as any, timestamp: Date.now() },
        { level: 4 as any, timestamp: Date.now() - 24 * 60 * 60 * 1000 },
      ]);
      const status = BurnoutGuardian.getSoarOrGlideStatus(indicators);
      expect(status.status).toBe('Soar');
    });

    it('should return Glide for moderate/low energy', () => {
      const indicators = BurnoutGuardian.analyzeBurnoutRisk([
        { level: 2 as any, timestamp: Date.now() },
        { level: 2 as any, timestamp: Date.now() - 24 * 60 * 60 * 1000 },
      ]);
      const status = BurnoutGuardian.getSoarOrGlideStatus(indicators);
      expect(status.status).toBe('Glide');
    });
  });

  describe('Burnout Notifications', () => {
    it('should generate high-risk notification', () => {
      const indicators = BurnoutGuardian.analyzeBurnoutRisk([
        { level: 1 as any, timestamp: Date.now() },
        { level: 1 as any, timestamp: Date.now() - 24 * 60 * 60 * 1000 },
      ]);
      const notifications = BurnoutGuardian.getBurnoutNotifications(indicators);
      expect(notifications.some(n => n.includes('Burnout'))).toBe(true);
    });

    it('should generate positive notification for high energy', () => {
      const indicators = BurnoutGuardian.analyzeBurnoutRisk([
        { level: 5 as any, timestamp: Date.now() },
        { level: 4 as any, timestamp: Date.now() - 24 * 60 * 60 * 1000 },
      ]);
      const notifications = BurnoutGuardian.getBurnoutNotifications(indicators);
      expect(notifications.some(n => n.includes('Amazing'))).toBe(true);
    });
  });
});
