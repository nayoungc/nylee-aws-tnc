// src/amplify-config.ts
import { Amplify } from 'aws-amplify';
// 클래스가 아닌 configure 함수를 직접 가져옵니다
import { configure as configureAuth } from 'aws-amplify/auth';
import { configure as configureAPI } from 'aws-amplify/api';
import { configure as configureStorage } from 'aws-amplify/storage';

// 기존 AWS 리소스 설정 정보
const awsConfig = {
  region: 'us-east-1',
  
  // Auth (Cognito)
  userPoolId: 'us-east-1_AFeIVnWIU',
  userPoolWebClientId: '6tdhvgmafd2uuhbc2naqg96g12',
  
  // API (AppSync)
  appsyncApiEndpoint: 'https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql',
  
  // Storage (S3)
  s3Bucket: 'nylee-aws-tnc',
  
  // AI Services (Bedrock)
  bedrockModel: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
  bedrockKnowledgeBaseId: '9NFEGNPEJ9'
};

// Amplify 초기화 함수
export function configureAmplify() {
  try {
    // 리전 설정
    Amplify.configure({
      region: awsConfig.region
    });
    
    // Auth 설정 (카테고리 클래스 대신 configure 함수 사용)
    configureAuth({
      Cognito: {
        userPoolId: awsConfig.userPoolId,
        userPoolClientId: awsConfig.userPoolWebClientId,
        loginWith: { username: true }
      }
    });
    
    // API 설정 (카테고리 클래스 대신 configure 함수 사용)
    configureAPI({
      GraphQL: {
        endpoint: awsConfig.appsyncApiEndpoint,
        defaultAuthMode: 'userPool'
      }
    });
    
    // Storage 설정 (카테고리 클래스 대신 configure 함수 사용)
    configureStorage({
      S3: {
        bucket: awsConfig.s3Bucket,
        region: awsConfig.region
      }
    });
    
    console.log("Amplify Gen 2 configuration completed");
  } catch (error) {
    console.error("Error configuring Amplify:", error);
  }
}

// 기존 설정 내보내기
export { awsConfig };