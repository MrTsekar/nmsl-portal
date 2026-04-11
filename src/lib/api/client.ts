import axios from "axios";
import { useAuthStore } from "@/store/auth-store";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://nmsl-api.onrender.com/api/v1";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  // Public auth routes that don't need authentication
  const publicAuthRoutes = ["/auth/sign-in", "/auth/sign-up", "/auth/forgot-password", "/auth/reset-password"];
  const isPublicAuthRoute = publicAuthRoutes.some(route => config.url?.startsWith(route));
  
  if (!isPublicAuthRoute && typeof window !== "undefined") {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Added auth header to request:", config.url);
    } else {
      console.warn("⚠️ No token available for request:", config.url);
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Handle 204 No Content - this is a valid success response
    if (response.status === 204) {
      response.data = null;
      return response;
    }
    
    // Handle empty response data
    if (response.data === "" || response.data === undefined) {
      response.data = null;
    }
    
    return response;
  },
  (error) => {
    // Don't treat 204 as an error
    if (error?.response?.status === 204) {
      return Promise.resolve({
        ...error.response,
        data: null,
      });
    }
    return Promise.reject(error);
  },
);
