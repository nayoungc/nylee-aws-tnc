// src/graphql/services/courseCatalog.ts
import { client } from '../api';

// 기본 타입 정의
export interface CourseCatalog {
  id: string;
  catalogId: string;
  version: string;
  title: string;
  awsCode?: string;
  description?: string;
  category?: string;
  level?: string;
  duration?: string;
  status?: string;
  objectives?: string[];
  targetAudience?: string[];
  deliveryMethod?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 생성 입력 타입
export interface CreateCourseCatalogInput {
  catalogId: string;
  version: string;
  title: string;
  awsCode?: string;
  description?: string;
  category?: string;
  level?: string;
  duration?: string;
  status?: string;
  objectives?: string[];
  targetAudience?: string[];
  deliveryMethod?: string;
}

// 수정 입력 타입
export interface UpdateCourseCatalogInput {
  id: string;
  catalogId: string;
  version: string;
  title?: string;
  awsCode?: string;
  description?: string;
  category?: string;
  level?: string;
  duration?: string;
  status?: string;
  objectives?: string[];
  targetAudience?: string[];
  deliveryMethod?: string;
}

// 삭제 입력 타입
export interface DeleteCourseCatalogInput {
  id: string;
  catalogId: string;
  version: string;
}

// API 함수 정의...
export const updateCourseCatalog = async (input: UpdateCourseCatalogInput) => {
  return client.mutations.updateCourseCatalog({ input });
};