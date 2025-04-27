// src/utils/graphql.ts

/**
 * GraphQL 응답에서 안전하게 데이터를 추출하는 유틸리티 함수
 * 타입 호환성 문제를 방지하기 위해 any 타입 사용
 */
export function safelyExtractData<T>(response: any): T | null {
  console.log("safelyExtractData 입력 데이터:", JSON.stringify(response, null, 2));
  
  // 데이터가 있는지 확인
  if (!response || !response.data) {
    console.warn("safelyExtractData: 응답에서 데이터를 찾을 수 없음");
    return null;
  }
  
  // 데이터 추출
  const result = response.data as T;
  console.log("safelyExtractData 추출 결과:", JSON.stringify(result, null, 2));
  
  return result;
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