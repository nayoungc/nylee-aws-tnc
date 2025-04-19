import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';

export class NyleeAwsTncBedrockStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 기존 S3 버킷들 참조
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
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonOpenSearchServerlessFullAccess')
      ]
    });

    // S3 버킷에 대한 권한 명시적 추가
    reportsBucket.grantRead(bedrockRole);
    courseMaterialsBucket.grantRead(bedrockRole);
    documentsBucket.grantRead(bedrockRole);
    
    // 모델 ARN
    const embeddingModelArn = "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v2:0";
    const foundationModelArn = "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0";

    // Amazon Titan Embeddings V2는 1024 차원
    const titanEmbeddingDimensions = 1024;

    // OpenSearch Serverless 컬렉션 ARN 참조 (콘솔에서 미리 생성 필요)
    const opensearchCollectionArn = 'arn:aws:aoss:us-east-1:598393186022:collection/tnc-vector-store';

    // CfnKnowledgeBase 생성 - OpenSearch Serverless 구성 사용
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
              dimensions: titanEmbeddingDimensions
            }
          }
        }
      },
      storageConfiguration: {
        type: 'OPENSEARCH_SERVERLESS',
        opensearchServerlessConfiguration: {
          collectionArn: opensearchCollectionArn,
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
              dimensions: titanEmbeddingDimensions
            }
          }
        }
      },
      storageConfiguration: {
        type: 'OPENSEARCH_SERVERLESS',
        opensearchServerlessConfiguration: {
          collectionArn: opensearchCollectionArn,
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
              dimensions: titanEmbeddingDimensions
            }
          }
        }
      },
      storageConfiguration: {
        type: 'OPENSEARCH_SERVERLESS',
        opensearchServerlessConfiguration: {
          collectionArn: opensearchCollectionArn,
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
    new cdk.CfnOutput(this, 'ReportsKnowledgeBaseIdOutput', {
      value: reportsKB.attrKnowledgeBaseId
    });
    
    new cdk.CfnOutput(this, 'MaterialsKnowledgeBaseIdOutput', {
      value: materialsKB.attrKnowledgeBaseId
    });
    
    new cdk.CfnOutput(this, 'DocsKnowledgeBaseIdOutput', {
      value: docsKB.attrKnowledgeBaseId
    });
    
    new cdk.CfnOutput(this, 'EducationAgentIdOutput', {
      value: agent.attrAgentId
    });
  }
}