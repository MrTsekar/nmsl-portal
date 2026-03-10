"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type UiState = {
  premiumTheme: boolean;
  companyLogoUrl: string | null;
  togglePremiumTheme: () => void;
  setPremiumTheme: (enabled: boolean) => void;
  setCompanyLogoUrl: (url: string | null) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      premiumTheme: false,
      companyLogoUrl: null,
      togglePremiumTheme: () =>
        set((state) => ({
          premiumTheme: !state.premiumTheme,
        })),
      setPremiumTheme: (enabled) => set({ premiumTheme: enabled }),
      setCompanyLogoUrl: (url) => set({ companyLogoUrl: url }),
    }),
    {
      name: "nmsl-ui",
      partialize: (state) => ({ premiumTheme: state.premiumTheme, companyLogoUrl: state.companyLogoUrl }),
    },
  ),
);
