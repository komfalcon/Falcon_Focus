import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PushNotificationPreferences {
  enabled: boolean;
  sessionReminders: boolean;
  achievements: boolean;
  dailyMotivation: boolean;
  eveningRecap: boolean;
  lowEnergyAlerts: boolean;
  flockNudges: boolean;
}

export const DEFAULT_PREFERENCES: PushNotificationPreferences = {
  enabled: true,
  sessionReminders: true,
  achievements: true,
  dailyMotivation: true,
  eveningRecap: true,
  lowEnergyAlerts: true,
  flockNudges: true,
};

export class PushNotificationsService {
  private static readonly STORAGE_KEY = 'push_notifications_prefs';
  private static readonly TOKEN_STORAGE_KEY = 'expo_push_token';

  /**
   * Request notification permissions from user
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  /**
   * Get Expo Push Token and store locally
   */
  static async getAndStorePushToken(): Promise<string | null> {
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      await AsyncStorage.setItem(this.TOKEN_STORAGE_KEY, token);
      return token;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  /**
   * Get stored push token
   */
  static async getStoredPushToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to retrieve push token:', error);
      return null;
    }
  }

  /**
   * Load notification preferences
   */
  static async loadPreferences(): Promise<PushNotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  /**
   * Save notification preferences
   */
  static async savePreferences(prefs: PushNotificationPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }

  /**
   * Schedule session reminder (30 minutes before)
   */
  static async scheduleSessionReminder(sessionTitle: string, sessionTime: number): Promise<string> {
    const trigger = new Date(sessionTime - 30 * 60 * 1000);

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '🦅 Study Session Starting Soon',
        body: `Your "${sessionTitle}" session starts in 30 minutes. Get ready to soar!`,
        data: { type: 'session_reminder', sessionTitle },
        sound: 'default',
      },
      trigger: trigger as any,
    });
  }

  /**
   * Schedule achievement celebration
   */
  static async scheduleAchievementNotification(
    badgeName: string,
    badgeEmoji: string
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `${badgeEmoji} Achievement Unlocked!`,
        body: `You've earned the "${badgeName}" badge! Keep soaring! 🚀`,
        data: { type: 'achievement', badgeName },
        sound: 'default',
      },
      trigger: null,
    });
  }

  /**
   * Schedule daily Falcon Wisdom motivation
   */
  static async scheduleDailyMotivation(hour: number = 9, minute: number = 0): Promise<string> {
    const motivationalMessages = [
      'Every study session brings you closer to mastery. Soar today! 🦅',
      'Your Falcon Focus streak is building momentum. Keep it up! 🔥',
      'Small consistent efforts lead to extraordinary results. Study wisely! 📚',
      'Your future self will thank you for studying today. Let\'s go! 💪',
      'Challenges are just opportunities to grow stronger. Embrace them! 🌟',
      'You\'re on an amazing journey. One study session at a time! ✨',
      'Falcon Focus is here to help you soar to success! 🚀',
      'Remember: Progress over perfection. Every minute counts! ⏰',
    ];

    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '🦅 Falcon Wisdom',
        body: randomMessage,
        data: { type: 'daily_motivation' },
        sound: 'default',
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      } as any,
    });
  }

  /**
   * Schedule evening recap notification
   */
  static async scheduleEveningRecap(hour: number = 20, minute: number = 0): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Evening Study Recap',
        body: 'Check your progress today! How many XP did you earn? 🎯',
        data: { type: 'evening_recap' },
        sound: 'default',
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      } as any,
    });
  }

  /**
   * Schedule low energy alert
   */
  static async scheduleLowEnergyAlert(energyLevel: number): Promise<string | null> {
    if (energyLevel > 2) return null; // Only alert if energy is low

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚡ Energy Check',
        body: 'Your energy is low. Consider taking a break or switching to lighter tasks. 🛫',
        data: { type: 'low_energy_alert' },
        sound: 'default',
      },
      trigger: null,
    });
  }

  /**
   * Schedule Flock accountability nudge
   */
  static async scheduleFlockNudge(flockName: string, memberName: string): Promise<string> {
    const nudges = [
      `${memberName} from "${flockName}" is crushing their goals! Will you join them? 🦅`,
      `Your flock is flying high! Don't get left behind in "${flockName}". Study now! 📚`,
      `"${flockName}" flock members are soaring. Time to catch up! 🚀`,
      `${memberName} just completed a study session in "${flockName}". Your turn! 💪`,
    ];

    const randomNudge = nudges[Math.floor(Math.random() * nudges.length)];

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '👥 Flock Nudge',
        body: randomNudge,
        data: { type: 'flock_nudge', flockName },
        sound: 'default',
      },
      trigger: null,
    });
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  /**
   * Handle notification response (when user taps notification)
   */
  static setupNotificationHandler(
    onResponse: (notification: Notifications.Notification) => void
  ): () => void {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      onResponse(response.notification);
    });

    // Return cleanup function
    return () => subscription.remove();
  }

  /**
   * Generate falcon-themed notification message
   */
  static generateFalconMessage(type: string, context?: any): string {
    const messages: Record<string, string> = {
      session_reminder: `Time to spread your wings and study! 🦅`,
      achievement: `You're soaring higher than ever! 🚀`,
      daily_motivation: `Another day, another opportunity to excel! 💪`,
      evening_recap: `Reflect on your amazing progress today! 📊`,
      low_energy: `Rest is part of the journey. Take care of yourself! 🛫`,
      flock_nudge: `Your flock believes in you! 👥`,
    };

    return messages[type] || 'Keep soaring with Falcon Focus! 🦅';
  }
}
