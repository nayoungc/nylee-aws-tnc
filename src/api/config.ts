import * as AWS from 'aws-sdk';
import { generateClient } from 'aws-amplify/api';

// AWS 설정
AWS.config.update({
  region: process.env.REACT_APP_AWS_REGION || 'us-east-1'
});

// DynamoDB 클라이언트
export const documentClient = new AWS.DynamoDB.DocumentClient();

// Amplify 클라이언트 (GraphQL API가 있는 경우)
export const amplifyClient = generateClient();

// 시간 관련 유틸리티
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
