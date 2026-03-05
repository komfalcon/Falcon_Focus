import { View, Text, TextInput, TouchableOpacity, type KeyboardTypeOptions } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  icon?: React.ReactNode;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?: string;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  error,
  icon,
  autoCapitalize = "none",
}: InputProps) {
  const colors = useColors();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: colors.muted,
            marginBottom: 6,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surfaceSecondary,
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: error
            ? colors.error
            : isFocused
              ? colors.primary
              : colors.border,
          paddingHorizontal: 14,
          height: 52,
        }}
      >
        {icon && (
          <View style={{ marginRight: 10, opacity: 0.6 }}>{icon}</View>
        )}
        <TextInput
          style={{
            flex: 1,
            fontSize: 15,
            color: colors.foreground,
          }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword((p) => !p)}
            style={{ padding: 6 }}
          >
            <Text
              style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          style={{
            color: colors.error,
            fontSize: 12,
            marginTop: 4,
            fontWeight: "500",
          }}
        >
          ⚠ {error}
        </Text>
      )}
    </View>
  );
}
