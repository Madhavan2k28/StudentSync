import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ss_user'));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('ss-logout', onLogout);
    return () => window.removeEventListener('ss-logout', onLogout);
  }, []);

  function saveSession({ token, user }) {
    localStorage.setItem('ss_token', token);
    localStorage.setItem('ss_user', JSON.stringify(user));
    setUser(user);
  }

  function updateUser(next) {
    localStorage.setItem('ss_user', JSON.stringify(next));
    setUser(next);
  }

  async function login(email, password) {
    saveSession(await api.login({ email, password }));
  }

  async function register(data) {
    saveSession(await api.register(data));
  }

  async function logout() {
    try {
      await api.logout();
    } catch {
      /* already logged out on the server */
    }
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
