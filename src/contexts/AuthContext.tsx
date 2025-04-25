// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchAuthSession, getCurrentUser, fetchUserAttributes, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

// 인증 컨텍스트 타입 정의
interface AuthContextValue {
  isAuthenticated: boolean;
  userAttributes: any;
  username: string;
  userRole: string;
  loading: boolean;
  hasCredentials: boolean; // AWS 자격 증명 유무 상태 추가
  checkAuthStatus: (force?: boolean) => Promise<boolean>;
  logout: (global?: boolean) => Promise<void>;
  loginRedirect: (returnPath?: string) => void;
  handleAuthError: (error: any) => void;
  refreshCredentials: () => Promise<boolean>; // 자격 증명 갱신 함수 추가
}

// 인증 상태 타입 정의
interface AuthState {
  isAuthenticated: boolean;
  userAttributes: any;
  username: string;
  userRole: string;
  loading: boolean;
  hasCredentials: boolean; // AWS 자격 증명 유무 상태 추가
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
const TOKEN_REFRESH_MIN_INTERVAL = 60000; // 1분으로 늘림

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
    loading: true,
    hasCredentials: false
  });

  // 마지막 새로고침 시간 추적
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  
  // 최초 앱 로딩 시 인증 확인 횟수 제한
  const [initialAuthChecked, setInitialAuthChecked] = useState<boolean>(false);
  
  // 인증 확인 중인 Promise를 추적하기 위한 ref
  const authCheckPromiseRef = useRef<Promise<boolean> | null>(null);

  /**
   * 인증 상태 확인 함수 - 개선된 버전
   * @param force 강제로 새로고침 여부
   */
  const checkAuthStatus = useCallback(async (force = false): Promise<boolean> => {
    // 이미 진행 중인 인증 확인이 있으면 그 Promise를 반환
    if (authCheckPromiseRef.current && !force) {
      console.log('이미 인증 확인이 진행 중입니다. 기존 요청을 반환합니다.');
      return authCheckPromiseRef.current;
    }
    
    // 중복 실행 방지
    if (authCheckInProgress && !force) {
      console.log('이미 인증 확인 중입니다. 중복 요청 무시.');
      return state.isAuthenticated;
    }
    
    // 캐시 수명 (1분으로 단축)
    const CACHE_TTL = 60 * 1000;
  
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
    
    // 새 인증 확인 Promise 생성 및 저장
    const authCheckPromise = (async (): Promise<boolean> => {
      try {
        try {
          // 세션 가져오기
          const session = await fetchAuthSession({ 
            forceRefresh: force 
          });
          
          // 토큰이 없으면 로그아웃 상태
          if (!session.tokens) {
            console.log('유효한 토큰 없음, 로그아웃 상태로 설정');
            setState({
              isAuthenticated: false,
              userAttributes: null,
              username: '',
              userRole: 'student',
              loading: false,
              hasCredentials: false
            });
            
            // 세션 스토리지 정리
            sessionStorage.removeItem('userAttributes');
            sessionStorage.removeItem('userAttributesTimestamp');
            
            return false;
          }
          
          // 자격 증명이 없는 경우 - 부분 인증 상태 처리
          if (!session.credentials) {
            console.log('자격 증명 없음, 토큰만 있는 상태 - 부분 인증 상태');
            
            // 사용자 정보 가져오기 시도
            try {
              const user = await getCurrentUser();
              const attributes = await fetchUserAttributes();
              
              // 자격 증명은 없지만 유효한 사용자 정보가 있어 인증 상태로 간주
              setState({
                isAuthenticated: true,
                userAttributes: attributes,
                username: user.username,
                userRole: attributes.profile || 'student',
                loading: false,
                hasCredentials: false // 자격 증명 없음 표시
              });
              
              setLastRefresh(now);
              // 인증 상태로 간주하되, AWS 서비스 호출에는 문제가 있음을 로그로 남김
              console.log('인증은 유효하지만 AWS 자격 증명이 없습니다. AWS 서비스 사용에 제한이 있을 수 있습니다.');
              
              // 토큰 갱신 횟수 제한 이후에도 자격 증명이 없으면 재시도 제한
              if (tokenRefreshAttempts >= MAX_TOKEN_REFRESH_ATTEMPTS) {
                sessionStorage.setItem('credentialRefreshBlocked', 'true');
              }
              
              return true;
            } catch (userError) {
              // 사용자 정보도 가져올 수 없는 경우 - 인증 심각한 문제
              console.log('사용자 정보 가져오기 실패 - 인증 문제로 로그아웃 처리:', userError);
              
              // 로그아웃 처리
              try {
                await signOut({ global: false });
                console.log('부분 인증 상태에서 강제 로그아웃 완료');
              } catch (signOutErr) {
                console.error('로그아웃 처리 중 오류:', signOutErr);
              }
              
              setState({
                isAuthenticated: false,
                userAttributes: null,
                username: '',
                userRole: 'student',
                loading: false,
                hasCredentials: false
              });
              
              // 세션 스토리지 정리
              sessionStorage.clear();
              
              return false;
            }
          }
          
          // 정상적인 인증 상태 (토큰 + 자격 증명)
          console.log('유효한 토큰과 자격 증명 발견: 정상 로그인 상태');
          
          // 사용자 정보 가져오기
          const user = await getCurrentUser();
          const attributes = await fetchUserAttributes();
          
          // 세션에 저장
          sessionStorage.setItem('userAttributes', JSON.stringify(attributes));
          sessionStorage.setItem('userAttributesTimestamp', now.toString());
          sessionStorage.removeItem('credentialRefreshBlocked'); // 정상 상태이므로 제한 해제
          
          // 상태 업데이트
          setState({
            isAuthenticated: true,
            userAttributes: attributes,
            username: user.username,
            userRole: attributes.profile || 'student',
            loading: false,
            hasCredentials: true // 자격 증명 있음 표시
          });
          
          // 인증 성공 후 리프레시 횟수 초기화
          tokenRefreshAttempts = 0;
          setLastRefresh(now);
          return true;
        } catch (error: any) {
          console.error('인증 확인 중 오류:', error);
          
          // 세션 만료 오류인 경우 로그아웃 처리
          if (error.name === 'TokenExpiredError' || 
              error.message?.includes('expired') || 
              error.message?.includes('invalid')) {
            console.log('토큰 만료 또는 무효 - 로그아웃 처리');
            try {
              await signOut({ global: false });
            } catch (signOutErr) {
              console.warn('만료된 세션 로그아웃 중 오류:', signOutErr);
            }
          }
          
          // 오류 발생 시 로그아웃 상태로 설정
          setState({
            isAuthenticated: false,
            userAttributes: null,
            username: '',
            userRole: 'student',
            loading: false,
            hasCredentials: false
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
        
        // 완료 후 참조된 Promise 제거
        authCheckPromiseRef.current = null;
      }
    })();
    
    // 현재 실행 중인 인증 확인 Promise 저장
    authCheckPromiseRef.current = authCheckPromise;
    
    return authCheckPromise;
  }, [lastRefresh, state.isAuthenticated]);

  /**
   * AWS 자격 증명 갱신 함수
   */
  const refreshCredentials = useCallback(async (): Promise<boolean> => {
    // 자격 증명 갱신이 차단된 경우 확인
    const isBlocked = sessionStorage.getItem('credentialRefreshBlocked') === 'true';
    if (isBlocked) {
      console.log('자격 증명 갱신이 차단되어 있습니다. 먼저 로그아웃 후 다시 로그인하세요.');
      return false;
    }
    
    console.log('AWS 자격 증명 수동 갱신 시도...');
    
    try {
      // 강제 세션 갱신으로 자격 증명 획득 시도
      const session = await fetchAuthSession({ forceRefresh: true });
      
      if (session.credentials) {
        console.log('AWS 자격 증명 갱신 성공');
        
        // 상태 업데이트
        setState(prev => ({
          ...prev,
          hasCredentials: true
        }));
        
        // 토큰 갱신 횟수 초기화
        tokenRefreshAttempts = 0;
        setLastRefresh(Date.now());
        
        return true;
      } else {
        console.log('AWS 자격 증명 갱신 실패 - 자격 증명을 얻을 수 없음');
        
        // 상태 업데이트 (자격 증명 없음)
        setState(prev => ({
          ...prev,
          hasCredentials: false
        }));
        
        return false;
      }
    } catch (error) {
      console.error('AWS 자격 증명 갱신 중 오류:', error);
      return false;
    }
  }, []);

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
        loading: false,
        hasCredentials: false
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
        loading: false,
        hasCredentials: false
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
        loading: false,
        hasCredentials: false
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
    window.location.href = `/signin?returnTo=\${encodeURIComponent(returnUrl)}`;
  }, []);

  // 초기 로드 시 인증 확인 및 이벤트 리스너 설정
  useEffect(() => {
    // 앱 로드 시 한번만 인증 상태 확인
    let authCheckAttempted = false;
    const initialDelayMs = 100; // 초기 지연 시간 (ms)

    const initialAuthCheck = async () => {
      if (!authCheckAttempted) {
        authCheckAttempted = true;
        
        // 로드 시 잠깐 지연 후 인증 상태 확인 (초기 충돌 방지)
        await new Promise(resolve => setTimeout(resolve, initialDelayMs));
        try {
          await checkAuthStatus(true);
        } catch (err) {
          console.error('초기 인증 상태 확인 중 오류:', err);
        }
      }
    };

    initialAuthCheck();

    // Auth 이벤트 리스너 설정
    const listener = Hub.listen('auth', ({ payload }) => {
      console.log('Auth 이벤트:', payload.event);

      switch (payload.event) {
        case 'signedIn':
          // 로그인 시 즉시 강제 인증 확인 (모든 정보 갱신)
          setTimeout(async () => {
            try {
              await checkAuthStatus(true);
            } catch (err) {
              console.error('로그인 후 인증 상태 확인 중 오류:', err);
            }
          }, 500); // 로그인 이벤트 후 약간 지연
          break;

        case 'signedOut':
          console.log('signedOut 이벤트 감지 - 상태 초기화');
          // 상태 초기화
          setState({
            isAuthenticated: false,
            userAttributes: null,
            username: '',
            userRole: 'student',
            loading: false,
            hasCredentials: false
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
          // 로그인 상태가 아니면 토큰 갱신 무시
          if (!state.isAuthenticated) {
            console.log('로그아웃 상태. 토큰 갱신 중단');
            return;
          }

          const now = Date.now();

          // 토큰 갱신 빈도 제한
          if (now - tokenRefreshLastAttempt < TOKEN_REFRESH_MIN_INTERVAL) {
            console.log('토큰 갱신 제한: 너무 빈번한 요청');
            return;
          }

          // 최대 시도 횟수 제한
          if (tokenRefreshAttempts >= MAX_TOKEN_REFRESH_ATTEMPTS) {
            console.log(`토큰 갱신 제한: 최대 시도 횟수 초과 (\${tokenRefreshAttempts}/\${MAX_TOKEN_REFRESH_ATTEMPTS})`);
            
            // 마지막 시도 후 30분 지나면 카운터 초기화
            if (now - tokenRefreshLastAttempt > 30 * 60 * 1000) {
              console.log('토큰 갱신 카운터 초기화 (30분 경과)');
              tokenRefreshAttempts = 0;
            } else {
              // 그렇지 않으면 무시
              return;
            }
          }

          // 토큰 갱신 시도 기록
          tokenRefreshAttempts++;
          tokenRefreshLastAttempt = now;
          
          // 메인 스레드 차단 방지를 위해 비동기 실행
          setTimeout(async () => {
            try {
              // 인증 상태 확인 (강제 갱신)
              const refreshed = await checkAuthStatus(true);
              console.log('토큰 갱신 결과:', refreshed ? '성공' : '실패');
              
              if (refreshed && state.hasCredentials) {
                // 자격 증명까지 포함하여 성공 시 카운터 초기화
                tokenRefreshAttempts = 0;
              }
            } catch (refreshError) {
              console.error('토큰 갱신 중 오류:', refreshError);
            }
          }, 100);
          break;
          
        case 'tokenRefresh_failure':
          console.error('토큰 갱신 실패 이벤트 감지');
          // 필요시 추가 처리
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
        // 자격 증명 관련 오류 시 증명 갱신 시도
        if (state.isAuthenticated && !state.hasCredentials) {
          console.log('자격 증명 관련 오류 감지, 자격 증명 갱신 시도');
          refreshCredentials().catch(err => 
            console.error('자격 증명 갱신 중 오류:', err)
          );
          return;
        }
        
        // 인증 오류 발생 시 인증 상태 확인
        checkAuthStatus(true).then(isAuth => {
          if (!isAuth) {
            handleAuthError(event.error);
          }
        }).catch(err => {
          console.error('인증 상태 확인 중 오류:', err);
          handleAuthError(event.error);
        });
      }
    };

    window.addEventListener('error', globalErrorHandler);

    return () => {
      listener();
      window.removeEventListener('error', globalErrorHandler);
    };
  }, [checkAuthStatus, handleAuthError, state.isAuthenticated, state.hasCredentials, refreshCredentials]);

  // 컨텍스트 값 메모이제이션
  const value = useMemo(() => ({
    ...state,
    checkAuthStatus,
    logout,
    loginRedirect,
    handleAuthError,
    refreshCredentials
  }), [state, checkAuthStatus, logout, loginRedirect, handleAuthError, refreshCredentials]);

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