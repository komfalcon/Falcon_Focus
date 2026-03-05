import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colors = useColors();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const forgotPasswordMutation = trpc.falconAuth.forgotPassword.useMutation();

  const handleReset = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setError("");
    setIsLoading(true);
    try {
      await forgotPasswordMutation.mutateAsync({ email: email.trim() });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email. Please try again.");
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
        {/* Back Button */}
        <View style={{ position: "absolute", top: 48, left: 24 }}>
          <Button
            label="← Back"
            onPress={() => router.back()}
            variant="ghost"
            size="sm"
          />
        </View>

        {/* Logo & Header */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
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
        </View>

        {success ? (
          <Card variant="success" padding={28} radius={20}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 36, marginBottom: 12 }}>✉️</Text>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground, marginBottom: 8 }}>
                Check your inbox
              </Text>
              <Text style={{ color: colors.muted, textAlign: "center", fontSize: 14, lineHeight: 20 }}>
                If that email address is in our system, we've sent a password reset link to{" "}
                <Text style={{ fontWeight: "bold", color: colors.foreground }}>{email}</Text>
              </Text>
              <View style={{ marginTop: 24 }}>
                <Button
                  label="Back to Sign In"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/(auth)/sign-in");
                  }}
                  variant="primary"
                  size="md"
                />
              </View>
            </View>
          </Card>
        ) : (
          <Card variant="elevated" padding={24} radius={20}>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.foreground, marginBottom: 8 }}>
              Reset password
            </Text>
            <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 24, lineHeight: 20 }}>
              Enter your email and we'll send you a link to reset your password.
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

            <Button
              label="Send Reset Link"
              onPress={handleReset}
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              fullWidth
            />
          </Card>
        )}

        {/* Footer */}
        <Text style={{ color: colors.muted, fontSize: 11, textAlign: "center", marginTop: 32 }}>
          Falcon Focus by Korede Omotosho
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
