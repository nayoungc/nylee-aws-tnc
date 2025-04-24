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

import awsExports from './aws-exports';

// AWS 자격 증명을 저장할 전역 변수
let awsCredentials: AWS.Credentials | null = null;
let credentialsInitialized = false;
let lastCredentialAttempt = 0;

// 토큰 리프레시 시도 제한 추가
let tokenRefreshAttempts = 0;
const MAX_TOKEN_REFRESH_ATTEMPTS = 3;

// AWS 자격 증명 초기화 함수
async function initializeCredentials(force = false): Promise<boolean> {
  // 10초 이내에 이미 시도했으면 중복 호출 방지
  const now = Date.now();
  if (!force && credentialsInitialized && awsCredentials && 
      (now - lastCredentialAttempt < 10000)) {
    return true;
  }
  
  lastCredentialAttempt = now;
  
  try {
    console.log('자격 증명 초기화 시도 중...');
    const session = await fetchAuthSession();
    
    if (session.credentials) {
      awsCredentials = new AWS.Credentials({
        accessKeyId: session.credentials.accessKeyId,
        secretAccessKey: session.credentials.secretAccessKey,
        sessionToken: session.credentials.sessionToken
      });
      
      // AWS SDK 글로벌 설정에도 적용
      AWS.config.credentials = awsCredentials;
      
      credentialsInitialized = true;
      console.log('AWS SDK 자격 증명 설정 완료');
      tokenRefreshAttempts = 0; // 성공 시 시도 횟수 리셋
      return true;
    } else {
      console.error('세션에서 자격 증명을 찾을 수 없음');
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
Hub.listen('auth', (data) => {
  const { payload } = data;
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
    
    // 최대 시도 횟수를 초과하면 더 이상 시도하지 않음
    if (tokenRefreshAttempts >= MAX_TOKEN_REFRESH_ATTEMPTS) {
      console.log(`최대 토큰 갱신 시도 횟수(\${MAX_TOKEN_REFRESH_ATTEMPTS})를 초과했습니다.`);
      return;
    }
    
    tokenRefreshAttempts++;
    initializeCredentials(true);
  }
});

// AWS 서비스 생성을 위한 함수
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
      <App />
    </React.StrictMode>
  );
});