import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'manager' | 'staff';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const DEMO_USERS: User[] = [
  { id: '1', email: 'admin@inventorypro.com', role: 'admin', name: 'Admin User' },
  { id: '2', email: 'manager@inventorypro.com', role: 'manager', name: 'Manager' },
  { id: '3', email: 'staff@inventorypro.com', role: 'staff', name: 'Staff Member' },
];

// Demo password (same for all users for simplicity)
const DEMO_PASSWORD = 'password123';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('inventorypro_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check demo users first
    const foundDemoUser = DEMO_USERS.find(u => u.email === email);
    if (foundDemoUser && password === DEMO_PASSWORD) {
      setUser(foundDemoUser);
      localStorage.setItem('inventorypro_user', JSON.stringify(foundDemoUser));
      return true;
    }

    // Check registered users
    const registeredUsers = JSON.parse(localStorage.getItem('inventorypro_registered_users') || '[]');
    const foundRegisteredUser = registeredUsers.find((u: User & { password: string }) => u.email === email && u.password === password);
    
    if (foundRegisteredUser) {
      const { password: _, ...userWithoutPassword } = foundRegisteredUser;
      setUser(userWithoutPassword);
      localStorage.setItem('inventorypro_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    
    return false;
  };

  const signup = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const registeredUsers = JSON.parse(localStorage.getItem('inventorypro_registered_users') || '[]');
    
    // Check if user already exists
    const existingUser = registeredUsers.find((u: User & { password: string }) => u.email === email);
    if (existingUser) {
      return false;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      role,
    };

    registeredUsers.push(newUser);
    localStorage.setItem('inventorypro_registered_users', JSON.stringify(registeredUsers));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('inventorypro_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
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