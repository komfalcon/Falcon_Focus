import { Stack, Redirect } from "expo-router";
import { useAuthContext } from "@/lib/auth/auth-context";

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuthContext();

  // Already logged-in users skip auth screens
  if (!isLoading && isAuthenticated) {
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
