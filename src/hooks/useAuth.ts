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
  getUserRoles: () => string[];
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
  isInstructor: false,
  getUserRoles: () => []
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

    console.log('profile', profile);
    
    setIsAdmin(profile === 'admin');
    setIsInstructor(profile === 'instructor');
    
    return {
      isAdmin: profile === 'admin',
      isInstructor: profile === 'instructor'
    };
  }, []);
  
  // 사용자 역할을 배열로 반환하는 함수
  const getUserRoles = useCallback((): string[] => {
    if (!user || !user.attributes) return [];
    
    const roles: string[] = [];
    const profile = user.attributes.profile || '';
    
    // profile 기반 역할 추가
    if (profile === 'admin') {
      roles.push('admin');
    } else if (profile === 'instructor') {
      roles.push('instructor');
    } else {
      roles.push('student'); // 기본 역할
    }
    
    console.log('User roles from getUserRoles:', roles);
    return roles;
  }, [user]);
  
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
      console.log('인증 확인 중 오류:', error);
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
      // 개선된 로그아웃 처리
      await signOut({ global: true });
      
      // 상태 리셋
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsInstructor(false);
      
      // 로컬 스토리지에서 'rememberedUsername'이외의 인증 관련 데이터 제거
      const username = localStorage.getItem('rememberedUsername');
      localStorage.clear();
      if (username) {
        localStorage.setItem('rememberedUsername', username);
      }
      
      console.log('로그아웃 성공');
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
    isInstructor,
    getUserRoles
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
