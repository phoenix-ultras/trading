import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginRequest, logout as logoutRequest, refreshAccessToken } from '../lib/api';

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = 'auth_wallet_access_token';
const USER_STORAGE_KEY = 'auth_wallet_user';

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(() => {
    const value = localStorage.getItem(USER_STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    async function bootstrapAuth() {
      if (accessToken) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const data = await refreshAccessToken();
        persistToken(data.accessToken);
      } catch (error) {
        clearSession();
      } finally {
        setIsBootstrapping(false);
      }
    }

    bootstrapAuth();
  }, []);

  const persistToken = useCallback((token) => {
    setAccessToken(token);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }, []);

  const persistUser = useCallback((nextUser) => {
    setUser(nextUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials);
    persistToken(data.accessToken);
    persistUser(data.user);
    return data;
  }, [persistToken, persistUser]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const withAccessToken = useCallback(async (requestFn) => {
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    try {
      return await requestFn(accessToken);
    } catch (error) {
      if (error.status !== 401) {
        throw error;
      }

      const refreshed = await refreshAccessToken();
      persistToken(refreshed.accessToken);
      return requestFn(refreshed.accessToken);
    }
  }, [accessToken, persistToken]);

  const value = useMemo(() => ({
    accessToken,
    user,
    isAuthenticated: Boolean(accessToken),
    isBootstrapping,
    login,
    logout,
    withAccessToken,
    setAccessToken: persistToken,
    setUser: persistUser,
    clearSession
  }), [accessToken, clearSession, isBootstrapping, login, logout, persistToken, persistUser, user, withAccessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
