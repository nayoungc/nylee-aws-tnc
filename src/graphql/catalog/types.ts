// src/graphql/catalog/types.ts
import { BaseRecord } from '../common/types';
import { CourseCatalogStatus, CourseCatalog } from '@models/catalog';

// ===== 쿼리 결과 타입 =====

// 목록 조회 결과 타입
export interface ListCourseCatalogsResult {
  listCourseCatalogs: {
    items: CourseCatalog[];
    nextToken?: string | null;
  };
}

// 단일 코스 카탈로그 조회 결과 타입
export interface GetCourseCatalogResult {
  getCourseCatalog: CourseCatalog | null;
}

// 검색 결과 타입
export interface SearchCourseCatalogResult {
  searchCourseCatalog: {
    items: CourseCatalog[];
    nextToken?: string | null;
  };
}

// 카테고리별 조회 결과 타입
export interface GetCourseCatalogByCategoryResult {
  getCourseCatalogByCategory: {
    items: CourseCatalog[];
    nextToken?: string | null;
  };
}

// 레벨별 조회 결과 타입
export interface GetCourseCatalogByLevelResult {
  getCatalogByLevel: {
    items: CourseCatalog[];
    nextToken?: string | null;
  };
}

// 태그별 조회 결과 타입
export interface GetCourseCatalogsByTagResult {
  getCatalogsByTag: {
    items: CourseCatalog[];
    nextToken?: string | null;
  };
}

// 최근 업데이트된 카탈로그 조회 결과 타입
export interface GetRecentlyUpdatedCourseCatalogsResult {
  getRecentlyUpdatedCatalogs: {
    items: CourseCatalog[];
    nextToken?: string | null;
  };
}

// ===== 뮤테이션 결과 타입 =====

// 생성 결과 타입
export interface CreateCourseCatalogResult {
  createCourseCatalog: CourseCatalog;
}

// 수정 결과 타입
export interface UpdateCourseCatalogResult {
  updateCourseCatalog: CourseCatalog;
}

// 삭제 결과 타입
export interface DeleteCourseCatalogResult {
  deleteCourseCatalog: {
    id: string;
    title?: string;
  };
}

// 상태 업데이트 결과 타입
export interface UpdateCourseCatalogStatusResult {
  updateCourseCatalogStatus: {
    id: string;
    title: string;
    status: CourseCatalogStatus;
    updatedAt: string;
  };
}

// 태그 추가 결과 타입
export interface AddTagToCourseCatalogResult {
  addTagToCourseCatalog: {
    id: string;
    title: string;
    tags: string[];
    updatedAt: string;
  };
}

// 태그 제거 결과 타입
export interface RemoveTagFromCourseCatalogResult {
  removeTagFromCourseCatalog: {
    id: string;
    title: string;
    tags: string[];
    updatedAt: string;
  };
}

// 일괄 업데이트 결과 타입
export interface BulkUpdateCourseCatalogsResult {
  bulkUpdateCourseCatalogs: {
    successCount: number;
    failedItems: Array<{
      id: string;
      errorMessage: string;
    }>;
  };
}

// ===== 입력 타입 =====

// 필터 입력 타입
export interface CourseCatalogFilterInput {
  text?: string;
  level?: string;
  category?: string;
  tags?: string[];
}

// GraphQL에서 사용하는 모델 필터 타입
export interface ModelCourseCatalogFilterInput {
  id?: ModelIDInput;
  title?: ModelStringInput;
  awsCode?: ModelStringInput;
  category?: ModelStringInput;
  level?: ModelStringInput;
  status?: ModelStringInput;
  and?: ModelCourseCatalogFilterInput[];
  or?: ModelCourseCatalogFilterInput[];
  not?: ModelCourseCatalogFilterInput;
}

// ID 필터 타입
interface ModelIDInput {
  ne?: string;
  eq?: string;
  le?: string;
  lt?: string;
  ge?: string;
  gt?: string;
  contains?: string;
  notContains?: string;
  between?: [string, string];
  beginsWith?: string;
}

// 문자열 필터 타입
interface ModelStringInput {
  ne?: string;
  eq?: string;
  le?: string;
  lt?: string;
  ge?: string;
  gt?: string;
  contains?: string;
  notContains?: string;
  between?: [string, string];
  beginsWith?: string;
  attributeExists?: boolean;
  attributeType?: string;
  size?: ModelSizeInput;
}

// 크기 필터 타입
interface ModelSizeInput {
  ne?: number;
  eq?: number;
  le?: number;
  lt?: number;
  ge?: number;
  gt?: number;
  between?: [number, number];
}