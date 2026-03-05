import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

type ThemeOption = "light" | "dark" | "system";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  theme: ThemeOption;
  setColorScheme: (scheme: ThemeOption) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [theme, setTheme] = useState<ThemeOption>("system");

  const resolvedScheme: ColorScheme = theme === "system" ? (systemScheme ?? "light") : theme;

  const applyScheme = useCallback((scheme: ColorScheme) => {
    Appearance.setColorScheme?.(scheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      const palette = SchemeColors[scheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  const setColorScheme = useCallback((newTheme: ThemeOption) => {
    setTheme(newTheme);
    const scheme: ColorScheme = newTheme === "system" ? (systemScheme ?? "light") : newTheme;
    applyScheme(scheme);
  }, [applyScheme, systemScheme]);

  useEffect(() => {
    applyScheme(resolvedScheme);
  }, [applyScheme, resolvedScheme]);

  const value = useMemo(
    () => ({
      colorScheme: resolvedScheme,
      theme,
      setColorScheme,
    }),
    [resolvedScheme, theme, setColorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={{ flex: 1 }}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
