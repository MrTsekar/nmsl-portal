"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Role, User } from "@/types";

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setSession: (payload: { token: string; user: User }) => void;
  updateUser: (patch: Partial<User>) => void;
  switchRole: (role: Role) => void;
  signOut: () => void;
};

const defaultAdminUser: User = {
  id: "u-sa-1",
  name: "Emeka Nwosu",
  email: "admin@nmsl.app",
  role: "admin",
  location: "Abuja",
  state: "FCT",
  address: "NMSL Headquarters, Central Business District, Abuja",
  phone: "+234 801 234 5678",
  dateOfBirth: "1975-06-15",
  gender: "male",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setSession: ({ token, user }) => {
        console.log("🔐 Setting session:", { token: token?.substring(0, 20) + "...", user: user.email });
        set({ token, user, isAuthenticated: true });
        console.log("✅ Session set, isAuthenticated:", true);
      },
      updateUser: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : state.user,
        })),
      switchRole: (role) =>
        set((state) => {
          return state.user
            ? { user: { ...state.user, role } }
            : { user: { ...defaultAdminUser, role }, token: "mock-token", isAuthenticated: true };
        }),
      signOut: () => {
        console.log("🚪 Signing out...");
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: "nmsl-auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        console.log("💧 Auth store rehydration started");
        return (state, error) => {
          if (error) {
            console.error("❌ Rehydration failed:", error);
          } else {
            console.log("✅ Auth store rehydrated:", {
              hasToken: !!state?.token,
              hasUser: !!state?.user,
              isAuthenticated: state?.isAuthenticated,
            });
          }
        };
      },
    }
  )
);
