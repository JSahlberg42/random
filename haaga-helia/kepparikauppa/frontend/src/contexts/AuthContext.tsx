import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import type { User } from '../types';
import { getToken, getUser, removeToken, removeUser, setToken, setUser } from '../lib/auth';
import { getMe, login, register } from '../lib/api';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: string) => Promise<void>;
  register: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const token = getToken();
    const savedUser = getUser();
    if (token && savedUser) {
      setUserState(savedUser);
      // Validate session with the server
      getMe()
        .then((u) => {
          if (mounted) setUserState(u);
        })
        .catch(() => {
          if (mounted) {
            removeToken();
            removeUser();
            setUserState(null);
          }
        })
        .finally(() => {
          if (mounted) setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, []);

  const doLogin = useCallback(async (email: string, password: string, _role?: string) => {
    const { token, user } = await login(email, password);
    setToken(token);
    setUser(user);
    setUserState(user);
  }, []);

  const doRegister = useCallback(async (email: string, password: string, role?: string) => {
    const { token, user } = await register(email, password, role);
    setToken(token);
    setUser(user);
    setUserState(user);
  }, []);

  const doLogout = useCallback(() => {
    removeToken();
    removeUser();
    setUserState(null);
    window.location.href = '/';
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login: doLogin, register: doRegister, logout: doLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
