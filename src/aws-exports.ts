// src/aws-exports.ts
import { ResourcesConfig } from 'aws-amplify';

// Amplify Gen 2 타입 정의를 사용하여 타입 안전성 강화
const awsExports = {
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_AFeIVnWIU",
      userPoolClientId: "6tdhvgmafd2uuhbc2naqg96g12",
      loginWith: {
        email: true,
        username: false,
        phone: false
      },
      // Gen 2에서 지원하는 설정만 포함
      signUpAttributes: undefined, // 이 줄 제거
    }
  },
  
  API: {
    GraphQL: {
      endpoint: "https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql",
      region: "us-east-1",
      defaultAuthMode: "userPool" as const
    }
  },

  // 기본 리전 설정
  default_region: "us-east-1"
};

export default awsExports;