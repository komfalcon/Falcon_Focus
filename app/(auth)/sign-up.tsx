import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth/use-auth";
import { useGoogleAuth } from "@/lib/auth/google-auth";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SignUpScreen() {
  const router = useRouter();
  const colors = useColors();
  const { signUp, signInWithGoogle } = useAuth();
  const { request, response, promptAsync, redirectUri } = useGoogleAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === "success") {
      const code = response.params?.code;
      if (code) {
        setIsGoogleLoading(true);
        signInWithGoogle(code, redirectUri, request?.codeVerifier ?? undefined)
          .then(() => {
            router.replace("/(tabs)");
          })
          .catch((err: unknown) => {
            setError(err instanceof Error ? err.message : "Google sign in failed. Please try again.");
          })
          .finally(() => {
            setIsGoogleLoading(false);
          });
      }
    } else if (response?.type === "error") {
      setError(response.error?.message || "Google sign in failed. Please try again.");
      setIsGoogleLoading(false);
    } else if (response?.type === "cancel" || response?.type === "dismiss") {
      setIsGoogleLoading(false);
    }
  }, [response, signInWithGoogle, redirectUri, request, router]);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setError("");
    setIsLoading(true);
    try {
      await signUp(name.trim(), email.trim(), password);
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGooglePress = () => {
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    promptAsync().catch(() => {
      // If promptAsync itself throws, ensure loading state is cleared
      setIsGoogleLoading(false);
    });
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
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 24,
              backgroundColor: colors.isDark ? colors.surface : colors.secondary,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 44 }}>🦅</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground }}>
            Falcon Focus
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
            Join thousands of soaring students
          </Text>
        </View>

        {/* Sign Up Form */}
        <Card variant="elevated" padding={24} radius={20}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.foreground, marginBottom: 20 }}>
            Create account
          </Text>

          {error ? (
            <Card variant="error" padding={12} radius={10} style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.error, fontSize: 13 }}>{error}</Text>
            </Card>
          ) : null}

          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Korede Omotosho"
            autoCapitalize="words"
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Button
            label="Create Account"
            onPress={handleSignUp}
            variant="primary"
            size="lg"
            loading={isLoading}
            disabled={isLoading || isGoogleLoading}
            fullWidth
          />

          {/* Divider */}
          <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 16 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text style={{ marginHorizontal: 12, color: colors.muted, fontSize: 12 }}>or sign up with</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          {/* Google Sign-Up Button */}
          <Button
            label="Continue with Google"
            onPress={handleGooglePress}
            variant="outline"
            size="lg"
            loading={isGoogleLoading}
            disabled={!request || isLoading || isGoogleLoading}
            fullWidth
            icon={<Text style={{ fontSize: 18 }}>G</Text>}
          />
        </Card>

        {/* Sign In Link */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
          <Text style={{ color: colors.muted, fontSize: 14 }}>Already have an account? </Text>
          <Button
            label="Sign In"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(auth)/sign-in");
            }}
            variant="ghost"
            size="sm"
          />
        </View>

        {/* Footer */}
        <Text style={{ color: colors.muted, fontSize: 11, textAlign: "center", marginTop: 32 }}>
          Falcon Focus by Korede Omotosho
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
