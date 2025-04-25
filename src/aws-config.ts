// AWS 리소스 설정 정보
export const awsConfig = {
  region: 'us-east-1',
  userPoolId: 'us-east-1_AFeIVnWIU',
  userPoolWebClientId: '6tdhvgmafd2uuhbc2naqg96g12',
  appsyncApiEndpoint: 'https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql',
  s3Bucket: 'nylee-aws-tnc',
  bedrockModel: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
  bedrockKnowledgeBaseId: '9NFEGNPEJ9'
};

// Amplify 설정
export const amplifyConfig = {
  Auth: {
    region: awsConfig.region,
    userPoolId: awsConfig.userPoolId,
    userPoolWebClientId: awsConfig.userPoolWebClientId
  },
  API: {
    graphql_endpoint: awsConfig.appsyncApiEndpoint,
    graphql_headers: async () => ({
      'x-api-key': '', // API 키가 있는 경우 추가
    })
  },
  Storage: {
    AWSS3: {
      bucket: awsConfig.s3Bucket,
      region: awsConfig.region
    }
  }
};
