// src/graphql/catalog/types.ts
import { BaseRecord } from '../common/types';
import { CourseCatalogStatus, CourseCatalog } from '@models/courseCatalog';

// ===== 쿼리 결과 타입 =====

/**
 * 목록 조회 결과 타입
 * 코스 카탈로그 목록 및 페이지네이션 토큰 포함
 */
export interface ListCourseCatalogsResult {
  listCourseCatalogs: {
    items: CourseCatalog[];
    nextToken?: string | null;
  };
}

/**
 * 단일 코스 카탈로그 조회 결과 타입
 */
export interface GetCourseCatalogResult {
  getCourseCatalog: CourseCatalog | null;
}

/**
 * 검색 결과 타입
 */
export interface SearchCourseCatalogResult {
  searchCourseCatalogs: {
    items: CourseCatalog[];
    nextToken?: string | null;
  };
}

/**
 * 카테고리별 조회 결과 타입
 */
export interface GetCourseCatalogByCategoryResult {
  getCourseCatalogByCategory: {
    items: CourseCatalog[];
    nextToken?: string | null;
  };
}

/**
 * 레벨별 조회 결과 타입
 */
export interface GetCourseCatalogByLevelResult {
  getCourseCatalogByLevel: {
    items: CourseCatalog[];
    nextToken?: string | null;
  };
}

/**
 * 태그별 조회 결과 타입
 */
export interface GetCourseCatalogsByTagResult {
  getCourseCatalogsByTag: {
    items: CourseCatalog[];
    nextToken?: string | null;
  };
}

/**
 * 최근 업데이트된 카탈로그 조회 결과 타입
 */
export interface GetRecentlyUpdatedCourseCatalogsResult {
  getRecentlyUpdatedCourseCatalogs: {
    items: CourseCatalog[];
    nextToken?: string | null;
  };
}

// ===== 뮤테이션 결과 타입 =====

/**
 * 생성 결과 타입
 */
export interface CreateCourseCatalogResult {
  createCourseCatalog: CourseCatalog;
}

/**
 * 수정 결과 타입
 */
export interface UpdateCourseCatalogResult {
  updateCourseCatalog: CourseCatalog;
}

/**
 * 삭제 결과 타입
 */
export interface DeleteCourseCatalogResult {
  deleteCourseCatalog: {
    id: string;
    title?: string;
  };
}

/**
 * 상태 업데이트 결과 타입
 */
export interface UpdateCourseCatalogStatusResult {
  updateCourseCatalogStatus: {
    id: string;
    title: string;
    status: CourseCatalogStatus;
    updatedAt: string;
  };
}

/**
 * 태그 추가 결과 타입
 */
export interface AddTagToCourseCatalogResult {
  addTagToCourseCatalog: {
    id: string;
    title: string;
    tags: string[];
    updatedAt: string;
  };
}

/**
 * 태그 제거 결과 타입
 */
export interface RemoveTagFromCourseCatalogResult {
  removeTagFromCourseCatalog: {
    id: string;
    title: string;
    tags: string[];
    updatedAt: string;
  };
}

/**
 * 일괄 업데이트 결과 타입
 */
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

/**
 * 클라이언트측 필터 입력 타입
 * 사용자 인터페이스에서 필터링에 사용됨
 */
export interface CourseCatalogFilterInput {
  text?: string;
  level?: string;
  category?: string;
  tags?: string[];
}

/**
 * GraphQL에서 사용하는 모델 필터 타입
 * Amplify/AppSync에서 자동 생성한 필터 타입
 */
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

/**
 * 검색 가능한 필터 타입
 * 전문 검색에 사용되는 필터
 */
export interface SearchableCourseCatalogFilterInput {
  id?: SearchableIDFilterInput;
  title?: SearchableStringFilterInput;
  description?: SearchableStringFilterInput;
  category?: SearchableStringFilterInput;
  level?: SearchableStringFilterInput;
  tags?: SearchableStringFilterInput;
  and?: SearchableCourseCatalogFilterInput[];
  or?: SearchableCourseCatalogFilterInput[];
  not?: SearchableCourseCatalogFilterInput;
}

/**
 * ID 필터 타입
 */
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

/**
 * 검색 가능한 ID 필터 타입
 */
interface SearchableIDFilterInput {
  ne?: string;
  eq?: string;
  match?: string;
  matchPhrase?: string;
  matchPhrasePrefix?: string;
  multiMatch?: string;
  exists?: boolean;
  wildcard?: string;
  regexp?: string;
}

/**
 * 문자열 필터 타입
 */
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

/**
 * 검색 가능한 문자열 필터 타입
 */
interface SearchableStringFilterInput {
  ne?: string;
  eq?: string;
  match?: string;
  matchPhrase?: string;
  matchPhrasePrefix?: string;
  multiMatch?: string;
  exists?: boolean;
  wildcard?: string;
  regexp?: string;
}

/**
 * 크기 필터 타입
 */
interface ModelSizeInput {
  ne?: number;
  eq?: number;
  le?: number;
  lt?: number;
  ge?: number;
  gt?: number;
  between?: [number, number];
}