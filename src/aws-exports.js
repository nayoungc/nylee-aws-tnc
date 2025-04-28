const config = {
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_zrHUYDT0e",
      //userPoolClientId: "6tdhvgmafd2uuhbc2naqg96g12",
    }
  },
  Storage: {
    S3: {
      bucket: "nylee-aws-tnc",
      region: "us-east-1"
    }
  },
  API: {
    GraphQL: {
      endpoint: 'https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql',
      region: 'us-east-1',
      defaultAuthMode: 'userPool',
    }
  }
};