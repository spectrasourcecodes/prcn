import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Attach token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle global errors and token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network error
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // Don't refresh for authentication requests
    const isAuthRequest =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/forgot-password") ||
      originalRequest.url?.includes("/auth/reset-password") ||
      originalRequest.url?.includes("/auth/change-password") ||
      originalRequest.url?.includes("/auth/refresh-token");

    // Don't intercept for admin routes - let them handle their own auth
    const isAdminRoute = originalRequest.url?.includes("/admin");

    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    // If it's an admin route and 401, redirect to admin login
    if (status === 401 && isAdminRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Check if already on admin login page to avoid loop
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.replace("/admin/login");
      }
      return Promise.reject(error);
    }

    // Avoid redirect loops for /users/profile on admin pages
    if (status === 401 && originalRequest.url?.includes("/users/profile")) {
      // Let the AuthContext or AdminRoute handle it
      return Promise.reject(error);
    }

    if (
      status === 401 &&
      token &&
      refreshToken &&
      !isAuthRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          "http://localhost:5000/api/auth/refresh-token",
          { refreshToken }
        );

        const {
          token: newToken,
          refreshToken: newRefreshToken,
        } = refreshResponse.data.data;

        localStorage.setItem("token", newToken);

        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return API(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Redirect based on current path
        if (window.location.pathname.includes("/admin")) {
          window.location.replace("/admin/login");
        } else {
          window.location.replace("/login");
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;