// src/graphql/surveyQuestionBank/types.d.ts
import { SurveyQuestionBank } from '@/models/surveyQuestionBank';

// 쿼리 결과 타입
export interface ListSurveyQuestionBankItemsResult {
  listSurveyQuestionBankItems: {
    items: SurveyQuestionBank[];
    nextToken?: string | null;
  };
}

export interface GetSurveyQuestionBankItemResult {
  getSurveyQuestionBankItem: SurveyQuestionBank | null;
}

export interface SearchSurveyQuestionBankItemsResult {
  searchSurveyQuestionBankItems: {
    items: SurveyQuestionBank[];
    nextToken?: string | null;
  };
}

export interface GetSurveyQuestionBankItemsByTagResult {
  getSurveyQuestionBankItemsByTag: {
    items: SurveyQuestionBank[];
    nextToken?: string | null;
  };
}

export interface GetSurveyQuestionBankItemsByTypeResult {
  getSurveyQuestionBankItemsByType: {
    items: SurveyQuestionBank[];
    nextToken?: string | null;
  };
}

// 뮤테이션 결과 타입
export interface CreateSurveyQuestionBankItemResult {
  createSurveyQuestionBankItem: SurveyQuestionBank;
}

export interface UpdateSurveyQuestionBankItemResult {
  updateSurveyQuestionBankItem: SurveyQuestionBank;
}

export interface DeleteSurveyQuestionBankItemResult {
  deleteSurveyQuestionBankItem: {
    questionId: string;
  };
}

// 필터 타입
export interface ModelSurveyQuestionBankFilterInput {
  questionId?: ModelIDInput;
  content?: ModelStringInput;
  type?: ModelStringInput;
  tags?: ModelStringInput;
  required?: ModelBooleanInput;
  and?: ModelSurveyQuestionBankFilterInput[];
  or?: ModelSurveyQuestionBankFilterInput[];
  not?: ModelSurveyQuestionBankFilterInput;
}

export interface SearchableSurveyQuestionBankFilterInput {
  questionId?: SearchableIDFilterInput;
  content?: SearchableStringFilterInput;
  type?: SearchableStringFilterInput;
  tags?: SearchableStringFilterInput;
  and?: SearchableSurveyQuestionBankFilterInput[];
  or?: SearchableSurveyQuestionBankFilterInput[];
  not?: SearchableSurveyQuestionBankFilterInput;
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