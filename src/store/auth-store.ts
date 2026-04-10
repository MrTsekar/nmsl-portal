"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
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
        localStorage.setItem("nmsl-token", token);
        set({ token, user, isAuthenticated: true });
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
        localStorage.removeItem("nmsl-token");
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: "nmsl-auth-storage",
    }
  )
);
