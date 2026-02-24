import { ScrollView, Text, View, TouchableOpacity, Switch } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect } from 'react';
import { useThemeContext } from '@/lib/theme-provider';
import { PushNotificationsService } from '@/lib/push-notifications-service';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = useColors();
  const { setColorScheme } = useThemeContext();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [alarmsEnabled, setAlarmsEnabled] = useState(true);

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  useEffect(() => {
    PushNotificationsService.loadPreferences().then((prefs) => {
      setPushEnabled(prefs.enabled);
      setAlarmsEnabled(prefs.sessionReminders);
    });
  }, []);

  const handleThemeToggle = () => {
    const newScheme = isDarkMode ? 'light' : 'dark';
    setColorScheme(newScheme);
    setIsDarkMode(newScheme === 'dark');
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-6">Settings</Text>

          {/* Appearance */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-muted uppercase mb-4">Appearance</Text>

            <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Dark Mode</Text>
                <Text className="text-xs text-muted mt-1">
                  {isDarkMode ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={handleThemeToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDarkMode ? colors.primary : colors.muted}
              />
            </View>
          </View>

          {/* Notifications */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-muted uppercase mb-4">Notifications</Text>

            <View className="gap-3">
              <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Push Notifications</Text>
                  <Text className="text-xs text-muted mt-1">Session reminders & achievements</Text>
                </View>
                <Switch
                  value={pushEnabled}
                  onValueChange={async (value) => {
                    setPushEnabled(value);
                    const prefs = await PushNotificationsService.loadPreferences();
                    await PushNotificationsService.savePreferences({ ...prefs, enabled: value });
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={pushEnabled ? colors.primary : colors.muted}
                />
              </View>

              <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Alarms</Text>
                  <Text className="text-xs text-muted mt-1">Study schedule alerts</Text>
                </View>
                <Switch
                  value={alarmsEnabled}
                  onValueChange={async (value) => {
                    setAlarmsEnabled(value);
                    const prefs = await PushNotificationsService.loadPreferences();
                    await PushNotificationsService.savePreferences({ ...prefs, sessionReminders: value });
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={alarmsEnabled ? colors.primary : colors.muted}
                />
              </View>
            </View>
          </View>

          {/* About */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-muted uppercase mb-4">About</Text>

            <View className="bg-surface rounded-lg p-4 border border-border">
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground">Falcon Focus</Text>
                <Text className="text-xs text-muted mt-1">Version 1.0.0</Text>
              </View>

              <View className="border-t border-border pt-4 mb-4">
                <Text className="text-xs font-semibold text-primary mb-2">Tagline</Text>
                <Text className="text-sm text-foreground italic">
                  "Sharpen Your Vision. Soar to Success."
                </Text>
              </View>

              <View className="border-t border-border pt-4 mb-4">
                <Text className="text-xs font-semibold text-primary mb-2">Founder</Text>
                <Text className="text-sm font-semibold text-foreground">Korede Omotosho</Text>
              </View>

              <View className="border-t border-border pt-4">
                <Text className="text-xs font-semibold text-primary mb-2">Vision</Text>
                <Text className="text-sm text-foreground leading-relaxed">
                  Born from one student's spark to help thousands soar. Falcon Focus is designed to be the ultimate study companion for students 13-25, combining powerful learning tools with immersive gamification to make studying engaging, effective, and inspiring.
                </Text>
              </View>
            </View>
          </View>

          {/* Data & Privacy */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-muted uppercase mb-4">Data & Privacy</Text>

            <View className="gap-3">
              <TouchableOpacity className="bg-surface rounded-lg p-4 border border-border active:opacity-80">
                <Text className="text-sm font-semibold text-foreground">Export Data</Text>
                <Text className="text-xs text-muted mt-1">Download your study data</Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-surface rounded-lg p-4 border border-border active:opacity-80">
                <Text className="text-sm font-semibold text-foreground">Privacy Policy</Text>
                <Text className="text-xs text-muted mt-1">Learn how we protect your data</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View className="bg-secondary/10 rounded-lg p-4 border border-secondary/30 items-center">
            <Text className="text-xs text-secondary font-semibold mb-2">Falcon Focus by Korede Omotosho</Text>
            <Text className="text-xs text-muted text-center">
              Sharpen Your Vision. Soar to Success.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
