import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  // 강사용 인증 시스템
  loginWith: {
    email: true,
    username: false,
    phone: false,
  },
  userAttributes: {
    required: ['name', 'email'],
    optional: ['preferred_username', 'title', 'organization'],
  },
  multifactor: {
    mode: 'optional',
    sms: true,
  },
  passwordPolicy: {
    minLength: 8,
    requireNumbers: true,
    requireLowercase: true,
    requireUppercase: true,
    requireSymbols: true,
  },
  // 고급 설정
  capabilities: {
    // 강사 추가는 관리자만 가능
    selfSignUp: false,
    // 24시간내 비밀번호 재설정 필요
    passwordRecovery: {
      deliveryMethod: 'EMAIL',
      expiry: '24hours',
    },
  },
});
