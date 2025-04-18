import { defineStorage } from '@aws-amplify/backend';
import { BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';

export const storage = defineStorage({
  // 과정 자료 버킷
  courseMaterialsBucket: {
    bucketName: 'tnc-course-materials',
    blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    encryption: BucketEncryption.S3_MANAGED,
    versioned: true,
    cors: [
      {
        allowedMethods: ['GET'],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      },
    ],
  },
  
  // 보고서 버킷
  reportsBucket: {
    bucketName: 'tnc-reports',
    blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    encryption: BucketEncryption.S3_MANAGED,
  },
  
  // 사용자 업로드 버킷
  userContentBucket: {
    bucketName: 'tnc-user-content',
    blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    encryption: BucketEncryption.S3_MANAGED,
    cors: [
      {
        allowedMethods: ['GET', 'PUT', 'POST', 'HEAD'],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
        exposedHeaders: ['ETag'],
        maxAge: 3600,
      },
    ],
    lifecycle: {
      abortIncompleteMultipartUploadAfter: 7,
      transitions: [
        {
          storageClass: 'INTELLIGENT_TIERING',
          transitionAfter: 30,
        }
      ]
    }
  },
});
