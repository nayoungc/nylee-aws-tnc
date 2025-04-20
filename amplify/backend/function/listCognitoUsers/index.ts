// amplify/backend/function/listCognitoUsers/index.ts
import { ListUsersCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

export const handler = async (event) => {
  const client = new CognitoIdentityProviderClient({ region: process.env.REGION });
  
  try {
    // Auth 리소스에서 생성된 실제 User Pool ID 사용
    const userPoolId = process.env.USER_POOL_ID;
    
    // ListUsersCommand 사용 (AdminListUsersCommand 대신)
    const command = new ListUsersCommand({
      UserPoolId: userPoolId,
      Limit: event.arguments?.limit || 20,
      // 필요한 경우 PaginationToken 추가
      PaginationToken: event.arguments?.nextToken
    });
    
    const response = await client.send(command);
    
    return {
      items: response.Users?.map(user => {
        // 속성 매핑
        const attributes = {};
        // user.Attributes?.forEach(attr => {
        //   attributes[attr.Name] = attr.Value;
        // });
        
        return {
          username: user.Username,
          email: attributes['email'] || null,
          name: attributes['name'] || null,
          status: user.UserStatus,
          enabled: user.Enabled
        };
      }) || [],
      nextToken: response.PaginationToken
    };
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
};
