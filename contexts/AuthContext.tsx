
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  company: string;
  email?: string;
  mobile?: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (method: 'email' | 'mobile', data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: User = {
  id: 'USR-001',
  name: 'Alex Morgan',
  company: 'Acme Global Ltd.',
  email: 'alex@acme.com',
  avatar: 'https://picsum.photos/40/40'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session on mount
    const storedUser = localStorage.getItem('paydd_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from storage', e);
        localStorage.removeItem('paydd_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (method: 'email' | 'mobile', data: any) => {
    // Simulate API call delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const loggedInUser = { ...MOCK_USER };
        if (method === 'email') loggedInUser.email = data.email;
        if (method === 'mobile') loggedInUser.mobile = data.mobile;
        
        setUser(loggedInUser);
        localStorage.setItem('paydd_user', JSON.stringify(loggedInUser));
        resolve();
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('paydd_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
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
