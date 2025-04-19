// src/utils/amplify-utils.ts
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';

let isConfigured = false;

export const ensureAmplifyConfigured = () => {
  if (!isConfigured) {
    console.log('Configuring Amplify...');
    isConfigured = true;
  }
};

export const getAuthenticatedGraphQLClient = async () => {
  ensureAmplifyConfigured();
  
  try {
    // 인증 세션 확인
    const session = await fetchAuthSession();
    if (!session.tokens) {
      throw new Error('Not authenticated');
    }
    
    // 인증된 클라이언트 생성
    return generateClient();
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};
