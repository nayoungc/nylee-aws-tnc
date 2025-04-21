// src/graphql/client.ts 파일 생성
import { generateClient } from 'aws-amplify/api';

// CourseCatalog 타입 정의
export interface CourseCatalog {
  catalogId: string;
  version: string;
  title: string;
  awsCode?: string;
  description?: string;
  level?: string;
  duration?: number;
  price?: number;
  currency?: string;
  isPublished: boolean;
  publishedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  course_name?: string;
  status?: string;
  category?: string;
  deliveryMethod?: string;
  objectives?: string[];
  targetAudience?: string[];
}

// Schema 타입 정의
export interface Schema {
  models: {
    CourseCatalog: {
      list: (options?: any) => Promise<{data: CourseCatalog[], errors?: any[]}>;
      get: (key: {catalogId: string, version?: string}) => Promise<{data: CourseCatalog, errors?: any[]}>;
      // 다른 메서드들...
    };
    // 다른 모델들...
  };
}

// 클라이언트 생성 및 내보내기
export const client = generateClient<Schema>();