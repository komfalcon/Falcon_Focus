import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth/use-auth";

export default function SignInScreen() {
  const router = useRouter();
  const colors = useColors();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo & Header */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🦅</Text>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground }}>
            Falcon Focus
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
            Sharpen Your Vision. Soar to Success.
          </Text>
        </View>

        {/* Sign In Form */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.foreground, marginBottom: 20 }}>
            Welcome back
          </Text>

          {error ? (
            <View
              style={{
                backgroundColor: colors.error + "15",
                borderRadius: 10,
                padding: 12,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.error + "30",
              }}
            >
              <Text style={{ color: colors.error, fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground, marginBottom: 6 }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={{
                borderWidth: 1.5,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 14,
                fontSize: 15,
                color: colors.foreground,
                backgroundColor: colors.background,
              }}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground, marginBottom: 6 }}>
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              secureTextEntry
              autoComplete="password"
              style={{
                borderWidth: 1.5,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 14,
                fontSize: 15,
                color: colors.foreground,
                backgroundColor: colors.background,
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleSignIn}
            disabled={isLoading}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              marginBottom: 12,
              opacity: isLoading ? 0.7 : 1,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgot-password")}
            style={{ alignItems: "center", paddingVertical: 8 }}
          >
            <Text style={{ color: colors.primary, fontSize: 13 }}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
          <Text style={{ color: colors.muted, fontSize: 14 }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "bold" }}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={{ color: colors.muted, fontSize: 11, textAlign: "center", marginTop: 32 }}>
          Falcon Focus by Korede Omotosho
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
