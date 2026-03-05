import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockNotifications, mockAsyncStorage, mockDevice } = vi.hoisted(() => ({
  mockNotifications: {
    getPermissionsAsync: vi.fn(),
    requestPermissionsAsync: vi.fn(),
    setNotificationHandler: vi.fn(),
    setNotificationChannelAsync: vi.fn(),
    getExpoPushTokenAsync: vi.fn(),
    scheduleNotificationAsync: vi.fn().mockResolvedValue('mock-id'),
    cancelAllScheduledNotificationsAsync: vi.fn(),
    addNotificationResponseReceivedListener: vi.fn(() => ({ remove: vi.fn() })),
    AndroidImportance: { MAX: 5, HIGH: 4 },
  },
  mockAsyncStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
  mockDevice: { isDevice: true },
}));

vi.mock('expo-notifications', () => mockNotifications);
vi.mock('expo-device', () => mockDevice);
vi.mock('react-native', () => ({ Platform: { OS: 'android' } }));
vi.mock('@react-native-async-storage/async-storage', () => ({ default: mockAsyncStorage }));
vi.mock('expo-constants', () => ({
  default: {
    expoConfig: { extra: { eas: { projectId: 'mock-project-id' } } },
  },
}));

import { PushNotificationsService, DEFAULT_PREFERENCES, type PushNotificationPreferences } from './push-notifications-service';

describe('PushNotificationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DEFAULT_PREFERENCES', () => {
    it('should have all preferences enabled by default', () => {
      expect(DEFAULT_PREFERENCES.enabled).toBe(true);
      expect(DEFAULT_PREFERENCES.sessionReminders).toBe(true);
      expect(DEFAULT_PREFERENCES.achievements).toBe(true);
      expect(DEFAULT_PREFERENCES.dailyMotivation).toBe(true);
      expect(DEFAULT_PREFERENCES.eveningRecap).toBe(true);
      expect(DEFAULT_PREFERENCES.lowEnergyAlerts).toBe(true);
      expect(DEFAULT_PREFERENCES.flockNudges).toBe(true);
    });
  });

  describe('requestPermissions', () => {
    it('should return false when not on a physical device', async () => {
      mockDevice.isDevice = false;
      const result = await PushNotificationsService.requestPermissions();
      expect(result).toBe(false);
      mockDevice.isDevice = true;
    });

    it('should skip requesting if already granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'granted',
        expires: 'never',
        granted: true,
        canAskAgain: true,
      });

      const result = await PushNotificationsService.requestPermissions();
      expect(result).toBe(true);
      expect(mockNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should request permissions if not already granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'undetermined',
        expires: 'never',
        granted: false,
        canAskAgain: true,
      });
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
        expires: 'never',
        granted: true,
        canAskAgain: true,
      });

      const result = await PushNotificationsService.requestPermissions();
      expect(result).toBe(true);
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should set up Android notification channels', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'granted',
        expires: 'never',
        granted: true,
        canAskAgain: true,
      });

      await PushNotificationsService.requestPermissions();

      expect(mockNotifications.setNotificationChannelAsync).toHaveBeenCalledWith('default', expect.objectContaining({
        name: 'Falcon Focus',
      }));
      expect(mockNotifications.setNotificationChannelAsync).toHaveBeenCalledWith('timer', expect.objectContaining({
        name: 'Timer Alerts',
      }));
    });
  });

  describe('getExpoPushToken', () => {
    it('should return cached token if available', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('ExponentPushToken[cached]');

      const token = await PushNotificationsService.getExpoPushToken();
      expect(token).toBe('ExponentPushToken[cached]');
      expect(mockNotifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    });

    it('should request new token if no cache', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'granted',
        expires: 'never',
        granted: true,
        canAskAgain: true,
      });
      mockNotifications.getExpoPushTokenAsync.mockResolvedValue({
        data: 'ExponentPushToken[new]',
        type: 'expo',
      });

      const token = await PushNotificationsService.getExpoPushToken();
      expect(token).toBe('ExponentPushToken[new]');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('push_token', 'ExponentPushToken[new]');
    });

    it('should return null on error', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const token = await PushNotificationsService.getExpoPushToken();
      expect(token).toBeNull();
    });
  });

  describe('loadPreferences', () => {
    it('should return stored preferences', async () => {
      const stored: PushNotificationPreferences = { ...DEFAULT_PREFERENCES, enabled: false };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(stored));

      const prefs = await PushNotificationsService.loadPreferences();
      expect(prefs.enabled).toBe(false);
    });

    it('should return defaults when nothing stored', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const prefs = await PushNotificationsService.loadPreferences();
      expect(prefs).toEqual(DEFAULT_PREFERENCES);
    });

    it('should return defaults on error', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('fail'));

      const prefs = await PushNotificationsService.loadPreferences();
      expect(prefs).toEqual(DEFAULT_PREFERENCES);
    });
  });

  describe('savePreferences', () => {
    it('should save preferences to AsyncStorage', async () => {
      const prefs: PushNotificationPreferences = { ...DEFAULT_PREFERENCES, dailyMotivation: false };
      await PushNotificationsService.savePreferences(prefs);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'notification_settings',
        JSON.stringify(prefs),
      );
    });
  });

  describe('scheduleDailyMotivation', () => {
    it('should schedule a daily motivation notification with identifier', async () => {
      await PushNotificationsService.scheduleDailyMotivation();

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: 'daily_motivation',
          content: expect.objectContaining({
            title: '🦅 Falcon Focus',
          }),
          trigger: expect.objectContaining({
            hour: 8,
            minute: 0,
            repeats: true,
            channelId: 'default',
          }),
        }),
      );
    });
  });

  describe('scheduleStreakReminder', () => {
    it('should schedule a streak reminder for active streaks', async () => {
      await PushNotificationsService.scheduleStreakReminder(5);

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: 'streak_reminder',
          content: expect.objectContaining({
            title: '🔥 Streak Alert!',
            body: expect.stringContaining('5-day streak'),
          }),
        }),
      );
    });

    it('should not schedule for zero streak', async () => {
      await PushNotificationsService.scheduleStreakReminder(0);
      expect(mockNotifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('scheduleLowEnergyAlert', () => {
    it('should schedule alert for low energy', async () => {
      await PushNotificationsService.scheduleLowEnergyAlert(1);
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    it('should not schedule for high energy', async () => {
      const result = await PushNotificationsService.scheduleLowEnergyAlert(4);
      expect(result).toBeNull();
      expect(mockNotifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('cancelAllNotifications', () => {
    it('should cancel all scheduled notifications', async () => {
      await PushNotificationsService.cancelAllNotifications();
      expect(mockNotifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });
  });

  describe('setupNotificationHandler', () => {
    it('should set up listener and return cleanup function', () => {
      const onResponse = vi.fn();
      const cleanup = PushNotificationsService.setupNotificationHandler(onResponse);

      expect(mockNotifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
      expect(typeof cleanup).toBe('function');
    });
  });

  describe('generateFalconMessage', () => {
    it('should return correct message for known types', () => {
      expect(PushNotificationsService.generateFalconMessage('session_reminder')).toContain('wings');
      expect(PushNotificationsService.generateFalconMessage('achievement')).toContain('soaring');
      expect(PushNotificationsService.generateFalconMessage('flock_nudge')).toContain('flock');
    });

    it('should return fallback for unknown types', () => {
      expect(PushNotificationsService.generateFalconMessage('unknown')).toContain('Falcon Focus');
    });
  });
});
