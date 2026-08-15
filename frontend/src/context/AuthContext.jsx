import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser as apiLogin, registerUser as apiRegister, getCurrentUser } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [family, setFamily] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load user profile on mount or token change
  const refreshUser = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setUser(null);
      setFamily(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getCurrentUser();
      if (res && (res.success || res.user || res.data)) {
        const userData = res.user || res.data;
        setUser(userData);
        if (userData.familyId) {
          setFamily({ _id: userData.familyId, name: userData.familyName || 'My Family' });
        }
      }
    } catch (err) {
      console.warn('[AuthContext] Session expired or invalid:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    if (res && res.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (res.user && res.user.familyId) {
        setFamily({ _id: res.user.familyId, name: res.user.familyName || 'My Family' });
      }
    }
    return res;
  };

  // Register handler
  const register = async (userData) => {
    const res = await apiRegister(userData);
    if (res && res.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (res.user && res.user.familyId) {
        setFamily({ _id: res.user.familyId, name: res.user.familyName || 'My Family' });
      }
    }
    return res;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setFamily(null);
  };

  const activeFamilyId = family?._id || user?.familyId || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        family,
        activeFamilyId,
        loading,
        theme,
        toggleTheme,
        login,
        register,
        logout,
        refreshUser,
        setFamily,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
