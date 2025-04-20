// src/aws-exports.ts
interface AmplifyConfig {
    aws_project_region: string;
    aws_cognito_region: string;
    aws_user_pools_id: string;
    aws_user_pools_web_client_id: string;
    aws_mandatory_sign_in: string;
    Auth: {
      Cognito: {
        userPoolId: string;
        userPoolClientId: string;
        loginWith: {
          email: boolean;
        }
      }
    };
    API: {
      GraphQL: {
        endpoint: string;
        region: string;
        defaultAuthMode: string;
      }
    };
    // 추가 속성 (타입 오류 방지를 위해 인덱스 시그니처 사용)
    [key: string]: any;
}
  
// AmplifyConfig 타입 적용 - 이 부분이 누락됨
const awsExports: AmplifyConfig = {
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
    
    API: {
      GraphQL: {
        endpoint: "https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql",
        region: "us-east-1",
        defaultAuthMode: "userPool"
      }
    },
    
    // 기존 소문자 api는 유지
    api: {
      graphql_endpoint: "https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql",
      graphql_endpoint_iam_region: "us-east-1",
      aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS"
    }
};
  
export default awsExports;