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
    try {
      const session = await fetchAuthSession();
      this.isAuthenticated = !!session.tokens;
      this.hasCredentials = !!session.credentials;
      this.useMockData = sessionStorage.getItem('useMockData') === 'true' || 
                         sessionStorage.getItem('partialAuthState') === 'true' ||
                         !this.hasCredentials ||
                         process.env.NODE_ENV === 'development';
      
      // 성공 시 AWS 설정도 업데이트
      if (session.credentials) {
        AWS.config.credentials = new AWS.Credentials({
          accessKeyId: session.credentials.accessKeyId,
          secretAccessKey: session.credentials.secretAccessKey,
          sessionToken: session.credentials.sessionToken
        });
        
        // 리전 설정
        AWS.config.region = AWS.config.region || 'ap-northeast-2';
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