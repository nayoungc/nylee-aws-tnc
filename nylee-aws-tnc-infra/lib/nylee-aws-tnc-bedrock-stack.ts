// lib/nylee-aws-tnc-bedrock-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as customResources from 'aws-cdk-lib/custom-resources';

export interface NyleeAwsTncBedrockStackProps extends cdk.StackProps {
  // 필요한 경우 메인 스택에서 값을 가져오는 속성 추가
  // existingBucketNames?: string[];
  // existingTableNames?: string[];
}

export class NyleeAwsTncBedrockStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: NyleeAwsTncBedrockStackProps) {
    super(scope, id, props);

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
    
    // DynamoDB 테이블 참조 (선택 사항)
    // 이 부분은 메인 스택의 테이블을 참조하는 방법에 따라 달라질 수 있음
    const tableNames = ['TnC-CourseTemplate', 'TnC-CourseSession', 'TnC-Questions', 'TnC-Responses'];
    const tables = tableNames.map(tableName => 
      dynamodb.Table.fromTableName(this, `Imported\${tableName}`, tableName)
    );
    
    // 테이블에 대한 읽기 권한 부여
    tables.forEach(table => table.grantReadData(bedrockServiceRole));
    
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

    // Lambda 핸들러 코드 생성을 위한 경로
    const kbHandlerPath = 'lambda/bedrock-kb-creator';
    const agentHandlerPath = 'lambda/bedrock-agent-creator';

    // 필요한 Lambda 핸들러 디렉토리가 있는지 확인하세요
    // (실제로는 이 코드를 실행하기 전에 해당 디렉토리와 코드 파일을 생성해야 합니다)

    // Bedrock Knowledge Base 생성 (CloudFormation Custom Resource 사용)
    // 각 데이터 소스용 Knowledge Base 생성
    const reportsKnowledgeBase = new cdk.CustomResource(this, 'ReportsKnowledgeBase', {
      serviceToken: new customResources.Provider(this, 'ReportsKBProvider', {
        onEventHandler: new lambda.Function(this, 'ReportsKBHandler', {
          runtime: lambda.Runtime.NODEJS_18_X,
          handler: 'index.handler',
          code: lambda.Code.fromAsset(kbHandlerPath),
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
          code: lambda.Code.fromAsset(kbHandlerPath),
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
          code: lambda.Code.fromAsset(kbHandlerPath),
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
          code: lambda.Code.fromAsset(agentHandlerPath),
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
            DYNAMODB_TABLES: JSON.stringify(tableNames)
          }
        }),
      }),
      properties: {
        CreationTime: Date.now()
      }
    });

    // Agent가 모든 knowledge base 생성 후 생성되도록 의존성 설정
    educationAgent.node.addDependency(reportsKnowledgeBase);
    educationAgent.node.addDependency(materialsKnowledgeBase);
    educationAgent.node.addDependency(docsKnowledgeBase);

    // 출력값
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