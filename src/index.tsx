import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import AWS from 'aws-sdk'; 
import { fetchAuthSession } from 'aws-amplify/auth';
import App from './App';
import './styles/theme.css';
import './styles/auth.css';
import './i18n';

import awsExports from './aws-exports';

// AWS 자격 증명을 저장할 전역 변수
let awsCredentials: AWS.Credentials | null = null;
let credentialsInitialized = false;

// AWS 자격 증명 초기화 함수
async function initializeCredentials(): Promise<boolean> {
  if (credentialsInitialized && awsCredentials) return true;
  
  try {
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

// Amplify 설정
console.log('Amplify 설정 적용 시작');
try {
  Amplify.configure(awsExports);
  console.log('Amplify Gen 2 설정 완료', Amplify.getConfig());
  
  // AWS SDK 리전 설정 (리전은 바로 설정 가능)
  const region = awsExports.API?.GraphQL?.region || 'us-east-1';
  AWS.config.region = region;
  console.log('AWS SDK 리전 설정:', region);
  
  // 초기 자격 증명 설정 시도
  initializeCredentials();
  
} catch (error) {
  console.error('Amplify 설정 실패:', error);
}

// AWS 서비스 생성을 위한 함수 (타입 오류 수정)
export async function createAWSService<T>(ServiceClass: new (config: AWS.ConfigurationOptions) => T): Promise<T> {
  await initializeCredentials();
  
  if (!awsCredentials) {
    throw new Error('AWS 자격 증명을 설정할 수 없습니다');
  }
  
  return new ServiceClass({
    credentials: awsCredentials,
    region: AWS.config.region
  });
}

// TypeScript 타입 선언 추가
declare global {
  interface Window {
    updateAWSCredentials: () => Promise<boolean>;
    createAWSService: typeof createAWSService;
  }
}

// 전역 함수로 등록
window.updateAWSCredentials = initializeCredentials;
window.createAWSService = createAWSService;

// 렌더링
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);