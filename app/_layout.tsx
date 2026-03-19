import "@/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";

import { ThemeProvider } from "@/lib/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ErrorBoundary>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
            </Stack>
            <StatusBar style="auto" />
          </GestureHandlerRootView>
        </ErrorBoundary>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
