"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type UiState = {
  premiumTheme: boolean;
  togglePremiumTheme: () => void;
  setPremiumTheme: (enabled: boolean) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      premiumTheme: false,
      togglePremiumTheme: () =>
        set((state) => ({
          premiumTheme: !state.premiumTheme,
        })),
      setPremiumTheme: (enabled) => set({ premiumTheme: enabled }),
    }),
    {
      name: "nmsl-ui",
      partialize: (state) => ({ premiumTheme: state.premiumTheme }),
    },
  ),
);
