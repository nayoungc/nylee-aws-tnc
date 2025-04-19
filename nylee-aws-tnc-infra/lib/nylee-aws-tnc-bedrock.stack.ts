import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import * as customResources from 'aws-cdk-lib/custom-resources';

export class NyleeAwsTncBedrockStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ... 기존 코드는 유지 ...

    // ===============================================================
    // Bedrock Knowledge Bases & Agent
    // ===============================================================
    
    // 기존 S3 버킷 참조
    const reportsBucket = s3.Bucket.fromBucketName(
      this, 
      'ExistingReportsBucket', 
      `tnc-reports-\${this.account}-\${this.region}`
    );
    
    const courseMaterialsBucket = s3.Bucket.fromBucketName(
      this, 
      'ExistingMaterialsBucket', 
      `tnc-course-materials-\${this.account}-\${this.region}`
    );
    
    // 세 번째 버킷 참조
    const documentsBucket = s3.Bucket.fromBucketName(
      this, 
      'ExistingDocsBucket', 
      'nylee-aws-docs-rag'
    );
    
    // Bedrock 서비스를 위한 IAM 역할 생성
    const bedrockServiceRole = new iam.Role(this, 'BedrockServiceRole', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      description: 'Role for Bedrock to access S3 and DynamoDB',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
      ]
    });
    
    // DynamoDB 테이블에 대한 읽기 권한 추가
    courseTemplateTable.grantReadData(bedrockServiceRole);
    courseSessionTable.grantReadData(bedrockServiceRole);
    questionsTable.grantReadData(bedrockServiceRole);
    responsesTable.grantReadData(bedrockServiceRole);
    
    // Knowledge Base 데이터 소스 정책
    const kbDataSourcePolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:ListBucket'
      ],
      resources: [
        reportsBucket.bucketArn,
        `\${reportsBucket.bucketArn}/*`,
        courseMaterialsBucket.bucketArn,
        `\${courseMaterialsBucket.bucketArn}/*`,
        documentsBucket.bucketArn,
        `\${documentsBucket.bucketArn}/*`
      ]
    });
    
    bedrockServiceRole.addToPolicy(kbDataSourcePolicy);

    // Bedrock Knowledge Base 생성 (CloudFormation Custom Resource 사용)
    // 각 데이터 소스용 Knowledge Base 생성
    const reportsKnowledgeBase = new cdk.CustomResource(this, 'ReportsKnowledgeBase', {
      serviceToken: new customResources.Provider(this, 'ReportsKBProvider', {
        onEventHandler: new lambda.Function(this, 'ReportsKBHandler', {
          runtime: lambda.Runtime.NODEJS_18_X,
          handler: 'index.handler',
          code: lambda.Code.fromAsset('lambda/bedrock-kb-creator'),
          timeout: cdk.Duration.minutes(5),
          environment: {
            KB_NAME: 'TnC-Reports-Knowledge',
            KB_DESCRIPTION: 'Knowledge base for course reports and analytics',
            S3_BUCKET_NAME: reportsBucket.bucketName,
            ROLE_ARN: bedrockServiceRole.roleArn,
            MODEL_ID: 'anthropic.claude-3-haiku-20240307-v1:0',
          }
        }),
      }),
      properties: {
        CreationTime: Date.now() // 업데이트 트리거용
      }
    });

    const materialsKnowledgeBase = new cdk.CustomResource(this, 'MaterialsKnowledgeBase', {
      serviceToken: new customResources.Provider(this, 'MaterialsKBProvider', {
        onEventHandler: new lambda.Function(this, 'MaterialsKBHandler', {
          runtime: lambda.Runtime.NODEJS_18_X,
          handler: 'index.handler',
          code: lambda.Code.fromAsset('lambda/bedrock-kb-creator'),
          timeout: cdk.Duration.minutes(5),
          environment: {
            KB_NAME: 'TnC-Materials-Knowledge',
            KB_DESCRIPTION: 'Knowledge base for course materials and resources',
            S3_BUCKET_NAME: courseMaterialsBucket.bucketName,
            ROLE_ARN: bedrockServiceRole.roleArn,
            MODEL_ID: 'anthropic.claude-3-haiku-20240307-v1:0',
          }
        }),
      }),
      properties: {
        CreationTime: Date.now()
      }
    });

    const docsKnowledgeBase = new cdk.CustomResource(this, 'DocsKnowledgeBase', {
      serviceToken: new customResources.Provider(this, 'DocsKBProvider', {
        onEventHandler: new lambda.Function(this, 'DocsKBHandler', {
          runtime: lambda.Runtime.NODEJS_18_X,
          handler: 'index.handler',
          code: lambda.Code.fromAsset('lambda/bedrock-kb-creator'),
          timeout: cdk.Duration.minutes(5),
          environment: {
            KB_NAME: 'TnC-Documentation-Knowledge',
            KB_DESCRIPTION: 'Knowledge base for AWS documentation and guides',
            S3_BUCKET_NAME: documentsBucket.bucketName,
            ROLE_ARN: bedrockServiceRole.roleArn,
            MODEL_ID: 'anthropic.claude-3-haiku-20240307-v1:0',
          }
        }),
      }),
      properties: {
        CreationTime: Date.now()
      }
    });

    // Bedrock Agent 생성
    const educationAgent = new cdk.CustomResource(this, 'EducationAgent', {
      serviceToken: new customResources.Provider(this, 'AgentProvider', {
        onEventHandler: new lambda.Function(this, 'AgentCreatorHandler', {
          runtime: lambda.Runtime.NODEJS_18_X,
          handler: 'index.handler',
          code: lambda.Code.fromAsset('lambda/bedrock-agent-creator'),
          timeout: cdk.Duration.minutes(10),
          environment: {
            AGENT_NAME: 'TnC-Education-Assistant',
            AGENT_DESCRIPTION: 'Assistant for educational content creation and student interactions',
            ROLE_ARN: bedrockServiceRole.roleArn,
            MODEL_ID: 'anthropic.claude-3-sonnet-20240229-v1:0',
            KB_IDS: JSON.stringify([
              cdk.Fn.ref(reportsKnowledgeBase.node.defaultChild!.node.id),
              cdk.Fn.ref(materialsKnowledgeBase.node.defaultChild!.node.id),
              cdk.Fn.ref(docsKnowledgeBase.node.defaultChild!.node.id)
            ]),
            DYNAMODB_TABLES: JSON.stringify([
              courseTemplateTable.tableName,
              courseSessionTable.tableName,
              questionsTable.tableName,
              responsesTable.tableName
            ])
          }
        }),
      }),
      properties: {
        CreationTime: Date.now()
      }
    });

    // Make sure agent is created after all knowledge bases
    educationAgent.node.addDependency(reportsKnowledgeBase);
    educationAgent.node.addDependency(materialsKnowledgeBase);
    educationAgent.node.addDependency(docsKnowledgeBase);

    // ===============================================================
    // 출력값 추가
    // ===============================================================
    
    // 기존 출력값은 유지하고 Bedrock 관련 출력 추가
    new cdk.CfnOutput(this, 'ReportsKnowledgeBaseId', { 
      value: cdk.Fn.ref(reportsKnowledgeBase.node.defaultChild!.node.id) 
    });
    
    new cdk.CfnOutput(this, 'MaterialsKnowledgeBaseId', { 
      value: cdk.Fn.ref(materialsKnowledgeBase.node.defaultChild!.node.id)
    });
    
    new cdk.CfnOutput(this, 'DocsKnowledgeBaseId', { 
      value: cdk.Fn.ref(docsKnowledgeBase.node.defaultChild!.node.id)
    });
    
    new cdk.CfnOutput(this, 'EducationAgentId', { 
      value: cdk.Fn.ref(educationAgent.node.defaultChild!.node.id)
    });
  }
}