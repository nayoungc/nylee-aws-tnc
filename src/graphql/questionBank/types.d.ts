// src/graphql/questionBank/types.d.ts
import { QuestionBank } from '@/models/questionBank';

// 쿼리 결과 타입
export interface ListQuestionBankItemsResult {
  listQuestionBankItems: {
    items: QuestionBank[];
    nextToken?: string | null;
  };
}

export interface GetQuestionBankItemResult {
  getQuestionBankItem: QuestionBank | null;
}

export interface SearchQuestionBankItemsResult {
  searchQuestionBankItems: {
    items: QuestionBank[];
    nextToken?: string | null;
  };
}

export interface GetQuestionBankItemsByTagResult {
  getQuestionBankItemsByTag: {
    items: QuestionBank[];
    nextToken?: string | null;
  };
}

export interface GetQuestionBankItemsByDifficultyResult {
  getQuestionBankItemsByDifficulty: {
    items: QuestionBank[];
    nextToken?: string | null;
  };
}

export interface GetQuestionBankItemsByTypeResult {
  getQuestionBankItemsByType: {
    items: QuestionBank[];
    nextToken?: string | null;
  };
}

// 뮤테이션 결과 타입
export interface CreateQuestionBankItemResult {
  createQuestionBankItem: QuestionBank;
}

export interface UpdateQuestionBankItemResult {
  updateQuestionBankItem: QuestionBank;
}

export interface DeleteQuestionBankItemResult {
  deleteQuestionBankItem: {
    questionId: string;
  };
}

// 필터 타입
export interface ModelQuestionBankFilterInput {
  questionId?: ModelIDInput;
  content?: ModelStringInput;
  type?: ModelStringInput;
  difficulty?: ModelStringInput;
  tags?: ModelStringInput;
  and?: ModelQuestionBankFilterInput[];
  or?: ModelQuestionBankFilterInput[];
  not?: ModelQuestionBankFilterInput;
}

export interface SearchableQuestionBankFilterInput {
  questionId?: SearchableIDFilterInput;
  content?: SearchableStringFilterInput;
  type?: SearchableStringFilterInput;
  difficulty?: SearchableStringFilterInput;
  tags?: SearchableStringFilterInput;
  and?: SearchableQuestionBankFilterInput[];
  or?: SearchableQuestionBankFilterInput[];
  not?: SearchableQuestionBankFilterInput;
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
