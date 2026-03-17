import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const DEMO_EMAIL = "demo@smartchef.test";

// Auth-related paths that should always be allowed
const AUTH_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/demo-login",
  "/auth/reset-password",
];

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token and block demo writes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Block mutating requests for demo account (before hitting the network)
    const method = config.method?.toUpperCase();
    if (method !== "GET") {
      const isAuthPath = AUTH_PATHS.some((p) => config.url?.includes(p));
      if (!isAuthPath) {
        try {
          const savedUser = localStorage.getItem("user");
          const user = savedUser ? JSON.parse(savedUser) : null;
          if (user?.email === DEMO_EMAIL) {
            toast(
              "This is a demo account for exploration only.\nCreate an account for full access.",
              {
                icon: "🔒",
                duration: 3000,
                style: { textAlign: "center" },
              }
            );
            return Promise.reject(
              new axios.Cancel("Demo account is read-only")
            );
          }
        } catch {
          /* ignore parse errors */
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/signup") ||
      requestUrl.includes("/auth/reset-password");

    if (error.response?.status === 401 && !isAuthRequest) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
