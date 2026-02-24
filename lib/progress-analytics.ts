// Progress Analytics - Charts, heatmaps, and Flight Reports
import { StudySession, Task, Goal, DailyStats } from './types';

export interface WeeklyHeatmapData {
  day: string;
  date: number;
  studyMinutes: number;
  sessionsCompleted: number;
  tasksCompleted: number;
  energyAverage: number;
  intensity: 'low' | 'medium' | 'high' | 'extreme';
}

export interface SubjectMasteryData {
  subject: string;
  tasksCompleted: number;
  tasksTotal: number;
  masteryPercentage: number;
  studyHours: number;
  lastStudied: number;
}

export interface GoalForecast {
  goalTitle: string;
  targetDate: number;
  daysRemaining: number;
  completionProbability: number; // 0-100
  estimatedCompletionDate: number;
  recommendation: string;
}

export interface FlightReport {
  period: 'weekly' | 'monthly';
  startDate: number;
  endDate: number;
  totalStudyHours: number;
  totalSessions: number;
  totalTasks: number;
  totalGoals: number;
  avgDailyStudyTime: number;
  longestStreak: number;
  currentStreak: number;
  badgesEarned: number;
  xpGained: number;
  subjectMastery: SubjectMasteryData[];
  weeklyHeatmap: WeeklyHeatmapData[];
  goalForecasts: GoalForecast[];
  coachInsights: string[];
  motivationalMessage: string;
}

export class ProgressAnalyticsService {
  static generateWeeklyHeatmap(
    studySessions: StudySession[],
    tasks: Task[],
    energyLogs: any[]
  ): WeeklyHeatmapData[] {
    const heatmap: WeeklyHeatmapData[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayStart = date.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const daySessions = studySessions.filter(
        (s) => s.startedAt >= dayStart && s.startedAt < dayEnd
      );
      const dayTasks = tasks.filter(
        (t) => t.completedAt && t.completedAt >= dayStart && t.completedAt < dayEnd
      );
      const dayEnergy = energyLogs.filter(
        (e) => e.timestamp >= dayStart && e.timestamp < dayEnd
      );

      const studyMinutes = daySessions.reduce((sum, s) => sum + s.duration, 0);
      const energyAverage =
        dayEnergy.length > 0
          ? dayEnergy.reduce((sum, e) => sum + e.level, 0) / dayEnergy.length
          : 3;

      let intensity: 'low' | 'medium' | 'high' | 'extreme' = 'low';
      if (studyMinutes >= 180) intensity = 'extreme';
      else if (studyMinutes >= 120) intensity = 'high';
      else if (studyMinutes >= 60) intensity = 'medium';

      heatmap.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dayStart,
        studyMinutes,
        sessionsCompleted: daySessions.length,
        tasksCompleted: dayTasks.length,
        energyAverage: Math.round(energyAverage * 10) / 10,
        intensity,
      });
    }

    return heatmap;
  }

  static calculateSubjectMastery(
    tasks: Task[],
    studySessions: StudySession[]
  ): SubjectMasteryData[] {
    const subjects = new Map<
      string,
      {
        completed: number;
        total: number;
        studyHours: number;
        lastStudied: number;
      }
    >();

    // Count tasks by subject
    tasks.forEach((task) => {
      const subject = task.subject || 'General';
      const current = subjects.get(subject) || {
        completed: 0,
        total: 0,
        studyHours: 0,
        lastStudied: 0,
      };
      current.total++;
      if (task.completed) current.completed++;
      if (task.completedAt && task.completedAt > current.lastStudied) {
        current.lastStudied = task.completedAt;
      }
      subjects.set(subject, current);
    });

    // Add study hours from sessions
    studySessions.forEach((session) => {
      const subject = session.subject || 'General';
      const current = subjects.get(subject) || {
        completed: 0,
        total: 0,
        studyHours: 0,
        lastStudied: 0,
      };
      current.studyHours += session.duration / 60;
      if (session.startedAt > current.lastStudied) {
        current.lastStudied = session.startedAt;
      }
      subjects.set(subject, current);
    });

    return Array.from(subjects.entries()).map(([subject, data]) => ({
      subject,
      tasksCompleted: data.completed,
      tasksTotal: data.total,
      masteryPercentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      studyHours: Math.round(data.studyHours * 10) / 10,
      lastStudied: data.lastStudied,
    }));
  }

  static forecastGoalCompletion(
    goal: Goal,
    tasks: Task[],
    studySessions: any[]
  ): GoalForecast {
    const goalTasks = tasks.filter((t) => t.subject === goal.subject);
    const completedTasks = goalTasks.filter((t) => t.completed).length;
    const totalTasks = goalTasks.length;

    const daysRemaining = Math.ceil((goal.targetDate - Date.now()) / (24 * 60 * 60 * 1000));
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

    let completionProbability = 0;
    let estimatedCompletionDate = Date.now();
    let recommendation = '';

    if (completionRate === 1) {
      completionProbability = 100;
      estimatedCompletionDate = Date.now();
      recommendation = 'Goal is complete! Celebrate your achievement! 🎉';
    } else if (completionRate === 0) {
      completionProbability = Math.max(0, 100 - daysRemaining * 5);
      estimatedCompletionDate = Date.now() + daysRemaining * 24 * 60 * 60 * 1000;
      recommendation = 'Start now! Break this goal into smaller tasks to build momentum.';
    } else {
      const tasksRemaining = totalTasks - completedTasks;
      const daysPerTask = daysRemaining / tasksRemaining;
      const avgDaysPerTask = 3; // Assume 3 days per task on average

      if (daysPerTask >= avgDaysPerTask) {
        completionProbability = 85;
        estimatedCompletionDate = Date.now() + tasksRemaining * avgDaysPerTask * 24 * 60 * 60 * 1000;
        recommendation = 'You\'re on track! Maintain your current pace.';
      } else {
        completionProbability = Math.max(20, 85 - (avgDaysPerTask - daysPerTask) * 10);
        estimatedCompletionDate = Date.now() + tasksRemaining * daysPerTask * 24 * 60 * 60 * 1000;
        recommendation = 'Accelerate your pace! Consider focusing more on this goal.';
      }
    }

    return {
      goalTitle: goal.title,
      targetDate: goal.targetDate,
      daysRemaining,
      completionProbability: Math.min(100, Math.max(0, completionProbability)),
      estimatedCompletionDate,
      recommendation,
    };
  }

  static generateFlightReport(
    period: 'weekly' | 'monthly',
    studySessions: StudySession[],
    tasks: Task[],
    goals: Goal[],
    userProgress: any,
    energyLogs: any[],
    badges: any[]
  ): FlightReport {
    const now = Date.now();
    const daysBack = period === 'weekly' ? 7 : 30;
    const startDate = now - daysBack * 24 * 60 * 60 * 1000;

    const periodSessions = studySessions.filter((s) => s.startedAt >= startDate);
    const periodTasks = tasks.filter((t) => t.completedAt && t.completedAt >= startDate);
    const periodGoals = goals.filter((g) => g.completedAt && g.completedAt >= startDate);

    const totalStudyHours = periodSessions.reduce((sum, s) => sum + s.duration, 0) / 60;
    const avgDailyStudyTime = totalStudyHours / daysBack;

    const subjectMastery = this.calculateSubjectMastery(tasks, studySessions);
    const weeklyHeatmap = this.generateWeeklyHeatmap(studySessions, tasks, energyLogs);
    const goalForecasts = goals.map((g) => this.forecastGoalCompletion(g, tasks, studySessions));

    const coachInsights = this.generateCoachInsights(
      subjectMastery,
      userProgress,
      periodSessions,
      periodTasks
    );

    const motivationalMessage = this.generateMotivationalMessage(userProgress.currentStreak, totalStudyHours);

    return {
      period,
      startDate,
      endDate: now,
      totalStudyHours: Math.round(totalStudyHours * 10) / 10,
      totalSessions: periodSessions.length,
      totalTasks: periodTasks.length,
      totalGoals: periodGoals.length,
      avgDailyStudyTime: Math.round(avgDailyStudyTime * 10) / 10,
      longestStreak: userProgress.longestStreak || 0,
      currentStreak: userProgress.currentStreak || 0,
      badgesEarned: badges.filter((b) => b.unlockedAt && b.unlockedAt >= startDate).length,
      xpGained: Math.round(periodSessions.reduce((sum, s) => sum + Math.floor(s.duration * 1.5), 0)),
      subjectMastery,
      weeklyHeatmap,
      goalForecasts,
      coachInsights,
      motivationalMessage,
    };
  }

  private static generateCoachInsights(
    subjectMastery: SubjectMasteryData[],
    userProgress: any,
    sessions: StudySession[],
    tasks: Task[]
  ): string[] {
    const insights: string[] = [];

    // Weak subject insight
    if (subjectMastery.length > 0) {
      const weakSubject = subjectMastery.reduce((prev, current) =>
        prev.masteryPercentage < current.masteryPercentage ? prev : current
      );
      if (weakSubject.masteryPercentage < 50) {
        insights.push(
          `Your ${weakSubject.subject} mastery is at ${weakSubject.masteryPercentage}%. Focus on this subject to improve overall performance.`
        );
      }
    }

    // Streak insight
    if (userProgress.currentStreak >= 7) {
      insights.push(`Amazing ${userProgress.currentStreak}-day streak! You're building incredible momentum.`);
    }

    // Study pattern insight
    const avgSessionLength = sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length : 0;
    if (avgSessionLength > 60) {
      insights.push('Your study sessions are long and focused. Consider breaking them into 25-min Falcon Dives for better retention.');
    }

    // Consistency insight
    const tasksCompleted = tasks.filter((t) => t.completed).length;
    if (tasksCompleted > 20) {
      insights.push('Your consistency is outstanding! You\'re completing tasks at a great pace.');
    }

    return insights;
  }

  private static generateMotivationalMessage(streak: number, totalHours: number): string {
    const messages = [
      `You've soared ${totalHours.toFixed(1)} hours this period! Keep flying high! 🦅`,
      `Your ${streak}-day streak shows incredible dedication. The sky is not the limit! 🚀`,
      `You're building unstoppable momentum. Every session takes you higher! ⚡`,
      `Your consistency is your superpower. Keep soaring! 🦅`,
      `You've invested ${totalHours.toFixed(1)} hours in yourself. That's champion-level commitment! 💪`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}
