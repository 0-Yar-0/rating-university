import React, { useEffect, useState, createContext, useContext } from 'react';
import { Api } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await Api.me();
        // Support both `{ user }` and direct user object responses from API
        setUser(me?.user || me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = (userData) => {
    // Normalize payload and help debugging
    console.log('Auth.login called with:', userData);
    setUser(userData?.user || userData);
  };

  const logout = async () => {
    await Api.logout().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
