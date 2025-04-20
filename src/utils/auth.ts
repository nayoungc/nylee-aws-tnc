import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

// 인증된 API 클라이언트 반환 함수
export const getAuthenticatedApiClient = async () => {
    try {
      // 인증 확인만 수행
      await getCurrentUser();
      
      // API 클라이언트 생성 및 반환
      return generateClient();
    } catch (error) {
      console.error('인증된 API 클라이언트 생성 오류:', error);
      throw new Error('API 접근을 위한 인증이 필요합니다.');
    }
  };

// GraphQL 쿼리 실행 헬퍼 함수
export const executeGraphQL = async <T>(
    query: string,
    variables?: Record<string, any>,
    authMode: 'apiKey' | 'userPool' | 'iam' | 'oidc' | 'lambda' = 'userPool'
  ): Promise<T> => {
    try {
      const client = await getAuthenticatedApiClient();
      
      // any 타입으로 처리하여 타입 오류 회피
      const result: any = await client.graphql({
        query,
        variables,
        authMode
      });
      
      // 결과 확인
      if (!result || !result.data) {
        throw new Error('GraphQL 응답에 데이터가 없습니다');
      }
      
      // 데이터 반환
      return result.data as T;
    } catch (error) {
      console.error('GraphQL 쿼리 실행 오류:', error);
      throw error;
    }
  };