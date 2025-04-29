// src/utils/apiClient.ts
import { fetchAuthSession } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';

// 로깅 함수
const logDebug = (message: string, ...params: any[]) => console.debug(`[API] \${message}`, ...params);
const logInfo = (message: string, ...params: any[]) => console.info(`[API] \${message}`, ...params);
const logWarn = (message: string, ...params: any[]) => console.warn(`[API] \${message}`, ...params);
const logError = (message: string, ...params: any[]) => console.error(`[API] \${message}`, ...params);

// 클라이언트 인스턴스 캐싱
let userPoolClient: any = null;
let apiKeyClient: any = null;

/**
 * 인증 상태에 따라 적절한 API 클라이언트를 반환
 */
export const getAuthClient = async () => {
  try {
    const session = await fetchAuthSession();
    
    if (session?.tokens) {
      // 사용자 인증 있음 - userPool 클라이언트 사용
      if (!userPoolClient) {
        userPoolClient = generateClient({ authMode: 'userPool' });
        logInfo('사용자 인증 클라이언트 생성됨');
      }
      return userPoolClient;
    } else {
      // 인증 없음 - apiKey 클라이언트 사용
      if (!apiKeyClient) {
        apiKeyClient = generateClient({ authMode: 'apiKey' });
        logInfo('API 키 클라이언트 생성됨');
      }
      return apiKeyClient;
    }
  } catch (error) {
    logError('API 클라이언트 생성 오류:', error);
    
    // 폴백: apiKey 클라이언트
    if (!apiKeyClient) {
      apiKeyClient = generateClient({ authMode: 'apiKey' });
    }
    return apiKeyClient;
  }
};

/**
 * GraphQL 쿼리 실행 헬퍼 함수
 * @param query GraphQL 쿼리/뮤테이션 문자열
 * @param variables 쿼리 변수 객체
 * @returns 쿼리 실행 결과
 */
export const executeGraphQL = async (
  query: string,
  variables?: Record<string, any>
) => {
  try {
    // 토큰 상태 확인 및 필요시 갱신
    await checkAndRefreshToken();
    
    // 적절한 클라이언트 가져오기
    const client = await getAuthClient();
    
    // GraphQL 쿼리 실행
    return client.graphql({
      query,
      variables
    });
  } catch (error) {
    logError('GraphQL 쿼리 실행 오류:', error);
    throw error;
  }
};

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
        
        // 클라이언트 캐시 초기화
        userPoolClient = null;
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
 * 인증된 API 요청을 수행하는 함수
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