"use client";

import { create } from "zustand";
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

const patientUser: User = {
  id: "u-1",
  name: "Arianna Lim",
  email: "patient@nmsl.app",
  role: "patient",
  location: "Abuja",
  state: "FCT",
  address: "12 Gana Street, Maitama",
  idNumber: "PT-2026-00017",
  phone: "+63 912 345 6789",
  dateOfBirth: "1996-08-14",
  gender: "female",
  emergencyContactName: "Rafael Lim",
  emergencyContactPhone: "+63 917 001 8890",
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  setSession: ({ token, user }) => set({ token, user, isAuthenticated: true }),
  updateUser: (patch) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...patch } : state.user,
    })),
  switchRole: (role) =>
    set((state) =>
      state.user
        ? {
            user: { ...state.user, role },
          }
        : {
            user: { ...patientUser, role },
            token: "mock-token",
            isAuthenticated: true,
          },
    ),
  signOut: () => set({ token: null, user: null, isAuthenticated: false }),
}));
