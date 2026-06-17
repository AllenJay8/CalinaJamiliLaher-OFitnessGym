import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/auth';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<UserRole>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  const persistAuth = (authUser: User, authToken: string) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('auth_user', JSON.stringify(authUser));
    localStorage.setItem('auth_role', authUser.role);
  };

  const clearAuth = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_role');
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const { data } = await authService.me();
          setUser(data);
          localStorage.setItem('auth_user', JSON.stringify(data));
          localStorage.setItem('auth_role', data.role);
        } catch {
          clearAuth();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (username: string, password: string): Promise<UserRole> => {
    const { data } = await authService.login(username, password);
    persistAuth(data.user, data.token);
    return data.user.role;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore logout errors
    }
    clearAuth();
  };

  const role = user?.role ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isAdmin: role === 'admin',
        isStaff: role === 'staff',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
