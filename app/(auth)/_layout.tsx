import { Stack, Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthContext } from "@/lib/auth/auth-context";
import { useColors } from "@/hooks/use-colors";

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const colors = useColors();

  // Wait for auth to resolve before rendering or redirecting
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Already logged-in users skip auth screens
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
