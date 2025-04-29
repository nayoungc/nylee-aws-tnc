// src/utils/apiClient.ts
import { fetchAuthSession } from 'aws-amplify/auth';

// 로깅 함수 (Logger 클래스 대신 직접 사용)
const logDebug = (message: string, ...params: any[]) => console.debug(`[Token] \${message}`, ...params);
const logInfo = (message: string, ...params: any[]) => console.info(`[Token] \${message}`, ...params);
const logWarn = (message: string, ...params: any[]) => console.warn(`[Token] \${message}`, ...params);
const logError = (message: string, ...params: any[]) => console.error(`[Token] \${message}`, ...params);

/**
 * 인증 토큰을 확인하고 필요시 갱신하는 함수
 * @returns {Promise<boolean>} 토큰 유효성 여부
 */
export const checkAndRefreshToken = async (): Promise<boolean> => {
  try {
    logDebug('토큰 상태 확인 중...');
    const session = await fetchAuthSession();
    
    if (!session?.tokens) {
      logInfo('유효한 세션이 없습니다.');
      return false;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.tokens.accessToken?.payload?.exp || 0;
    const timeRemaining = expiresAt - now;
    
    // 토큰 만료 시간 표시
    if (timeRemaining > 0) {
      logDebug(`토큰 만료까지 남은 시간: \${Math.round(timeRemaining / 60)}분`);
      
      // 토큰이 15분 이내에 만료될 예정이면 갱신 시도
      if (timeRemaining < 900) {
        logInfo('토큰이 곧 만료됩니다. 갱신 시도 중...');
        await fetchAuthSession({ forceRefresh: true });
        logInfo('토큰이 갱신되었습니다.');
      }
      
      return true;
    } else {
      logWarn('토큰이 이미 만료되었습니다.');
      return false;
    }
  } catch (error) {
    logError('토큰 확인/갱신 중 오류:', error);
    return false;
  }
};

/**
 * API 호출을 위한 인증 헤더를 가져오는 함수
 * @returns {Promise<{Authorization: string}>} 인증 헤더
 */
export const getAuthHeaders = async (): Promise<{ Authorization?: string }> => {
  try {
    const session = await fetchAuthSession();
    if (session?.tokens?.idToken) {
      return {
        Authorization: `Bearer \${session.tokens.idToken.toString()}`
      };
    }
    return {};
  } catch (error) {
    logError('인증 헤더 가져오기 실패:', error);
    return {};
  }
};

/**
 * 인증 요청을 수행하는 함수
 * @param url 요청 URL
 * @param options fetch 옵션
 * @returns 응답 데이터
 */
export const authenticatedFetch = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> => {
  try {
    // 토큰 확인 및 갱신
    await checkAndRefreshToken();
    
    // 인증 헤더 가져오기
    const authHeaders = await getAuthHeaders();
    
    // 요청 옵션 설정
    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers || {})
      }
    };
    
    // 요청 실행
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`API 요청 실패: \${response.status} \${response.statusText}`);
    }
    
    // 응답 데이터 파싱
    return await response.json() as T;
  } catch (error) {
    logError('API 요청 실패:', error);
    throw error;
  }
};