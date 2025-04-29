// src/utils/authDebugger.ts
import { fetchAuthSession, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

// 로그 함수들
const logInfo = (message: string, ...params: any[]) => console.info(`[Auth Debug] \${message}`, ...params);
const logWarn = (message: string, ...params: any[]) => console.warn(`[Auth Debug] \${message}`, ...params);
const logError = (message: string, ...params: any[]) => console.error(`[Auth Debug] \${message}`, ...params);
const logDebug = (message: string, ...params: any[]) => console.debug(`[Auth Debug] \${message}`, ...params);

/**
 * 현재 인증 상태를 디버깅하는 유틸리티 함수
 */
export async function debugAuthState(): Promise<void> {
  logInfo('===== 인증 상태 확인 시작 =====');
  
  try {
    // 1. 현재 인증된 사용자 확인
    try {
      const user = await getCurrentUser();
      logInfo('현재 사용자 정보:', user);
      
      // 사용자 속성 가져오기
      try {
        const attributes = await fetchUserAttributes();
        logInfo('사용자 속성:', attributes);
        
        // 역할 정보 확인
        const profile = attributes.profile;
        if (profile) {
          logInfo(`사용자 역할: \${profile}`);
        }
      } catch (attrError) {
        logWarn('사용자 속성 가져오기 실패:', attrError);
      }
    } catch (userError) {
      logWarn('인증된 사용자 없음:', userError);
    }
    
    // 2. 인증 세션 상태 확인
    try {
      const session = await fetchAuthSession();
      
      // 세션 기본 정보
      logInfo('세션 정보:', {
        hasSession: !!session,
        hasTokens: !!session?.tokens,
        identityId: session?.identityId || 'none'
      });
      
      // 토큰이 있는 경우 상세 정보 확인
      if (session?.tokens) {
        const { idToken, accessToken } = session.tokens;
        const now = Math.floor(Date.now() / 1000);
        
        if (idToken) {
          // 안전하게 속성 접근
          const payload = idToken.payload || {};
          const exp = payload.exp || 0;
          const iat = payload.iat || 0;
          const timeLeft = exp - now;
          
          logInfo('ID 토큰 정보:', {
            // iat가 있는 경우에만 issuedAt 정보 포함
            ...(iat ? { issuedAt: new Date(iat * 1000).toLocaleString() } : {}),
            expireTime: new Date(exp * 1000).toLocaleString(),
            minutesRemaining: Math.round(timeLeft / 60),
            expired: timeLeft <= 0
          });
        }
        
        if (accessToken) {
          // 안전하게 속성 접근
          const payload = accessToken.payload || {};
          const exp = payload.exp || 0;
          const timeLeft = exp - now;
          
          logInfo('액세스 토큰 정보:', {
            expireTime: new Date(exp * 1000).toLocaleString(),
            minutesRemaining: Math.round(timeLeft / 60),
            expired: timeLeft <= 0
          });
        }
      } else {
        logWarn('유효한 토큰 없음');
      }
    } catch (sessionError) {
      logError('세션 확인 실패:', sessionError);
    }
  } catch (e) {
    logError('인증 상태 확인 중 오류 발생:', e);
  }
  
  logInfo('===== 인증 상태 확인 완료 =====');
}

/**
 * 인증 상태 요약을 간략하게 반환하는 함수
 * @returns 인증 상태 요약 객체
 */
export async function getAuthSummary() {
  try {
    // 기본 상태 초기화
    const summary = {
      isAuthenticated: false,
      username: null as string | null,
      roles: [] as string[],
      tokenExpiresIn: 0
    };
    
    try {
      // 사용자 확인
      const user = await getCurrentUser();
      summary.isAuthenticated = true;
      summary.username = user.username;
      
      // 속성 확인
      const attributes = await fetchUserAttributes();
      if (attributes.profile) {
        summary.roles.push(attributes.profile);
      }
      
      // 토큰 정보 확인
      const session = await fetchAuthSession();
      if (session?.tokens?.idToken) {
        const now = Math.floor(Date.now() / 1000);
        const exp = session.tokens.idToken.payload?.exp || 0;
        summary.tokenExpiresIn = Math.max(0, exp - now);
      }
    } catch (e) {
      // 인증되지 않은 상태
    }
    
    return summary;
  } catch (e) {
    return {
      isAuthenticated: false,
      username: null,
      roles: [],
      tokenExpiresIn: 0,
      error: e
    };
  }
}