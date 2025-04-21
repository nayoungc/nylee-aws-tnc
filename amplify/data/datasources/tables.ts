// amplify/data/datasources/tables.ts
import { DynamoDBTableStep } from '@aws-amplify/backend-dynamodb';

// 기존 테이블 참조
export const catalogTable = DynamoDBTableStep.fromTable({
  tableArn: process.env.TNC_COURSE_CATALOG_ARN || 'arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Tnc-CourseCatalog'
});

export const moduleTable = DynamoDBTableStep.fromTable({
  tableArn: process.env.TNC_MODULES_ARN || 'arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Tnc-CourseCatalog-Modules'
});

export const labTable = DynamoDBTableStep.fromTable({
  tableArn: process.env.TNC_LABS_ARN || 'arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Tnc-CourseCatalog-Labs'
});

export const courseTable = DynamoDBTableStep.fromTable({
  tableArn: process.env.TNC_COURSES_ARN || 'arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Tnc-Courses'
});

export const customerTable = DynamoDBTableStep.fromTable({
  tableArn: process.env.TNC_CUSTOMERS_ARN || 'arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Tnc-Customers'
});