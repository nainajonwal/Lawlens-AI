import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [activeCaseId, setActiveCaseId] = useState(() => {
    return localStorage.getItem('activeCaseId') || null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (activeCaseId) {
      localStorage.setItem('activeCaseId', activeCaseId);
    } else {
      localStorage.removeItem('activeCaseId');
    }
  }, [activeCaseId]);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        identifier,
        email: identifier,
        password
      });
      const { access_token, user: userData } = res.data;
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.detail || 'Login failed. Please check credentials.'
      };
    } finally {
      setLoading(false);
    }
  };


  const register = async (name, email, password, barEnrollmentNo, stateBarCouncil) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        bar_enrollment_no: barEnrollmentNo,
        state_bar_council: stateBarCouncil,
      });
      const { access_token, user: userData } = res.data;
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.detail || 'Registration failed. Please check details.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setActiveCaseId(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeCaseId,
        setActiveCaseId,
        login,
        register,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
