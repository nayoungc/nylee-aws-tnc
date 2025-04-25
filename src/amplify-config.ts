// src/amplify-config.ts
export const amplifyConfig = {
  // AWS 리전
  region: 'us-east-1', // 사용 중인 AWS 리전으로 변경하세요
  
  // Cognito 인증 설정
  auth: {
    Cognito: {
      userPoolId: 'us-east-1_AFeIVnWIU', // 실제 Cognito User Pool ID로 변경하세요
      userPoolClientId: '6tdhvgmafd2uuhbc2naqg96g12', // 실제 Client ID로 변경하세요
      signUpVerificationMethod: 'code'
    }
  },
  
  // 필요한 경우 API, S3 등 추가 설정
  storage: {
    S3: {
      bucket: 'nylee-aws-tnc', // 실제 S3 버킷 이름으로 변경하세요
      region: 'us-east-1'
    }
  }
};