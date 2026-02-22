// Falcon Wisdom Coach - Context-aware study recommendations
import { UserProgress, Goal, Task, StudySession, EnergyLog, Note, Flashcard } from './types';

export interface CoachTip {
  id: string;
  title: string;
  message: string;
  icon: string;
  priority: 'low' | 'medium' | 'high';
  category: 'motivation' | 'strategy' | 'warning' | 'opportunity';
  trigger: string;
  actionUrl?: string;
}

export interface CoachContext {
  weakSubjects: string[];
  energyLevel: number;
  upcomingDeadlines: Goal[];
  currentStreak: number;
  recentPerformance: number; // 0-100
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  lastStudySession?: StudySession;
  totalStudyToday: number;
  altitude: string;
}

export class FalconWisdomCoach {
  static generateContext(
    userProgress: UserProgress,
    goals: Goal[],
    tasks: Task[],
    energyLogs: EnergyLog[],
    notes: Note[],
    flashcards: Flashcard[],
    studySessions: StudySession[]
  ): CoachContext {
    const now = new Date();
    const hour = now.getHours();
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else if (hour >= 21 || hour < 6) timeOfDay = 'night';

    // Calculate weak subjects (subjects with low completion rate)
    const subjectPerformance = new Map<string, { completed: number; total: number }>();
    tasks.forEach((task) => {
      const subject = task.subject || 'General';
      const current = subjectPerformance.get(subject) || { completed: 0, total: 0 };
      current.total++;
      if (task.completed) current.completed++;
      subjectPerformance.set(subject, current);
    });

    const weakSubjects = Array.from(subjectPerformance.entries())
      .filter(([_, perf]) => perf.total > 0 && perf.completed / perf.total < 0.5)
      .map(([subject]) => subject)
      .slice(0, 3);

    // Get current energy level
    const recentEnergy = energyLogs
      .filter((log) => log.timestamp > Date.now() - 24 * 60 * 60 * 1000)
      .sort((a, b) => b.timestamp - a.timestamp);
    const energyLevel = recentEnergy.length > 0 ? (recentEnergy[0].level as number) : 3;

    // Get upcoming deadlines
    const upcomingDeadlines = goals
      .filter((g) => g.targetDate && g.targetDate > Date.now() && g.targetDate < Date.now() + 7 * 24 * 60 * 60 * 1000)
      .sort((a, b) => (a.targetDate || 0) - (b.targetDate || 0))
      .slice(0, 3);

    // Calculate recent performance
    const completedTasks = tasks.filter((t) => t.completed).length;
    const recentPerformance = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 50;

    // Calculate total study today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const totalStudyToday = studySessions
      .filter((s) => s.startedAt > todayStart.getTime())
      .reduce((sum, s) => sum + s.duration, 0);

    // Get altitude level
    const altitude = this.getAltitudeLevel(userProgress.xp);

    const lastSession = studySessions.sort((a, b) => b.startedAt - a.startedAt)[0];

    return {
      weakSubjects,
      energyLevel,
      upcomingDeadlines,
      currentStreak: userProgress.currentStreak,
      recentPerformance,
      timeOfDay,
      lastStudySession: lastSession,
      totalStudyToday,
      altitude,
    };
  }

  static generateTips(context: CoachContext): CoachTip[] {
    const tips: CoachTip[] = [];

    // Morning motivation
    if (context.timeOfDay === 'morning') {
      tips.push({
        id: 'morning_motivation',
        title: 'Rise and Soar! 🌅',
        message: `Good morning! Your energy is fresh. Today is perfect for tackling your ${context.weakSubjects[0] || 'toughest'} subject.`,
        icon: '🌅',
        priority: 'medium',
        category: 'motivation',
        trigger: 'morning_time',
      });
    }

    // Weak subject targeting
    if (context.weakSubjects.length > 0 && context.energyLevel >= 3) {
      tips.push({
        id: 'weak_subject_focus',
        title: 'Precision Strike Opportunity',
        message: `Your ${context.weakSubjects[0]} is weak before the exam. Try a targeted 25-min Falcon Dive to strengthen it.`,
        icon: '🎯',
        priority: 'high',
        category: 'strategy',
        trigger: 'weak_subject_detected',
        actionUrl: '/focus',
      });
    }

    // Low energy warning
    if (context.energyLevel <= 2) {
      tips.push({
        id: 'low_energy_warning',
        title: 'Energy is Low',
        message: 'Your energy is declining. Recommend lighter review instead of new topics. Take a break soon.',
        icon: '⚠️',
        priority: 'high',
        category: 'warning',
        trigger: 'low_energy',
      });
    }

    // High energy opportunity
    if (context.energyLevel >= 4 && context.totalStudyToday < 120) {
      tips.push({
        id: 'high_energy_opportunity',
        title: 'Peak Focus Time',
        message: 'Your energy is soaring! This is the perfect time for deep, focused study sessions.',
        icon: '⚡',
        priority: 'medium',
        category: 'opportunity',
        trigger: 'high_energy',
        actionUrl: '/focus',
      });
    }

    // Streak momentum
    if (context.currentStreak >= 3) {
      tips.push({
        id: 'streak_momentum',
        title: `${context.currentStreak}-Day Streak! 🔥`,
        message: `Amazing! You've maintained a ${context.currentStreak}-day streak. Keep the momentum going!`,
        icon: '🔥',
        priority: 'medium',
        category: 'motivation',
        trigger: 'streak_milestone',
      });
    }

    // Upcoming deadline alert
    if (context.upcomingDeadlines.length > 0) {
      const deadline = context.upcomingDeadlines[0];
      const daysUntil = Math.ceil((deadline.targetDate! - Date.now()) / (24 * 60 * 60 * 1000));
      tips.push({
        id: 'deadline_alert',
        title: `${deadline.title} Due Soon`,
        message: `Your goal "${deadline.title}" is due in ${daysUntil} days. Schedule focused study blocks now.`,
        icon: '📅',
        priority: daysUntil <= 2 ? 'high' : 'medium',
        category: 'warning',
        trigger: 'upcoming_deadline',
        actionUrl: '/planner',
      });
    }

    // Altitude celebration
    if (context.altitude === 'Soaring' && context.recentPerformance >= 70) {
      tips.push({
        id: 'altitude_celebration',
        title: 'Soaring High! 🦅',
        message: 'You\'ve reached Soaring altitude! Your consistent effort is paying off. Keep flying!',
        icon: '🦅',
        priority: 'low',
        category: 'motivation',
        trigger: 'altitude_milestone',
      });
    }

    // Evening wind-down
    if (context.timeOfDay === 'evening' && context.totalStudyToday >= 120) {
      tips.push({
        id: 'evening_winddown',
        title: 'Great Day of Learning! 🌙',
        message: 'You\'ve studied well today. Time to rest and recharge for tomorrow.',
        icon: '🌙',
        priority: 'low',
        category: 'motivation',
        trigger: 'evening_time',
      });
    }

    // Study block suggestion
    if (context.lastStudySession && Date.now() - context.lastStudySession.startedAt > 4 * 60 * 60 * 1000) {
      tips.push({
        id: 'study_block_suggestion',
        title: 'Time for Another Session',
        message: `It's been a while since your last study session. Start a fresh Falcon Dive to keep your momentum.`,
        icon: '⏰',
        priority: 'medium',
        category: 'opportunity',
        trigger: 'time_since_last_session',
        actionUrl: '/focus',
      });
    }

    return tips.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  static getAltitudeLevel(xp: number): string {
    if (xp < 1000) return 'Fledgling';
    if (xp < 5000) return 'Soaring';
    return 'Apex';
  }

  static getTipForScreen(
    screenName: 'home' | 'planner' | 'focus' | 'learn' | 'progress',
    context: CoachContext,
    allTips: CoachTip[]
  ): CoachTip | null {
    // Filter tips relevant to the current screen
    const screenTriggers = {
      home: ['morning_motivation', 'streak_momentum', 'altitude_celebration', 'evening_winddown'],
      planner: ['deadline_alert', 'weak_subject_focus'],
      focus: ['high_energy_opportunity', 'low_energy_warning', 'study_block_suggestion'],
      learn: ['weak_subject_focus'],
      progress: ['altitude_celebration', 'streak_momentum'],
    };

    const relevantTips = allTips.filter((tip) => screenTriggers[screenName].includes(tip.trigger));
    return relevantTips.length > 0 ? relevantTips[0] : null;
  }

  static generateMotivationalQuote(): string {
    const quotes = [
      '"Every soar begins with a single flap of the wings."',
      '"The falcon doesn\'t rush its ascent—it soars with purpose."',
      '"Consistency is the wind beneath your wings."',
      '"Your effort today shapes your altitude tomorrow."',
      '"Even the mightiest falcon rests between flights."',
      '"Progress is measured not by speed, but by persistence."',
      '"The view from the top is worth every climb."',
      '"Your weaknesses are just opportunities to soar higher."',
      '"Study smart, soar far."',
      '"Every completed session adds a feather to your wings."',
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  static shouldShowCoachTip(): boolean {
    // Show tips 70% of the time to avoid overwhelming the user
    return Math.random() < 0.7;
  }
}
