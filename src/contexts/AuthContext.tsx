// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAuthSession, getCurrentUser, fetchUserAttributes, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

// 인증 컨텍스트 타입 정의
interface AuthContextValue {
  isAuthenticated: boolean;
  userAttributes: any;
  username: string;
  userRole: string;
  loading: boolean;
  checkAuthStatus: (force?: boolean) => Promise<void>;
  logout: (global?: boolean) => Promise<void>;
}

// 인증 상태 타입 정의 (useState용)
interface AuthState {
  isAuthenticated: boolean;
  userAttributes: any; // any 타입으로 명시하여 null과 객체 모두 허용
  username: string;
  userRole: string;
  loading: boolean;
}

// 기본값으로 undefined 설정 (후에 useAuth 훅이 올바른 사용을 강제함)
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * 인증 상태를 전역으로 관리하는 Provider 컴포넌트
 * 중복된 인증 로직을 한 곳에 모아 성능 최적화
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 인증 상태 관리 - 명시적 타입 지정
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    userAttributes: null,
    username: '',
    userRole: 'student',
    loading: true
  });
  
  // 마지막 새로고침 시간 추적
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  
  /**
   * 인증 상태 확인 함수 - 캐싱을 통해 최적화
   * @param force 강제로 새로고침 여부
   */
  const checkAuthStatus = useCallback(async (force = false) => {
    // 캐시 수명 (15분)
    const CACHE_TTL = 15 * 60 * 1000;
    
    // 1. 최근에 이미 확인한 경우 건너뛰기 (15분 이내)
    const now = Date.now();
    if (!force && now - lastRefresh < CACHE_TTL) {
      console.log('최근에 이미 인증 확인 완료. 건너뜁니다.');
      return;
    }
    
    // 2. 세션 스토리지에서 캐시된 데이터 확인
    const cachedData = sessionStorage.getItem('userAttributes');
    const timestamp = sessionStorage.getItem('userAttributesTimestamp');
    
    if (!force && cachedData && timestamp && (now - parseInt(timestamp) < CACHE_TTL)) {
      try {
        const parsedData = JSON.parse(cachedData);
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          userAttributes: parsedData,
          username: parsedData.name || parsedData.email || parsedData.username || '',
          userRole: parsedData.profile || 'student',
          loading: false
        }));
        return;
      } catch (e) {
        // 캐시 파싱 오류는 무시하고 계속 진행
      }
    }
    
    // 3. 실제 인증 확인 수행
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const session = await fetchAuthSession();
      if (!session.tokens) {
        throw new Error('No valid tokens');
      }
      
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      // 세션 스토리지에 저장하여 캐싱
      sessionStorage.setItem('userAttributes', JSON.stringify(attributes));
      sessionStorage.setItem('userAttributesTimestamp', now.toString());
      
      setState({
        isAuthenticated: true,
        userAttributes: attributes,
        username: user.username,
        userRole: attributes.profile || 'student',
        loading: false
      });
      
      setLastRefresh(now);
    } catch (error) {
      setState({
        isAuthenticated: false,
        userAttributes: null,
        username: '',
        userRole: 'student',
        loading: false
      });
      
      // 캐시 정보 제거
      sessionStorage.removeItem('userAttributes');
      sessionStorage.removeItem('userAttributesTimestamp');
    }
  }, [lastRefresh]); // 마지막 새로고침 시간에만 의존
  
  /**
   * 로그아웃 처리 함수
   * @param global 모든 기기에서 로그아웃 여부
   */
  const logout = useCallback(async (global = false) => {
    try {
      await signOut({ global });
      
      // 상태 및 캐시 초기화
      setState({
        isAuthenticated: false,
        userAttributes: null,
        username: '',
        userRole: 'student',
        loading: false
      });
      
      // 세션 스토리지 정리
      sessionStorage.removeItem('userAttributes');
      sessionStorage.removeItem('userAttributesTimestamp');
      
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  }, []);
  
  // 초기 로드 시 인증 확인 및 이벤트 리스너 설정
  useEffect(() => {
    // 앱 로드 시 인증 상태 확인
    checkAuthStatus();
    
    // Auth 이벤트 리스너 설정
    const listener = Hub.listen('auth', ({ payload }) => {
      console.log('Auth 이벤트:', payload.event);
      
      switch (payload.event) {
        case 'signedIn':
          checkAuthStatus(true); // 강제 새로고침
          break;
        case 'signedOut':
          setState(prev => ({
            ...prev,
            isAuthenticated: false,
            userAttributes: null,
            username: '',
            userRole: 'student'
          }));
          sessionStorage.removeItem('userAttributes');
          sessionStorage.removeItem('userAttributesTimestamp');
          break;
        case 'tokenRefresh':
          setLastRefresh(Date.now());
          break;
        case 'tokenRefresh_failure':
          logout();
          break;
      }
    });
    
    return () => listener();
  }, [checkAuthStatus, logout]);
  
  // 컨텍스트 값 메모이제이션 (불필요한 리렌더링 방지)
  const value = useMemo(() => ({
    ...state,
    checkAuthStatus,
    logout
  }), [state, checkAuthStatus, logout]);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 인증 컨텍스트 사용을 위한 커스텀 훅
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다');
  }
  return context;
};