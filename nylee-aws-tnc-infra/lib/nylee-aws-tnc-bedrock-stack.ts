import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';

export class NyleeAwsTncBedrockStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 버킷 참조
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

    // OpenSearch 접근 권한 추가
    bedrockRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'aoss:APIAccessAll',
        'aoss:CreateCollection',
        'aoss:DeleteCollection',
        'aoss:UpdateCollection'
      ],
      resources: ['*']
    }));
    
    // 모델 ARN
    const embeddingModelArn = "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v2:0";
    const foundationModelArn = "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0";

    // 수동으로 생성한 OpenSearch 컬렉션의 ARN을 직접 입력
    // 이 ARN은 미리 콘솔에서 생성해둔 컬렉션의 것이어야 합니다
    const collectionArn = 'arn:aws:aoss:us-east-1:598393186022:collection/tnc-vector-store';
    
    // Knowledge Base 생성
    const reportsKB = new bedrock.CfnKnowledgeBase(this, 'ReportsKnowledgeBase', {
      name: 'TnC-Reports-Knowledge',
      description: 'Knowledge base for course reports and analytics',
      roleArn: bedrockRole.roleArn,
      knowledgeBaseConfiguration: {
        type: 'VECTOR',
        vectorKnowledgeBaseConfiguration: {
          embeddingModelArn: embeddingModelArn,
          embeddingModelConfiguration: {
            bedrockEmbeddingModelConfiguration: {
              dimensions: 1024
            }
          }
        }
      },
      // 수동으로 생성한 컬렉션 ARN 사용
      storageConfiguration: {
        type: 'OPENSEARCH_SERVERLESS',
        opensearchServerlessConfiguration: {
          collectionArn: collectionArn,
          vectorIndexName: 'tnc-vector-index',
          fieldMapping: {
            vectorField: 'vector_field',
            textField: 'text_content',
            metadataField: 'metadata'
          }
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
          embeddingModelArn: embeddingModelArn,
          embeddingModelConfiguration: {
            bedrockEmbeddingModelConfiguration: {
              dimensions: 1024
            }
          }
        }
      },
      storageConfiguration: {
        type: 'OPENSEARCH_SERVERLESS',
        opensearchServerlessConfiguration: {
          collectionArn: collectionArn,
          vectorIndexName: 'tnc-materials-index',
          fieldMapping: {
            vectorField: 'vector_field',
            textField: 'text_content',
            metadataField: 'metadata'
          }
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
          embeddingModelArn: embeddingModelArn,
          embeddingModelConfiguration: {
            bedrockEmbeddingModelConfiguration: {
              dimensions: 1024
            }
          }
        }
      },
      storageConfiguration: {
        type: 'OPENSEARCH_SERVERLESS',
        opensearchServerlessConfiguration: {
          collectionArn: collectionArn,
          vectorIndexName: 'tnc-docs-index',
          fieldMapping: {
            vectorField: 'vector_field',
            textField: 'text_content',
            metadataField: 'metadata'
          }
        }
      }
    });
    
    // Agent 생성
    const agent = new bedrock.CfnAgent(this, 'EducationAgent', {
      agentName: 'TnC-Education-Assistant',
      description: 'Assistant for educational content creation',
      agentResourceRoleArn: bedrockRole.roleArn,
      foundationModel: foundationModelArn,
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