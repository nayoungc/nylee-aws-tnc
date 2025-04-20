// src/aws-exports.ts
const awsExports = {
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
          email: true
        }
      }
    },
    
    // 대문자 API로 수정 (올바른 형식)
    API: {
      GraphQL: {
        endpoint: "https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql",
        region: "us-east-1",
        defaultAuthMode: "userPool"
      }
    },
    
    // 기존 소문자 api는 유지 (레거시 지원용)
    api: {
      graphql_endpoint: "https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql",
      graphql_endpoint_iam_region: "us-east-1",
      aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS"
    }
  };
  
  export default awsExports;