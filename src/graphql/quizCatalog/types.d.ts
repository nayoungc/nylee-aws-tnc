// src/graphql/quizCatalog/types.d.ts
import { QuizCatalog } from '@/models/quizCatalog';

// 쿼리 결과 타입
export interface ListQuizCatalogItemsResult {
  listQuizCatalogItems: {
    items: QuizCatalog[];
    nextToken?: string | null;
  };
}

export interface GetQuizCatalogItemResult {
  getQuizCatalogItem: QuizCatalog | null;
}

export interface SearchQuizCatalogItemsResult {
  searchQuizCatalogItems: {
    items: QuizCatalog[];
    nextToken?: string | null;
  };
}

export interface GetQuizCatalogItemsByTagResult {
  getQuizCatalogItemsByTag: {
    items: QuizCatalog[];
    nextToken?: string | null;
  };
}

export interface GetQuizCatalogItemsByCategoryResult {
  getQuizCatalogItemsByCategory: {
    items: QuizCatalog[];
    nextToken?: string | null;
  };
}

export interface GetQuizCatalogItemsByDifficultyResult {
  getQuizCatalogItemsByDifficulty: {
    items: QuizCatalog[];
    nextToken?: string | null;
  };
}

// 뮤테이션 결과 타입
export interface CreateQuizCatalogItemResult {
  createQuizCatalogItem: QuizCatalog;
}

export interface UpdateQuizCatalogItemResult {
  updateQuizCatalogItem: QuizCatalog;
}

export interface DeleteQuizCatalogItemResult {
  deleteQuizCatalogItem: {
    quizCatalogId: string;
  };
}

// 필터 타입
export interface ModelQuizCatalogFilterInput {
  quizCatalogId?: ModelIDInput;
  title?: ModelStringInput;
  category?: ModelStringInput;
  difficulty?: ModelStringInput;
  tags?: ModelStringInput;
  isActive?: ModelBooleanInput;
  and?: ModelQuizCatalogFilterInput[];
  or?: ModelQuizCatalogFilterInput[];
  not?: ModelQuizCatalogFilterInput;
}

export interface SearchableQuizCatalogFilterInput {
  quizCatalogId?: SearchableIDFilterInput;
  title?: SearchableStringFilterInput;
  description?: SearchableStringFilterInput;
  category?: SearchableStringFilterInput;
  difficulty?: SearchableStringFilterInput;
  tags?: SearchableStringFilterInput;
  and?: SearchableQuizCatalogFilterInput[];
  or?: SearchableQuizCatalogFilterInput[];
  not?: SearchableQuizCatalogFilterInput;
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
