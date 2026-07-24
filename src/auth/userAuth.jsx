import React, { createContext, useContext, useEffect, useState } from "react";
import API from "../utils/axios";

const AuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check token validity on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      setLoading(false);
      return;
    }

    // Verify token by fetching current user
    const verifyUser = async () => {
      try {
        const response = await API.get("/users/profile");
        const userData = response.data.data;
        setUser(userData);
        setIsAuthenticated(true);
        // Update stored user in case of changes
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        // Only clear if it's a 401 and we're not on admin page
        if (error.response?.status === 401 && !window.location.pathname.includes("/admin")) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
        } else if (error.response?.status === 401 && window.location.pathname.includes("/admin")) {
          // For admin pages, don't clear token; let AdminRoute handle it
          // but we still set loading to false so the route can check localStorage directly
          setIsAuthenticated(false);
          setUser(null);
        }
        // If other error (network, etc.), keep token and rely on stored user
        // to avoid breaking the app on network issues
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  // LOGIN – calls backend, then stores data
  const login = async (email, password) => {
    try {
      const response = await API.post("/auth/login", { email, password });
      const { user, token, refreshToken } = response.data.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      setUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  // REGISTER – calls backend, then stores data
  const register = async (userData) => {
    try {
      const response = await API.post("/auth/register", userData);
      const { user, token, refreshToken } = response.data.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      setUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // LOGOUT – clear all
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
    // Optionally call backend logout
    API.post("/auth/logout").catch(() => {});
  };

  // UPDATE USER (e.g., after profile update)
  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem("user", JSON.stringify(merged));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    getToken: () => localStorage.getItem("token"),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);