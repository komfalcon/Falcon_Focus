import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="focus"
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          backgroundColor: colors.isDark ? "#0f1923" : "#ffffff",
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === "web" ? 60 : 60 + insets.bottom,
          paddingBottom: Platform.OS === "web" ? 8 : insets.bottom,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="focus"
        options={{
          title: "Focus",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="target" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart-bar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
