/**
 * Data models for Study Planner app
 */

export interface Task {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: Date;
  createdAt: Date;
  tasks: Task[];
  status: 'active' | 'completed' | 'archived';
}

export interface GoalWithProgress extends Goal {
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
}

export interface Statistics {
  totalGoals: number;
  completedGoals: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  goalsOnTrack: number;
  goalsOverdue: number;
  weeklyActivity: DailyActivity[];
}

export interface DailyActivity {
  date: Date;
  tasksCompleted: number;
}
