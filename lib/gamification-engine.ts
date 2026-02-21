// Falcon Focus Gamification Engine
// Manages Altitude levels, Feathers/XP, badges, quests, and streaks

export type AltitudeLevel = 'Fledgling' | 'Soaring' | 'Apex';

export interface AltitudeSystem {
  level: AltitudeLevel;
  xp: number;
  xpToNextLevel: number;
  altitude: number; // 0-100 percentage
}

export interface FeatherReward {
  action: string;
  feathers: number;
  xp: number;
  description: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockCondition: string;
  xpReward: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number; // XP
  progress: number;
  target: number;
  completed: boolean;
  type: 'daily' | 'weekly';
}

export interface StreakData {
  current: number;
  longest: number;
  lastSessionDate?: number;
}

// Badge Definitions - 20+ themed badges
export const BADGES: BadgeDefinition[] = [
  {
    id: 'first_flight',
    name: 'First Flight',
    description: 'Complete your first study session',
    icon: '🦅',
    rarity: 'common',
    unlockCondition: 'Complete 1 session',
    xpReward: 50,
  },
  {
    id: 'precision_strike',
    name: 'Precision Strike',
    description: 'Complete 5 sessions without distractions',
    icon: '🎯',
    rarity: 'rare',
    unlockCondition: 'Complete 5 distraction-free sessions',
    xpReward: 200,
  },
  {
    id: 'endurance_flight',
    name: 'Endurance Flight',
    description: 'Study for 10 hours in a week',
    icon: '💪',
    rarity: 'rare',
    unlockCondition: 'Study 10 hours weekly',
    xpReward: 300,
  },
  {
    id: 'flock_leader',
    name: 'Flock Leader',
    description: 'Share your progress with 3 friends',
    icon: '👑',
    rarity: 'epic',
    unlockCondition: 'Share 3 Flight Cards',
    xpReward: 500,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚔️',
    rarity: 'epic',
    unlockCondition: 'Maintain 7-day streak',
    xpReward: 400,
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Earn 100 XP in a single day',
    icon: '💯',
    rarity: 'epic',
    unlockCondition: 'Earn 100 XP daily',
    xpReward: 350,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete 5 study sessions after 8 PM',
    icon: '🌙',
    rarity: 'rare',
    unlockCondition: 'Study 5 times after 8 PM',
    xpReward: 250,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete 10 sessions in a week',
    icon: '⚡',
    rarity: 'epic',
    unlockCondition: 'Complete 10 weekly sessions',
    xpReward: 400,
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Study every day for 14 days',
    icon: '👑',
    rarity: 'legendary',
    unlockCondition: 'Maintain 14-day streak',
    xpReward: 1000,
  },
  {
    id: 'focus_master',
    name: 'Focus Master',
    description: 'Complete 20 distraction-free sessions',
    icon: '🧠',
    rarity: 'legendary',
    unlockCondition: 'Complete 20 distraction-free sessions',
    xpReward: 800,
  },
  {
    id: 'goal_crusher',
    name: 'Goal Crusher',
    description: 'Complete 5 learning goals',
    icon: '🎖️',
    rarity: 'epic',
    unlockCondition: 'Complete 5 goals',
    xpReward: 600,
  },
  {
    id: 'subject_master_math',
    name: 'Math Maestro',
    description: 'Reach 80% mastery in Mathematics',
    icon: '🔢',
    rarity: 'rare',
    unlockCondition: 'Reach 80% Math mastery',
    xpReward: 300,
  },
  {
    id: 'subject_master_science',
    name: 'Science Sage',
    description: 'Reach 80% mastery in Science',
    icon: '🔬',
    rarity: 'rare',
    unlockCondition: 'Reach 80% Science mastery',
    xpReward: 300,
  },
  {
    id: 'subject_master_language',
    name: 'Language Luminary',
    description: 'Reach 80% mastery in Languages',
    icon: '🌍',
    rarity: 'rare',
    unlockCondition: 'Reach 80% Language mastery',
    xpReward: 300,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 5 study sessions before 9 AM',
    icon: '🌅',
    rarity: 'rare',
    unlockCondition: 'Study 5 times before 9 AM',
    xpReward: 250,
  },
  {
    id: 'energy_guardian',
    name: 'Energy Guardian',
    description: 'Log energy levels for 7 consecutive days',
    icon: '⚡',
    rarity: 'rare',
    unlockCondition: 'Log energy 7 days',
    xpReward: 200,
  },
  {
    id: 'notes_keeper',
    name: 'Notes Keeper',
    description: 'Create 10 study notes',
    icon: '📝',
    rarity: 'common',
    unlockCondition: 'Create 10 notes',
    xpReward: 150,
  },
  {
    id: 'flashcard_master',
    name: 'Flashcard Master',
    description: 'Review 50 flashcards',
    icon: '🎴',
    rarity: 'rare',
    unlockCondition: 'Review 50 flashcards',
    xpReward: 250,
  },
  {
    id: 'planner_pro',
    name: 'Planner Pro',
    description: 'Schedule 20 study blocks',
    icon: '📅',
    rarity: 'common',
    unlockCondition: 'Schedule 20 blocks',
    xpReward: 100,
  },
  {
    id: 'soaring_legend',
    name: 'Soaring Legend',
    description: 'Reach Apex level',
    icon: '🏆',
    rarity: 'legendary',
    unlockCondition: 'Reach Apex level',
    xpReward: 2000,
  },
];

// Feather Rewards for various actions
export const FEATHER_REWARDS: FeatherReward[] = [
  { action: 'complete_session', feathers: 10, xp: 50, description: 'Completed a study session' },
  { action: 'complete_task', feathers: 5, xp: 25, description: 'Completed a task' },
  { action: 'complete_goal', feathers: 50, xp: 200, description: 'Completed a learning goal' },
  { action: 'maintain_streak', feathers: 3, xp: 15, description: 'Maintained daily streak' },
  { action: 'unlock_badge', feathers: 20, xp: 100, description: 'Unlocked a badge' },
  { action: 'share_flight_card', feathers: 5, xp: 25, description: 'Shared a Flight Card' },
  { action: 'complete_quest', feathers: 15, xp: 75, description: 'Completed a quest' },
  { action: 'zero_distractions', feathers: 15, xp: 60, description: 'Distraction-free session' },
];

// Gamification Engine Class
export class GamificationEngine {
  static getAltitudeLevel(xp: number): AltitudeLevel {
    if (xp < 1000) return 'Fledgling';
    if (xp < 5000) return 'Soaring';
    return 'Apex';
  }

  static getAltitudePercentage(xp: number): number {
    const level = this.getAltitudeLevel(xp);
    if (level === 'Fledgling') {
      return Math.min((xp / 1000) * 100, 100);
    } else if (level === 'Soaring') {
      return Math.min(((xp - 1000) / 4000) * 100, 100);
    } else {
      return Math.min(((xp - 5000) / 5000) * 100, 100);
    }
  }

  static getXpToNextLevel(xp: number): number {
    const level = this.getAltitudeLevel(xp);
    if (level === 'Fledgling') {
      return Math.max(1000 - xp, 0);
    } else if (level === 'Soaring') {
      return Math.max(5000 - xp, 0);
    } else {
      return Math.max(10000 - xp, 0);
    }
  }

  static getFeatherReward(action: string): FeatherReward | undefined {
    return FEATHER_REWARDS.find((r) => r.action === action);
  }

  static getBadgeByAction(action: string): BadgeDefinition | undefined {
    return BADGES.find((b) => b.unlockCondition.toLowerCase().includes(action.toLowerCase()));
  }

  static calculateStreakStatus(lastSessionDate?: number): number {
    if (!lastSessionDate) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSession = new Date(lastSessionDate);
    lastSession.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) return 1; // Same day
    if (daysDiff === 1) return 1; // Yesterday (streak continues)
    return 0; // Streak broken
  }

  static generateDailyQuests(): Quest[] {
    return [
      {
        id: 'daily_1',
        title: 'Morning Soar',
        description: 'Complete 1 study session before noon',
        reward: 50,
        progress: 0,
        target: 1,
        completed: false,
        type: 'daily',
      },
      {
        id: 'daily_2',
        title: 'Focus Dive',
        description: 'Complete 1 distraction-free session',
        reward: 75,
        progress: 0,
        target: 1,
        completed: false,
        type: 'daily',
      },
      {
        id: 'daily_3',
        title: 'Energy Check',
        description: 'Log your energy level',
        reward: 25,
        progress: 0,
        target: 1,
        completed: false,
        type: 'daily',
      },
    ];
  }

  static generateWeeklyQuests(): Quest[] {
    return [
      {
        id: 'weekly_1',
        title: 'Week Warrior',
        description: 'Complete 5 study sessions',
        reward: 200,
        progress: 0,
        target: 5,
        completed: false,
        type: 'weekly',
      },
      {
        id: 'weekly_2',
        title: 'Endurance Flight',
        description: 'Study for 10 hours total',
        reward: 300,
        progress: 0,
        target: 10,
        completed: false,
        type: 'weekly',
      },
      {
        id: 'weekly_3',
        title: 'Flock Sharer',
        description: 'Share 2 Flight Cards',
        reward: 150,
        progress: 0,
        target: 2,
        completed: false,
        type: 'weekly',
      },
    ];
  }
}
