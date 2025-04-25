// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchAuthSession, getCurrentUser, fetchUserAttributes, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import AWS from 'aws-sdk';
import { AuthSession } from 'aws-amplify/auth';

// 로그 레벨 타입 및 설정
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
const LOG_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'error' : 'info';

// 인증 컨텍스트 타입 정의
interface AuthContextValue {
  isAuthenticated: boolean;
  userAttributes: any;
  username: string;
  userRole: string;
  loading: boolean;
  hasCredentials: boolean;
  useMockData: boolean;
  checkAuthStatus: (force?: boolean) => Promise<boolean>;
  logout: (global?: boolean) => Promise<void>;
  loginRedirect: (returnPath?: string) => void;
  handleAuthError: (error: any) => void;
  refreshCredentials: () => Promise<boolean>;
  createAWSService: <T>(ServiceClass: new (config: AWS.ConfigurationOptions) => T) => Promise<T>;
  setMockDataMode: (enabled: boolean) => void;
}

// 인증 상태 타입 정의
interface AuthState {
  isAuthenticated: boolean;
  userAttributes: any;
  username: string;
  userRole: string;
  loading: boolean;
  hasCredentials: boolean;
  useMockData: boolean;
}

// AWS 자격 증명 저장 변수
let awsCredentials: AWS.Credentials | null = null;
let credentialsInitialized = false;
let lastCredentialAttempt = 0;

// 세션 캐싱 변수
let lastSessionCheck = 0;
let cachedSessionInfo: { hasTokens: boolean; hasCredentials: boolean } | null = null;
let lastLogOutput = 0;

// 상태 변경 추적 변수
let lastAuthCheckTime = 0;
let pendingAuthChecks = 0;

// Context 생성
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * 인증 상태를 전역으로 관리하는 Provider 컴포넌트
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 인증 상태 관리 - 초기 로딩 상태를 false로 설정
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    userAttributes: null,
    username: '',
    userRole: 'student',
    loading: false, // 초기에는 로딩 상태가 아님
    hasCredentials: false,
    useMockData: sessionStorage.getItem('useMockData') === 'true'
  });

  // 인증 프로세스 상태 관리
  const [initialAuthChecked, setInitialAuthChecked] = useState<boolean>(false);
  const authCheckPromiseRef = useRef<Promise<boolean> | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  
  // 디바운스 타이머 레퍼런스
  const debounceTimerRef = useRef<number | null>(null);
  
  // 처리 중 상태 추적용 ref
  const processingRef = useRef<boolean>(false);
  const loadingTimeoutRef = useRef<number | null>(null);

  // 모의 데이터 모드 설정 함수
  const setMockDataMode = useCallback((enabled: boolean) => {
    if (enabled) {
      sessionStorage.setItem('useMockData', 'true');
    } else {
      sessionStorage.removeItem('useMockData');
    }

    setState(prev => {
      if (prev.useMockData === enabled) return prev; // 변경 없으면 상태 업데이트 안함
      return {
        ...prev,
        useMockData: enabled
      };
    });

    // 로그 출력은 3초에 한 번만
    const now = Date.now();
    if (now - lastLogOutput > 3000) {
      console.log('모의 데이터 모드 ' + (enabled ? '활성화' : '비활성화'));
      lastLogOutput = now;
    }
  }, []);

  /**
   * AWS 자격 증명 초기화 함수
   */
  const initializeCredentials = useCallback(async (force = false): Promise<boolean> => {
    // 중복 호출 방지
    if (!force && credentialsInitialized && awsCredentials &&
        Date.now() - lastCredentialAttempt < 10000) {
      return true;
    }

    // 세션 캐싱 - 빈번한 호출 방지
    const now = Date.now();
    if (!force && cachedSessionInfo && now - lastSessionCheck < 5000) {
      return cachedSessionInfo.hasCredentials;
    }

    lastCredentialAttempt = now;
    lastSessionCheck = now;

    try {
      // 세션 상태 확인
      const session = await fetchAuthSession();
      const sessionInfo = {
        hasTokens: !!session.tokens,
        hasCredentials: !!session.credentials
      };
      
      // 이전 상태와 다를 때만 로그 출력
      if (!cachedSessionInfo || 
          cachedSessionInfo.hasTokens !== sessionInfo.hasTokens || 
          cachedSessionInfo.hasCredentials !== sessionInfo.hasCredentials) {
        console.log('AWS 세션 정보:', sessionInfo);
      }
      
      cachedSessionInfo = sessionInfo;

      // 토큰이 없으면 로그인되지 않은 상태
      if (!session.tokens) {
        awsCredentials = null;
        credentialsInitialized = false;
        setState(prev => {
          if (prev.isAuthenticated === false && !prev.hasCredentials) return prev;
          return {
            ...prev,
            isAuthenticated: false,
            hasCredentials: false
          };
        });
        return false;
      }

      // 자격 증명이 있으면 설정 완료
      if (session.credentials) {
        awsCredentials = new AWS.Credentials({
          accessKeyId: session.credentials.accessKeyId,
          secretAccessKey: session.credentials.secretAccessKey,
          sessionToken: session.credentials.sessionToken
        });

        AWS.config.credentials = awsCredentials;
        AWS.config.region = AWS.config.region || 'ap-northeast-2'; // 한국 리전으로 설정
        credentialsInitialized = true;

        sessionStorage.removeItem('partialAuthState');
        
        // 모의 데이터 모드가 아닐 때만 모드 설정 변경
        if (state.useMockData) {
          setMockDataMode(false);
        }

        setState(prev => {
          if (prev.hasCredentials === true && !prev.useMockData) return prev;
          return {
            ...prev,
            hasCredentials: true,
            useMockData: false
          };
        });

        return true;
      }

      // 토큰은 있지만 자격 증명이 없는 부분 인증 상태
      sessionStorage.setItem('partialAuthState', 'true');
      
      // 모의 데이터 모드가 아닐 때만 모드 설정 변경
      if (!state.useMockData) {
        setMockDataMode(true);
      }

      credentialsInitialized = false;
      awsCredentials = null;
      setState(prev => {
        if (!prev.hasCredentials && prev.useMockData) return prev;
        return {
          ...prev,
          hasCredentials: false,
          useMockData: true
        };
      });

      return false;
    } catch (err) {
      console.error('AWS 자격 증명 설정 실패:', err);
      credentialsInitialized = false;
      awsCredentials = null;
      setState(prev => {
        if (!prev.hasCredentials && prev.useMockData) return prev;
        return {
          ...prev,
          hasCredentials: false,
          useMockData: true
        };
      });

      sessionStorage.setItem('partialAuthState', 'true');
      if (!state.useMockData) {
        setMockDataMode(true);
      }

      return false;
    }
  }, [state.useMockData, setMockDataMode]);

  /**
   * 인증 상태 확인 함수 - 디바운스, 중복 호출 방지 및 타임아웃 로직 추가
   */
  const checkAuthStatus = useCallback(async (force = false): Promise<boolean> => {
    // 이미 진행 중인 인증 확인이 있으면 그 Promise를 반환
    if (authCheckPromiseRef.current && !force) {
      return authCheckPromiseRef.current;
    }
    
    // 디바운스 강화 - 60초 내에 다시 체크하지 않음
    const now = Date.now();
    if (!force && now - lastAuthCheckTime < 60000 && state.isAuthenticated) {
      return state.isAuthenticated;
    }
    
    // 짧은 시간 내에 여러 번 호출 방지 (디바운스)
    if (!force && now - lastAuthCheckTime < 1000 && pendingAuthChecks > 0) {
      pendingAuthChecks++;
      return new Promise(resolve => {
        setTimeout(() => resolve(state.isAuthenticated), 100);
      });
    }
    
    lastAuthCheckTime = now;
    pendingAuthChecks++;

    // 캐시 TTL 및 인증 상태 확인
    const isPartialAuth = sessionStorage.getItem('partialAuthState') === 'true';
    const CACHE_TTL = isPartialAuth ? 300000 : 120000; // 5분 또는 2분

    // 캐시 유효성 검사
    if (!force && now - lastRefresh < CACHE_TTL && state.isAuthenticated) {
      pendingAuthChecks--;
      return state.isAuthenticated;
    }

    // 로딩 상태 설정
    setState(prev => ({ ...prev, loading: true }));

    // 로딩 타임아웃 설정 - 최대 10초 후 강제 해제
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current);
    }
    loadingTimeoutRef.current = window.setTimeout(() => {
      setState(prev => {
        if (!prev.loading) return prev;
        console.warn('인증 상태 확인 타임아웃 - 로딩 상태 해제');
        return { ...prev, loading: false };
      });
      loadingTimeoutRef.current = null;
    }, 10000);

    // 새 인증 확인 Promise 생성 및 저장
    const authCheckPromise = (async (): Promise<boolean> => {
      try {
        // 세션 가져오기
        let session: AuthSession;
        try {
          session = await fetchAuthSession();
        } catch (sessionError) {
          setState(prev => ({
            ...prev,
            isAuthenticated: false,
            userAttributes: null,
            username: '',
            userRole: 'student',
            loading: false,
            hasCredentials: false,
            useMockData: false
          }));
          return false;
        }

        // 토큰이 없으면 로그아웃 상태
        if (!session.tokens) {
          setState(prev => ({
            ...prev,
            isAuthenticated: false,
            userAttributes: null,
            username: '',
            userRole: 'student',
            loading: false,
            hasCredentials: false,
            useMockData: false
          }));
          
          sessionStorage.removeItem('userAttributes');
          sessionStorage.removeItem('partialAuthState');
          sessionStorage.removeItem('useMockData');
          
          return false;
        }

        // 자격 증명 상태 업데이트
        await initializeCredentials(force);

        try {
          const user = await getCurrentUser();
          const attributes = await fetchUserAttributes();
          
          setState(prev => {
            // 상태가 크게 변하지 않았으면 업데이트하지 않음
            if (prev.isAuthenticated && 
                prev.username === user.username && 
                prev.hasCredentials === !!session.credentials) {
              return {
                ...prev,
                loading: false,
                userAttributes: attributes,
                userRole: attributes.profile || prev.userRole
              };
            }
            
            return {
              isAuthenticated: true,
              userAttributes: attributes,
              username: user.username,
              userRole: attributes.profile || 'student',
              loading: false,
              hasCredentials: !!session.credentials,
              useMockData: !session.credentials
            };
          });

          sessionStorage.setItem('userAttributes', JSON.stringify(attributes));
          setLastRefresh(now);
          
          return true;
        } catch (userError) {
          console.error('사용자 정보 가져오기 실패:', userError);
          
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            userAttributes: {},
            username: 'unknown',
            userRole: 'student',
            loading: false,
            hasCredentials: !!session.credentials,
            useMockData: !session.credentials
          }));
          
          return true;
        }
      } catch (error) {
        console.error('인증 확인 중 오류:', error);
        
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          userAttributes: null,
          username: '',
          userRole: 'student',
          loading: false,
          hasCredentials: false,
          useMockData: false
        }));
        
        return false;
      } finally {
        // 로딩 상태 해제 보장
        setState(prev => ({ ...prev, loading: false }));
        setInitialAuthChecked(true);
        authCheckPromiseRef.current = null;
        pendingAuthChecks--;
        
        // 타임아웃 타이머 정리
        if (loadingTimeoutRef.current) {
          window.clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
      }
    })();

    // 인증 확인과 타임아웃 경쟁 - 최대 10초 후 완료 보장
    authCheckPromiseRef.current = Promise.race([
      authCheckPromise,
      new Promise<boolean>(resolve => {
        setTimeout(() => {
          console.warn('인증 확인 시간 초과');
          resolve(state.isAuthenticated);
        }, 10000);
      })
    ]);
    
    return authCheckPromiseRef.current;
  }, [lastRefresh, state.isAuthenticated, initializeCredentials]);
  
  /**
   * AWS 자격 증명 갱신 함수
   */
  const refreshCredentials = useCallback(async (): Promise<boolean> => {
    console.log('AWS 자격 증명 수동 갱신 시도...');

    try {
      await checkAuthStatus(true);
      const success = await initializeCredentials(true);

      if (success) {
        console.log('AWS 자격 증명 갱신 성공');
        sessionStorage.removeItem('partialAuthState');
        setMockDataMode(false);
        return true;
      } else {
        console.log('AWS 자격 증명 갱신 실패');
        sessionStorage.setItem('partialAuthState', 'true');
        setMockDataMode(true);
        return false;
      }
    } catch (error) {
      console.error('AWS 자격 증명 갱신 중 오류:', error);
      sessionStorage.setItem('partialAuthState', 'true');
      setMockDataMode(true);
      return false;
    }
  }, [checkAuthStatus, initializeCredentials, setMockDataMode]);

  /**
   * 로그아웃 처리 함수
   */
  const logout = useCallback(async (global = false) => {
    console.log('로그아웃 시작');

    try {
      await signOut({ global });
    } catch (signOutError) {
      console.warn('로그아웃 처리 중 오류:', signOutError);
    }

    // 상태 초기화
    setState({
      isAuthenticated: false,
      userAttributes: null,
      username: '',
      userRole: 'student',
      loading: false,
      hasCredentials: false,
      useMockData: false
    });

    // AWS 자격 증명 정리
    awsCredentials = null;
    credentialsInitialized = false;

    // 스토리지 정리
    sessionStorage.clear();
    localStorage.removeItem('amplify-signin-with-hostedUI');

    console.log('로그아웃 완료');
  }, []);

  /**
   * 로그인 페이지로 리디렉션하는 함수
   */
  const loginRedirect = useCallback((returnPath?: string) => {
    const returnUrl = returnPath || window.location.pathname;
    window.location.href = `/signin?returnTo=\${encodeURIComponent(returnUrl)}`;
  }, []);

  /**
   * 인증 오류 처리 함수
   */
  const handleAuthError = useCallback((error: any) => {
    // 자격 증명 관련 오류인지 확인
    const isCredentialError =
      error.message?.includes("자격 증명이 없습니다") ||
      error.message?.includes("No credentials");

    // 토큰 만료 오류인지 확인
    const isTokenError =
      error.message?.includes("expired") ||
      error.name === 'NotAuthorizedException';

    // 부분 인증 상태에서 자격 증명 오류인 경우
    if (isCredentialError && state.isAuthenticated && !state.hasCredentials) {
      console.log('자격 증명 오류 감지 - 부분 인증 상태');
      sessionStorage.setItem('partialAuthState', 'true');
      setMockDataMode(true);
      return;
    }

    // 토큰 만료 또는 심각한 인증 오류인 경우
    if (isTokenError || (isCredentialError && !state.hasCredentials && !state.isAuthenticated)) {
      console.log('인증 세션 만료 또는 심각한 오류, 로그아웃 처리');

      setState({
        isAuthenticated: false,
        userAttributes: null,
        username: '',
        userRole: 'student',
        loading: false,
        hasCredentials: false,
        useMockData: false
      });

      // AWS 자격 증명 정리
      awsCredentials = null;
      credentialsInitialized = false;

      // 스토리지 정리
      sessionStorage.clear();
      localStorage.removeItem('amplify-signin-with-hostedUI');

      // 로그인 페이지로 리다이렉트 (디바운스 적용)
      const currentPath = window.location.pathname;
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
      
      debounceTimerRef.current = window.setTimeout(() => {
        loginRedirect(currentPath);
        debounceTimerRef.current = null;
      }, 100);
    }
  }, [loginRedirect, state.isAuthenticated, state.hasCredentials, setMockDataMode]);

  /**
   * AWS 서비스 생성 함수
   */
  const createAWSService = useCallback(async <T,>(ServiceClass: new (config: AWS.ConfigurationOptions) => T): Promise<T> => {
    // 부분 인증 상태 확인
    if (sessionStorage.getItem('partialAuthState') === 'true') {
      throw new Error('부분 인증 상태입니다. AWS 서비스를 사용할 수 없습니다.');
    }

    // 자격 증명 초기화 시도
    const credentialsReady = await initializeCredentials();

    if (!credentialsReady || !awsCredentials) {
      throw new Error('AWS 자격 증명을 설정할 수 없습니다. 먼저 로그인하세요.');
    }

    // AWS 서비스 인스턴스 생성
    return new ServiceClass({
      credentials: awsCredentials,
      region: AWS.config.region || 'ap-northeast-2'
    });
  }, [initializeCredentials]);

  // 초기 로드 시 인증 확인 및 이벤트 리스너 설정
  useEffect(() => {
    // 초기 인증 상태 확인
    const initialAuthCheck = async () => {
      try {
        // 최대 5초 후에는 어떻게든 로딩 상태 해제 보장
        const timeoutPromise = new Promise(resolve => 
          setTimeout(() => {
            setState(prev => ({ ...prev, loading: false }));
            resolve(false);
          }, 5000)
        );
        
        // 인증 상태 확인 시도
        const authPromise = checkAuthStatus(true).catch(err => {
          console.error('초기 인증 상태 확인 중 오류:', err);
          return false;
        });
        
        // 둘 중 먼저 완료되는 것을 사용
        await Promise.race([authPromise, timeoutPromise]);
        
        // 어떤 경우에도 로딩은 완료 처리
        setState(prev => ({ ...prev, loading: false }));
      } catch (err) {
        console.error('초기 인증 상태 확인 중 예기치 못한 오류:', err);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    initialAuthCheck();

    // Auth 이벤트 리스너 설정
    const listener = Hub.listen('auth', ({ payload }) => {
      console.log('Auth 이벤트:', payload.event);

      switch (payload.event) {
        case 'signedIn':
          setTimeout(() => {
            checkAuthStatus(true).catch(err =>
              console.error('로그인 후 인증 상태 확인 중 오류:', err)
            );
          }, 500);
          break;

        case 'signedOut':
          console.log('signedOut 이벤트 감지 - 상태 초기화');
          setState({
            isAuthenticated: false,
            userAttributes: null,
            username: '',
            userRole: 'student',
            loading: false,
            hasCredentials: false,
            useMockData: false
          });

          awsCredentials = null;
          credentialsInitialized = false;
          sessionStorage.clear();
          setLastRefresh(0);
          break;

        case 'tokenRefresh':
          if (state.isAuthenticated) {
            // 디바운스 처리
            if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = window.setTimeout(() => {
              checkAuthStatus(true).catch(err =>
                console.error('토큰 갱신 중 오류:', err)
              );
              debounceTimerRef.current = null;
            }, 100);
          }
          break;

        case 'tokenRefresh_failure':
          console.error('토큰 갱신 실패');
          sessionStorage.setItem('partialAuthState', 'true');
          setMockDataMode(true);
          setState(prev => ({
            ...prev,
            hasCredentials: false,
            useMockData: true
          }));
          break;
      }
    });

    // 전역 오류 리스너
    const globalErrorHandler = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes("자격 증명이 없습니다") ||
        event.error?.message?.includes("No credentials")
      ) {
        if (sessionStorage.getItem('partialAuthState') === 'true') {
          return;
        }

        // 디바운스 처리
        if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = window.setTimeout(() => {
          checkAuthStatus(true)
            .then(isAuth => {
              if (!isAuth) {
                handleAuthError(event.error);
              }
            })
            .catch(err => {
              console.error('오류 처리 중 추가 오류:', err);
              handleAuthError(event.error);
            });
          debounceTimerRef.current = null;
        }, 100);
      }
    };

    window.addEventListener('error', globalErrorHandler);

    return () => {
      listener();
      window.removeEventListener('error', globalErrorHandler);
      // 타이머 정리
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [checkAuthStatus, handleAuthError, setMockDataMode]);

  // 부분 인증 상태 감지 시 모의 데이터 모드 자동 활성화 - 초기 한번만 실행
  useEffect(() => {
    // 이미 처리 중이면 중단
    if (processingRef.current) return;
    
    const isPartialAuth = sessionStorage.getItem('partialAuthState') === 'true';
    
    if (isPartialAuth && !state.useMockData) {
      processingRef.current = true;
      
      // 지연 시간을 늘려 잦은 상태 업데이트 방지
      setTimeout(() => {
        if (!state.useMockData) { // 상태 재확인
          setMockDataMode(true);
        }
        processingRef.current = false;
      }, 300);
    }
  }, []); // 의존성 배열 비움 - 마운트 시 한 번만 실행

  // 인증 컨텍스트의 모든 값을 생성
  const value = useMemo(() => ({
    ...state,
    checkAuthStatus,
    logout,
    loginRedirect,
    handleAuthError,
    refreshCredentials,
    createAWSService,
    setMockDataMode
  }), [
    state,
    checkAuthStatus,
    logout,
    loginRedirect,
    handleAuthError,
    refreshCredentials,
    createAWSService,
    setMockDataMode
  ]);

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
 * 인증 에러 처리 래퍼 함수
 */
export const withAuthErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  authContext: { handleAuthError: (error: any) => void }
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await apiFunction(...args);
    } catch (error: any) {
      // 인증 오류 확인
      const isAuthError =
        error.message?.includes("자격 증명이 없습니다") ||
        error.message?.includes("No credentials") ||
        error.message?.includes("expired") ||
        error.name === 'NotAuthorizedException';

      // 인증 오류인 경우 처리기 호출
      if (isAuthError && authContext.handleAuthError) {
        authContext.handleAuthError(error);
      }

      throw error;
    }
  };
};

/**
 * 인증 오류 처리 핸들러를 생성하는 함수
 */
export const createAuthErrorHandler = (
  errorCallback: (error: any) => void,
  navigate?: (path: string) => void,
  loginPath: string = '/signin'
): { handleAuthError: (error: any) => void } => {
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