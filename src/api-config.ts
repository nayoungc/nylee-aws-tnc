// src/api-config.ts
// configure 호출을 제거하고 설정만 내보내기
export const awsConfig = {
  aws_project_region: "us-east-1",
  aws_cognito_region: "us-east-1",
  aws_user_pools_id: "us-east-1_AFeIVnWIU",
  aws_user_pools_web_client_id: "6tdhvgmafd2uuhbc2naqg96g12",
  aws_mandatory_sign_in: "enable",
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_AFeIVnWIU",
      userPoolClientId: "6tdhvgmafd2uuhbc2naqg96g12",
      loginWith: {
        email: true,
        phone: false,
        username: true
      }
    }
  },
  API: {
    GraphQL: {
      endpoint: "https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql",
      region: "us-east-1",
      defaultAuthMode: "userPool"
    }
  }
};

// 필요한 경우 다른 유틸리티 함수 추가
export const configureAmplify = () => {
  // Amplify.configure() 호출 제거
  console.log('API 설정 초기화 완료');
};