import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setAuthToken, setUnauthorizedHandler } from '../services/api';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Strictly in-memory React state (no localStorage/sessionStorage)
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  // Wire 401 response interceptor directly to logout handler
  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.token) {
        setAuthToken(response.token);
        setToken(response.token);
        setUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      if (response.success && response.token) {
        setAuthToken(response.token);
        setToken(response.token);
        setUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        err.message ||
        'Registration failed.';
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (oldPassword, newPassword) => {
    const response = await userService.updatePassword(oldPassword, newPassword);
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token && user),
        role: user?.role || null,
        login,
        register,
        logout,
        setUser,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
