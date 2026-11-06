import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; role?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cardioguard_token');
      const storedUser = authService.getCurrentUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        try {
          // Verify with backend
          const freshUser = await authService.getMe();
          setUser(freshUser);
        } catch (e) {
          console.warn('Session verification failed, logging out...');
          authService.logout();
          setToken(null);
          setUser(null);
        }
      } else {
        // Auto-authenticate as default Doctor for seamless development & live demo
        try {
          const res = await authService.login('doctor@cardioguard.ai', 'Doctor@123456');
          setToken(res.access_token);
          setUser(res.user);
        } catch (e) {
          console.warn('Auto-login fallback:', e);
          const defaultDoctor: User = {
            id: 2,
            email: 'doctor@cardioguard.ai',
            full_name: 'Dr. Alex',
            role: 'healthcare_professional',
            is_active: true,
            created_at: new Date().toISOString()
          };
          setUser(defaultDoctor);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; full_name: string; role?: string }) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

