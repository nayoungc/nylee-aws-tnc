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
  checkAuthStatus: (force?: boolean) => Promise<boolean>; // 반환 타입을 Promise<boolean>으로 변경
  logout: (global?: boolean) => Promise<void>;
  loginRedirect: (returnPath?: string) => void;
  handleAuthError: (error: any) => void;
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

// 토큰 리프레시 제한을 위한 변수
let tokenRefreshAttempts = 0;
const MAX_TOKEN_REFRESH_ATTEMPTS = 3;
let tokenRefreshLastAttempt = 0;
const TOKEN_REFRESH_MIN_INTERVAL = 30000; // 30초

/**
 * 인증 상태를 전역으로 관리하는 Provider 컴포넌트
 * 중복된 인증 로직을 한 곳에 모아 성능 최적화
 */
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
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
  const checkAuthStatus = useCallback(async (force = false): Promise<boolean> => { // 명시적 반환 타입 선언
    // 캐시 수명 (15분)
    const CACHE_TTL = 15 * 60 * 1000;
  
    // 1. 최근에 이미 확인한 경우 건너뛰기 (15분 이내) - 강제 새로고침 시는 제외
    const now = Date.now();
    if (!force && now - lastRefresh < CACHE_TTL) {
      console.log('최근에 이미 인증 확인 완료. 건너뜁니다.');
      return true; // 캐시된 값 사용 시에도 true 반환
    }
  
    // 2. 인증 확인 수행
    setState(prev => ({ ...prev, loading: true }));
  
    try {
      // 명시적으로 새 세션 가져오기
      const session = await fetchAuthSession({ forceRefresh: force });
      if (!session.tokens) {
        throw new Error('No valid tokens');
      }
  
      // 중요: AWS SDK에 자격 증명 명시적 설정
      if (session.credentials) {
        console.log('유효한 자격 증명을 찾아 AWS SDK에 설정합니다');
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
      
      // 토큰 리프레시 카운터 리셋
      tokenRefreshAttempts = 0;
      
      return true; // 성공 시 true 반환
    } catch (error) {
      console.error('인증 확인 실패:', error);
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
      
      return false; // 실패 시 false 반환
    }
  }, [lastRefresh]);

  /**
   * 로그아웃 처리 함수
   * @param global 모든 기기에서 로그아웃 여부
   */
  const logout = useCallback(async (global = false) => {
    console.log('로그아웃 시작...');
    try {
      // 1. 먼저 Amplify signOut 호출
      console.log('Amplify signOut 호출 중...');
      await signOut({ global });

      // 2. 그 다음 상태 및 캐시 초기화
      console.log('로그아웃 상태 정리 중...');
      setState({
        isAuthenticated: false,
        userAttributes: null,
        username: '',
        userRole: 'student',
        loading: false
      });

      console.log('로그아웃 스토리지 정리 중...');
      // 3. 세션 스토리지 정리
      sessionStorage.removeItem('userAttributes');
      sessionStorage.removeItem('userAttributesTimestamp');
      localStorage.removeItem('amplify-signin-with-hostedUI');

      console.log('로그아웃 완료!');

      // 4. 지연된 리디렉션으로 변경
      setTimeout(() => {
        window.location.href = '/';
      }, 300); // 약간의 지연 추가
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 오류 시에도 로그아웃 처리
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
    }
  }, []);

  /**
   * 인증 오류 처리 함수
   * 자격 증명 만료, 인증 실패 등을 처리
   */
  const handleAuthError = useCallback((error: any) => {
    if (
      error.message?.includes("자격 증명이 없습니다") || 
      error.message?.includes("세션에 유효한 자격 증명이 없습니다") ||
      error.message?.includes("No credentials") ||
      error.message?.includes("expired") ||
      error.name === 'NotAuthorizedException' ||
      error.code === 'NotAuthorizedException'
    ) {
      console.log("인증 세션 만료됨, 로그아웃 처리");
      
      // 상태 초기화
      setState({
        isAuthenticated: false,
        userAttributes: null,
        username: '',
        userRole: 'student',
        loading: false
      });
      
      // 스토리지 정리
      sessionStorage.removeItem('userAttributes');
      sessionStorage.removeItem('userAttributesTimestamp');
      localStorage.removeItem('amplify-signin-with-hostedUI');
      
      // 로그인 페이지로 리다이렉트 (현재 경로 저장)
      const currentPath = window.location.pathname;
      loginRedirect(currentPath);
    }
  }, []);

  /**
   * 로그인 페이지로 리디렉션하는 함수
   */
  const loginRedirect = useCallback((returnPath?: string) => {
    const returnUrl = returnPath || window.location.pathname;
    window.location.href = `/login?returnTo=\${encodeURIComponent(returnUrl)}`;
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
        // Auth 이벤트 리스너에서 signedOut 이벤트 처리 부분
        case 'signedOut':
          // 강제로 모든 상태와 캐시 정리
          setState({
            isAuthenticated: false,
            userAttributes: null,
            username: '',
            userRole: 'student',
            loading: false
          });
          sessionStorage.clear(); // 모든 세션 스토리지 정리
          localStorage.removeItem('amplify-signin-with-hostedUI'); // Amplify 관련 항목 정리
          setLastRefresh(0);
          tokenRefreshAttempts = 0;
          break;
        case 'tokenRefresh':
          // 이미 로그아웃된 상태라면 토큰 갱신 중단
          if (!state.isAuthenticated) {
            console.log('로그아웃 상태. 토큰 갱신 중단');
            return;
          }

          const now = Date.now();
          if (tokenRefreshAttempts >= MAX_TOKEN_REFRESH_ATTEMPTS ||
            (now - tokenRefreshLastAttempt < TOKEN_REFRESH_MIN_INTERVAL && tokenRefreshAttempts > 0)) {
            console.log(`토큰 갱신 제한: 시도 횟수(\${tokenRefreshAttempts}/\${MAX_TOKEN_REFRESH_ATTEMPTS})`);
            return;
          }

          tokenRefreshAttempts++;
          tokenRefreshLastAttempt = now;
          setLastRefresh(now);
          break;
        case 'tokenRefresh_failure':  // 수정: tokenRefreshFailed -> tokenRefresh_failure
          console.error('토큰 갱신 실패');
          handleAuthError(new Error('토큰 갱신 실패'));
          break;
      }
    });

    // 전역 오류 리스너 설정
    const globalErrorHandler = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes("자격 증명이 없습니다") || 
        event.error?.message?.includes("세션에 유효한 자격 증명이 없습니다") ||
        event.error?.message?.includes("No credentials")
      ) {
        handleAuthError(event.error);
      }
    };
    
    window.addEventListener('error', globalErrorHandler);

    return () => {
      listener();
      window.removeEventListener('error', globalErrorHandler);
    };
  }, [checkAuthStatus, logout, handleAuthError]);

  // 컨텍스트 값 메모이제이션 (불필요한 리렌더링 방지)
  const value = useMemo(() => ({
    ...state,
    checkAuthStatus,
    logout,
    loginRedirect,
    handleAuthError // 인증 오류 처리 함수 추가
  }), [state, checkAuthStatus, logout, loginRedirect, handleAuthError]);

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

/**
 * AWS API 호출을 위한 wrapper 함수
 * 인증 오류를 자동으로 처리
 */
export const withAuthErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  auth?: ReturnType<typeof useAuth>
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await apiFunction(...args);
    } catch (error: any) {
      // 사용자가 auth 객체를 전달했다면 그것을 사용, 아니면 useAuth hook 사용
      const authContext = auth || useContext(AuthContext);
      if (authContext && authContext.handleAuthError) {
        authContext.handleAuthError(error);
      }
      throw error;
    }
  };
};