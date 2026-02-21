import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class NotificationsService {
  static async requestPermissions() {
    if (Platform.OS === 'web') return;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  static async scheduleNotification(
    payload: NotificationPayload,
    delaySeconds: number = 0
  ) {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          sound: 'default',
        },
        trigger: { type: 'timeInterval' as any, seconds: delaySeconds > 0 ? delaySeconds : 1 },
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  static async scheduleSessionReminder(
    sessionTitle: string,
    minutesBeforeStart: number = 30
  ) {
    const delaySeconds = minutesBeforeStart * 60;
    await this.scheduleNotification(
      {
        title: '🦅 Study Time Approaching',
        body: `${sessionTitle} starts in ${minutesBeforeStart} minutes. Get ready to soar!`,
        data: { type: 'session_reminder' },
      },
      delaySeconds
    );
  }

  static async scheduleStreakReminder() {
    await this.scheduleNotification(
      {
        title: '🔥 Keep Your Streak Alive',
        body: 'Complete a study session today to maintain your streak!',
        data: { type: 'streak_reminder' },
      },
      86400 // 24 hours
    );
  }

  static async scheduleMorningBriefing() {
    await this.scheduleNotification(
      {
        title: '🌅 Good Morning, Falcon',
        body: 'Check your schedule and plan your study sessions for today.',
        data: { type: 'morning_briefing' },
      },
      28800 // 8 AM
    );
  }

  static async scheduleEveningRecap() {
    await this.scheduleNotification(
      {
        title: '🌙 Evening Recap',
        body: 'Review your progress today and plan tomorrow\'s goals.',
        data: { type: 'evening_recap' },
      },
      64800 // 6 PM
    );
  }

  static async scheduleDeadlineAlert(
    taskTitle: string,
    hoursUntilDeadline: number
  ) {
    await this.scheduleNotification(
      {
        title: '⏰ Deadline Alert',
        body: `${taskTitle} is due in ${hoursUntilDeadline} hours!`,
        data: { type: 'deadline_alert' },
      },
      hoursUntilDeadline * 3600
    );
  }

  static async scheduleAchievementUnlocked(badgeName: string) {
    await this.scheduleNotification(
      {
        title: '🏆 Badge Unlocked!',
        body: `You\'ve earned the "${badgeName}" badge!`,
        data: { type: 'achievement_unlocked' },
      },
      0
    );
  }

  static async cancelAllNotifications() {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
