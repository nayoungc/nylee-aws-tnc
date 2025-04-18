import { defineBackend } from '@aws-amplify/backend';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export const ai = {
  // Bedrock 설정
  bedrockModels: {
    claude: 'anthropic.claude-v2',
    claudeInstant: 'anthropic.claude-instant-v1',
  },
  
  // Lambda 함수에 Bedrock 권한 부여를 위한 함수
  addBedrockPermissions: (func: Function) => {
    func.addToRolePolicy(new PolicyStatement({
      actions: [
        'bedrock:InvokeModel',
        'bedrock:GetKnowledgeBase',
        'bedrock:RetrieveKnowledgeBase',
        'bedrock:InvokeAgent'
      ],
      resources: ['*'], // 프로덕션에서는 특정 모델 ARN으로 제한하세요
    }));
    
    return func;
  },
};

export default ai;