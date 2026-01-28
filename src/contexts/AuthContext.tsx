import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for frontend testing
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin': {
    password: 'admin123',
    user: {
      id: '1',
      username: 'admin',
      email: 'admin@hypersofts.com',
      telegramId: '6596742955',
      role: 'admin',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: new Date().toISOString(),
    }
  },
  'user1': {
    password: 'user123',
    user: {
      id: '2',
      username: 'user1',
      email: 'user1@example.com',
      telegramId: '1896145195',
      role: 'user',
      isActive: true,
      createdAt: '2024-06-15T00:00:00Z',
      lastLogin: new Date().toISOString(),
    }
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('hyper_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem('hyper_user');
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // This would be an API call in production
    const demoUser = DEMO_USERS[username.toLowerCase()];
    
    if (demoUser && demoUser.password === password) {
      const user = { ...demoUser.user, lastLogin: new Date().toISOString() };
      localStorage.setItem('hyper_user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('hyper_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
