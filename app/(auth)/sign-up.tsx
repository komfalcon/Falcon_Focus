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
import { useState, useEffect } from "react";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth/use-auth";
import { useGoogleAuth } from "@/lib/auth/google-auth";
import * as Haptics from "expo-haptics";

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
            Join thousands of soaring students
          </Text>
        </View>

        {/* Sign Up Form */}
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
            Create account
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

          {[
            { label: "Full Name", value: name, setter: setName, placeholder: "Korede Omotosho", type: "default", secure: false, autoComplete: "name" as const },
            { label: "Email", value: email, setter: setEmail, placeholder: "you@example.com", type: "email-address", secure: false, autoComplete: "email" as const },
            { label: "Password", value: password, setter: setPassword, placeholder: "••••••••", type: "default", secure: true, autoComplete: "password-new" as const },
            { label: "Confirm Password", value: confirmPassword, setter: setConfirmPassword, placeholder: "••••••••", type: "default", secure: true, autoComplete: "password-new" as const },
          ].map((field, idx) => (
            <View key={idx} style={{ marginBottom: idx < 3 ? 16 : 20 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground, marginBottom: 6 }}>
                {field.label}
              </Text>
              <TextInput
                value={field.value}
                onChangeText={field.setter}
                placeholder={field.placeholder}
                placeholderTextColor={colors.muted}
                keyboardType={field.type as any}
                autoCapitalize={field.type === "default" && !field.secure ? "words" : "none"}
                secureTextEntry={field.secure}
                autoComplete={field.autoComplete}
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
          ))}

          <TouchableOpacity
            onPress={handleSignUp}
            disabled={isLoading || isGoogleLoading}
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
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 16 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text style={{ marginHorizontal: 12, color: colors.muted, fontSize: 12 }}>or sign up with</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          {/* Google Sign-Up Button */}
          <TouchableOpacity
            onPress={handleGooglePress}
            disabled={!request || isLoading || isGoogleLoading}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: colors.border,
              borderRadius: 14,
              paddingVertical: 14,
              backgroundColor: colors.background,
              opacity: !request || isGoogleLoading ? 0.7 : 1,
            }}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color={colors.foreground} />
            ) : (
              <>
                <Text style={{ fontSize: 18, marginRight: 10 }}>G</Text>
                <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign In Link */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
          <Text style={{ color: colors.muted, fontSize: 14 }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/(auth)/sign-in");
          }}>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "bold" }}>Sign In</Text>
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
