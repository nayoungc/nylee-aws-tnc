import { defineStorage } from '@aws-amplify/backend';

// 기존 S3 버킷 연결
export const storage = defineStorage({
  name: 'nylee-aws-tnc',
  access: 'auth'
});
