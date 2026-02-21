// Core Data Models for Falcon Focus

export interface StudyBlock {
  id: string;
  title: string;
  subject: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  recurring: boolean;
  color: string;
  notes?: string;
}

export interface StudySession {
  id: string;
  blockId?: string;
  title: string;
  subject: string;
  duration: number; // minutes
  startedAt: number; // timestamp
  completedAt?: number;
  distractionsLogged: number;
  focusLevel: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  subject: string;
  dueDate: number; // timestamp
  completed: boolean;
  completedAt?: number;
  priority: 'low' | 'medium' | 'high';
  blockId?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  subject: string;
  targetDate: number; // timestamp
  milestones: Milestone[];
  completed: boolean;
  completedAt?: number;
  createdAt: number;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: number;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  content: string;
  tags: string[];
  images?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  images?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewedAt?: number;
  nextReviewAt?: number;
  reviewCount: number;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  cards: Flashcard[];
  createdAt: number;
  updatedAt: number;
}

export interface EnergyLog {
  id: string;
  level: number; // 1-5
  timestamp: number;
  notes?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserProgress {
  totalStudyHours: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate?: number;
  xp: number;
  level: 'Fledgling' | 'Soaring' | 'Apex';
  badges: Badge[];
  completedGoals: number;
  completedTasks: number;
}

export interface DailyStats {
  date: number; // timestamp
  studyHours: number;
  sessionsCompleted: number;
  tasksCompleted: number;
  energyLevels: number[]; // array of energy logs for the day
}

export interface AppState {
  studyBlocks: StudyBlock[];
  studySessions: StudySession[];
  tasks: Task[];
  goals: Goal[];
  notes: Note[];
  flashcardDecks: FlashcardDeck[];
  energyLogs: EnergyLog[];
  userProgress: UserProgress;
  dailyStats: DailyStats[];
}
