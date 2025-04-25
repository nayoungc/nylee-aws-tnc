// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  signIn, 
  signOut, 
  getCurrentUser, 
  fetchUserAttributes,
  type UserAttributeKey  // UserAttributeKey 타입 임포트 추가
} from 'aws-amplify/auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isInstructor, setIsInstructor] = useState<boolean>(false);
  
  // checkUserRole 함수의 매개변수 타입 수정
  const checkUserRole = useCallback((attributes: Partial<Record<UserAttributeKey, string>>) => {
    // profile 속성이 존재하는지 안전하게 확인
    const profile = attributes.profile || '';
    
    setIsAdmin(profile === 'admin');
    setIsInstructor(profile === 'instructor');
    
    return {
      isAdmin: profile === 'admin',
      isInstructor: profile === 'instructor'
    };
  }, []);
  
  // 현재 사용자 불러오기
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const userData = { ...currentUser, attributes };
      
      // 사용자 역할 확인
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
  
  // 로그인
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const result = await signIn({ username, password });
      await checkAuth(); // 사용자 정보 다시 불러오기
      return { success: true, result };
    } catch (error) {
      console.error('로그인 오류:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };
  
  // 로그아웃
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
  
  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth,
    isAdmin,
    isInstructor
  };
}

export default useAuth;