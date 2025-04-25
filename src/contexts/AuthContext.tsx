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
  checkAuthStatus: (force?: boolean) => Promise<boolean>;
  logout: (global?: boolean) => Promise<void>;
  loginRedirect: (returnPath?: string) => void;
  handleAuthError: (error: any) => void;
}

// 인증 상태 타입 정의
interface AuthState {
  isAuthenticated: boolean;
  userAttributes: any;
  username: string;
  userRole: string;
  loading: boolean;
}

// Auth 에러 핸들러를 위한 간소화된 인터페이스
interface AuthErrorHandlerContext {
  handleAuthError: (error: any) => void;
  isAuthenticated?: boolean;
  checkAuthStatus?: (force?: boolean) => Promise<boolean>;
}

// Context 생성
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// 토큰 리프레시 제한을 위한 변수
let tokenRefreshAttempts = 0;
const MAX_TOKEN_REFRESH_ATTEMPTS = 3;
let tokenRefreshLastAttempt = 0;
const TOKEN_REFRESH_MIN_INTERVAL = 30000; // 30초

// 중복 인증 요청 방지를 위한 변수
let authCheckInProgress = false;

/**
 * 인증 상태를 전역으로 관리하는 Provider 컴포넌트
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 인증 상태 관리
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    userAttributes: null,
    username: '',
    userRole: 'student',
    loading: true
  });

  // 마지막 새로고침 시간 추적
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  // 최초 앱 로딩 시 인증 확인 횟수 제한
  const [initialAuthChecked, setInitialAuthChecked] = useState<boolean>(false);

  /**
   * 인증 상태 확인 함수 - 개선된 버전
   * @param force 강제로 새로고침 여부
   */
  const checkAuthStatus = useCallback(async (force = false): Promise<boolean> => {
    // 중복 실행 방지
    if (authCheckInProgress && !force) {
      console.log('이미 인증 확인 중입니다. 중복 요청 무시.');
      return state.isAuthenticated;
    }

    // 캐시 수명 (3분)
    const CACHE_TTL = 3 * 60 * 1000;

    // 최근에 이미 확인한 경우 (캐시 유효)
    const now = Date.now();
    if (!force && now - lastRefresh < CACHE_TTL && state.isAuthenticated) {
      console.log('최근에 이미 인증 확인 완료. 캐시된 상태 반환.');
      return state.isAuthenticated;
    }

    // 로딩 플래그 설정
    console.log('인증 상태 확인 시작');
    authCheckInProgress = true;

    setState(prev => ({
      ...prev,
      loading: true
    }));

    try {
      try {
        // 세션 가져오기
        const session = await fetchAuthSession({
          forceRefresh: force || (now - lastRefresh > CACHE_TTL * 2)
        });

        // 토큰이 없으면 로그아웃 상태
        if (!session.tokens) {
          console.log('유효한 토큰 없음, 로그아웃 상태로 설정');
          setState({
            isAuthenticated: false,
            userAttributes: null,
            username: '',
            userRole: 'student',
            loading: false
          });
          return false;
        }

        // 자격 증명 확인 (없어도 계속 진행, 일부 작업은 자격 증명 없이도 가능)
        if (!session.credentials) {
          console.log('자격 증명 없음, 토큰만 있는 상태 - 부분 인증 상태');
          // 인증 상태는 토큰 기반으로 판단
          try {
            // 사용자 정보만 가져오기 시도
            const user = await getCurrentUser();
            const attributes = await fetchUserAttributes();

            // 세션에 저장
            sessionStorage.setItem('userAttributes', JSON.stringify(attributes));
            sessionStorage.setItem('userAttributesTimestamp', now.toString());

            // 상태 업데이트
            setState({
              isAuthenticated: true,
              userAttributes: attributes,
              username: user.username,
              userRole: attributes.profile || 'student',
              loading: false
            });

            setLastRefresh(now);
            return true;
          } catch (userError) {
            console.log('사용자 정보 가져오기 실패:', userError);
            // 사용자 정보 가져오기 실패시 로그아웃 상태로 간주
            setState({
              isAuthenticated: false,
              userAttributes: null,
              username: '',
              userRole: 'student',
              loading: false
            });
            return false;
          }
        }

        // 토큰과 자격 증명 모두 있는 경우
        console.log('유효한 토큰과 자격 증명 발견: 로그인된 상태');

        // 사용자 정보 가져오기
        const user = await getCurrentUser();
        const attributes = await fetchUserAttributes();

        // 세션에 저장
        sessionStorage.setItem('userAttributes', JSON.stringify(attributes));
        sessionStorage.setItem('userAttributesTimestamp', now.toString());

        // 상태 업데이트
        setState({
          isAuthenticated: true,
          userAttributes: attributes,
          username: user.username,
          userRole: attributes.profile || 'student',
          loading: false
        });

        setLastRefresh(now);
        tokenRefreshAttempts = 0;
        return true;
      } catch (error) {
        console.log('인증 확인 중 오류:', error);

        // 오류 발생 시 로그아웃 상태로 설정
        setState({
          isAuthenticated: false,
          userAttributes: null,
          username: '',
          userRole: 'student',
          loading: false
        });

        // 캐시 정리
        sessionStorage.removeItem('userAttributes');
        sessionStorage.removeItem('userAttributesTimestamp');

        return false;
      }
    } finally {
      // 로딩 플래그 해제
      authCheckInProgress = false;

      // 로딩 상태 종료
      setState(prev => ({
        ...prev,
        loading: false
      }));

      // 첫 인증 확인 완료 표시
      if (!initialAuthChecked) {
        setInitialAuthChecked(true);
      }
    }
  }, [lastRefresh, state.isAuthenticated]);

  /**
   * 로그아웃 처리 함수
   * @param global 모든 기기에서 로그아웃 여부
   */
  const logout = useCallback(async (global = false) => {
    console.log('로그아웃 시작 - AuthContext');
    try {
      // 1. Amplify signOut 호출
      try {
        console.log('Amplify signOut 호출 중...');
        await signOut({ global });
        console.log('Amplify signOut 성공');
      } catch (signOutError) {
        console.warn('Amplify signOut 중 오류 (계속 진행):', signOutError);
        // signOut에 실패하더라도 계속 진행
      }

      // 2. 상태 초기화
      console.log('로그아웃 상태 정리 중...');
      setState({
        isAuthenticated: false,
        userAttributes: null,
        username: '',
        userRole: 'student',
        loading: false
      });

      // 3. 세션 스토리지 및 캐시 정리
      console.log('로그아웃 스토리지 정리 중...');
      sessionStorage.clear();

      // Cognito 관련 모든 항목 제거
      Object.keys(localStorage).forEach(key => {
        if (key.includes('CognitoIdentityServiceProvider') || key.includes('amplify-signin')) {
          localStorage.removeItem(key);
        }
      });

      // 4. 토큰 관련 상태 초기화
      tokenRefreshAttempts = 0;
      tokenRefreshLastAttempt = 0;
      setLastRefresh(0);

      console.log('로그아웃 완료!');
      return;
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
      // 오류가 있더라도 상태는 로그아웃으로 설정
      setState({
        isAuthenticated: false,
        userAttributes: null,
        username: '',
        userRole: 'student',
        loading: false
      });

      // 스토리지 정리 시도
      try {
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('세션 스토리지 정리 중 오류:', storageError);
      }

      throw error; // 오류를 상위로 전달
    }
  }, []);

  /**
   * 인증 오류 처리 함수
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

      // 로그인 페이지로 리다이렉트
      const currentPath = window.location.pathname;
      loginRedirect(currentPath);
    }
  }, []);

  /**
   * 로그인 페이지로 리디렉션하는 함수
   */
  const loginRedirect = useCallback((returnPath?: string) => {
    const returnUrl = returnPath || window.location.pathname;
    //window.location.href = `/login?returnTo=\${encodeURIComponent(returnUrl)}`;
    window.location.href = `/signin?returnTo=\${encodeURIComponent(returnUrl)}`;
  }, []);

  // 초기 로드 시 인증 확인 및 이벤트 리스너 설정
  useEffect(() => {
    // 앱 로드 시 한번만 인증 상태 확인
    let authCheckAttempted = false;

    const initialAuthCheck = async () => {
      if (!authCheckAttempted) {
        authCheckAttempted = true;
        await checkAuthStatus(true);
      }
    };

    initialAuthCheck();

    // Auth 이벤트 리스너 설정
    const listener = Hub.listen('auth', ({ payload }) => {
      console.log('Auth 이벤트:', payload.event);

      switch (payload.event) {
        case 'signedIn':
          checkAuthStatus(true); // 강제 새로고침
          break;

        case 'signedOut':
          console.log('signedOut 이벤트 감지 - 상태 초기화');
          // 상태 초기화
          setState({
            isAuthenticated: false,
            userAttributes: null,
            username: '',
            userRole: 'student',
            loading: false
          });

          // 스토리지 정리
          sessionStorage.clear();
          localStorage.removeItem('amplify-signin-with-hostedUI');

          // Cognito 관련 모든 항목 제거
          Object.keys(localStorage).forEach(key => {
            if (key.includes('CognitoIdentityServiceProvider')) {
              localStorage.removeItem(key);
            }
          });

          setLastRefresh(0);
          tokenRefreshAttempts = 0;
          break;

        case 'tokenRefresh':
          // 로그아웃 상태에서는 토큰 갱신을 시도하지 않음
          if (!state.isAuthenticated) {
            console.log('로그아웃 상태. 토큰 갱신 중단');
            return;
          }

          const now = Date.now();
          
          // 토큰 갱신 제한
          if (now - tokenRefreshLastAttempt < TOKEN_REFRESH_MIN_INTERVAL) {
            console.log('토큰 갱신 제한: 너무 빈번한 요청');
            return;
          }

          if (tokenRefreshAttempts >= MAX_TOKEN_REFRESH_ATTEMPTS) {
            console.log(`토큰 갱신 제한: 최대 시도 횟수 초과 (\${tokenRefreshAttempts}/\${MAX_TOKEN_REFRESH_ATTEMPTS})`);
            // 제한 횟수 도달 후 일정 시간 후 다시 허용
            if (now - tokenRefreshLastAttempt > TOKEN_REFRESH_MIN_INTERVAL * 10) {
              console.log('토큰 갱신 카운터 초기화');
              tokenRefreshAttempts = 0;
            }
            return;
          }

          tokenRefreshAttempts++;
          tokenRefreshLastAttempt = now;
          console.log('토큰 갱신 시도:', tokenRefreshAttempts);

          // 토큰 갱신 시 조용히 인증 상태 확인
          checkAuthStatus(true).catch(err =>
            console.error('토큰 갱신 중 인증 상태 확인 실패:', err)
          );
          break;
      }
    });

    // 전역 오류 리스너
    const globalErrorHandler = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes("자격 증명이 없습니다") ||
        event.error?.message?.includes("세션에 유효한 자격 증명이 없습니다") ||
        event.error?.message?.includes("No credentials")
      ) {
        // 인증 오류 발생 시 인증 상태 확인
        checkAuthStatus(true).then(isAuth => {
          if (!isAuth) {
            handleAuthError(event.error);
          }
        });
      }
    };

    window.addEventListener('error', globalErrorHandler);

    return () => {
      listener();
      window.removeEventListener('error', globalErrorHandler);
    };
  }, [checkAuthStatus, handleAuthError]);

  // 컨텍스트 값 메모이제이션
  const value = useMemo(() => ({
    ...state,
    checkAuthStatus,
    logout,
    loginRedirect,
    handleAuthError
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
 * 인증 에러 처리 래퍼 함수 - Hook 규칙을 위반하지 않도록 수정
 */
export const withAuthErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  authContext: AuthErrorHandlerContext
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await apiFunction(...args);
    } catch (error: any) {
      // 인증 오류 확인
      const isAuthError =
        error.message?.includes("자격 증명이 없습니다") ||
        error.message?.includes("세션에 유효한 자격 증명이 없습니다") ||
        error.message?.includes("No credentials") ||
        error.message?.includes("expired") ||
        error.name === 'NotAuthorizedException' ||
        error.code === 'NotAuthorizedException';

      // 인증 오류인 경우 처리기 호출
      if (isAuthError && authContext.handleAuthError) {
        authContext.handleAuthError(error);
      }

      throw error;
    }
  };
};

/**
 * API 호출 시 인증 컨텍스트와 함께 사용하기 위한 헬퍼 함수
 * 컴포넌트 내부에서 사용
 */
export const createAuthErrorHandler = (
  errorCallback: (error: any) => void,
  navigate?: (path: string) => void,
  loginPath: string = '/signin' // 기본값 설정하되 변경 가능하게
): AuthErrorHandlerContext => {
  return {
    handleAuthError: (error: any) => {
      console.error('인증 오류:', error);
      errorCallback(error);
      if (navigate) {
        navigate(loginPath);
      }
    }
  };
};