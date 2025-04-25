import { defineAuth } from '@aws-amplify/backend';

// 기존 Cognito 사용자 풀 사용
export const auth = defineAuth({
  loginWith: {
    email: true,
    phone: false,
    username: true
  },
  // 기존 Cognito 사용자 풀 연결
  userPoolId: 'us-east-1_AFeIVnWIU',
  userPoolClientId: '6tdhvgmafd2uuhbc2naqg96g12'
});
