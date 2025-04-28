// src/utils/apiClient.ts
import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

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
        console.log('사용자 인증 클라이언트 생성됨');
      }
      return userPoolClient;
    } else {
      // 인증 없음 - apiKey 클라이언트 사용
      if (!apiKeyClient) {
        apiKeyClient = generateClient({ authMode: 'apiKey' });
        console.log('API 키 클라이언트 생성됨');
      }
      return apiKeyClient;
    }
  } catch (error) {
    console.error('API 클라이언트 생성 오류:', error);
    
    // 폴백: apiKey 클라이언트
    if (!apiKeyClient) {
      apiKeyClient = generateClient({ authMode: 'apiKey' });
    }
    return apiKeyClient;
  }
};

/**
 * GraphQL 쿼리 실행 헬퍼 함수
 */
export const executeGraphQL = async (
  query: string,
  variables?: Record<string, any>
) => {
  const client = await getAuthClient();
  return client.graphql({
    query,
    variables
  });
};

/**
 * 토큰 갱신이 필요한지 확인하고 필요시 갱신하는 함수
 */
export const checkAndRefreshToken = async (): Promise<boolean> => {
  try {
    const session = await fetchAuthSession();
    if (!session?.tokens) {
      return false;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.tokens.accessToken?.payload?.exp || 0;
    const timeRemaining = expiresAt - now;
    
    // 토큰이 15분 이내에 만료될 예정이면 갱신
    if (timeRemaining < 900) {
      await fetchAuthSession({ forceRefresh: true });
      // 클라이언트 캐시 초기화하여 다음 호출에서 새로 생성되게 함
      userPoolClient = null;
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('토큰 확인/갱신 중 오류:', error);
    return false;
  }
};