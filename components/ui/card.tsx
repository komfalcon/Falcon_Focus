import { View, TouchableOpacity, type ViewStyle } from "react-native";
import { useColors } from "@/hooks/use-colors";

type CardVariant = "default" | "elevated" | "glass" | "accent" | "success" | "warning" | "error";

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: number;
  radius?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = "default",
  padding = 16,
  radius = 16,
  onPress,
  style,
}: CardProps) {
  const colors = useColors();
  const backgrounds: Record<CardVariant, string> = {
    default: colors.surface,
    elevated: colors.card,
    glass: colors.glass,
    accent: colors.accent + "15",
    success: colors.success + "12",
    warning: colors.warning + "12",
    error: colors.error + "12",
  };
  const borders: Record<CardVariant, string> = {
    default: colors.border,
    elevated: colors.border,
    glass: colors.border,
    accent: colors.accent + "30",
    success: colors.success + "30",
    warning: colors.warning + "30",
    error: colors.error + "30",
  };

  const content = (
    <View
      style={{
        backgroundColor: backgrounds[variant],
        borderRadius: radius,
        padding,
        borderWidth: 1,
        borderColor: borders[variant],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: colors.isDark ? 0.3 : 0.06,
        shadowRadius: 8,
        elevation: 2,
        ...style,
      }}
    >
      {children}
    </View>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      {content}
    </TouchableOpacity>
  ) : (
    content
  );
}
