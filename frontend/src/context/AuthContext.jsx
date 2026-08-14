import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser as apiLogin, registerUser as apiRegister, getCurrentUser } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [family, setFamily] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setFamily(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getCurrentUser();
      if (res.success) {
        setUser(res.data);
        if (res.data.familyId) {
          setFamily({ _id: res.data.familyId, name: res.data.familyName });
        }
      }
    } catch (err) {
      console.error('Failed to load user profile:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (res.user.familyId) {
        setFamily({ _id: res.user.familyId });
      }
    }
    return res;
  };

  const register = async (userData) => {
    const res = await apiRegister(userData);
    if (res.success && res.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (res.user.familyId) {
        setFamily({ _id: res.user.familyId });
      }
    }
    return res;
  };

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
