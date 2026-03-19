import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class PushNotificationsService {
  static async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let permissionStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      permissionStatus = status;
    }

    if (permissionStatus !== "granted") return false;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Falcon Focus",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    return true;
  }

  static async sendSessionCompleteNotification(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Time's up! Session complete. Take a break 🎯",
        body: "",
        sound: "default",
      },
      trigger: null,
    });
  }

  static async scheduleDailyMotivation(): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync("daily_motivation").catch(() => undefined);

    await Notifications.scheduleNotificationAsync({
      identifier: "daily_motivation",
      content: {
        title: "🦅 Falcon Focus",
        body: "A focused session today can change your future. Start now 🎯",
        sound: "default",
      },
      trigger: {
        hour: 8,
        minute: 0,
        repeats: true,
      },
    });
  }

  static async cancelDailyMotivation(): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync("daily_motivation").catch(() => undefined);
  }
}
