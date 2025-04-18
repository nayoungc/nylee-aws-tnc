import { defineData, createTable } from '@aws-amplify/backend';
import { AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';

// DynamoDB 테이블 정의
export const courseTemplateTable = createTable({
  tableName: 'TnC-CourseTemplate',
  partitionKey: { name: 'id', type: AttributeType.STRING },
  sortKey: { name: 'version', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
});

export const courseSessionTable = createTable({
  tableName: 'TnC-CourseSession',
  partitionKey: { name: 'id', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  globalSecondaryIndexes: [{
    indexName: 'byInstructor',
    partitionKey: { name: 'instructorId', type: AttributeType.STRING },
    sortKey: { name: 'startDate', type: AttributeType.STRING },
  }],
});

export const sessionAssessmentTable = createTable({
  tableName: 'TnC-SessionAssessment',
  partitionKey: { name: 'sessionId', type: AttributeType.STRING },
  sortKey: { name: 'assessmentType', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
});

export const questionsTable = createTable({
  tableName: 'TnC-Questions',
  partitionKey: { name: 'id', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  globalSecondaryIndexes: [{
    indexName: 'bySession',
    partitionKey: { name: 'sessionId', type: AttributeType.STRING },
    sortKey: { name: 'questionType', type: AttributeType.STRING },
  }],
});

export const responsesTable = createTable({
  tableName: 'TnC-Responses',
  partitionKey: { name: 'id', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  globalSecondaryIndexes: [
    {
      indexName: 'bySession',
      partitionKey: { name: 'sessionId', type: AttributeType.STRING },
      sortKey: { name: 'studentName', type: AttributeType.STRING },
    },
    {
      indexName: 'byQuestion',
      partitionKey: { name: 'questionId', type: AttributeType.STRING },
    }
  ],
});

export const announcementsTable = createTable({
  tableName: 'TnC-Announcements',
  partitionKey: { name: 'id', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  globalSecondaryIndexes: [{
    indexName: 'bySession',
    partitionKey: { name: 'sessionId', type: AttributeType.STRING },
    sortKey: { name: 'createdAt', type: AttributeType.STRING },
  }],
});

// GraphQL API 및 데이터 모델 정의
export const data = defineData({
  // 스키마는 별도로 schema.graphql 파일에서 정의되는 것으로 가정
  schemaPath: './schema.graphql',
  // 테이블
  tables: {
    courseTemplateTable,
    courseSessionTable,
    sessionAssessmentTable,
    questionsTable,
    responsesTable,
    announcementsTable
  },
  // 인증 모드
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    // API 키 인증 모드 (교육생 접근용)
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});