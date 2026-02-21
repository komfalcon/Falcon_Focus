// Burnout Guardian - Intelligent energy tracking and burnout prevention

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type BurnoutStatus = 'Soaring' | 'Gliding' | 'Recovering' | 'Caution';

export interface EnergyForecast {
  today: EnergyLevel;
  tomorrow: EnergyLevel;
  trend: 'improving' | 'stable' | 'declining';
  recommendation: string;
}

export interface BurnoutIndicators {
  averageEnergyThisWeek: number;
  sessionCount: number;
  breaksTaken: number;
  status: BurnoutStatus;
  riskLevel: 'low' | 'medium' | 'high';
}

export class BurnoutGuardian {
  /**
   * Analyze energy levels and predict burnout risk
   */
  static analyzeBurnoutRisk(energyLogs: Array<{ level: EnergyLevel; timestamp: number }>): BurnoutIndicators {
    if (energyLogs.length === 0) {
      return {
        averageEnergyThisWeek: 3,
        sessionCount: 0,
        breaksTaken: 0,
        status: 'Soaring',
        riskLevel: 'low',
      };
    }

    // Get logs from last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyLogs = energyLogs.filter((log) => log.timestamp >= sevenDaysAgo);

    const averageEnergy = weeklyLogs.length > 0
      ? weeklyLogs.reduce((sum, log) => sum + log.level, 0) / weeklyLogs.length
      : 3;

    // Determine status and risk
    let status: BurnoutStatus = 'Soaring';
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    if (averageEnergy >= 4) {
      status = 'Soaring';
      riskLevel = 'low';
    } else if (averageEnergy >= 3) {
      status = 'Gliding';
      riskLevel = 'low';
    } else if (averageEnergy >= 2) {
      status = 'Recovering';
      riskLevel = 'medium';
    } else {
      status = 'Caution';
      riskLevel = 'high';
    }

    return {
      averageEnergyThisWeek: Math.round(averageEnergy * 10) / 10,
      sessionCount: weeklyLogs.length,
      breaksTaken: Math.floor(weeklyLogs.length / 2), // Estimate
      status,
      riskLevel,
    };
  }

  /**
   * Generate intelligent energy forecast
   */
  static generateEnergyForecast(
    energyLogs: Array<{ level: EnergyLevel; timestamp: number }>,
    sessionCount: number
  ): EnergyForecast {
    const indicators = this.analyzeBurnoutRisk(energyLogs);
    const recentLogs = energyLogs.slice(-7);
    const avgRecent = recentLogs.length > 0
      ? recentLogs.reduce((sum, log) => sum + log.level, 0) / recentLogs.length
      : 3;

    let tomorrow = Math.round(avgRecent) as EnergyLevel;
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    let recommendation = '';

    // Predict trend
    if (recentLogs.length >= 3) {
      const lastThree = recentLogs.slice(-3).map((l) => l.level);
      const oldThree = recentLogs.slice(-6, -3).map((l) => l.level);

      const lastAvg = lastThree.reduce((a, b) => a + b, 0) / 3;
      const oldAvg = oldThree.length > 0 ? oldThree.reduce((a, b) => a + b, 0) / 3 : lastAvg;

      if (lastAvg > oldAvg + 0.5) {
        trend = 'improving';
        tomorrow = Math.min(5, Math.round(lastAvg + 1)) as EnergyLevel;
      } else if (lastAvg < oldAvg - 0.5) {
        trend = 'declining';
        tomorrow = Math.max(1, Math.round(lastAvg - 1)) as EnergyLevel;
      }
    }

    // Generate recommendation
    if (indicators.riskLevel === 'high') {
      recommendation = '⚠️ Burnout risk detected! Take a break, rest, and come back refreshed.';
    } else if (indicators.riskLevel === 'medium') {
      recommendation = '💡 Your energy is declining. Consider taking a 30-min break or switching subjects.';
    } else if (trend === 'improving') {
      recommendation = '🚀 Your energy is rising! Great time for challenging material.';
    } else if (indicators.status === 'Soaring') {
      recommendation = '🦅 You\'re soaring! Maintain this momentum with consistent study blocks.';
    } else {
      recommendation = '🌤️ Steady energy levels. Perfect for focused, deep-work sessions.';
    }

    return {
      today: Math.round(avgRecent) as EnergyLevel,
      tomorrow,
      trend,
      recommendation,
    };
  }

  /**
   * Get break suggestions based on energy and session history
   */
  static getBreakSuggestion(
    currentEnergy: EnergyLevel,
    sessionDurationMinutes: number,
    consecutiveSessions: number
  ): string {
    if (currentEnergy <= 1) {
      return '🛑 Stop! Your energy is critically low. Take a 30-min break or call it a day.';
    }

    if (currentEnergy <= 2) {
      return '⏸️ Your energy is low. Take a 20-min break, grab water, and stretch.';
    }

    if (sessionDurationMinutes >= 120) {
      return '⏱️ You\'ve been going for 2+ hours. Take a 15-min break to recharge.';
    }

    if (consecutiveSessions >= 4) {
      return '🔄 You\'ve completed 4+ sessions. Take a longer 30-min break.';
    }

    if (sessionDurationMinutes >= 60) {
      return '⏱️ After 60 minutes, take a 10-min break to stay fresh.';
    }

    return '✅ You\'re doing great! Keep up the momentum.';
  }

  /**
   * Determine "Soar or Glide" status for the day
   */
  static getSoarOrGlideStatus(indicators: BurnoutIndicators): { status: 'Soar' | 'Glide'; emoji: string; message: string } {
    if (indicators.status === 'Soaring' && indicators.riskLevel === 'low') {
      return {
        status: 'Soar',
        emoji: '🦅',
        message: 'You\'re ready to soar! Tackle your most challenging goals today.',
      };
    } else {
      return {
        status: 'Glide',
        emoji: '🌤️',
        message: 'Take it easy today. Focus on lighter tasks and maintenance work.',
      };
    }
  }

  /**
   * Generate burnout prevention notifications
   */
  static getBurnoutNotifications(indicators: BurnoutIndicators): string[] {
    const notifications: string[] = [];

    if (indicators.riskLevel === 'high') {
      notifications.push('🚨 Burnout Alert: Your energy is critically low. Please take a break!');
    }

    if (indicators.riskLevel === 'medium' && indicators.sessionCount > 5) {
      notifications.push('💡 You\'ve had many sessions. Consider taking a longer break.');
    }

    if (indicators.breaksTaken === 0 && indicators.sessionCount >= 3) {
      notifications.push('⏸️ You haven\'t taken a break yet. Time to rest and recharge!');
    }

    if (indicators.status === 'Soaring') {
      notifications.push('🎉 Amazing energy levels! Keep this momentum going!');
    }

    return notifications;
  }
}
