// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  api,
  login as apiLogin,
  register as apiRegister,
  getUserProfile,
} from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem("token");

        if (token) {
          // Token is set in interceptors automatically

          // Fetch current user data
          const userData = await getUserProfile();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Token might be invalid - remove it
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await apiLogin({ email, password });

      if (res.token) {
        // Token is stored in localStorage by the login function

        // Get user info from the response or fetch separately
        const userData = res.user || (await getUserProfile());
        setUser(userData);
        setIsAuthenticated(true);

        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Đăng nhập thất bại",
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  // Register function
  const register = async (userData) => {
    try {
      const res = await apiRegister(userData);

      if (res.token) {
        // Token is stored in localStorage by the register function

        // Get user info
        const userInfo = res.user || (await getUserProfile());
        setUser(userInfo);
        setIsAuthenticated(true);

        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Đăng ký tài khoản thất bại",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
