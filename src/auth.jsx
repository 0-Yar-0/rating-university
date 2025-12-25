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
        // Prevent indefinite hanging — race Api.me with a timeout
        const me = await Promise.race([
          Api.me(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('me timeout')), 5000)),
        ]);
        // Support both `{ user }` and direct user object responses from API
        setUser(me?.user || me);
      } catch (err) {
        console.warn('Auth.init failed or timed out:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Helper to fetch /api/auth/me with retries — useful when server sets cookie but
  // doesn't return user body immediately after login/register.
  const refresh = async (attempts = 6, delay = 200) => {
    for (let i = 0; i < attempts; i++) {
      try {
        const me = await Api.me();
        const u = me?.user || me;
        console.log('Auth.refresh attempt', i + 1, 'result:', u);
        if (u) {
          setUser(u);
          return u;
        }
      } catch (err) {
        console.warn('Auth.refresh error', err);
      }
      // wait before retrying
      await new Promise((r) => setTimeout(r, delay));
    }
    return null;
  };

  const login = async (userData) => {
    // Normalize payload and help debugging
    console.log('Auth.login called with:', userData);
    const u = userData?.user || userData;
    if (u) {
      setUser(u);
      return u;
    }

    // If server didn't return user object, try to refresh (poll /api/auth/me)
    const refreshed = await refresh();
    return refreshed;
  };

  const logout = async () => {
    await Api.logout().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};
