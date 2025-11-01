import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { defaultUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Initialize users in localStorage if not exists
  useEffect(() => {
    const storedUsers = localStorage.getItem('bubt-users');
    if (!storedUsers) {
      localStorage.setItem('bubt-users', JSON.stringify(defaultUsers));
    }

    // Check for logged in user
    const storedUser = localStorage.getItem('bubt-current-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const storedUsers = localStorage.getItem('bubt-users');
    if (!storedUsers) return { success: false, message: 'No users found' };

    const users: User[] = JSON.parse(storedUsers);
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('bubt-current-user', JSON.stringify(foundUser));
      return { success: true, message: 'Login successful' };
    }

    return { success: false, message: 'Invalid email or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bubt-current-user');
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<{ success: boolean; message: string }> => {
    const storedUsers = localStorage.getItem('bubt-users');
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'User with this email already exists' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role: 'student', // Default role for registration
      phone,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('bubt-users', JSON.stringify(users));

    setUser(newUser);
    localStorage.setItem('bubt-current-user', JSON.stringify(newUser));

    return { success: true, message: 'Registration successful' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isAuthenticated: !!user,
      }}
    >
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
