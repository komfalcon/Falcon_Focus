import { useThemeContext } from "@/lib/theme-provider";

/**
 * Returns the current theme's color palette.
 * Usage: const colors = useColors(); then colors.background, colors.primary, etc.
 */
export function useColors() {
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";
  return {
    background: isDark ? "#0f1923" : "#f8fafc",
    surface: isDark ? "#1a2332" : "#ffffff",
    surfaceSecondary: isDark ? "#243040" : "#f1f5f9",
    card: isDark ? "#1e2d3d" : "#ffffff",
    foreground: isDark ? "#e8eef7" : "#0f1923",
    muted: isDark ? "#8899aa" : "#64748b",
    primary: "#0a7ea4",
    primaryLight: isDark ? "#12a5d3" : "#0a7ea4",
    accent: "#FFB81C",
    success: isDark ? "#4ade80" : "#16a34a",
    warning: isDark ? "#fbbf24" : "#d97706",
    error: isDark ? "#f87171" : "#dc2626",
    border: isDark ? "#1e3044" : "#e2e8f0",
    glass: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    overlay: "rgba(0,0,0,0.6)",
    // Legacy aliases for backward compatibility
    text: isDark ? "#e8eef7" : "#0f1923",
    secondary: isDark ? "#1a2332" : "#0f1923",
    tint: "#0a7ea4",
    icon: isDark ? "#8899aa" : "#64748b",
    tabIconDefault: isDark ? "#8899aa" : "#64748b",
    tabIconSelected: "#0a7ea4",
    isDark,
  };
}
