// src/aws-exports.ts
const awsExports = {
    // 기존 설정 유지
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
          email: true,  // 이메일 로그인 활성화
          // username 속성 제거
          // phone 속성 제거
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
  
  export default awsExports;