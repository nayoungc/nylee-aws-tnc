// src/hooks/useAuth.ts
/*
Amplify v6(Gen 2)에서 사용 가능한 auth 이벤트 목록:

signedIn - 사용자 로그인 성공
signedOut - 사용자 로그아웃 성공
tokenRefresh - 토큰 새로고침 성공
tokenRefresh_failure - 토큰 새로고침 실패
signInWithRedirect - 리디렉션 로그인 시작
signInWithRedirect_failure - 리디렉션 로그인 실패
customOAuthState - 커스텀 OAuth 상태
*/
// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  signIn, 
  signOut, 
  getCurrentUser, 
  fetchUserAttributes 
} from 'aws-amplify/auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 현재 사용자 불러오기
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const userData = { ...currentUser, attributes };
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
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
    checkAuth
  };
}

export default useAuth;