import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';
import * as opensearch from 'aws-cdk-lib/aws-opensearchserverless';

export class NyleeAwsTncBedrockStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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

    // 역할에 OpenSearch 접근 권한 추가
    bedrockRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'aoss:APIAccessAll',
        'aoss:CreateCollection',
        'aoss:DeleteCollection',
        'aoss:UpdateCollection'
      ],
      resources: ['*']
    }));
    
    // 올바른 임베딩 모델 ARN - Titan Embeddings V2
    const embeddingModelArn = "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v2:0";
    const foundationModelArn = "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0";

    // OpenSearch Serverless 벡터 컬렉션 생성 - 올바른 Type 값 사용
    const vectorCollection = new opensearch.CfnCollection(this, 'TnCVectorCollection', {
      name: 'tnc-vector-store',
      type: 'VECTORSEARCH',  // 수정: VECTOR_SEARCH -> VECTORSEARCH
      description: 'Vector collection for TnC Knowledge Base',
      standbyReplicas: 'ENABLED'
    });
    
    // 벡터 컬렉션에 대한 보안 정책 설정 - 올바른 Type 값 사용
    const vectorCollectionPolicy = new opensearch.CfnSecurityPolicy(this, 'VectorCollectionPolicy', {
      name: 'tnc-vector-policy',
      type: 'data',  // 다시 소문자로 변경: DATA -> data
      policy: JSON.stringify({
        Rules: [
          {
            ResourceType: 'collection',
            Resource: ['collection/tnc-vector-store'],
            Permission: [
              'aoss:CreateCollectionItems',
              'aoss:DeleteCollectionItems',
              'aoss:UpdateCollectionItems',
              'aoss:DescribeCollectionItems'
            ]
          }
        ],
        AWSOwnedKey: true
      })
    });

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
              dimensions: 1536
            }
          }
        }
      },
      storageConfiguration: {
        type: 'OPENSEARCH_SERVERLESS',
        opensearchServerlessConfiguration: {
          collectionArn: vectorCollection.attrArn,
          vectorIndexName: 'tnc-vector-index',
          fieldMapping: {
            vectorField: 'vector_field',
            textField: 'text_content',
            metadataField: 'metadata'
          }
        }
      }
    });
    
    // 컬렉션 생성 후에 Knowledge Base 생성
    reportsKB.node.addDependency(vectorCollection);
    reportsKB.node.addDependency(vectorCollectionPolicy);
    
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
              dimensions: 1536
            }
          }
        }
      },
      storageConfiguration: {
        type: 'OPENSEARCH_SERVERLESS',
        opensearchServerlessConfiguration: {
          collectionArn: vectorCollection.attrArn,
          vectorIndexName: 'tnc-materials-index',
          fieldMapping: {
            vectorField: 'vector_field',
            textField: 'text_content',
            metadataField: 'metadata'
          }
        }
      }
    });
    
    materialsKB.addDependsOn(vectorCollection);
    materialsKB.addDependsOn(vectorCollectionPolicy);
    
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
              dimensions: 1536
            }
          }
        }
      },
      storageConfiguration: {
        type: 'OPENSEARCH_SERVERLESS',
        opensearchServerlessConfiguration: {
          collectionArn: vectorCollection.attrArn,
          vectorIndexName: 'tnc-docs-index',
          fieldMapping: {
            vectorField: 'vector_field',
            textField: 'text_content',
            metadataField: 'metadata'
          }
        }
      }
    });
    
    docsKB.addDependsOn(vectorCollection);
    docsKB.addDependsOn(vectorCollectionPolicy);
    
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
    
    new cdk.CfnOutput(this, 'OpenSearchCollectionId', { 
      value: vectorCollection.attrId
    });
  }
}