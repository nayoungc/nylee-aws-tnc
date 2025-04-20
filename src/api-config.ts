// src/api-config.ts
import { Amplify } from 'aws-amplify';

export const configureAmplify = () => {
  // AWS 리소스 구성
  const awsConfig = {
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
    API: {  // 대문자 "API"로 변경 (중요!)
      GraphQL: {
        endpoint: "https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql",
        region: "us-east-1",
        defaultAuthMode: "userPool" // defaultAuthMode 추가
      }
    }
  };

  // Amplify 구성 적용
  Amplify.configure(awsConfig);
  console.log('Amplify configuration completed');
};
