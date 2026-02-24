// Flock Mode - Accountability and sharing without backend
import { UserProgress } from './types';

export interface FlockMember {
  id: string;
  name: string;
  joinCode: string;
  joinedAt: number;
  altitude: string;
  streak: number;
  xp: number;
  lastUpdate: number;
}

export interface Flock {
  id: string;
  name: string;
  ownerName: string;
  createdAt: number;
  members: FlockMember[];
  inviteCode: string;
  maxMembers: number;
  description?: string;
}

export interface FlockCheckIn {
  id: string;
  memberId: string;
  timestamp: number;
  message: string;
  studyMinutesToday: number;
  energyLevel: number;
  goalsMet: number;
}

const DEFAULT_MEMBER: FlockMember = {
  id: '',
  name: 'No members',
  joinCode: '',
  joinedAt: 0,
  altitude: 'Fledgling',
  streak: 0,
  xp: 0,
  lastUpdate: 0,
};

export class FlockModeService {
  static createFlock(ownerName: string, flockName: string, description?: string): Flock {
    const inviteCode = this.generateInviteCode();

    return {
      id: `flock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: flockName,
      ownerName,
      createdAt: Date.now(),
      members: [
        {
          id: `member_${Date.now()}`,
          name: ownerName,
          joinCode: inviteCode,
          joinedAt: Date.now(),
          altitude: 'Fledgling',
          streak: 0,
          xp: 0,
          lastUpdate: Date.now(),
        },
      ],
      inviteCode,
      maxMembers: 10,
      description,
    };
  }

  static generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  static joinFlock(flock: Flock, memberName: string, userProgress: UserProgress): Flock | null {
    // Check if member limit reached
    if (flock.members.length >= flock.maxMembers) {
      return null;
    }

    // Check if member already exists
    if (flock.members.some((m) => m.name === memberName)) {
      return null;
    }

    const newMember: FlockMember = {
      id: `member_${Date.now()}`,
      name: memberName,
      joinCode: flock.inviteCode,
      joinedAt: Date.now(),
      altitude: this.getAltitudeLevel(userProgress.xp),
      streak: userProgress.currentStreak,
      xp: userProgress.xp,
      lastUpdate: Date.now(),
    };

    return {
      ...flock,
      members: [...flock.members, newMember],
    };
  }

  static updateMemberProgress(
    flock: Flock,
    memberId: string,
    userProgress: UserProgress
  ): Flock {
    return {
      ...flock,
      members: flock.members.map((member) =>
        member.id === memberId
          ? {
              ...member,
              altitude: this.getAltitudeLevel(userProgress.xp),
              streak: userProgress.currentStreak,
              xp: userProgress.xp,
              lastUpdate: Date.now(),
            }
          : member
      ),
    };
  }

  static addCheckIn(
    flock: Flock,
    memberId: string,
    message: string,
    studyMinutesToday: number,
    energyLevel: number,
    goalsMet: number
  ): FlockCheckIn {
    return {
      id: `checkin_${Date.now()}`,
      memberId,
      timestamp: Date.now(),
      message,
      studyMinutesToday,
      energyLevel,
      goalsMet,
    };
  }

  static getFlockStats(flock: Flock) {
    const totalMembers = flock.members.length;
    const avgStreak = totalMembers > 0
      ? flock.members.reduce((sum, m) => sum + m.streak, 0) / totalMembers
      : 0;
    const totalXP = flock.members.reduce((sum, m) => sum + m.xp, 0);
    const altitudes = {
      Fledgling: flock.members.filter((m) => m.altitude === 'Fledgling').length,
      Soaring: flock.members.filter((m) => m.altitude === 'Soaring').length,
      Apex: flock.members.filter((m) => m.altitude === 'Apex').length,
    };

    const topMember = flock.members.length > 0
      ? flock.members.reduce((prev, current) =>
          prev.xp > current.xp ? prev : current
        )
      : DEFAULT_MEMBER;

    return {
      totalMembers,
      avgStreak: Math.round(avgStreak * 10) / 10,
      totalXP,
      altitudes,
      topMember,
    };
  }

  static generateAccountabilityNudge(flock: Flock, memberName: string): string {
    const member = flock.members.find((m) => m.name === memberName);
    if (!member) return '';

    const nudges = [
      `🦅 Hey ${memberName}! Your flock is cheering you on! How's your study going today?`,
      `${memberName}, the flock is flying high! 🚀 How's your progress today?`,
      `${memberName}, let's soar together! 📚 Check in with your flock!`,
      `🔥 ${memberName}, your streak is looking good! Keep it up!`,
      `${memberName}, your flock believes in you! 💪 Share your progress!`,
      `Time to fly, ${memberName}! 🦅 How are you doing today?`,
      `${memberName}, the flock is waiting to hear from you! 🎯`,
      `Let's keep soaring together, ${memberName}! 📈 Share your wins!`,
    ];

    return nudges[Math.floor(Math.random() * nudges.length)];
  }

  static generateFlockReport(flock: Flock): string {
    const stats = this.getFlockStats(flock);

    return `
╔════════════════════════════════════╗
║     🦅 ${flock.name.toUpperCase()} FLOCK 🦅     ║
╠════════════════════════════════════╣
║ Members: ${stats.totalMembers}${' '.repeat(27 - stats.totalMembers.toString().length)}║
║ Combined XP: ${stats.totalXP}${' '.repeat(21 - stats.totalXP.toString().length)}║
║ Avg Streak: ${stats.avgStreak} days${' '.repeat(22 - stats.avgStreak.toString().length)}║
╠════════════════════════════════════╣
║ Altitude Breakdown:                ║
║ 🐣 Fledgling: ${stats.altitudes.Fledgling}${' '.repeat(20 - stats.altitudes.Fledgling.toString().length)}║
║ 🦅 Soaring: ${stats.altitudes.Soaring}${' '.repeat(22 - stats.altitudes.Soaring.toString().length)}║
║ 👑 Apex: ${stats.altitudes.Apex}${' '.repeat(25 - stats.altitudes.Apex.toString().length)}║
╠════════════════════════════════════╣
║ Top Flyer: ${stats.topMember.name.substring(0, 24).padEnd(24)}║
║ XP: ${stats.topMember.xp}${' '.repeat(29 - stats.topMember.xp.toString().length)}║
╚════════════════════════════════════╝
    `;
  }

  private static getAltitudeLevel(xp: number): string {
    if (xp < 1000) return 'Fledgling';
    if (xp < 5000) return 'Soaring';
    return 'Apex';
  }
}
