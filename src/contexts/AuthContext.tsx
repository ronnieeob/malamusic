import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { AuthService } from '../services/authService';
import { LogoutDialog } from '../components/LogoutDialog';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authService = AuthService.getInstance();
  const [user, setUser] = useState<User | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      const user = await authService.login(email, password);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    await authService.requestPasswordReset(email);
  };

  const resetPassword = async (token: string, password: string) => {
    await authService.resetPassword(token, password);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const updatedUser = await authService.updateProfile(user.id, data);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      requestPasswordReset,
      resetPassword,
      updateProfile, 
      logout,
      isAuthenticated: !!user 
    }}>
      <LogoutDialog
        isOpen={showLogoutDialog}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}