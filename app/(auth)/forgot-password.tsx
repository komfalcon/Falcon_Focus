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
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

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
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ position: "absolute", top: 48, left: 24, padding: 8 }}
        >
          <Text style={{ color: colors.primary, fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>

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
        </View>

        {success ? (
          <View
            style={{
              backgroundColor: colors.success + "15",
              borderRadius: 20,
              padding: 28,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.success + "30",
            }}
          >
            <Text style={{ fontSize: 36, marginBottom: 12 }}>✉️</Text>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground, marginBottom: 8 }}>
              Check your inbox
            </Text>
            <Text style={{ color: colors.muted, textAlign: "center", fontSize: 14, lineHeight: 20 }}>
              If that email address is in our system, we've sent a password reset link to{" "}
              <Text style={{ fontWeight: "bold", color: colors.foreground }}>{email}</Text>
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(auth)/sign-in");
              }}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 32,
                marginTop: 24,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "bold" }}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
            <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.foreground, marginBottom: 8 }}>
              Reset password
            </Text>
            <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 24, lineHeight: 20 }}>
              Enter your email and we'll send you a link to reset your password.
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

            <View style={{ marginBottom: 20 }}>
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

            <TouchableOpacity
              onPress={handleReset}
              disabled={isLoading}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
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
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Send Reset Link</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <Text style={{ color: colors.muted, fontSize: 11, textAlign: "center", marginTop: 32 }}>
          Falcon Focus by Korede Omotosho
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
