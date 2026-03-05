import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  icon,
  fullWidth,
}: ButtonProps) {
  const colors = useColors();
  const heights = { sm: 36, md: 48, lg: 56 };
  const fontSizes = { sm: 13, md: 15, lg: 17 };
  const paddings = { sm: 14, md: 20, lg: 24 };

  const backgrounds: Record<string, string> = {
    primary: colors.primary,
    secondary: colors.surfaceSecondary,
    outline: "transparent",
    ghost: "transparent",
    destructive: colors.error,
  };
  const textColors: Record<string, string> = {
    primary: "#ffffff",
    secondary: colors.foreground,
    outline: colors.primary,
    ghost: colors.primary,
    destructive: "#ffffff",
  };

  return (
    <TouchableOpacity
      onPress={async () => {
        if (disabled || loading) return;
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.75}
      disabled={disabled || loading}
      style={{
        height: heights[size],
        paddingHorizontal: paddings[size],
        backgroundColor: disabled ? colors.surfaceSecondary : backgrounds[variant],
        borderRadius: 14,
        borderWidth: variant === "outline" ? 1.5 : 0,
        borderColor: variant === "outline" ? colors.primary : "transparent",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: fullWidth ? "100%" : undefined,
        opacity: disabled ? 0.5 : 1,
        shadowColor: variant === "primary" ? colors.primary : "transparent",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: variant === "primary" ? 4 : 0,
      }}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={{
              color: disabled ? colors.muted : textColors[variant],
              fontSize: fontSizes[size],
              fontWeight: "600",
              letterSpacing: 0.2,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
