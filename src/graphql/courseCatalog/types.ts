// src/graphql/courseCatalog/types.ts
import { BaseRecord } from '../common/types';

/**
 * 코스 카탈로그 상태 정의
 */
export enum CourseCatalogStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED'
}

/**
 * 코스 카탈로그 모델 타입
 * 백엔드 스키마와 일치하는 필드 사용
 */
export interface CourseCatalog {
  id: string;
  course_name: string;
  course_id?: string;
  version?:string;
  level?: string;
  duration?: string;
  delivery_method?: string;
  description?: string;
  objectives?: string[];
  status?: CourseCatalogStatus;
  createdAt?: string;
  updatedAt?: string;
}

// ===== 입력 타입 =====

/**
 * 코스 카탈로그 생성 입력 타입
 */
export interface CreateCourseCatalogInput {
  course_name: string;
  course_id?: string;
  level?: string;
  duration?: string;
  delivery_method?: string;
  description?: string;
  objectives?: string[];
  target_audience?: string;
}

/**
 * 코스 카탈로그 수정 입력 타입
 */
export interface UpdateCourseCatalogInput {
  id: string;
  course_name?: string;
  course_id?: string;
  level?: string;
  duration?: string;
  delivery_method?: string;
  description?: string;
  objectives?: string[];
  target_audience?: string;
}

/**
 * 코스 카탈로그 삭제 입력 타입
 */
export interface DeleteCourseCatalogInput {
  id: string;
}

// ===== 쿼리/뮤테이션 결과 타입 =====

export interface ListCourseCatalogsResult {
  listCourseCatalogs: {
    items: CourseCatalog[];
    nextToken?: string | null;
  };
}

export interface GetCourseCatalogResult {
  getCourseCatalog: CourseCatalog | null;
}

export interface CreateCourseCatalogResult {
  createCourseCatalog: CourseCatalog;
}

export interface UpdateCourseCatalogResult {
  updateCourseCatalog: CourseCatalog;
}

export interface DeleteCourseCatalogResult {
  deleteCourseCatalog: {
    id: string;
    course_name?: string;
  };
}

// ===== 필터 타입 =====

export interface CourseCatalogFilterInput {
  text?: string;
  level?: string;
  target_audience?: string;
  objectives?: string[];
}

export interface ModelCourseCatalogFilterInput {
  id?: ModelIDInput;
  course_name?: ModelStringInput;
  course_id?: ModelStringInput;
  target_audience?: ModelStringInput;
  level?: ModelStringInput;
  status?: ModelStringInput;
  and?: ModelCourseCatalogFilterInput[];
  or?: ModelCourseCatalogFilterInput[];
  not?: ModelCourseCatalogFilterInput;
}

// ===== 기타 타입 =====

interface ModelIDInput {
  ne?: string;
  eq?: string;
  contains?: string;
  beginsWith?: string;
}

interface ModelStringInput {
  ne?: string;
  eq?: string;
  contains?: string;
  beginsWith?: string;
  size?: ModelSizeInput;
}

interface ModelSizeInput {
  ne?: number;
  eq?: number;
  gt?: number;
  lt?: number;
  between?: [number, number];
}

export interface BulkUpdateCourseCatalogsInput {
  items: Array<UpdateCourseCatalogInput>;
}
