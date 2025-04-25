// src/api/auth-provider.ts
import { fetchAuthSession } from 'aws-amplify/auth';
import AWS from 'aws-sdk';

// global auth state를 관리할 객체
export const AuthStateManager = {
  isAuthenticated: false,
  hasCredentials: false,
  useMockData: false,
  
  // 초기화 및 상태 확인 함수
  async checkAuthState() {
    // 이전 상태와 큰 변화가 없으면 업데이트하지 않음
    const prevState = {
      isAuthenticated: this.isAuthenticated,
      hasCredentials: this.hasCredentials,
      useMockData: this.useMockData
    };
    
    try {
      const session = await fetchAuthSession();
      const newIsAuthenticated = !!session.tokens;
      const newHasCredentials = !!session.credentials;
      const newUseMockData = sessionStorage.getItem('useMockData') === 'true' || 
                         sessionStorage.getItem('partialAuthState') === 'true' ||
                         !newHasCredentials ||
                         process.env.NODE_ENV === 'development';
      
      // 변경사항이 있을 때만 업데이트
      if (prevState.isAuthenticated !== newIsAuthenticated || 
          prevState.hasCredentials !== newHasCredentials || 
          prevState.useMockData !== newUseMockData) {
        
        this.isAuthenticated = newIsAuthenticated;
        this.hasCredentials = newHasCredentials;
        this.useMockData = newUseMockData;
        
        console.log('AWS 세션 정보:', {
          hasTokens: !!session.tokens,
          hasCredentials: !!session.credentials
        });
      }
      
      return {
        isAuthenticated: this.isAuthenticated,
        hasCredentials: this.hasCredentials,
        useMockData: this.useMockData
      };
    } catch (error) {
      this.isAuthenticated = false;
      this.hasCredentials = false;
      this.useMockData = true;
      console.error('Auth state check failed:', error);
      
      return {
        isAuthenticated: false,
        hasCredentials: false,
        useMockData: true
      };
    }
  }
};

// App 초기화 시 호출할 함수
export async function initAuthState() {
  await AuthStateManager.checkAuthState();
}

// 모의 데이터 모드 확인 함수
export function shouldUseMockData() {
  return AuthStateManager.useMockData || 
         sessionStorage.getItem('useMockData') === 'true' || 
         sessionStorage.getItem('partialAuthState') === 'true' ||
         process.env.NODE_ENV === 'development';
}

// AWS DynamoDB 클라이언트 생성 함수
export async function getDocumentClient() {
  // 상태가 체크되지 않았다면 먼저 체크
  if (!AuthStateManager.isAuthenticated) {
    await AuthStateManager.checkAuthState();
  }
  
  // 자격 증명이 없거나 모의 데이터 모드인 경우 예외 발생
  if (shouldUseMockData() || !AuthStateManager.hasCredentials) {
    throw new Error('유효한 AWS 자격 증명이 없거나 모의 데이터 모드가 활성화되었습니다.');
  }
  
  try {
    // 이미 설정된 AWS 자격 증명 사용
    return new AWS.DynamoDB.DocumentClient({
      region: AWS.config.region || 'ap-northeast-2'
    });
  } catch (error) {
    console.error('DocumentClient 생성 실패:', error);
    throw error;
  }
}