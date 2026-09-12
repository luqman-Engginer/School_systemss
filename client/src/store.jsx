import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, setUser, getUser, getToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getUser());
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    async function boot() {
      if (!getToken()) return setBooted(true);
      try {
        const me = await api('/auth/me');
        setUserState(me);
        setUser(me);
      } catch {
        setToken(null);
        setUser(null);
        setUserState(null);
      } finally {
        setBooted(true);
      }
    }
    boot();
  }, []);

  const login = async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    setToken(data.token);
    setUser(data.user);
    setUserState(data.user);
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setUserState(null);
  };

  const refresh = async () => {
    const me = await api('/auth/me');
    setUserState(me);
    setUser(me);
    return me;
  };

  return <AuthContext.Provider value={{ user, login, logout, refresh, booted }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}