// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchAuthSession, getCurrentUser, fetchUserAttributes, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import AWS from 'aws-sdk';

// 로그 레벨 타입 및 우선순위 정의
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// 환경에 따른 로그 레벨 조정
const LOG_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'error' : 'info';

// 로그 레벨 비교 헬퍼 함수
const isLogEnabled = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[LOG_LEVEL];
};

const logDebug = (...args: any[]) => {
  if (!isLogEnabled('debug')) return;
  console.debug(...args);
};

const logInfo = (...args: any[]) => {
  if (!isLogEnabled('info')) return;
  console.log(...args);
};

const logWarn = (...args: any[]) => {
  if (!isLogEnabled('warn')) return;
  console.warn(...args);
};

const logError = (...args: any[]) => {
  if (!isLogEnabled('error')) return;
  console.error(...args);
};

// 인증 컨텍스트 타입 정의
interface AuthContextValue {
  isAuthenticated: boolean;
  userAttributes: any;
  username: string;
  userRole: string;
  loading: boolean;
  hasCredentials: boolean;
  useMockData: boolean; // 모의 데이터 모드 플래그 추가
  checkAuthStatus: (force?: boolean) => Promise<boolean>;
  logout: (global?: boolean) => Promise<void>;
  loginRedirect: (returnPath?: string) => void;
  handleAuthError: (error: any) => void;
  refreshCredentials: () => Promise<boolean>;
  createAWSService: <T>(ServiceClass: new (config: AWS.ConfigurationOptions) => T) => Promise<T>;
  setMockDataMode: (enabled: boolean) => void; // 모의 데이터 모드 설정 함수 추가
}

// 인증 상태 타입 정의
interface AuthState {
  isAuthenticated: boolean;
  userAttributes: any;
  username: string;
  userRole: string;
  loading: boolean;
  hasCredentials: boolean;
  useMockData: boolean; // 모의 데이터 모드 플래그 추가
}

// Auth 에러 핸들러 인터페이스
interface AuthErrorHandlerContext {
  handleAuthError: (error: any) => void;
  isAuthenticated?: boolean;
  checkAuthStatus?: (force?: boolean) => Promise<boolean>;
  refreshCredentials?: () => Promise<boolean>;
}

// 전역 타입 정의
declare global {
  interface Window {
    // 문자열 키도 허용하도록 타입 수정
    timeoutIds: Record<string | number, boolean>;
    loginRedirect?: (path: string) => void;
  }
}

// Context 생성
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// 토큰 갱신 제한을 위한 변수
let tokenRefreshAttempts = 0;
const MAX_TOKEN_REFRESH_ATTEMPTS = 3;
let tokenRefreshLastAttempt = 0;
const TOKEN_REFRESH_MIN_INTERVAL = 300000; // 5분

// 중복 인증 요청 방지를 위한 변수
let authCheckInProgress = false;

// AWS 자격 증명 저장 변수
let awsCredentials: AWS.Credentials | null = null;
let credentialsInitialized = false;
let lastCredentialAttempt = 0;

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
    hasCredentials: false,
    useMockData: sessionStorage.getItem('useMockData') === 'true'
  });

  // 마지막 새로고침 시간 추적
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  // 최초 앱 로딩 시 인증 확인 횟수 제한
  const [initialAuthChecked, setInitialAuthChecked] = useState<boolean>(false);

  // 인증 확인 중인 Promise를 추적하기 위한 ref
  const authCheckPromiseRef = useRef<Promise<boolean> | null>(null);

  /**
   * 안전한 setTimeout 함수 - 메모리 누수 방지
   */
  const safeSetTimeout = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const timeoutIds = window.timeoutIds = window.timeoutIds || {};
    const id = setTimeout(callback, delay);

    // ID를 문자열로 변환하여 사용
    const idKey = String(id);
    timeoutIds[idKey] = true;

    return id;
  }, []);

  /**
   * 모의 데이터 모드 설정 함수
   */
  const setMockDataMode = useCallback((enabled: boolean) => {
    if (enabled) {
      sessionStorage.setItem('useMockData', 'true');
    } else {
      sessionStorage.removeItem('useMockData');
    }
    
    setState(prev => ({
      ...prev,
      useMockData: enabled
    }));
    
    logInfo(`모의 데이터 모드 \${enabled ? '활성화' : '비활성화'}`);
  }, []);

  /**
   * AWS 자격 증명 초기화 함수 - 개선됨
   */
  const initializeCredentials = useCallback(async (force = false): Promise<boolean> => {
    // 부분 인증 상태가 이미 확인되었고 강제 갱신이 아니면 재시도하지 않음
    if (!force && sessionStorage.getItem('partialAuthState') === 'true') {
      logInfo('부분 인증 상태 인식됨 - AWS 자격 증명 초기화 건너뜀');
      return false;
    }

    // 중복 호출 방지 (10초 내 재시도 방지)
    const now = Date.now();
    if (!force && credentialsInitialized && awsCredentials &&
      now - lastCredentialAttempt < 10000) {
      return true;
    }

    lastCredentialAttempt = now;

    try {
      // 세션 상태 확인
      const session = await fetchAuthSession();

      // 토큰이 없으면 로그인되지 않은 상태
      if (!session.tokens) {
        logInfo('사용자가 로그인되어 있지 않습니다.');
        awsCredentials = null;
        credentialsInitialized = false;
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          hasCredentials: false
        }));
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
        credentialsInitialized = true;
        logInfo('AWS SDK 자격 증명 설정 완료');

        // 부분 인증 상태 플래그 제거 (완전한 인증 상태로 전환됨)
        sessionStorage.removeItem('partialAuthState');
        // 모의 데이터 모드 비활성화
        setMockDataMode(false);

        setState(prev => ({
          ...prev,
          hasCredentials: true,
          useMockData: false
        }));

        return true;
      }

      // 토큰은 있지만 자격 증명이 없는 부분 인증 상태
      logInfo('세션에 자격 증명이 없습니다 - 부분 인증 상태');

      // 부분 인증 상태 플래그 설정
      sessionStorage.setItem('partialAuthState', 'true');
      
      // 모의 데이터 모드 자동 활성화
      setMockDataMode(true);

      credentialsInitialized = false;
      awsCredentials = null;
      setState(prev => ({
        ...prev,
        hasCredentials: false,
        useMockData: true
      }));

      return false;
    } catch (err) {
      logError('AWS 자격 증명 설정 실패:', err);
      credentialsInitialized = false;
      awsCredentials = null;
      setState(prev => ({
        ...prev,
        hasCredentials: false,
        useMockData: true
      }));
      
      // 부분 인증 상태 플래그 설정
      sessionStorage.setItem('partialAuthState', 'true');
      // 모의 데이터 모드 자동 활성화
      setMockDataMode(true);
      
      return false;
    }
  }, [setMockDataMode]);

  /**
   * 인증 상태 확인 함수 - 개선됨
   */
  const checkAuthStatus = useCallback(async (force = false): Promise<boolean> => {
    // 이미 진행 중인 인증 확인이 있으면 그 Promise를 반환
    if (authCheckPromiseRef.current && !force) {
      logInfo('이미 인증 확인이 진행 중입니다. 기존 요청을 반환합니다.');
      return authCheckPromiseRef.current;
    }

    // 중복 실행 방지
    if (authCheckInProgress && !force) {
      logInfo('이미 인증 확인 중입니다. 중복 요청 무시.');
      return state.isAuthenticated;
    }

    // 캐시 유효성 확인 - 부분 인증 상태일 때 더 오래 캐싱
    const now = Date.now();
    const CACHE_TTL = 120000; // 2분
    const PARTIAL_AUTH_CACHE_TTL = 300000; // 5분 (부분 인증 상태)
    const isPartialAuth = sessionStorage.getItem('partialAuthState') === 'true';
    
    if (!force && 
        now - lastRefresh < (isPartialAuth ? PARTIAL_AUTH_CACHE_TTL : CACHE_TTL) && 
        state.isAuthenticated) {
      logInfo('최근에 이미 인증 확인 완료. 캐시된 상태 반환.');
      return state.isAuthenticated;
    }
    
    // 부분 인증 상태에서 짧은 시간 내 반복 호출 제한 (1분)
    if (isPartialAuth && !force && now - lastRefresh < 60000) {
      logInfo('부분 인증 상태 - 짧은 시간 내 반복 호출 제한');
      return state.isAuthenticated;
    }

    // 로딩 플래그 설정
    authCheckInProgress = true;
    setState(prev => ({ ...prev, loading: true }));

    // 새 인증 확인 Promise 생성 및 저장
    const authCheckPromise = (async (): Promise<boolean> => {
      try {
        // 세션 가져오기
        let session;
        try {
          session = await fetchAuthSession();
        } catch (sessionError) {
          logError('세션 가져오기 실패:', sessionError);
          setState({
            isAuthenticated: false,
            userAttributes: null,
            username: '',
            userRole: 'student',
            loading: false,
            hasCredentials: false,
            useMockData: false
          });
          return false;
        }

        // 토큰이 없으면 로그아웃 상태
        if (!session.tokens) {
          logInfo('유효한 토큰 없음, 로그아웃 상태');
          setState({
            isAuthenticated: false,
            userAttributes: null,
            username: '',
            userRole: 'student',
            loading: false,
            hasCredentials: false,
            useMockData: false
          });

          // 세션 스토리지 정리
          sessionStorage.removeItem('userAttributes');
          sessionStorage.removeItem('userAttributesTimestamp');
          sessionStorage.removeItem('partialAuthState');
          sessionStorage.removeItem('limitFetchAttributes');
          sessionStorage.removeItem('useMockData');

          return false;
        }

        // 자격 증명 상태 업데이트
        await initializeCredentials(force);

        // 부분 인증 상태 처리 (자격 증명 없음)
        if (!session.credentials) {
          logInfo('자격 증명 없음, 토큰만 있는 상태 - 부분 인증 상태 처리');
          
          try {
            // 이미 캐싱된 속성이 있는지 확인
            const cachedAttributes = sessionStorage.getItem('userAttributes');
            const cachedUsername = sessionStorage.getItem('username');
            
            if (cachedAttributes && cachedUsername) {
              logInfo('캐싱된 사용자 정보 사용 (부분 인증 상태)');
              setState({
                isAuthenticated: true,
                userAttributes: JSON.parse(cachedAttributes),
                username: cachedUsername,
                userRole: JSON.parse(cachedAttributes).profile || 'student',
                loading: false,
                hasCredentials: false,
                useMockData: true // 부분 인증 상태에서 항상 모의 데이터 사용
              });
              
              // 부분 인증 상태 표시
              sessionStorage.setItem('partialAuthState', 'true');
              // 모의 데이터 모드 자동 활성화
              setMockDataMode(true);
              
              setLastRefresh(now);
              
              return true;
            }
            
            // 먼저 사용자 기본 정보만 가져오기
            const user = await getCurrentUser();
            
            // 속성 가져오기 시도 - 오류 발생 가능성이 높음
            let attributes = {};
            try {
              attributes = await fetchUserAttributes();
              // 성공적으로 가져온 경우 캐싱
              sessionStorage.setItem('userAttributes', JSON.stringify(attributes));
              sessionStorage.setItem('username', user.username);
            } catch (attributesError) {
              logInfo('사용자 속성 가져오기 실패 - 제한된 모드로 진행:', attributesError);
              // 기본 정보만 사용하는 제한 모드 표시
              sessionStorage.setItem('limitFetchAttributes', 'true');
            }
            
            // 부분 인증 상태 설정
            setState({
              isAuthenticated: true,
              userAttributes: attributes || {},
              username: user.username,
              userRole: (attributes as any)?.profile || 'student',
              loading: false,
              hasCredentials: false,
              useMockData: true // 부분 인증 상태에서 항상 모의 데이터 사용
            });
            
            // 부분 인증 상태 플래그 설정
            sessionStorage.setItem('partialAuthState', 'true');
            // 모의 데이터 모드 자동 활성화
            setMockDataMode(true);
            setLastRefresh(now);
            
            return true;
          } catch (userError) {
            // 사용자 기본 정보도 가져올 수 없으면 로그아웃
            logError('사용자 정보 가져오기 실패:', userError);
            try {
              await signOut();
            } catch (signOutError) {
              logWarn('로그아웃 처리 중 오류:', signOutError);
            }
            
            setState({
              isAuthenticated: false,
              userAttributes: null,
              username: '',
              userRole: 'student',
              loading: false,
              hasCredentials: false,
              useMockData: false
            });
            
            return false;
          }
        }
        
        // 정상 인증 상태 (토큰과 자격 증명이 모두 있음)
        try {
          const user = await getCurrentUser();
          const attributes = await fetchUserAttributes();
          
          // 상태 업데이트
          setState({
            isAuthenticated: true,
            userAttributes: attributes,
            username: user.username,
            userRole: attributes.profile || 'student',
            loading: false,
            hasCredentials: true,
            useMockData: false // 완전한 인증 상태에서는 모의 데이터 비활성화
          });
          
          // 세션 저장
          sessionStorage.setItem('userAttributes', JSON.stringify(attributes));
          sessionStorage.setItem('userAttributesTimestamp', now.toString());
          sessionStorage.setItem('username', user.username);
          sessionStorage.removeItem('partialAuthState');
          sessionStorage.removeItem('limitFetchAttributes');
          sessionStorage.removeItem('useMockData');
          
          setLastRefresh(now);
          return true;
        } catch (userError) {
          logError('사용자 정보 가져오기 실패:', userError);
          
          // 사용자 정보는 가져올 수 없지만 토큰이 있는 경우
          setState({
            isAuthenticated: true,
            userAttributes: {},
            username: 'unknown',
            userRole: 'student',
            loading: false,
            hasCredentials: !!session.credentials,
            useMockData: !session.credentials // 자격 증명 여부에 따라 모의 데이터 모드 설정
          });
          
          return true;
        }
      } catch (error) {
        logError('인증 확인 중 오류:', error);
        
        // 오류 발생 시 로그아웃 상태로 설정
        setState({
          isAuthenticated: false,
          userAttributes: null,
          username: '',
          userRole: 'student',
          loading: false,
          hasCredentials: false,
          useMockData: false
        });
        
        return false;
      } finally {
        // 로딩 상태 종료
        authCheckInProgress = false;
        setState(prev => ({ ...prev, loading: false }));

        // 첫 인증 확인 완료 표시
        if (!initialAuthChecked) {
          setInitialAuthChecked(true);
        }

        // 참조된 Promise 제거
        authCheckPromiseRef.current = null;
      }
    })();

    // 현재 실행 중인 인증 확인 Promise 저장
    authCheckPromiseRef.current = authCheckPromise;

    return authCheckPromise;
  }, [lastRefresh, state.isAuthenticated, initializeCredentials, setMockDataMode]);

  /**
   * AWS 자격 증명 갱신 함수 - 개선됨
   */
  const refreshCredentials = useCallback(async (): Promise<boolean> => {
    logInfo('AWS 자격 증명 수동 갱신 시도...');

    try {
      // 인증 상태 강제 갱신
      await checkAuthStatus(true);

      // 자격 증명 확인
      const success = await initializeCredentials(true);

      if (success) {
        logInfo('AWS 자격 증명 갱신 성공');
        // 토큰 갱신 카운터 초기화
        tokenRefreshAttempts = 0;
        // 부분 인증 상태 플래그 제거
        sessionStorage.removeItem('partialAuthState');
        sessionStorage.removeItem('limitFetchAttributes');
        // 모의 데이터 모드 비활성화
        setMockDataMode(false);
        return true;
      } else {
        logInfo('AWS 자격 증명 갱신 실패');
        // 부분 인증 상태 플래그 설정
        sessionStorage.setItem('partialAuthState', 'true');
        // 모의 데이터 모드 활성화
        setMockDataMode(true);
        return false;
      }
    } catch (error) {
      logError('AWS 자격 증명 갱신 중 오류:', error);
      // 부분 인증 상태 플래그 설정
      sessionStorage.setItem('partialAuthState', 'true');
      // 모의 데이터 모드 활성화
      setMockDataMode(true);
      return false;
    }
  }, [checkAuthStatus, initializeCredentials, setMockDataMode]);

  /**
   * 로그아웃 처리 함수
   */
  const logout = useCallback(async (global = false) => {
    logInfo('로그아웃 시작');

    // 모든 타이머 정리
    const timeoutIds = window.timeoutIds || {};
    for (const id in timeoutIds) {
      clearTimeout(Number(id));
      delete timeoutIds[id];
    }

    try {
      await signOut({ global });
    } catch (signOutError) {
      logWarn('로그아웃 처리 중 오류:', signOutError);
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

    // Cognito 관련 모든 항목 제거
    Object.keys(localStorage).forEach(key => {
      if (key.includes('CognitoIdentityServiceProvider') ||
        key.includes('amplify-signin')) {
        localStorage.removeItem(key);
      }
    });

    // 토큰 관련 변수 초기화
    tokenRefreshAttempts = 0;
    tokenRefreshLastAttempt = 0;
    setLastRefresh(0);

    logInfo('로그아웃 완료');
    return;
  }, []);

  /**
   * 로그인 페이지로 리디렉션하는 함수
   */
  const loginRedirect = useCallback((returnPath?: string) => {
    const returnUrl = returnPath || window.location.pathname;
    window.location.href = `/signin?returnTo=\${encodeURIComponent(returnUrl)}`;
  }, []);

  /**
   * 인증 오류 처리 함수 - 개선됨
   */
  const handleAuthError = useCallback((error: any) => {
    // 자격 증명 관련 오류인지 확인
    const isCredentialError =
      error.message?.includes("자격 증명이 없습니다") ||
      error.message?.includes("세션에 유효한 자격 증명이 없습니다") ||
      error.message?.includes("No credentials");

    // 토큰 만료 오류인지 확인
    const isTokenError =
      error.message?.includes("expired") ||
      error.name === 'NotAuthorizedException' ||
      error.code === 'NotAuthorizedException';

    // 부분 인증 상태에서 자격 증명 오류인 경우
    if (isCredentialError && state.isAuthenticated && !state.hasCredentials) {
      logInfo('자격 증명 오류 감지 - 부분 인증 상태');
      // 이미 부분 인증 상태임을 표시
      sessionStorage.setItem('partialAuthState', 'true');
      // 모의 데이터 모드 활성화
      setMockDataMode(true);
      return; // 이미 부분 인증 상태이므로 별도 조치 필요 없음
    }

    // 토큰 만료 또는 심각한 인증 오류인 경우
    if (isTokenError || (isCredentialError && !state.hasCredentials && !state.isAuthenticated)) {
      logInfo('인증 세션 만료 또는 심각한 오류, 로그아웃 처리');

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

      // 로그인 페이지로 리다이렉트
      const currentPath = window.location.pathname;
      loginRedirect(currentPath);
    }
  }, [loginRedirect, state.isAuthenticated, state.hasCredentials, setMockDataMode]);

  /**
   * AWS 서비스 생성 함수
   */
  const createAWSService = useCallback(async <T,>(ServiceClass: new (config: AWS.ConfigurationOptions) => T): Promise<T> => {
    // 부분 인증 상태 확인
    if (sessionStorage.getItem('partialAuthState') === 'true') {
      throw new Error('부분 인증 상태입니다. AWS 서비스를 사용할 수 없습니다. 자격 증명을 갱신하거나 로그아웃 후 다시 로그인해 주세요.');
    }

    // 자격 증명 초기화 시도
    const credentialsReady = await initializeCredentials();

    if (!credentialsReady || !awsCredentials) {
      throw new Error('AWS 자격 증명을 설정할 수 없습니다. 먼저 로그인하세요.');
    }

    // AWS 서비스 인스턴스 생성
    return new ServiceClass({
      credentials: awsCredentials,
      region: AWS.config.region
    });
  }, [initializeCredentials]);

  // 초기 로드 시 인증 확인 및 이벤트 리스너 설정
  useEffect(() => {
    // 앱 초기화 시 timeoutIds 객체 준비
    window.timeoutIds = window.timeoutIds || {};

    // 초기 인증 상태 확인 (지연 실행)
    const initialAuthCheck = async () => {
      // 첫 확인 시에는 잠시 지연 (다른 초기화와의 충돌 방지)
      await new Promise(resolve => setTimeout(resolve, 200));
      try {
        await checkAuthStatus(true);
      } catch (err) {
        logError('초기 인증 상태 확인 중 오류:', err);
      }
    };

    initialAuthCheck();

    // Auth 이벤트 리스너 설정
    const listener = Hub.listen('auth', ({ payload }) => {
      logInfo('Auth 이벤트:', payload.event);

      // 부분 인증 상태 및 모의 데이터 모드 확인
      const isPartialAuth = sessionStorage.getItem('partialAuthState') === 'true';
      const isLimitedMode = sessionStorage.getItem('limitFetchAttributes') === 'true';

      switch (payload.event) {
        case 'signedIn':
          // 로그인 시 자격 증명 초기화 (지연 적용)
          safeSetTimeout(() => {
            checkAuthStatus(true).catch(err =>
              logError('로그인 후 인증 상태 확인 중 오류:', err)
            );
          }, 500);
          break;

        case 'signedOut':
          logInfo('signedOut 이벤트 감지 - 상태 초기화');
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
          // 부분 인증 상태 또는 제한된 모드에서는 최소한의 처리만 수행
          if (isPartialAuth || isLimitedMode) {
            logInfo('제한된 인증 모드에서는 토큰 갱신 처리를 최소화합니다');
            // 토큰 갱신 카운터를 최대값에 가깝게 설정하여 자격 증명 갱신 시도 제한
            tokenRefreshAttempts = MAX_TOKEN_REFRESH_ATTEMPTS - 1;
            return;
          }
          
          // 로그인 상태가 아니면 처리하지 않음
          if (!state.isAuthenticated) {
            logInfo('로그아웃 상태. 토큰 갱신 중단');
            return;
          }

          const now = Date.now();

          // 토큰 갱신 제한 - 시간 제한 강화
          if (now - tokenRefreshLastAttempt < TOKEN_REFRESH_MIN_INTERVAL * 2) {
            logInfo('토큰 갱신 제한: 너무 빈번한 요청');
            return;
          }

          // 최대 시도 횟수 초과 시 긴 시간 후에 재시도
          if (tokenRefreshAttempts >= MAX_TOKEN_REFRESH_ATTEMPTS) {
            if (now - tokenRefreshLastAttempt > 24 * 60 * 60 * 1000) { // 24시간
              logInfo('토큰 갱신 카운터 초기화 (24시간 경과)');
              tokenRefreshAttempts = 0;
            } else {
              logInfo(`토큰 갱신 제한: 최대 시도 횟수 초과 (\${tokenRefreshAttempts}/\${MAX_TOKEN_REFRESH_ATTEMPTS})`);
              return;
            }
          }

          // 토큰 갱신 시도
          logInfo(`토큰 갱신 시도 \${tokenRefreshAttempts + 1}/\${MAX_TOKEN_REFRESH_ATTEMPTS}`);
          tokenRefreshAttempts++;
          tokenRefreshLastAttempt = now;

          // 비동기 실행으로 UI 차단 방지
          safeSetTimeout(async () => {
            try {
              await checkAuthStatus(true);
            } catch (refreshError) {
              logError('토큰 갱신 중 오류:', refreshError);
            }
          }, 100);
          break;

        case 'tokenRefresh_failure':
          logError('토큰 갱신 실패');
          
          // 부분 인증 상태로 전환하고 모의 데이터 모드 활성화
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
      // 자격 증명 관련 오류만 처리
      if (
        event.error?.message?.includes("자격 증명이 없습니다") ||
        event.error?.message?.includes("세션에 유효한 자격 증명이 없습니다") ||
        event.error?.message?.includes("No credentials")
      ) {
        // 부분 인증 상태에서의 자격 증명 오류는 무시
        if (sessionStorage.getItem('partialAuthState') === 'true') {
          logInfo('부분 인증 상태 - 자격 증명 오류 무시');
          return;
        }

        // 인증 상태 확인
        checkAuthStatus(true)
          .then(isAuth => {
            // 인증되지 않은 상태라면 오류 처리
            if (!isAuth) {
              handleAuthError(event.error);
            }
          })
          .catch(err => {
            logError('오류 처리 중 추가 오류:', err);
            handleAuthError(event.error);
          });
      }
    };

    window.addEventListener('error', globalErrorHandler);

    // 클린업 함수
    return () => {
      listener();
      window.removeEventListener('error', globalErrorHandler);

      // 모든 타이머 정리
      const timeoutIds = window.timeoutIds || {};
      for (const id in timeoutIds) {
        clearTimeout(parseInt(id));
        delete timeoutIds[id];
      }
    };
  }, [checkAuthStatus, handleAuthError, safeSetTimeout, setMockDataMode]);

  // 부분 인증 상태 감지 시 모의 데이터 모드 자동 활성화
  useEffect(() => {
    if (sessionStorage.getItem('partialAuthState') === 'true' && !state.useMockData) {
      logInfo('부분 인증 상태 감지 - 자동으로 모의 데이터 모드 활성화');
      setMockDataMode(true);
    }
  }, [state.isAuthenticated, state.hasCredentials, state.useMockData, setMockDataMode]);

  // 전역 함수 설정
  useEffect(() => {
    window.loginRedirect = loginRedirect;
  }, [loginRedirect]);

  // 컨텍스트 값 메모이제이션
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
 * 인증 에러 처리 래퍼 함수 - 개선됨
 */
export const withAuthErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  authContext: AuthErrorHandlerContext
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // 자격 증명 상태 확인
    if (authContext.isAuthenticated === false) {
      // 인증되지 않은 경우 로그인 필요
      authContext.handleAuthError(new Error('인증이 필요합니다. 로그인해주세요.'));
      throw new Error('인증이 필요합니다');
    }
    
    // 부분 인증 상태 확인 (자격 증명 부재 확인)
    if (sessionStorage.getItem('partialAuthState') === 'true') {
      logWarn('부분 인증 상태: AWS 자격 증명이 없어 API 호출이 실패할 수 있습니다');
      
      // 자격 증명 갱신 시도 - 처음 한 번만 시도
      const attemptedRefresh = sessionStorage.getItem('attemptedCredentialsRefresh');
      
      if (!attemptedRefresh && authContext.refreshCredentials) {
        try {
          sessionStorage.setItem('attemptedCredentialsRefresh', 'true');
          const refreshed = await authContext.refreshCredentials();
          if (!refreshed) {
            logInfo('자격 증명 갱신 실패, 계속 진행');
          } else {
            logInfo('자격 증명 갱신 성공, API 호출 진행');
            // 갱신 성공 플래그 제거
            sessionStorage.removeItem('attemptedCredentialsRefresh');
          }
        } catch (refreshError) {
          logError('자격 증명 갱신 중 오류:', refreshError);
        }
      }
    }

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

      // 인증 오류인 경우 자격 증명 문제로 표시하고 처리기 호출
      if (isAuthError) {
        logError('API 호출 중 AWS 자격 증명 오류:', error);
        sessionStorage.setItem('partialAuthState', 'true');  // 부분 인증 상태 표시
        
        if (authContext.handleAuthError) {
          authContext.handleAuthError(error);
        }
      }

      throw error;
    }
  };
};

// AuthErrorHandlerContext 인터페이스는 이미 위에 정의되어 있음

/**
 * API 호출 시 인증 컨텍스트와 함께 사용하기 위한 헬퍼 함수
 */
export const createAuthErrorHandler = (
  errorCallback: (error: any) => void,
  navigate?: (path: string) => void,
  loginPath: string = '/signin'
): AuthErrorHandlerContext => {
  return {
    handleAuthError: (error: any) => {
      logError('인증 오류:', error);
      errorCallback(error);
      if (navigate) {
        navigate(loginPath);
      }
    }
  };
};