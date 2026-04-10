import axios from "axios";

// Force live API for testing
const baseURL = "https://nmsl-api.onrender.com/api/v1";
export const useMocks = false;

// Debug logging
console.log("[API CLIENT CONFIG - FORCED]", {
  baseURL,
  useMocks,
});

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("nmsl-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);
