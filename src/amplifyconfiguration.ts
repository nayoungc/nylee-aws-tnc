import { ResourcesConfig } from 'aws-amplify';

export const resourceConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_AFeIVnWIU',
      userPoolClientId: '6tdhvgmafd2uuhbc2naqg96g12',
      loginWith: {
        username: true,
        email: true,
        phone: false
      }
    }
  },
  API: {
    GraphQL: {
      endpoint: 'https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql',
      region: 'us-east-1',
      defaultAuthMode: 'userPool'
    }
  }
};

export default resourceConfig;