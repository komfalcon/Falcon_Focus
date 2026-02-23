/**
 * Social Leaderboards Service
 * Lightweight leaderboards for Flock Mode and Top Flyers
 * Simulated data for offline-first experience
 */

export interface LeaderboardEntry {
  rank: number;
  name: string;
  city: string;
  altitude: 'Fledgling' | 'Soaring' | 'Apex';
  xp: number;
  streak: number;
  totalSessions: number;
  avatar?: string;
}

export interface FlockLeaderboard {
  flockName: string;
  members: LeaderboardEntry[];
  period: 'week' | 'month' | 'allTime';
  lastUpdated: number;
}

export interface TopFlyersLeaderboard {
  entries: LeaderboardEntry[];
  period: 'week' | 'month';
  lastUpdated: number;
  region?: string;
}

// Simulated Nigerian users with realistic names and cities
const SIMULATED_TOP_FLYERS: LeaderboardEntry[] = [
  {
    rank: 1,
    name: 'Chioma Okafor',
    city: 'Lagos',
    altitude: 'Apex',
    xp: 12500,
    streak: 45,
    totalSessions: 287,
  },
  {
    rank: 2,
    name: 'Tunde Adeyemi',
    city: 'Ibadan',
    altitude: 'Apex',
    xp: 11800,
    streak: 42,
    totalSessions: 265,
  },
  {
    rank: 3,
    name: 'Amara Nwankwo',
    city: 'Enugu',
    altitude: 'Apex',
    xp: 11200,
    streak: 38,
    totalSessions: 248,
  },
  {
    rank: 4,
    name: 'Oluwaseun Oladele',
    city: 'Abuja',
    altitude: 'Soaring',
    xp: 9800,
    streak: 35,
    totalSessions: 215,
  },
  {
    rank: 5,
    name: 'Zainab Hassan',
    city: 'Kano',
    altitude: 'Soaring',
    xp: 9200,
    streak: 32,
    totalSessions: 198,
  },
  {
    rank: 6,
    name: 'Chinedu Eze',
    city: 'Port Harcourt',
    altitude: 'Soaring',
    xp: 8900,
    streak: 30,
    totalSessions: 185,
  },
  {
    rank: 7,
    name: 'Blessing Obi',
    city: 'Lagos',
    altitude: 'Soaring',
    xp: 8500,
    streak: 28,
    totalSessions: 172,
  },
  {
    rank: 8,
    name: 'Adebayo Ogunlana',
    city: 'Ibadan',
    altitude: 'Soaring',
    xp: 8100,
    streak: 26,
    totalSessions: 158,
  },
  {
    rank: 9,
    name: 'Ngozi Okoro',
    city: 'Abuja',
    altitude: 'Soaring',
    xp: 7800,
    streak: 24,
    totalSessions: 145,
  },
  {
    rank: 10,
    name: 'Kayode Adebisi',
    city: 'Ilorin',
    altitude: 'Soaring',
    xp: 7400,
    streak: 22,
    totalSessions: 132,
  },
  {
    rank: 11,
    name: 'Ife Adeyinka',
    city: 'Lagos',
    altitude: 'Soaring',
    xp: 7100,
    streak: 20,
    totalSessions: 120,
  },
  {
    rank: 12,
    name: 'Emeka Okonkwo',
    city: 'Enugu',
    altitude: 'Soaring',
    xp: 6800,
    streak: 18,
    totalSessions: 108,
  },
  {
    rank: 13,
    name: 'Aisha Muhammed',
    city: 'Kano',
    altitude: 'Fledgling',
    xp: 6500,
    streak: 16,
    totalSessions: 95,
  },
  {
    rank: 14,
    name: 'Victor Okafor',
    city: 'Port Harcourt',
    altitude: 'Fledgling',
    xp: 6200,
    streak: 14,
    totalSessions: 82,
  },
  {
    rank: 15,
    name: 'Folake Adeyemi',
    city: 'Ibadan',
    altitude: 'Fledgling',
    xp: 5900,
    streak: 12,
    totalSessions: 70,
  },
  {
    rank: 16,
    name: 'Segun Oladele',
    city: 'Abuja',
    altitude: 'Fledgling',
    xp: 5600,
    streak: 10,
    totalSessions: 58,
  },
  {
    rank: 17,
    name: 'Nneka Eze',
    city: 'Lagos',
    altitude: 'Fledgling',
    xp: 5300,
    streak: 8,
    totalSessions: 45,
  },
  {
    rank: 18,
    name: 'Jide Okonkwo',
    city: 'Enugu',
    altitude: 'Fledgling',
    xp: 5000,
    streak: 6,
    totalSessions: 32,
  },
  {
    rank: 19,
    name: 'Hauwa Ibrahim',
    city: 'Kano',
    altitude: 'Fledgling',
    xp: 4700,
    streak: 4,
    totalSessions: 20,
  },
  {
    rank: 20,
    name: 'Tayo Adebayo',
    city: 'Port Harcourt',
    altitude: 'Fledgling',
    xp: 4400,
    streak: 2,
    totalSessions: 8,
  },
];

export class SocialLeaderboardsService {
  /**
   * Get top flyers leaderboard (simulated)
   */
  static getTopFlyersLeaderboard(period: 'week' | 'month' = 'week'): TopFlyersLeaderboard {
    // Simulate weekly variations
    const entries = SIMULATED_TOP_FLYERS.map((entry) => ({
      ...entry,
      // Add slight variations for weekly updates
      xp: entry.xp + (Math.random() * 500 - 250),
      streak: Math.max(0, entry.streak + (Math.random() > 0.5 ? 1 : -1)),
    })).sort((a, b) => b.xp - a.xp);

    return {
      entries: entries.slice(0, 20),
      period,
      lastUpdated: Date.now(),
      region: 'Nigeria',
    };
  }

  /**
   * Get flock leaderboard
   */
  static getFlockLeaderboard(
    flockName: string,
    members: Array<{ name: string; xp: number; altitude: string; streak: number }>,
    period: 'week' | 'month' | 'allTime' = 'week'
  ): FlockLeaderboard {
    const sortedMembers = members
      .map((member, index) => ({
        rank: index + 1,
        name: member.name,
        city: 'Nigeria',
        altitude: (member.altitude as 'Fledgling' | 'Soaring' | 'Apex') || 'Fledgling',
        xp: member.xp,
        streak: member.streak,
        totalSessions: Math.floor(member.xp / 50),
      }))
      .sort((a, b) => b.xp - a.xp)
      .map((member, index) => ({ ...member, rank: index + 1 }));

    return {
      flockName,
      members: sortedMembers,
      period,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Generate motivational message based on leaderboard position
   */
  static generateMotivationalMessage(rank: number, totalParticipants: number): string {
    if (rank === 1) {
      return '🏆 You\'re the top flyer! Keep soaring at the peak! 🦅';
    } else if (rank <= 5) {
      return '🚀 You\'re in the elite top 5! Amazing momentum! Keep it up!';
    } else if (rank <= 10) {
      return '⭐ Top 10 flyer! You\'re crushing it! Just a bit more to reach the elite!';
    } else if (rank <= 20) {
      return '📈 You\'re in the top 20! Great progress! Keep pushing forward!';
    } else if (rank <= 50) {
      return '💪 You\'re climbing the ranks! Every session brings you higher!';
    } else {
      return '🌟 Every journey starts with a single flight. You\'re on your way! 🦅';
    }
  }

  /**
   * Get rank improvement message
   */
  static getRankImprovementMessage(previousRank: number, currentRank: number): string {
    if (currentRank < previousRank) {
      const improvement = previousRank - currentRank;
      return `🎉 Amazing! You jumped ${improvement} position${improvement > 1 ? 's' : ''}! Keep soaring! 🦅`;
    } else if (currentRank === previousRank) {
      return '💪 Holding strong! Keep grinding to climb higher!';
    } else {
      return '📊 Keep pushing! You\'ll be back on top soon!';
    }
  }

  /**
   * Generate weekly leaderboard update animation message
   */
  static generateWeeklyUpdateMessage(): string {
    const messages = [
      '🎯 Weekly leaderboard updated! Check your new rank! 📊',
      '🦅 Fresh rankings! See where you stand this week!',
      '⚡ Leaderboard refreshed! Time to climb higher! 🚀',
      '🏆 New week, new rankings! Where do you rank? 📈',
      '💫 Leaderboard updated! Keep the momentum going! 🔥',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Get city-based leaderboard
   */
  static getCityLeaderboard(city: string): TopFlyersLeaderboard {
    const cityFlyers = SIMULATED_TOP_FLYERS.filter((entry) => entry.city === city).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return {
      entries: cityFlyers,
      period: 'week',
      lastUpdated: Date.now(),
      region: city,
    };
  }

  /**
   * Calculate percentile rank
   */
  static calculatePercentile(rank: number, totalParticipants: number): number {
    return Math.round(((totalParticipants - rank) / totalParticipants) * 100);
  }

  /**
   * Get achievement badge for rank
   */
  static getAchievementBadge(rank: number): string {
    if (rank === 1) return '👑 Champion';
    if (rank <= 5) return '🥇 Elite';
    if (rank <= 10) return '🥈 Master';
    if (rank <= 20) return '🥉 Expert';
    if (rank <= 50) return '⭐ Rising Star';
    return '🌱 Fledgling';
  }

  /**
   * Generate comparison message
   */
  static generateComparisonMessage(userRank: number, friendRank: number, friendName: string): string {
    if (userRank < friendRank) {
      const diff = friendRank - userRank;
      return `🎯 You're ${diff} position${diff > 1 ? 's' : ''} ahead of ${friendName}! Keep it up! 🦅`;
    } else if (userRank === friendRank) {
      return `🤝 You and ${friendName} are tied! Friendly competition! 🏆`;
    } else {
      const diff = userRank - friendRank;
      return `💪 ${friendName} is ${diff} position${diff > 1 ? 's' : ''} ahead. Time to catch up! 🚀`;
    }
  }
}
