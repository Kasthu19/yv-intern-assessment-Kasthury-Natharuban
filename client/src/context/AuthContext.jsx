import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('yv_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.success) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error('Failed to fetch authenticated user profile:', err);
        localStorage.removeItem('yv_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.success) {
      const { token: jwtToken, user: userData } = response.data;
      localStorage.setItem('yv_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
    }
    return response;
  };

  const register = async (fullName, email, password) => {
    const response = await api.post('/auth/register', { fullName, email, password });
    if (response.success) {
      const { token: jwtToken, user: userData } = response.data;
      localStorage.setItem('yv_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
    }
    return response;
  };

  const logout = () => {
    localStorage.removeItem('yv_token');
    setToken(null);
    setUser(null);
  };

  /**
   * Check if logged-in user possesses a given permission key
   * BR-05: Chairman holds all permissions automatically
   */
  const hasPermission = (permissionKey) => {
    if (!user) return false;
    if (user.userType === 'CHAIRMAN') return true;
    if (Array.isArray(user.effectivePermissions)) {
      return user.effectivePermissions.includes(permissionKey);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
