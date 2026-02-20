import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect } from 'react';
import { useThemeContext } from '@/lib/theme-provider';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = useColors();
  const { setColorScheme } = useThemeContext();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  const handleThemeToggle = () => {
    const newScheme = isDarkMode ? 'light' : 'dark';
    setColorScheme(newScheme);
    setIsDarkMode(newScheme === 'dark');
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-6">Settings</Text>

          {/* Appearance */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-muted uppercase mb-4">Appearance</Text>

            <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
              <View className="flex-row items-center gap-3">
                <IconSymbol
                  name="gearshape.fill"
                  size={24}
                  color={colors.primary}
                />
                <View>
                  <Text className="text-base font-semibold text-foreground">Dark Mode</Text>
                  <Text className="text-xs text-muted mt-1">
                    {isDarkMode ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={handleThemeToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDarkMode ? colors.primary : colors.muted}
              />
            </View>
          </View>

          {/* About */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-muted uppercase mb-4">About</Text>

            <View className="bg-surface rounded-lg p-4 border border-border">
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground">Study Planner</Text>
                <Text className="text-xs text-muted mt-1">Version 1.0.0</Text>
              </View>

              <View className="border-t border-border pt-4">
                <Text className="text-sm text-foreground leading-relaxed">
                  Study Planner helps you set learning goals, break them into manageable tasks, and track your progress over time.
                </Text>
              </View>
            </View>
          </View>

          {/* Tips */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-muted uppercase mb-4">Tips</Text>

            <View className="bg-primary/10 rounded-lg p-4 border border-primary">
              <Text className="text-sm font-semibold text-primary mb-3">Getting Started</Text>
              <View className="gap-2">
                <Text className="text-xs text-foreground">
                  • Create a goal by tapping the + button on the Home screen
                </Text>
                <Text className="text-xs text-foreground">
                  • Break your goal into smaller tasks for better progress tracking
                </Text>
                <Text className="text-xs text-foreground">
                  • Check off tasks as you complete them to see your progress
                </Text>
                <Text className="text-xs text-foreground">
                  • View your statistics to stay motivated and track your learning journey
                </Text>
              </View>
            </View>
          </View>

          {/* Data */}
          <View>
            <Text className="text-sm font-semibold text-muted uppercase mb-4">Data</Text>

            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-sm text-foreground mb-3">
                All your data is stored locally on your device. No cloud sync is required.
              </Text>
              <Text className="text-xs text-muted">
                Your goals and tasks are automatically saved whenever you make changes.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
