// src/utils/authListener.ts
import { Hub } from 'aws-amplify/utils';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { AuthUser } from 'aws-amplify/auth';

// 인증 이벤트 유형에 따른 데이터 타입 (예시)
type AuthEventData = {
  user?: AuthUser;
  username?: string;
  attributes?: Record<string, any>;
  [key: string]: any;  // 다른 속성들
};

// 커스텀 로거 (logger.ts가 없는 경우 직접 콘솔 사용)
class AuthLogger {
  debug(msg: string, ...args: any[]) { console.debug(`[Auth] \${msg}`, ...args); }
  info(msg: string, ...args: any[]) { console.info(`[Auth] \${msg}`, ...args); }
  warn(msg: string, ...args: any[]) { console.warn(`[Auth] \${msg}`, ...args); }
  error(msg: string, ...args: any[]) { console.error(`[Auth] \${msg}`, ...args); }
}

const logger = new AuthLogger();

// 인증 이벤트 리스너 설정
export function setupAuthListener() {
  return Hub.listen('auth', ({ payload }) => {
    // 이벤트 이름 추출
    const eventName = payload.event as AuthEventName;
    
    // 이벤트에 따른 데이터 안전하게 처리
    switch (eventName) {
      case 'signedIn':
        // signedIn 이벤트는 데이터가 없을 수 있음
        logger.info('사용자 로그인됨');
        break;
      
      case 'signedOut':
        logger.info('사용자 로그아웃됨');
        break;
      
      case 'tokenRefresh':
        logger.debug('토큰 갱신됨');
        break;
      
      case 'tokenRefresh_failure':
        // TypeScript가 payload의 구조를 완전히 이해하지 못하는 경우를 위한 타입 단언
        const failureData = (payload as any).data;
        logger.error('토큰 갱신 실패:', failureData || '원인 불명');
        break;
      
      case 'signInWithRedirect_failure':
        const redirectError = (payload as any).data?.error;
        logger.error('리디렉션 로그인 실패:', redirectError || '원인 불명');
        break;
      
      default:
        // 안전하게 처리하기 위해 'as any' 사용
        const anyPayload = payload as any;
        const eventData = anyPayload.data ? 
          JSON.stringify(anyPayload.data).substring(0, 100) : // 데이터 로깅 제한
          '데이터 없음';
        logger.debug(`인증 이벤트 (\${eventName}): \${eventData}`);
    }
  });
}

// 인증 상태 디버깅 함수
export async function debugAuthState() {
  logger.info('===== 인증 상태 확인 =====');
  
  try {
    // 현재 사용자 확인
    try {
      const user = await getCurrentUser();
      logger.info('현재 사용자:', user);
    } catch (e) {
      logger.warn('인증된 사용자 없음');
    }
    
    // 세션 확인
    try {
      const session = await fetchAuthSession();
      const hasTokens = !!session?.tokens;
      
      logger.info('세션 상태:', { 
        hasSession: true, 
        hasTokens,
        identityId: session?.identityId || 'none'
      });
      
      // 토큰 만료 확인
      if (hasTokens && session.tokens?.idToken) {
        const expTime = session.tokens.idToken.payload.exp || 0;
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = expTime - now;
        
        logger.info('토큰 만료:', {
          expireTime: new Date(expTime * 1000).toLocaleString(),
          minutesLeft: Math.round(timeLeft / 60),
          isExpired: timeLeft <= 0
        });
      }
    } catch (e) {
      logger.error('세션 확인 실패:', e);
    }
  } catch (e) {
    logger.error('인증 상태 확인 중 오류:', e);
  }
  
  logger.info('===== 인증 상태 확인 완료 =====');
}

// 토큰 갱신 함수
export async function checkAndRefreshToken(): Promise<boolean> {
  try {
    logger.debug('토큰 상태 확인 중...');
    const session = await fetchAuthSession();
    
    if (!session?.tokens) {
      logger.info('유효한 세션이 없습니다.');
      return false;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.tokens.accessToken?.payload?.exp || 0;
    const timeRemaining = expiresAt - now;
    
    // 토큰 만료 시간 표시
    if (timeRemaining > 0) {
      logger.debug(`토큰 만료까지 남은 시간: \${Math.round(timeRemaining / 60)}분`);
      
      // 토큰이 15분 이내에 만료될 예정이면 갱신 시도
      if (timeRemaining < 900) {
        logger.info('토큰이 곧 만료됩니다. 갱신 시도 중...');
        await fetchAuthSession({ forceRefresh: true });
        logger.info('토큰이 갱신되었습니다.');
      }
      
      return true;
    } else {
      logger.warn('토큰이 이미 만료되었습니다.');
      return false;
    }
  } catch (error) {
    logger.error('토큰 확인/갱신 중 오류:', error);
    return false;
  }
}
