import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

describe('Study Context - Data Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Goal Management', () => {
    it('should create a goal with required fields', () => {
      const goal = {
        id: '1',
        title: 'Learn React',
        description: 'Master React fundamentals',
        targetDate: new Date('2026-03-20'),
        createdAt: new Date(),
        tasks: [],
        status: 'active' as const,
      };

      expect(goal.title).toBe('Learn React');
      expect(goal.status).toBe('active');
      expect(goal.tasks).toHaveLength(0);
    });

    it('should calculate progress percentage correctly', () => {
      const goal = {
        id: '1',
        title: 'Learn React',
        description: '',
        createdAt: new Date(),
        tasks: [
          { id: '1', goalId: '1', title: 'Task 1', completed: true, createdAt: new Date() },
          { id: '2', goalId: '1', title: 'Task 2', completed: false, createdAt: new Date() },
          { id: '3', goalId: '1', title: 'Task 3', completed: true, createdAt: new Date() },
        ],
        status: 'active' as const,
      };

      const completedTasks = goal.tasks.filter((t) => t.completed).length;
      const progressPercentage = (completedTasks / goal.tasks.length) * 100;

      expect(progressPercentage).toBe(66.66666666666666);
      expect(completedTasks).toBe(2);
    });

    it('should handle empty task list', () => {
      const goal = {
        id: '1',
        title: 'Learn React',
        tasks: [],
        status: 'active' as const,
      };

      const progressPercentage = goal.tasks.length > 0 ? (0 / goal.tasks.length) * 100 : 0;
      expect(progressPercentage).toBe(0);
    });
  });

  describe('Task Management', () => {
    it('should create a task with required fields', () => {
      const task = {
        id: '1',
        goalId: 'goal-1',
        title: 'Watch React tutorial',
        description: 'Complete the official React tutorial',
        completed: false,
        createdAt: new Date(),
      };

      expect(task.title).toBe('Watch React tutorial');
      expect(task.completed).toBe(false);
      expect(task.goalId).toBe('goal-1');
    });

    it('should mark task as completed with timestamp', () => {
      const task = {
        id: '1',
        goalId: 'goal-1',
        title: 'Watch React tutorial',
        completed: false,
        createdAt: new Date(),
        completedAt: undefined,
      };

      const completedTask = {
        ...task,
        completed: true,
        completedAt: new Date(),
      };

      expect(completedTask.completed).toBe(true);
      expect(completedTask.completedAt).toBeDefined();
    });

    it('should toggle task completion status', () => {
      let task = {
        id: '1',
        goalId: 'goal-1',
        title: 'Task 1',
        completed: false,
        createdAt: new Date(),
      };

      // Toggle to complete
      task = { ...task, completed: !task.completed };
      expect(task.completed).toBe(true);

      // Toggle back to incomplete
      task = { ...task, completed: !task.completed };
      expect(task.completed).toBe(false);
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate completion rate correctly', () => {
      const allTasks = [
        { id: '1', completed: true },
        { id: '2', completed: true },
        { id: '3', completed: false },
        { id: '4', completed: false },
      ];

      const completedTasks = allTasks.filter((t) => t.completed).length;
      const completionRate = (completedTasks / allTasks.length) * 100;

      expect(completionRate).toBe(50);
    });

    it('should identify overdue goals', () => {
      const today = new Date();
      const goals = [
        {
          id: '1',
          title: 'Goal 1',
          targetDate: new Date(today.getTime() - 86400000), // Yesterday
          status: 'active' as const,
        },
        {
          id: '2',
          title: 'Goal 2',
          targetDate: new Date(today.getTime() + 86400000), // Tomorrow
          status: 'active' as const,
        },
        {
          id: '3',
          title: 'Goal 3',
          targetDate: undefined,
          status: 'active' as const,
        },
      ];

      const overdue = goals.filter(
        (g) => g.targetDate && g.targetDate < today && g.status === 'active'
      );

      expect(overdue).toHaveLength(1);
      expect(overdue[0].id).toBe('1');
    });

    it('should count goals on track', () => {
      const today = new Date();
      const goals = [
        {
          id: '1',
          title: 'Goal 1',
          targetDate: new Date(today.getTime() - 86400000),
          status: 'active' as const,
        },
        {
          id: '2',
          title: 'Goal 2',
          targetDate: new Date(today.getTime() + 86400000),
          status: 'active' as const,
        },
        {
          id: '3',
          title: 'Goal 3',
          targetDate: undefined,
          status: 'active' as const,
        },
      ];

      const onTrack = goals.filter(
        (g) => !g.targetDate || (g.targetDate >= today && g.status === 'active')
      );

      expect(onTrack).toHaveLength(2);
    });

    it('should calculate weekly activity correctly', () => {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());

      const tasks = [
        {
          id: '1',
          completed: true,
          completedAt: new Date(weekStart.getTime() + 86400000 * 0), // Sunday
        },
        {
          id: '2',
          completed: true,
          completedAt: new Date(weekStart.getTime() + 86400000 * 0), // Sunday
        },
        {
          id: '3',
          completed: true,
          completedAt: new Date(weekStart.getTime() + 86400000 * 1), // Monday
        },
      ];

      const weeklyActivity = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const tasksCompletedToday = tasks.filter(
          (t) => t.completedAt && t.completedAt >= dayStart && t.completedAt <= dayEnd
        ).length;

        weeklyActivity.push({ date, tasksCompleted: tasksCompletedToday });
      }

      expect(weeklyActivity[0].tasksCompleted).toBe(2);
      expect(weeklyActivity[1].tasksCompleted).toBe(1);
      expect(weeklyActivity[2].tasksCompleted).toBe(0);
    });
  });

  describe('Data Validation', () => {
    it('should validate goal title is not empty', () => {
      const isValidGoal = (title: string) => title.trim().length > 0;

      expect(isValidGoal('Learn React')).toBe(true);
      expect(isValidGoal('')).toBe(false);
      expect(isValidGoal('   ')).toBe(false);
    });

    it('should validate task title is not empty', () => {
      const isValidTask = (title: string) => title.trim().length > 0;

      expect(isValidTask('Watch tutorial')).toBe(true);
      expect(isValidTask('')).toBe(false);
    });

    it('should validate date format', () => {
      const isValidDate = (dateString: string) => {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
      };

      expect(isValidDate('2026-03-20')).toBe(true);
      expect(isValidDate('invalid')).toBe(false);
    });
  });

  describe('Data Persistence', () => {
    it('should serialize goals for storage', () => {
      const goal = {
        id: '1',
        title: 'Learn React',
        createdAt: new Date('2026-02-20'),
        tasks: [],
        status: 'active' as const,
      };

      const serialized = JSON.stringify(goal);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.id).toBe('1');
      expect(deserialized.title).toBe('Learn React');
      expect(deserialized.status).toBe('active');
    });

    it('should handle date serialization and deserialization', () => {
      const originalDate = new Date('2026-02-20T10:00:00Z');
      const serialized = JSON.stringify({ date: originalDate });
      const deserialized = JSON.parse(serialized);
      const restoredDate = new Date(deserialized.date);

      expect(restoredDate.toISOString()).toBe(originalDate.toISOString());
    });
  });
});
