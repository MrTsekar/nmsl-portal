import { apiClient } from "@/lib/api/client";
import { mockHandlers } from "@/lib/mocks/handlers";
import { withMockFallback } from "@/lib/api/request";

export const authApi = {
  signIn: async (payload: { email: string; password: string }) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.post("/auth/sign-in", payload);
        return data;
      },
      mock: () => mockHandlers.auth.signIn(payload.email),
    });
  },
  signUp: async (payload: {
    name: string;
    email: string;
    password: string;
    location: string;
    state: string;
    address: string;
  }) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.post("/auth/sign-up", payload);
        return data;
      },
      mock: () => mockHandlers.auth.signUp(),
    });
  },
  forgotPassword: async (payload: { email: string }) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.post("/auth/forgot-password", payload);
        return data;
      },
      mock: () => mockHandlers.auth.forgotPassword(),
    });
  },
  resetPassword: async (payload: { token: string; password: string }) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.post("/auth/reset-password", payload);
        return data;
      },
      mock: () => mockHandlers.auth.resetPassword(),
    });
  },
};
