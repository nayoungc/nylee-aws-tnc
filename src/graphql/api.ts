// graphql
import { generateClient } from 'aws-amplify/api';
import { type Schema } from './schema';

// 타입이 지정된 클라이언트 생성
export const client = generateClient<Schema>();

// GraphQL 태그 함수 정의 (타입 안전성 위해)
export const graphql = <T>(query: string): T => {
  return query as unknown as T;
};

// 타입 안전한 API 호출 헬퍼
export async function executeGraphQL<T>({ query, variables }: { 
  query: any; 
  variables?: Record<string, any>;
}): Promise<T> {
  try {
    const result = await client.graphql({
      query,
      variables
    });
    return result.data as T;
  } catch (error) {
    console.error('GraphQL API 오류:', error);
    throw error;
  }
}
