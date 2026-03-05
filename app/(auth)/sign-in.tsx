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

export default function SignInScreen() {
  const router = useRouter();
  const colors = useColors();
  const { signIn, signInWithGoogle } = useAuth();
  const { request, response, promptAsync, redirectUri } = useGoogleAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 24,
              backgroundColor: colors.secondary,
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
            Sharpen Your Vision. Soar to Success.
          </Text>
        </View>

        {/* Sign In Form */}
        <Card variant="elevated" padding={24} radius={20}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.foreground, marginBottom: 20 }}>
            Welcome back
          </Text>

          {error ? (
            <Card variant="error" padding={12} radius={10} style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.error, fontSize: 13 }}>{error}</Text>
            </Card>
          ) : null}

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

          <View style={{ marginTop: 4 }}>
            <Button
              label="Sign In"
              onPress={handleSignIn}
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={isLoading || isGoogleLoading}
              fullWidth
            />
          </View>

          <Button
            label="Forgot password?"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(auth)/forgot-password");
            }}
            variant="ghost"
            size="sm"
          />

          {/* Divider */}
          <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 16 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text style={{ marginHorizontal: 12, color: colors.muted, fontSize: 12 }}>or continue with</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          {/* Google Sign-In Button */}
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

        {/* Sign Up Link */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
          <Text style={{ color: colors.muted, fontSize: 14 }}>Don't have an account? </Text>
          <Button
            label="Sign Up"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(auth)/sign-up");
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
