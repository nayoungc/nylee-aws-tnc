// src/api-config.ts
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import config from './amplifyconfiguration.json';

// Gen 2 방식으로 API 설정 초기화
export function configureAmplify() {
  // Amplify 전체 설정
  Amplify.configure({
    ...config,
    API: {
      GraphQL: {
        endpoint: 'https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql',
        region: 'us-east-1',
        defaultAuthMode: 'userPool'
      }
    }
  });

  console.log('Amplify configuration completed');
}

// API 클라이언트 생성 함수
export function createApiClient() {
  return generateClient();
}