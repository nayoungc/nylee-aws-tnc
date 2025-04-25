import { defineData } from '@aws-amplify/backend';
import { schema } from '../data/schema';

// 기존 AppSync API 연결
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
  // 기존 API 연결
  apiId: '34jyk55wjngtlbwbbzdjfraooe' // AppSync URL에서 추출한 ID
});
