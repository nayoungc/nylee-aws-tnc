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

// AWS 자격 증명 초기화 함수 (Gen 2 방식)
async function initializeCredentials(force = false): Promise<boolean> {
  // 현재 인증 상태 확인
  try {
    const { tokens, credentials } = await fetchAuthSession();
    
    // 로그인되지 않은 경우 조용히 반환
    if (!tokens) {
      console.log('사용자가 로그인되어 있지 않습니다. 자격 증명 초기화를 건너뜁니다.');
      return false;
    }
    
    // 10초 이내에 이미 시도했으면 중복 호출 방지
    const now = Date.now();
    if (!force && credentialsInitialized && awsCredentials &&
      (now - lastCredentialAttempt < 10000)) {
      return true;
    }

    lastCredentialAttempt = now;
    
    console.log('자격 증명 초기화 시도 중...');
    
    if (credentials) {
      awsCredentials = new AWS.Credentials({
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      });

      // AWS SDK 글로벌 설정에도 적용
      AWS.config.credentials = awsCredentials;

      credentialsInitialized = true;
      console.log('AWS SDK 자격 증명 설정 완료');
      tokenRefreshAttempts = 0; // 성공 시 시도 횟수 리셋
      return true;
    } else {
      console.log('세션에서 자격 증명을 찾을 수 없음 (사용자 로그인이 필요합니다)');
      return false;
    }
  } catch (err) {
    console.error('AWS 자격 증명 설정 실패:', err);
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
  if (payload.event === 'signedIn') {
    console.log('사용자 로그인 완료 - 자격 증명 갱신');
    tokenRefreshAttempts = 0; // 로그인 시 시도 횟수 리셋
    initializeCredentials(true); // 자격증명 초기화 (강제 갱신)
  }
  
  if (payload.event === 'signedOut') {
    console.log('사용자 로그아웃');
    credentialsInitialized = false;
    awsCredentials = null;
    tokenRefreshAttempts = 0; // 로그아웃 시 시도 횟수 리셋
  }

  if (payload.event === 'tokenRefresh') {
    console.log('토큰 갱신 - 자격 증명 업데이트');
    
    const now = Date.now();
    
    // 최대 시도 횟수를 초과하거나 마지막 시도 후 30초가 안지났으면 시도하지 않음
    if (tokenRefreshAttempts >= MAX_TOKEN_REFRESH_ATTEMPTS ||
        (now - tokenRefreshLastAttempt < TOKEN_REFRESH_MIN_INTERVAL && tokenRefreshAttempts > 0)) {
      console.log(`토큰 갱신 제한: 시도 횟수(\${tokenRefreshAttempts}/\${MAX_TOKEN_REFRESH_ATTEMPTS})`);
      return;
    }
    
    tokenRefreshAttempts++;
    tokenRefreshLastAttempt = now;
    initializeCredentials(true);
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