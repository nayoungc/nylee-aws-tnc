// src/utils/graphql.ts

/**
 * GraphQL 응답에서 안전하게 데이터를 추출하는 유틸리티 함수
 * 타입 호환성 문제를 방지하기 위해 any 타입 사용
 */
export function safelyExtractData<T>(result: any): T | undefined {
    if (result && typeof result === 'object' && 'data' in result) {
      return result.data;
    }
    return undefined;
  }
  
  /**
   * GraphQL 오류 메시지를 추출하는 유틸리티 함수
   * 타입 호환성 문제를 방지하기 위해 any 타입 사용
   */
  export function extractGraphQLErrors(result: any): string[] {
    if (result && typeof result === 'object' && 'errors' in result && Array.isArray(result.errors)) {
      return result.errors.map((error: any) => {
        // 다양한 오류 객체 형식 처리
        if (typeof error === 'string') return error;
        if (error && typeof error === 'object' && 'message' in error) return String(error.message);
        return String(error);
      });
    }
    return [];
  }  