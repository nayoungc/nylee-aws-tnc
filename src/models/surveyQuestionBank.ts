// src/models/surveyQuestionBank.ts
/**
 * 설문 질문 은행 모델
 */
export interface SurveyQuestionBank {
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

/**
 * 설문 질문 은행 생성 입력 타입
 */
export interface SurveyQuestionBankInput {
  text: string;
  type: string;
  options?: string[] | null;
  tags?: string[] | null;
  category?: string | null;
  metadata?: Record<string, any> | null;
  createdBy?: string | null;
}

/**
 * 설문 질문 은행 업데이트 입력 타입
 */
export interface SurveyQuestionBankUpdate {
  text?: string;
  type?: string;
  options?: string[] | null;
  tags?: string[] | null;
  category?: string | null;
  metadata?: Record<string, any> | null;
}

/**
 * 설문 질문 은행 필터링 타입
 */
export interface SurveyQuestionBankFilter {
  text?: string;
  type?: string;
  category?: string;
  tags?: string[];
}