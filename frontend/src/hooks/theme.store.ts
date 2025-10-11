import { create } from "zustand";

export type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "dark", // default to dark
  setTheme: (t) => set({ theme: t }),
}));
