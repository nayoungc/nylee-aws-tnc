import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';

export class NyleeAwsTncBedrockStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);  // 올바른 super() 호출 문법

    // 실제 버킷 이름을 하드코딩하여 사용 
    const reportsBucket = s3.Bucket.fromBucketName(
      this, 'ExistingReportsBucket', 'tnc-reports-598393186022-us-east-1'
    );
    
    const courseMaterialsBucket = s3.Bucket.fromBucketName(
      this, 'ExistingMaterialsBucket', 'tnc-course-materials-598393186022-us-east-1'
    );
    
    const documentsBucket = s3.Bucket.fromBucketName(
      this, 'ExistingDocsBucket', 'nylee-aws-docs-rag'
    );
    
    // IAM 역할 생성
    const bedrockRole = new iam.Role(this, 'BedrockRole', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')
      ]
    });
    
    // Knowledge Base 생성
    const reportsKB = new bedrock.CfnKnowledgeBase(this, 'ReportsKnowledgeBase', {
      name: 'TnC-Reports-Knowledge',
      description: 'Knowledge base for course reports and analytics',
      roleArn: bedrockRole.roleArn,
      knowledgeBaseConfiguration: {
        type: 'VECTOR',
        vectorKnowledgeBaseConfiguration: {
          embeddingModelArn: `arn:aws:bedrock:\${this.region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`
        }
      }
    });
    
    const materialsKB = new bedrock.CfnKnowledgeBase(this, 'MaterialsKnowledgeBase', {
      name: 'TnC-Materials-Knowledge',
      description: 'Knowledge base for course materials',
      roleArn: bedrockRole.roleArn,
      knowledgeBaseConfiguration: {
        type: 'VECTOR',
        vectorKnowledgeBaseConfiguration: {
          embeddingModelArn: `arn:aws:bedrock:\${this.region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`
        }
      }
    });
    
    const docsKB = new bedrock.CfnKnowledgeBase(this, 'DocsKnowledgeBase', {
      name: 'TnC-Documentation-Knowledge',
      description: 'Knowledge base for AWS documentation',
      roleArn: bedrockRole.roleArn,
      knowledgeBaseConfiguration: {
        type: 'VECTOR',
        vectorKnowledgeBaseConfiguration: {
          embeddingModelArn: `arn:aws:bedrock:\${this.region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`
        }
      }
    });
    
    // Agent 생성
    const agent = new bedrock.CfnAgent(this, 'EducationAgent', {
      agentName: 'TnC-Education-Assistant',
      description: 'Assistant for educational content creation',
      agentResourceRoleArn: bedrockRole.roleArn,
      foundationModel: `arn:aws:bedrock:\${this.region}::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0`,
      idleSessionTtlInSeconds: 1800,
      knowledgeBases: [
        {
          description: 'Reports knowledge base',
          knowledgeBaseId: reportsKB.attrKnowledgeBaseId
        },
        {
          description: 'Course materials knowledge base',
          knowledgeBaseId: materialsKB.attrKnowledgeBaseId
        },
        {
          description: 'AWS documentation knowledge base',
          knowledgeBaseId: docsKB.attrKnowledgeBaseId
        }
      ]
    });
    
    // 출력값
    new cdk.CfnOutput(this, 'ReportsKnowledgeBaseId', { 
      value: reportsKB.attrKnowledgeBaseId
    });
    
    new cdk.CfnOutput(this, 'MaterialsKnowledgeBaseId', { 
      value: materialsKB.attrKnowledgeBaseId
    });
    
    new cdk.CfnOutput(this, 'DocsKnowledgeBaseId', { 
      value: docsKB.attrKnowledgeBaseId
    });
    
    new cdk.CfnOutput(this, 'EducationAgentId', { 
      value: agent.attrAgentId
    });
  }
}