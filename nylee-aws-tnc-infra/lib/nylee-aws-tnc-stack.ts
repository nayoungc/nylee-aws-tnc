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

export class NyleeAwsTncStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ===============================================================
    // DynamoDB 테이블
    // ===============================================================
    
    // 과정 템플릿 테이블
    const courseTemplateTable = new dynamodb.Table(this, 'CourseTemplateTable', {
      tableName: 'TnC-CourseTemplate',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'version', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // 실수로 삭제되지 않도록 보호
    });

    // 세션 테이블
    const courseSessionTable = new dynamodb.Table(this, 'CourseSessionTable', {
      tableName: 'TnC-CourseSession',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    
    // 강사별 세션 조회를 위한 GSI 추가
    courseSessionTable.addGlobalSecondaryIndex({
      indexName: 'byInstructor',
      partitionKey: { name: 'instructorId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'startDate', type: dynamodb.AttributeType.STRING },
    });

    // 평가 도구 설정 테이블
    const sessionAssessmentTable = new dynamodb.Table(this, 'SessionAssessmentTable', {
      tableName: 'TnC-SessionAssessment',
      partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'assessmentType', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // 문제 은행 테이블
    const questionsTable = new dynamodb.Table(this, 'QuestionsTable', {
      tableName: 'TnC-Questions',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    
    // 세션별 문제 조회를 위한 GSI 추가
    questionsTable.addGlobalSecondaryIndex({
      indexName: 'bySession',
      partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'questionType', type: dynamodb.AttributeType.STRING },
    });

    // 응답 데이터 테이블
    const responsesTable = new dynamodb.Table(this, 'ResponsesTable', {
      tableName: 'TnC-Responses',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    
    // 세션별 응답 조회를 위한 GSI 추가
    responsesTable.addGlobalSecondaryIndex({
      indexName: 'bySession',
      partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'studentName', type: dynamodb.AttributeType.STRING },
    });
    
    // 문제별 응답 조회를 위한 GSI 추가
    responsesTable.addGlobalSecondaryIndex({
      indexName: 'byQuestion',
      partitionKey: { name: 'questionId', type: dynamodb.AttributeType.STRING },
    });

    // 공지사항 테이블
    const announcementsTable = new dynamodb.Table(this, 'AnnouncementsTable', {
      tableName: 'TnC-Announcements',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    
    // 세션별 공지사항 조회를 위한 GSI 추가
    announcementsTable.addGlobalSecondaryIndex({
      indexName: 'bySession',
      partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    });

    // ===============================================================
    // S3 버킷
    // ===============================================================
    
   // 과정 자료 저장 버킷
    const courseMaterialsBucket = new s3.Bucket(this, 'CourseMaterialsBucket', {
      bucketName: 'tnc-course-materials-' + this.account + '-' + this.region,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      versioned: true,
    });

    // 보고서 저장 버킷
    const reportsBucket = new s3.Bucket(this, 'ReportsBucket', {
      bucketName: 'tnc-reports-' + this.account + '-' + this.region,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    // ===============================================================
    // Cognito 사용자 풀 (강사 인증)
    // ===============================================================
    
    const userPool = new cognito.UserPool(this, 'InstructorUserPool', {
      userPoolName: 'TnC-InstructorPool',
      selfSignUpEnabled: false, // 관리자만 사용자 추가 가능
      autoVerify: { email: true }, // 이메일 자동 인증
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    });

    // 사용자 풀 클라이언트
    const userPoolClient = userPool.addClient('AppClient', {
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    });

    // ===============================================================
    // AppSync GraphQL API
    // ===============================================================
    
    // GraphQL API 생성
    const api = new appsync.GraphqlApi(this, 'TnCAPI', {
      name: 'TnC-GraphQL-API',
      schema: appsync.SchemaFile.fromAsset('graphql/schema.graphql'), // 스키마 파일 경로
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool,
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.API_KEY,
            apiKeyConfig: {
              name: 'TnC-Student-APIKey',
              description: '교육생 접근용 API 키',
              expires: cdk.Expiration.after(cdk.Duration.days(365)), // 1년 유효
            },
          },
        ],
      },
      xrayEnabled: true,
    });

    // DynamoDB 테이블에 대한 데이터 소스 생성
    const courseTemplateDS = api.addDynamoDbDataSource('CourseTemplateDataSource', courseTemplateTable);
    const courseSessionDS = api.addDynamoDbDataSource('CourseSessionDataSource', courseSessionTable);
    const sessionAssessmentDS = api.addDynamoDbDataSource('SessionAssessmentDataSource', sessionAssessmentTable);
    const questionsDS = api.addDynamoDbDataSource('QuestionsDataSource', questionsTable);
    const responsesDS = api.addDynamoDbDataSource('ResponsesDataSource', responsesTable);
    const announcementsDS = api.addDynamoDbDataSource('AnnouncementsDataSource', announcementsTable);

    // ===============================================================
    // Lambda 함수
    // ===============================================================
    
    // AI 문제 생성 Lambda 함수
    const questionGeneratorLambda = new lambda.Function(this, 'QuestionGeneratorFunction', {
      functionName: 'TnC-QuestionGenerator',
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda/questionGenerator'),
      handler: 'index.handler',
      timeout: cdk.Duration.minutes(5), // Bedrock 호출은 시간이 걸릴 수 있음
      environment: {
        QUESTIONS_TABLE: questionsTable.tableName,
        BEDROCK_MODEL_ID: 'anthropic.claude-v2', // 사용할 Bedrock 모델
      },
    });

    // Bedrock 모델 접근 권한 부여
    questionGeneratorLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'], // 실제 환경에서는 특정 모델 ARN으로 제한 권장
    }));

    // 문제 생성 Lambda를 AppSync에 연결
    const questionGeneratorDS = api.addLambdaDataSource('QuestionGeneratorDataSource', questionGeneratorLambda);

    // 데이터 분석 Lambda 함수
    const analyticsLambda = new lambda.Function(this, 'AnalyticsFunction', {
      functionName: 'TnC-Analytics',
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda/analytics'),
      handler: 'index.handler',
      timeout: cdk.Duration.minutes(3),
      environment: {
        RESPONSES_TABLE: responsesTable.tableName,
        QUESTIONS_TABLE: questionsTable.tableName,
        REPORTS_BUCKET: reportsBucket.bucketName,
      },
    });

    // S3 및 DynamoDB 접근 권한 부여
    reportsBucket.grantReadWrite(analyticsLambda);
    responsesTable.grantReadData(analyticsLambda);
    questionsTable.grantReadData(analyticsLambda);

    // 분석 Lambda를 AppSync에 연결
    const analyticsDS = api.addLambdaDataSource('AnalyticsDataSource', analyticsLambda);

    // ===============================================================
    // WebSocket API (실시간 통신)
    // ===============================================================
    
    // 먼저 Lambda 함수들을 생성
    const connectHandler = new lambda.Function(this, 'WebSocketConnectFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda/websocket/connect'),
      handler: 'connect.handler',
    });

    const disconnectHandler = new lambda.Function(this, 'WebSocketDisconnectFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda/websocket/disconnect'),
      handler: 'disconnect.handler',
    });

    const defaultHandler = new lambda.Function(this, 'WebSocketDefaultFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda/websocket/default'),
      handler: 'default.handler',
    });

    const messageHandler = new lambda.Function(this, 'WebSocketMessageFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda/websocket/message'),
      handler: 'message.handler',
    });

    // 통합 정책 (역할)
    const webSocketIntegrationRole = new iam.Role(this, 'WebSocketIntegrationRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });

    // L1 (CloudFormation 수준) 구성체 사용
    const webSocketApi = new apigatewayv2.CfnApi(this, 'TnCWebSocketAPI', {
      name: 'TnC-WebSocket-API',
      protocolType: 'WEBSOCKET',
      routeSelectionExpression: '\$request.body.action',
    });

    // 통합 생성하기
    const connectIntegration = new apigatewayv2.CfnIntegration(this, 'ConnectIntegration', {
      apiId: webSocketApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: cdk.Fn.join('', [
        'arn:aws:apigateway:',
        this.region,
        ':lambda:path/2015-03-31/functions/',
        connectHandler.functionArn,
        '/invocations'
      ]),
      credentialsArn: webSocketIntegrationRole.roleArn,
    });

    const disconnectIntegration = new apigatewayv2.CfnIntegration(this, 'DisconnectIntegration', {
      apiId: webSocketApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: cdk.Fn.join('', [
        'arn:aws:apigateway:',
        this.region,
        ':lambda:path/2015-03-31/functions/',
        disconnectHandler.functionArn,
        '/invocations'
      ]),
      credentialsArn: webSocketIntegrationRole.roleArn,
    });

    const defaultIntegration = new apigatewayv2.CfnIntegration(this, 'DefaultIntegration', {
      apiId: webSocketApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: cdk.Fn.join('', [
        'arn:aws:apigateway:',
        this.region,
        ':lambda:path/2015-03-31/functions/',
        defaultHandler.functionArn,
        '/invocations'
      ]),
      credentialsArn: webSocketIntegrationRole.roleArn,
    });

    const messageIntegration = new apigatewayv2.CfnIntegration(this, 'MessageIntegration', {
      apiId: webSocketApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: cdk.Fn.join('', [
        'arn:aws:apigateway:',
        this.region,
        ':lambda:path/2015-03-31/functions/',
        messageHandler.functionArn,
        '/invocations'
      ]),
      credentialsArn: webSocketIntegrationRole.roleArn,
    });

    // 라우트 생성하기
    new apigatewayv2.CfnRoute(this, 'ConnectRoute', {
      apiId: webSocketApi.ref,
      routeKey: '\$connect',
      authorizationType: 'NONE',
      target: cdk.Fn.join('/', ['integrations', connectIntegration.ref]),
    });

    new apigatewayv2.CfnRoute(this, 'DisconnectRoute', {
      apiId: webSocketApi.ref,
      routeKey: '\$disconnect',
      authorizationType: 'NONE',
      target: cdk.Fn.join('/', ['integrations', disconnectIntegration.ref]),
    });

    new apigatewayv2.CfnRoute(this, 'DefaultRoute', {
      apiId: webSocketApi.ref,
      routeKey: '\$default',
      authorizationType: 'NONE',
      target: cdk.Fn.join('/', ['integrations', defaultIntegration.ref]),
    });

    new apigatewayv2.CfnRoute(this, 'MessageRoute', {
      apiId: webSocketApi.ref,
      routeKey: 'message',
      authorizationType: 'NONE',
      target: cdk.Fn.join('/', ['integrations', messageIntegration.ref]),
    });

    // 스테이지 생성
    const webSocketStage = new apigatewayv2.CfnStage(this, 'ProductionStage', {
      apiId: webSocketApi.ref,
      stageName: 'production',
      autoDeploy: true,
    });

    // Lambda 함수에 권한 부여 - 수정된 부분
    connectHandler.addPermission('InvokeByApiGateway', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: cdk.Fn.join(':', [
        'arn',
        'aws',
        'execute-api',
        this.region,
        this.account,
        cdk.Fn.join('/', [webSocketApi.ref, webSocketStage.stageName, '\$connect'])
      ]),
    });

    disconnectHandler.addPermission('InvokeByApiGateway', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: cdk.Fn.join(':', [
        'arn',
        'aws',
        'execute-api',
        this.region,
        this.account,
        cdk.Fn.join('/', [webSocketApi.ref, webSocketStage.stageName, '\$disconnect'])
      ]),
    });

    defaultHandler.addPermission('InvokeByApiGateway', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: cdk.Fn.join(':', [
        'arn',
        'aws',
        'execute-api',
        this.region,
        this.account,
        cdk.Fn.join('/', [webSocketApi.ref, webSocketStage.stageName, '\$default'])
      ]),
    });

    messageHandler.addPermission('InvokeByApiGateway', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: cdk.Fn.join(':', [
        'arn',
        'aws',
        'execute-api',
        this.region,
        this.account,
        cdk.Fn.join('/', [webSocketApi.ref, webSocketStage.stageName, 'message'])
      ]),
    });

    // WebSocket API URL은 Fn.join()을 사용하여 구성
    const webSocketApiEndpoint = cdk.Fn.join('', [
      'wss://',
      webSocketApi.ref,
      '.execute-api.',
      this.region,
      '.amazonaws.com/',
      webSocketStage.stageName
    ]);

    // ===============================================================
    // CloudFront 배포
    // ===============================================================
    
    // 과정 자료용 CloudFront 배포
    const materialsDistribution = new cloudfront.Distribution(this, 'CourseMaterialsDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(courseMaterialsBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    // ===============================================================
    // 출력값
    // ===============================================================
    
    // 중요한 리소스 정보 출력
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'GraphQLApiUrl', { value: api.graphqlUrl });
    new cdk.CfnOutput(this, 'GraphQLApiId', { value: api.apiId });
    new cdk.CfnOutput(this, 'WebSocketApiUrl', { value: webSocketApiEndpoint });
    //new cdk.CfnOutput(this, 'AmplifyAppId', { value: amplifyApp.attrAppId });
    new cdk.CfnOutput(this, 'CourseMaterialsBucketName', { value: courseMaterialsBucket.bucketName });
    new cdk.CfnOutput(this, 'ReportsBucketName', { value: reportsBucket.bucketName });
    new cdk.CfnOutput(this, 'CourseMaterialsCloudfrontUrl', { value: materialsDistribution.distributionDomainName });
  }
}