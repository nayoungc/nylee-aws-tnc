// src/context/AuthContext.tsx
import React, { createContext, ReactNode, useContext } from 'react';
import { useAuth as useAuthHook } from '../hooks/useAuth';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}