// 모든 함수와 타입을 통합 내보내기
export * from './config';
export * from './types';

// 각 도메인별 함수 내보내기
export * from './catalog';
export * from './courses';
export * from './customers';
export * from './quiz';
export * from './survey';

import { withAuthErrorHandling, createAuthErrorHandler, useAuth } from '@contexts/AuthContext';

// API 호출에 자격 증명 부족 상태 처리 추가
export const createAPIWithAuth = <T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  errorCallback: (error: any) => void,
  navigate?: (path: string) => void
) => {
  const authErrorHandler = createAuthErrorHandler(errorCallback, navigate);
  return withAuthErrorHandling(apiFunction, {
    ...authErrorHandler,
    refreshCredentials: async () => {
      // 모의 데이터 모드 전환
      sessionStorage.setItem('useMockData', 'true');
      return false;
    }
  });
};

// API 모의 데이터 헬퍼 함수
export const useMockDataIfNeeded = (realData: any, mockData: any): any => {
  if (sessionStorage.getItem('useMockData') === 'true' || 
      sessionStorage.getItem('partialAuthState') === 'true') {
    return mockData;
  }
  return realData;
};