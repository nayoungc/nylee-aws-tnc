// src/hooks/useAuth.ts
import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
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

// 기본값으로 사용할 빈 컨텍스트 객체 생성
const defaultContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => ({ success: false, error: 'Not implemented' }),
  logout: async () => ({ success: false, error: 'Not implemented' }),
  checkAuth: async () => null,
  isAdmin: false,
  isInstructor: false
};

// Auth 컨텍스트 생성
const AuthContext = createContext<AuthContextType>(defaultContext);

// AuthProvider props 타입 정의
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider 컴포넌트 정의
export const AuthProvider = (props: AuthProviderProps) => {
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
  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth,
    isAdmin,
    isInstructor
  };
  
  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    props.children
  );
};

// useAuth 훅
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context;
}