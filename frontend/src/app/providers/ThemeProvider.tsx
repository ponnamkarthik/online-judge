import { useEffect } from "react";
import { useThemeStore } from "@/hooks/theme.store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  // On first mount, initialize from localStorage (if exists), else use store default
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") as "light" | "dark" | null;
      const initial = stored ?? theme;
      document.documentElement.classList.toggle("dark", initial === "dark");
      setTheme(initial);
    } catch {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist whenever theme changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  return <>{children}</>;
}
