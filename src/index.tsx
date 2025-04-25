import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import AWS from 'aws-sdk'; 
import { fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import App from './App';
import './styles/theme.css';
import './styles/auth.css';
import './i18n';

// AuthProvider 임포트 추가
import { AuthProvider } from './contexts/AuthContext';

import awsExports from './aws-exports';

// AWS 자격 증명을 저장할 전역 변수
let awsCredentials: AWS.Credentials | null = null;
let credentialsInitialized = false;
let lastCredentialAttempt = 0;

// 토큰 리프레시 제한 관련 변수
let tokenRefreshAttempts = 0;
const MAX_TOKEN_REFRESH_ATTEMPTS = 3;
let tokenRefreshLastAttempt = 0;
const TOKEN_REFRESH_MIN_INTERVAL = 30000; // 30초 간격으로 제한

// AWS 자격 증명 초기화 함수
async function initializeCredentials(force = false): Promise<boolean> {
  // 중복 호출 방지
  const now = Date.now();
  const CACHE_TTL = 30000; // 30초
  
  if (!force && credentialsInitialized && awsCredentials &&
    (now - lastCredentialAttempt < CACHE_TTL)) {
    return true;
  }

  lastCredentialAttempt = now;
  console.log('자격 증명 초기화 시도 중...');
  
  try {
    const session = await fetchAuthSession();
    
    if (!session.tokens) {
      console.log('토큰이 없음: 로그아웃 상태');
      credentialsInitialized = false;
      awsCredentials = null;
      return false;
    }
    
    if (session.credentials) {
      // 자격 증명이 있는 경우 - 정상 처리
      awsCredentials = new AWS.Credentials({
        accessKeyId: session.credentials.accessKeyId,
        secretAccessKey: session.credentials.secretAccessKey,
        sessionToken: session.credentials.sessionToken
      });

      AWS.config.credentials = awsCredentials;
      credentialsInitialized = true;
      
      console.log('AWS SDK 자격 증명 설정 완료');
      tokenRefreshAttempts = 0; // 성공 시 시도 횟수 리셋
      return true;
    } else {
      // 부분 인증 상태 - 명확한 로그 남김
      console.log('세션에 자격 증명이 없습니다 - 부분 인증 상태');
      
      // 즉시 새로운 시도를 하지 않고, 상태만 업데이트
      credentialsInitialized = false;
      awsCredentials = null;
      
      // 부분 인증 상태는 AuthContext에서 처리하도록 함
      return false;
    }
  } catch (err) {
    console.error('AWS 자격 증명 설정 실패:', err);
    credentialsInitialized = false;
    awsCredentials = null;
    return false;
  }
}

// Amplify 설정과 자격 증명 초기화를 순차적으로 진행하는 함수
async function initializeApp() {
  console.log('Amplify 설정 적용 시작');
  try {
    Amplify.configure(awsExports);
    console.log('Amplify Gen 2 설정 완료', Amplify.getConfig());

    // AWS SDK 리전 설정 (리전은 바로 설정 가능)
    const region = awsExports.API?.GraphQL?.region || 'us-east-1';
    AWS.config.region = region;
    console.log('AWS SDK 리전 설정:', region);

    // 초기 자격 증명 설정 시도
    await initializeCredentials();

  } catch (error) {
    console.error('Amplify 설정 실패:', error);
  }
}

// Amplify Gen 2 방식의 Hub 리스너 설정
Hub.listen('auth', ({ payload }) => {
  console.log('Auth 이벤트:', payload.event);
  
  if (payload.event === 'signedIn') {
    console.log('사용자 로그인 완료 - 자격 증명 갱신');
    tokenRefreshAttempts = 0; // 로그인 시 시도 횟수 리셋
    
    // 로그인 후 자격 증명 초기화 (지연 적용)
    setTimeout(() => {
      initializeCredentials(true).catch(err => 
        console.error('로그인 후 자격 증명 초기화 실패:', err)
      );
    }, 500);
  }
  
  if (payload.event === 'signedOut') {
    console.log('사용자 로그아웃');
    credentialsInitialized = false;
    awsCredentials = null;
    tokenRefreshAttempts = 0; // 로그아웃 시 시도 횟수 리셋
  }

  // 토큰 갱신 이벤트는 AuthContext에서만 처리하도록 여기서는 최소화
  if (payload.event === 'tokenRefresh') {
    const now = Date.now();
    
    // 토큰 갱신 빈도 관리 - 전역 변수로 제한
    if (now - tokenRefreshLastAttempt < TOKEN_REFRESH_MIN_INTERVAL || 
        tokenRefreshAttempts >= MAX_TOKEN_REFRESH_ATTEMPTS) {
      console.log('토큰 갱신 제한: 너무 빈번한 요청 또는 시도 횟수 제한');
      return;
    }
    
    tokenRefreshLastAttempt = now;
    tokenRefreshAttempts++;
    
    // 실제 갱신은 지연 실행하여 충돌 방지
    setTimeout(() => {
      initializeCredentials(false).catch(err => {
        console.error('토큰 갱신 처리 중 오류:', err);
      });
    }, 1000);
  }
});

// AWS 서비스 생성을 위한 함수 (Gen 2 방식)
export async function createAWSService<T>(ServiceClass: new (config: AWS.ConfigurationOptions) => T): Promise<T> {
  const credentialsReady = await initializeCredentials();
  
  if (!credentialsReady || !awsCredentials) {
    throw new Error('AWS 자격 증명을 설정할 수 없습니다. 먼저 로그인하세요.');
  }
  
  return new ServiceClass({
    credentials: awsCredentials,
    region: AWS.config.region
  });
}

// 전역 함수로 등록
(window as any).updateAWSCredentials = initializeCredentials;
(window as any).createAWSService = createAWSService;

// 앱 초기화 후 렌더링
initializeApp().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
});