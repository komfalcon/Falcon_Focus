// Flight Cards - Beautiful shareable study progress cards
import { UserProgress, Goal, Badge } from './types';

export interface FlightCard {
  id: string;
  userId: string;
  timestamp: number;
  altitude: string;
  xp: number;
  streak: number;
  badges: Badge[];
  todaySchedule: string[];
  motivationalQuote: string;
  founderCredit: string;
  shareCode?: string;
  qrCode?: string;
}

export interface FlightCardShareOptions {
  format: 'image' | 'qr' | 'link';
  platform?: 'whatsapp' | 'instagram' | 'sms' | 'email' | 'generic';
  includeQR?: boolean;
}

export class FlightCardsService {
  static generateFlightCard(
    userId: string,
    userProgress: UserProgress,
    todaySchedule: string[],
    badges: Badge[]
  ): FlightCard {
    const altitude = this.getAltitudeLevel(userProgress.xp);
    const quote = this.getMotivationalQuote();

    return {
      id: `fc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      timestamp: Date.now(),
      altitude,
      xp: userProgress.xp,
      streak: userProgress.currentStreak,
      badges: badges.slice(0, 5), // Show top 5 badges
      todaySchedule,
      motivationalQuote: quote,
      founderCredit: 'Falcon Focus by Korede Omotosho',
    };
  }

  static generateShareCode(): string {
    // Generate a unique 6-character code for Flock invites
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  static generateQRCodeData(flightCard: FlightCard, shareCode?: string): string {
    // Generate QR code data (URL-encoded)
    const data = {
      type: 'flight_card',
      id: flightCard.id,
      userId: flightCard.userId,
      altitude: flightCard.altitude,
      streak: flightCard.streak,
      shareCode: shareCode || '',
    };
    return JSON.stringify(data);
  }

  static generateShareLink(flightCard: FlightCard, shareCode: string): string {
    // Generate a shareable link
    const baseUrl = 'https://falconf.app/share';
    const params = new URLSearchParams({
      id: flightCard.id,
      code: shareCode,
      user: flightCard.userId,
    });
    return `${baseUrl}?${params.toString()}`;
  }

  static generateShareMessage(flightCard: FlightCard, platform: string): string {
    const messages = {
      whatsapp: `🦅 Check out my Falcon Focus progress! I'm at ${flightCard.altitude} altitude with a ${flightCard.streak}-day streak! 🔥 Join me in my Flock to stay accountable. #FalconFocus #StudyGoals`,
      instagram: `Soaring to new heights with Falcon Focus 🦅✨ ${flightCard.altitude} altitude | ${flightCard.streak}🔥 streak | ${flightCard.xp} XP earned. Sharpen your vision. Soar to success. #FalconFocus #StudyGrind`,
      sms: `🦅 My Falcon Focus: ${flightCard.altitude} altitude, ${flightCard.streak}-day streak, ${flightCard.xp} XP. Join my Flock! Falcon Focus by Korede Omotosho`,
      email: `Check out my Falcon Focus progress! I've reached ${flightCard.altitude} altitude with a ${flightCard.streak}-day study streak and earned ${flightCard.xp} XP. Join my Flock for accountability!`,
      generic: `🦅 Falcon Focus: ${flightCard.altitude} altitude | ${flightCard.streak}🔥 streak | ${flightCard.xp} XP`,
    };

    return messages[platform as keyof typeof messages] || messages.generic;
  }

  static formatFlightCardForDisplay(flightCard: FlightCard): string {
    const badgeNames = flightCard.badges.map((b) => b.name).join(', ') || 'None yet';

    return `
╔════════════════════════════════════╗
║        🦅 FALCON FOCUS 🦅          ║
║     Flight Card by Korede Omotosho ║
╠════════════════════════════════════╣
║ Altitude: ${flightCard.altitude.padEnd(26)}║
║ Streak: ${flightCard.streak} days${' '.repeat(24 - flightCard.streak.toString().length)}║
║ XP Earned: ${flightCard.xp}${' '.repeat(22 - flightCard.xp.toString().length)}║
║ Badges: ${badgeNames.substring(0, 26).padEnd(26)}║
╠════════════════════════════════════╣
║ Today's Schedule:                  ║
${flightCard.todaySchedule.slice(0, 3).map((item) => `║ • ${item.substring(0, 30).padEnd(30)}║`).join('\n')}
╠════════════════════════════════════╣
║ "${flightCard.motivationalQuote.substring(0, 32)}"${' '.repeat(Math.max(0, 32 - flightCard.motivationalQuote.length))}║
╚════════════════════════════════════╝
    `;
  }

  private static getAltitudeLevel(xp: number): string {
    if (xp < 1000) return 'Fledgling';
    if (xp < 5000) return 'Soaring';
    return 'Apex';
  }

  private static getMotivationalQuote(): string {
    const quotes = [
      'Every soar begins with a single flap of the wings.',
      'The falcon doesn\'t rush its ascent—it soars with purpose.',
      'Consistency is the wind beneath your wings.',
      'Your effort today shapes your altitude tomorrow.',
      'Even the mightiest falcon rests between flights.',
      'Progress is measured not by speed, but by persistence.',
      'The view from the top is worth every climb.',
      'Your weaknesses are just opportunities to soar higher.',
      'Study smart, soar far.',
      'Every completed session adds a feather to your wings.',
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
}
