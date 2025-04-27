// src/graphql/surveyCatalog/types.d.ts
import { SurveyCatalog } from '@/models/surveyCatalog';

// 쿼리 결과 타입
export interface ListSurveyCatalogItemsResult {
  listSurveyCatalogItems: {
    items: SurveyCatalog[];
    nextToken?: string | null;
  };
}

export interface GetSurveyCatalogItemResult {
  getSurveyCatalogItem: SurveyCatalog | null;
}

export interface SearchSurveyCatalogItemsResult {
  searchSurveyCatalogItems: {
    items: SurveyCatalog[];
    nextToken?: string | null;
  };
}

export interface GetSurveyCatalogItemsByTagResult {
  getSurveyCatalogItemsByTag: {
    items: SurveyCatalog[];
    nextToken?: string | null;
  };
}

export interface GetSurveyCatalogItemsByCategoryResult {
  getSurveyCatalogItemsByCategory: {
    items: SurveyCatalog[];
    nextToken?: string | null;
  };
}

// 뮤테이션 결과 타입
export interface CreateSurveyCatalogItemResult {
  createSurveyCatalogItem: SurveyCatalog;
}

export interface UpdateSurveyCatalogItemResult {
  updateSurveyCatalogItem: SurveyCatalog;
}

export interface DeleteSurveyCatalogItemResult {
  deleteSurveyCatalogItem: {
    surveyCatalogId: string;
  };
}

// 필터 타입
export interface ModelSurveyCatalogFilterInput {
  surveyCatalogId?: ModelIDInput;
  title?: ModelStringInput;
  category?: ModelStringInput;
  tags?: ModelStringInput;
  isActive?: ModelBooleanInput;
  and?: ModelSurveyCatalogFilterInput[];
  or?: ModelSurveyCatalogFilterInput[];
  not?: ModelSurveyCatalogFilterInput;
}

export interface SearchableSurveyCatalogFilterInput {
  surveyCatalogId?: SearchableIDFilterInput;
  title?: SearchableStringFilterInput;
  description?: SearchableStringFilterInput;
  category?: SearchableStringFilterInput;
  tags?: SearchableStringFilterInput;
  and?: SearchableSurveyCatalogFilterInput[];
  or?: SearchableSurveyCatalogFilterInput[];
  not?: SearchableSurveyCatalogFilterInput;
}

// 기본 필터 타입
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

interface ModelBooleanInput {
  ne?: boolean;
  eq?: boolean;
  attributeExists?: boolean;
  attributeType?: string;
}

interface ModelSizeInput {
  ne?: number;
  eq?: number;
  le?: number;
  lt?: number;
  ge?: number;
  gt?: number;
  between?: [number, number];
}

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