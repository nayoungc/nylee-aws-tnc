// src/graphql/courseCatalog/types.ts
import { CourseCatalogStatus } from '@/models/courseCatalog';

/**
 * API에서 반환되는 코스 카탈로그 타입
 * @description 백엔드 GraphQL 스키마와 일치하는 타입 정의
 */
export interface ApiCourseCatalog {
  id: string;
  course_name: string;
  course_id?: string;
  level?: string;
  duration?: string;  // 백엔드는 string 타입 사용
  delivery_method?: string;
  description?: string;
  objectives?: string[];
  target_audience?: string;
  status?: string;  // 백엔드는 string으로 반환
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

/**
 * 코스 카탈로그 연결 타입 (페이지네이션)
 */
export interface CourseCatalogConnection {
  items: ApiCourseCatalog[];
  nextToken?: string | null;
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
  status?: CourseCatalogStatus;
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
  status?: CourseCatalogStatus;
}

/**
 * 코스 카탈로그 삭제 입력 타입
 */
export interface DeleteCourseCatalogInput {
  id: string;
}

// ===== 쿼리/뮤테이션 결과 타입 =====

/**
 * 코스 카탈로그 목록 쿼리 결과 타입
 */
export interface ListCourseCatalogsResult {
  listCourseCatalogs: {
    items: ApiCourseCatalog[];
    nextToken?: string | null;
  };
}

/**
 * 코스 카탈로그 조회 쿼리 결과 타입
 */
export interface GetCourseCatalogResult {
  getCourseCatalog: ApiCourseCatalog | null;
}

/**
 * 코스 카탈로그 생성 뮤테이션 결과 타입
 */
export interface CreateCourseCatalogResult {
  createCourseCatalog: ApiCourseCatalog;
}

/**
 * 코스 카탈로그 수정 뮤테이션 결과 타입
 */
export interface UpdateCourseCatalogResult {
  updateCourseCatalog: ApiCourseCatalog;
}

/**
 * 코스 카탈로그 삭제 뮤테이션 결과 타입
 */
export interface DeleteCourseCatalogResult {
  deleteCourseCatalog: {
    id: string;
    course_name?: string;
  };
}

// ===== 필터 타입 =====

/**
 * 코스 카탈로그 검색 필터 타입
 */
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

// ===== 기타 필터 모델 타입 =====

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