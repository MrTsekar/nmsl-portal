import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://nmsl-api.onrender.com/api/v1";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const isAuthRoute = config.url?.startsWith("/auth/");
  if (!isAuthRoute && typeof window !== "undefined") {
    const token = window.localStorage.getItem("nmsl-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.status === 204 || response.data === "") {
      response.data = null;
    }
    return response;
  },
  (error) => Promise.reject(error),
);
