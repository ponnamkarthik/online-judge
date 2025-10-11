import { useCallback } from "react";
import { useThemeStore } from "@/hooks/theme.store";

export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { isDark: theme === "dark", toggle };
}
