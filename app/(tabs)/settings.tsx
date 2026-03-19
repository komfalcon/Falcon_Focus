import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { PushNotificationsService } from "@/lib/push-notifications-service";
import { useThemeContext } from "@/lib/theme-provider";
import { timerAudio } from "@/lib/audio/timer-sounds";

const DAILY_MOTIVATION_KEY = "daily_motivation_enabled";

function SectionTitle({ text }: { text: string }) {
  return <Text className="mb-3 mt-6 text-xs font-bold uppercase" style={{ color: "#64748b" }}>{text}</Text>;
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  const colors = useColors();

  return (
    <View className="mb-3 flex-row items-center justify-between rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
      <Text style={{ color: colors.foreground, fontWeight: "600" }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.border, true: colors.primary }} />
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const { colorScheme, setColorScheme } = useThemeContext();

  const [darkMode, setDarkMode] = useState(colorScheme === "dark");
  const [timerTicking, setTimerTicking] = useState(true);
  const [dailyMotivation, setDailyMotivation] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [muted, storedDaily] = await Promise.all([
        AsyncStorage.getItem("timer_muted"),
        AsyncStorage.getItem(DAILY_MOTIVATION_KEY),
      ]);
      setTimerTicking(muted !== "true");
      setDailyMotivation(storedDaily === "true");
    };

    void load();
  }, []);

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    setColorScheme(enabled ? "dark" : "light");
  };

  const handleTimerTickingToggle = async (enabled: boolean) => {
    setTimerTicking(enabled);
    await timerAudio.setMuted(!enabled);
  };

  const handleDailyMotivationToggle = async (enabled: boolean) => {
    setDailyMotivation(enabled);
    await AsyncStorage.setItem(DAILY_MOTIVATION_KEY, String(enabled));
    if (enabled) {
      const granted = await PushNotificationsService.requestPermissions();
      if (granted) {
        await PushNotificationsService.scheduleDailyMotivation();
      }
      return;
    }
    await PushNotificationsService.cancelDailyMotivation();
  };

  return (
    <ScreenContainer className="px-5 pb-8">
      <Text className="mt-3 text-2xl font-bold" style={{ color: colors.foreground }}>
        Settings
      </Text>

      <SectionTitle text="Appearance" />
      <ToggleRow label="Dark Mode" value={darkMode} onChange={handleDarkModeToggle} />

      <SectionTitle text="Timer" />
      <ToggleRow label="Timer Ticking" value={timerTicking} onChange={handleTimerTickingToggle} />

      <SectionTitle text="Notifications" />
      <ToggleRow label="Daily Motivation" value={dailyMotivation} onChange={handleDailyMotivationToggle} />

      <SectionTitle text="About" />
      <View className="rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
        <Text style={{ color: colors.foreground, fontWeight: "700" }}>App Name: Falcon Focus</Text>
        <Text className="mt-1" style={{ color: colors.foreground }}>Version: 1.0.0</Text>
        <Text className="mt-1" style={{ color: colors.muted }}>
          A simple Pomodoro timer for focused students.
        </Text>
      </View>

      <SectionTitle text="Developer" />
      <View className="rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
        <Text style={{ color: colors.foreground }}>Built by: Korede Omotosho</Text>
        <Text className="mt-1" style={{ color: colors.foreground }}>📧 omotoshokorede1025@gmail.com</Text>
        <Text className="mt-1" style={{ color: colors.foreground }}>📞 +2349113683395</Text>
      </View>
    </ScreenContainer>
  );
}
