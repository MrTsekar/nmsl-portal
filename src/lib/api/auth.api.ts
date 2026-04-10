import { apiClient } from "@/lib/api/client";

export const authApi = {
  signIn: async (payload: { email: string; password: string }) => {
    const { data } = await apiClient.post("/auth/sign-in", payload);
    return data;
  },
  signUp: async (payload: {
    name: string;
    email: string;
    password: string;
    location: string;
    state: string;
    address: string;
  }) => {
    const { data } = await apiClient.post("/auth/sign-up", payload);
    return data;
  },
  forgotPassword: async (payload: { email: string }) => {
    const { data } = await apiClient.post("/auth/forgot-password", payload);
    return data;
  },
  resetPassword: async (payload: { token: string; password: string }) => {
    const { data } = await apiClient.post("/auth/reset-password", payload);
    return data;
  },
};
