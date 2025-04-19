import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';

export class NyleeAwsTncBedrockStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 계정 ID와 리전을 변수로 추출
    const accountId = this.account;
    const region = this.region;
    
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
    
    // Knowledge Base용 버킷 생성 - 문자열 연결로 변경
    const kbBucket = new s3.Bucket(this, 'KnowledgeBaseBucket', {
      bucketName: 'tnc-kb-' + accountId + '-' + region,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });
    
    // IAM 역할 생성
    const bedrockRole = new iam.Role(this, 'BedrockRole', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')
      ]
    });

    // S3 버킷에 대한 권한 명시적 추가
    kbBucket.grantReadWrite(bedrockRole);
    reportsBucket.grantRead(bedrockRole);
    courseMaterialsBucket.grantRead(bedrockRole);
    documentsBucket.grantRead(bedrockRole);
    
    // 모델 ARN
    const embeddingModelArn = "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v2:0";
    const foundationModelArn = "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0";

    // Amazon Titan Embeddings V2는 1024 차원
    const titanEmbeddingDimensions = 1024;

    // CfnKnowledgeBase 직접 생성 - 모든 속성을 직접 설정
    const reportsKB = new cdk.CfnResource(this, 'ReportsKnowledgeBase', {
      type: 'AWS::Bedrock::KnowledgeBase',
      properties: {
        Name: 'TnC-Reports-Knowledge',
        Description: 'Knowledge base for course reports and analytics',
        RoleArn: bedrockRole.roleArn,
        KnowledgeBaseConfiguration: {
          Type: 'VECTOR',
          VectorKnowledgeBaseConfiguration: {
            EmbeddingModelArn: embeddingModelArn,
            EmbeddingModelConfiguration: {
              BedrockEmbeddingModelConfiguration: {
                Dimensions: titanEmbeddingDimensions
              }
            }
          }
        },
        StorageConfiguration: {
          Type: 'S3',
          S3Configuration: {
            BucketArn: kbBucket.bucketArn
          }
        }
      }
    });
    
    const materialsKB = new cdk.CfnResource(this, 'MaterialsKnowledgeBase', {
      type: 'AWS::Bedrock::KnowledgeBase',
      properties: {
        Name: 'TnC-Materials-Knowledge',
        Description: 'Knowledge base for course materials',
        RoleArn: bedrockRole.roleArn,
        KnowledgeBaseConfiguration: {
          Type: 'VECTOR',
          VectorKnowledgeBaseConfiguration: {
            EmbeddingModelArn: embeddingModelArn,
            EmbeddingModelConfiguration: {
              BedrockEmbeddingModelConfiguration: {
                Dimensions: titanEmbeddingDimensions
              }
            }
          }
        },
        StorageConfiguration: {
          Type: 'S3',
          S3Configuration: {
            BucketArn: kbBucket.bucketArn
          }
        }
      }
    });
    
    const docsKB = new cdk.CfnResource(this, 'DocsKnowledgeBase', {
      type: 'AWS::Bedrock::KnowledgeBase',
      properties: {
        Name: 'TnC-Documentation-Knowledge',
        Description: 'Knowledge base for AWS documentation',
        RoleArn: bedrockRole.roleArn,
        KnowledgeBaseConfiguration: {
          Type: 'VECTOR',
          VectorKnowledgeBaseConfiguration: {
            EmbeddingModelArn: embeddingModelArn,
            EmbeddingModelConfiguration: {
              BedrockEmbeddingModelConfiguration: {
                Dimensions: titanEmbeddingDimensions
              }
            }
          }
        },
        StorageConfiguration: {
          Type: 'S3',
          S3Configuration: {
            BucketArn: kbBucket.bucketArn
          }
        }
      }
    });
    
    // Agent 생성 (CfnResource 직접 사용)
    const agent = new cdk.CfnResource(this, 'EducationAgent', {
      type: 'AWS::Bedrock::Agent',
      properties: {
        AgentName: 'TnC-Education-Assistant',
        Description: 'Assistant for educational content creation',
        AgentResourceRoleArn: bedrockRole.roleArn,
        FoundationModel: foundationModelArn,
        IdleSessionTtlInSeconds: 1800,
        KnowledgeBases: [
          {
            Description: 'Reports knowledge base',
            KnowledgeBaseId: reportsKB.getAtt('KnowledgeBaseId').toString()
          },
          {
            Description: 'Course materials knowledge base',
            KnowledgeBaseId: materialsKB.getAtt('KnowledgeBaseId').toString()
          },
          {
            Description: 'AWS documentation knowledge base',
            KnowledgeBaseId: docsKB.getAtt('KnowledgeBaseId').toString()
          }
        ]
      }
    });
    
    // 출력값
    new cdk.CfnOutput(this, 'ReportsKnowledgeBaseId', { 
      value: reportsKB.getAtt('KnowledgeBaseId').toString()
    });
    
    new cdk.CfnOutput(this, 'MaterialsKnowledgeBaseId', { 
      value: materialsKB.getAtt('KnowledgeBaseId').toString()
    });
    
    new cdk.CfnOutput(this, 'DocsKnowledgeBaseId', { 
      value: docsKB.getAtt('KnowledgeBaseId').toString()
    });
    
    new cdk.CfnOutput(this, 'EducationAgentId', { 
      value: agent.getAtt('AgentId').toString()
    });
    
    new cdk.CfnOutput(this, 'KnowledgeBaseBucket', { 
      value: kbBucket.bucketName
    });
  }
}