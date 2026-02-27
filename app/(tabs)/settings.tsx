import { ScrollView, Text, View, TouchableOpacity, Switch, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect } from 'react';
import { useThemeContext } from '@/lib/theme-provider';
import { PushNotificationsService } from '@/lib/push-notifications-service';
import { useAuthContext } from '@/lib/auth/auth-context';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = useColors();
  const { setColorScheme } = useThemeContext();
  const { user, signOut } = useAuthContext();
  const router = useRouter();
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
          <Text className="text-3xl font-bold text-foreground dark:text-foreground-dark mb-6 tracking-tight">Settings</Text>

          {/* Profile Card */}
          {user ? (
            <View
              className="rounded-2xl p-5 mb-8 flex-row items-center"
              style={{
                backgroundColor: colors.primary + '14',
                borderWidth: 1,
                borderColor: colors.primary + '30',
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 14,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
                  {user.name?.charAt(0)?.toUpperCase() ?? '?'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-foreground dark:text-foreground-dark">{user.name}</Text>
                <Text className="text-xs text-muted dark:text-muted-dark mt-1">{user.email}</Text>
                <Text className="text-xs font-semibold mt-1" style={{ color: colors.accent }}>
                  {user.level ?? 'Fledgling'} • {user.feathers ?? 0} Feathers
                </Text>
              </View>
            </View>
          ) : null}

          {/* Appearance */}
          <View className="mb-8">
            <Text className="text-xs font-bold text-muted dark:text-muted-dark uppercase mb-4 tracking-wider">Appearance</Text>

            <View
              className="rounded-2xl p-4 flex-row justify-between items-center"
              style={{
                backgroundColor: colors.surface,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <View className="flex-1">
                <Text className="text-base font-bold text-foreground dark:text-foreground-dark">Dark Mode</Text>
                <Text className="text-xs text-muted dark:text-muted-dark mt-1">
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
            <Text className="text-xs font-bold text-muted dark:text-muted-dark uppercase mb-4 tracking-wider">Notifications</Text>

            <View className="gap-3">
              <View
                className="rounded-2xl p-4 flex-row justify-between items-center"
                style={{
                  backgroundColor: colors.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.03,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">Push Notifications</Text>
                  <Text className="text-xs text-muted dark:text-muted-dark mt-1">Session reminders & achievements</Text>
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

              <View
                className="rounded-2xl p-4 flex-row justify-between items-center"
                style={{
                  backgroundColor: colors.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.03,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">Alarms</Text>
                  <Text className="text-xs text-muted dark:text-muted-dark mt-1">Study schedule alerts</Text>
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
            <Text className="text-xs font-bold text-muted dark:text-muted-dark uppercase mb-4 tracking-wider">About</Text>

            <View
              className="rounded-2xl p-5"
              style={{
                backgroundColor: colors.surface,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="mb-4">
                <Text className="text-base font-bold text-foreground dark:text-foreground-dark">Falcon Focus</Text>
                <Text className="text-xs text-muted dark:text-muted-dark mt-1">Version 1.0.0</Text>
              </View>

              <View className="border-t pt-4 mb-4" style={{ borderTopColor: colors.border }}>
                <Text className="text-xs font-bold mb-2" style={{ color: colors.accent }}>Tagline</Text>
                <Text className="text-sm text-foreground dark:text-foreground-dark italic">
                  "Sharpen Your Vision. Soar to Success."
                </Text>
              </View>

              <View className="border-t pt-4 mb-4" style={{ borderTopColor: colors.border }}>
                <Text className="text-xs font-bold mb-2" style={{ color: colors.accent }}>Founder</Text>
                <Text className="text-sm font-bold text-foreground dark:text-foreground-dark">Korede Omotosho</Text>
              </View>

              <View className="border-t pt-4" style={{ borderTopColor: colors.border }}>
                <Text className="text-xs font-bold mb-2" style={{ color: colors.accent }}>Vision</Text>
                <Text className="text-sm text-foreground dark:text-foreground-dark leading-relaxed">
                  Born from one student's spark to help thousands soar. Falcon Focus is designed to be the ultimate study companion for students 13-25, combining powerful learning tools with immersive gamification to make studying engaging, effective, and inspiring.
                </Text>
              </View>
            </View>
          </View>

          {/* Data & Privacy */}
          <View className="mb-8">
            <Text className="text-xs font-bold text-muted dark:text-muted-dark uppercase mb-4 tracking-wider">Data & Privacy</Text>

            <View className="gap-3">
              <TouchableOpacity
                className="rounded-2xl p-4 active:opacity-80"
                style={{
                  backgroundColor: colors.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.03,
                  shadowRadius: 4,
                  elevation: 1,
                }}
                onPress={() => {
                  Alert.alert('Export Data', 'Your study data export will be prepared. This feature is coming soon.');
                }}
              >
                <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">Export Data</Text>
                <Text className="text-xs text-muted dark:text-muted-dark mt-1">Download your study data</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-2xl p-4 active:opacity-80"
                style={{
                  backgroundColor: colors.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.03,
                  shadowRadius: 4,
                  elevation: 1,
                }}
                onPress={() => {
                  Linking.openURL('https://falconfocus.app/privacy');
                }}
              >
                <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">Privacy Policy</Text>
                <Text className="text-xs text-muted dark:text-muted-dark mt-1">Learn how we protect your data</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Feedback & Support */}
          <View className="mb-8">
            <Text className="text-xs font-bold text-muted dark:text-muted-dark uppercase mb-4 tracking-wider">Feedback & Support</Text>

            <View
              className="rounded-2xl p-5"
              style={{
                backgroundColor: colors.surface,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="mb-4">
                <Text className="text-xs font-bold mb-2" style={{ color: colors.accent }}>Contact</Text>
                <Text className="text-sm text-foreground dark:text-foreground-dark">omotoshokorede1025@gmail.com</Text>
                <Text className="text-sm text-foreground dark:text-foreground-dark mt-1">+2349113683395</Text>
              </View>

              <View className="border-t pt-4" style={{ borderTopColor: colors.border }}>
                <TouchableOpacity
                  className="rounded-xl py-3 px-4 active:opacity-80 items-center"
                  style={{ backgroundColor: colors.primary }}
                  onPress={() => {
                    Linking.openURL('mailto:omotoshokorede1025@gmail.com?subject=Falcon Focus Feedback');
                  }}
                >
                  <Text className="text-sm font-bold text-white">Send Feedback</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Account */}
          <View className="mb-8">
            <Text className="text-xs font-bold uppercase mb-4 tracking-wider" style={{ color: colors.error }}>Account</Text>

            <TouchableOpacity
              className="rounded-2xl p-4 active:opacity-80"
              style={{
                backgroundColor: colors.error + '10',
                borderWidth: 1,
                borderColor: colors.error + '30',
              }}
              onPress={() => {
                Alert.alert(
                  'Sign Out',
                  'Are you sure you want to sign out?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Sign Out',
                      style: 'destructive',
                      onPress: async () => {
                        await signOut();
                        router.replace('/(auth)/sign-in');
                      },
                    },
                  ],
                );
              }}
            >
              <Text className="text-sm font-bold" style={{ color: colors.error }}>Sign Out</Text>
              <Text className="text-xs mt-1" style={{ color: colors.error + '99' }}>
                You'll need to sign in again to access your data
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View
            className="rounded-2xl p-5 items-center"
            style={{
              backgroundColor: colors.secondary + '10',
              borderWidth: 1,
              borderColor: colors.accent + '20',
            }}
          >
            <Text className="text-xs font-bold mb-2" style={{ color: colors.accent }}>Falcon Focus by Korede Omotosho</Text>
            <Text className="text-xs text-muted dark:text-muted-dark text-center">
              Sharpen Your Vision. Soar to Success.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
