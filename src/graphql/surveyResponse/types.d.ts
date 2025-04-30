// src/graphql/surveyQuestionBank/types.ts
export interface ApiSurveyQuestionBank {
  questionId: string;
  text: string;
  type: string;
  options?: string[] | null;
  tags?: string[] | null;
  category?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
}

export interface ListSurveyQuestionBankItemsResult {
  listSurveyQuestionBankItems?: {
    items: ApiSurveyQuestionBank[];
    nextToken?: string | null;
  };
  getSurveyQuestionBankItemsByTag?: {
    items: ApiSurveyQuestionBank[];
    nextToken?: string | null;
  };
  getSurveyQuestionBankItemsByType?: {
    items: ApiSurveyQuestionBank[];
    nextToken?: string | null;
  };
  searchSurveyQuestionBankItems?: {
    items: ApiSurveyQuestionBank[];
    nextToken?: string | null;
  };
}

export interface GetSurveyQuestionBankItemResult {
  getSurveyQuestionBankItem: ApiSurveyQuestionBank | null;
}

export interface CreateSurveyQuestionBankItemInput {
  text: string;
  type: string;
  options?: string[] | null;
  tags?: string[] | null;
  category?: string | null;
  metadata?: Record<string, any> | null;
  createdBy?: string | null;
}

export interface UpdateSurveyQuestionBankItemInput {
  questionId: string;
  text?: string;
  type?: string;
  options?: string[] | null;
  tags?: string[] | null;
  category?: string | null;
  metadata?: Record<string, any> | null;
}

export interface CreateSurveyQuestionBankItemResult {
  createSurveyQuestionBankItem: ApiSurveyQuestionBank;
}

export interface UpdateSurveyQuestionBankItemResult {
  updateSurveyQuestionBankItem: ApiSurveyQuestionBank;
}

export interface DeleteSurveyQuestionBankItemResult {
  deleteSurveyQuestionBankItem: {
    questionId: string;
  } | null;
}

export interface ModelSurveyQuestionBankFilterInput {
  questionId?: { eq?: string; contains?: string };
  text?: { eq?: string; contains?: string };
  type?: { eq?: string; contains?: string };
  category?: { eq?: string; contains?: string };
  tags?: { contains?: string };
  and?: ModelSurveyQuestionBankFilterInput[];
  or?: ModelSurveyQuestionBankFilterInput[];
  not?: ModelSurveyQuestionBankFilterInput;
}