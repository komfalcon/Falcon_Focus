import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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
  private static readonly TOKEN_KEY = 'push_token';
  private static readonly SETTINGS_KEY = 'notification_settings';

  /**
   * Request notification permissions and set up Android channels
   */
  static async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) return false;

    const { status: existing } = await Notifications.getPermissionsAsync();
    let final = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      final = status;
    }

    if (final !== 'granted') return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Falcon Focus',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0a7ea4',
        sound: 'default',
      });
      await Notifications.setNotificationChannelAsync('timer', {
        name: 'Timer Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 200, 500],
        lightColor: '#FFB81C',
      });
    }

    return true;
  }

  /**
   * Get Expo Push Token with caching
   */
  static async getExpoPushToken(): Promise<string | null> {
    try {
      const cached = await AsyncStorage.getItem(this.TOKEN_KEY);
      if (cached) return cached;

      const granted = await this.requestPermissions();
      if (!granted) return null;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) return null;

      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      await AsyncStorage.setItem(this.TOKEN_KEY, token.data);
      return token.data;
    } catch (error) {
      console.error('[Notifications] Token error:', error);
      return null;
    }
  }

  /**
   * Load notification preferences
   */
  static async loadPreferences(): Promise<PushNotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem(this.SETTINGS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('[Notifications] Failed to load preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  /**
   * Save notification preferences
   */
  static async savePreferences(prefs: PushNotificationPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error('[Notifications] Failed to save preferences:', error);
    }
  }

  /**
   * Schedule daily motivation notification
   */
  static async scheduleDailyMotivation(): Promise<void> {
    const messages = [
      "Good morning! 🌅 Ready to soar today?",
      "Every session counts! 🦅 Start small, finish strong.",
      "Your future self will thank you for studying today 🎯",
      "Top students study consistently. Today's your day! ⚡",
    ];

    const body = messages[Math.floor(Math.random() * messages.length)];

    await Notifications.scheduleNotificationAsync({
      identifier: 'daily_motivation',
      content: { title: '🦅 Falcon Focus', body, sound: 'default' },
      trigger: { hour: 8, minute: 0, repeats: true, channelId: 'default' },
    }).catch((e) => console.error('[Notifications] Failed to schedule daily motivation:', e));
  }

  /**
   * Schedule streak reminder notification
   */
  static async scheduleStreakReminder(currentStreak: number): Promise<void> {
    if (currentStreak <= 0) return;

    await Notifications.scheduleNotificationAsync({
      identifier: 'streak_reminder',
      content: {
        title: '🔥 Streak Alert!',
        body: `You're on a ${currentStreak}-day streak! Don't break it — study today!`,
        sound: 'default',
      },
      trigger: { hour: 18, minute: 0, repeats: true, channelId: 'default' },
    }).catch((e) => console.error('[Notifications] Failed to schedule streak reminder:', e));
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
    if (energyLevel > 2) return null;

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
      console.error('[Notifications] Failed to cancel:', error);
    }
  }

  /**
   * Handle notification response (when user taps notification)
   */
  static setupNotificationHandler(
    onResponse: (notification: Notifications.Notification) => void
  ): () => void {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      onResponse(response.notification);
    });

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
