import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

const DEMO_EMAIL = "demo@smartchef.test";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  });
  const loading = false;

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, token } = response.data.data;

      // Save token and user to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
      });
      const { user, token } = response.data.data;

      // Save token and user to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const demoLogin = async () => {
    try {
      const response = await api.post("/auth/demo-login");
      const { user, token } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      return { success: true };
    } catch (error) {
      console.error("Demo login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Demo login failed",
      };
    }
  };

  const logout = () => {
    // Just clear user (no API call)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    demoLogin,
    logout,
    isAuthenticated: !!user,
    isDemoUser: user?.email === DEMO_EMAIL,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
