// src/hooks/useAuth.ts
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  signIn, 
  signOut, 
  getCurrentUser, 
  fetchUserAttributes,
  type UserAttributeKey
} from 'aws-amplify/auth';

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
  checkAuth: () => Promise<any>;
  isAdmin: boolean;
  isInstructor: boolean;
}

// Auth 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider props 타입 정의
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider 컴포넌트 추가
export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isInstructor, setIsInstructor] = useState<boolean>(false);
  
  const checkUserRole = useCallback((attributes: Partial<Record<UserAttributeKey, string>>) => {
    const profile = attributes.profile || '';
    
    setIsAdmin(profile === 'admin');
    setIsInstructor(profile === 'instructor');
    
    return {
      isAdmin: profile === 'admin',
      isInstructor: profile === 'instructor'
    };
  }, []);
  
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const userData = { ...currentUser, attributes };
      
      checkUserRole(attributes);
      
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsInstructor(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [checkUserRole]);
  
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const result = await signIn({ username, password });
      await checkAuth();
      return { success: true, result };
    } catch (error) {
      console.error('로그인 오류:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsInstructor(false);
      return { success: true };
    } catch (error) {
      console.error('로그아웃 오류:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };
  
  // 페이지 로드시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  // 컨텍스트 값
  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth,
    isAdmin,
    isInstructor
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth 훅 수정 - 컨텍스트 사용
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}