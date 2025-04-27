// src/graphql/surveyResponse/types.d.ts
import { SurveyResponse } from '@/models/surveyResponse';

// 쿼리 결과 타입
export interface ListSurveyResponsesResult {
  listSurveyResponses: {
    items: SurveyResponse[];
    nextToken?: string | null;
  };
}

export interface GetSurveyResponseResult {
  getSurveyResponse: SurveyResponse | null;
}

export interface GetSurveyResponsesByCourseSurveyIdResult {
  getSurveyResponsesByCourseSurveyId: {
    items: SurveyResponse[];
    nextToken?: string | null;
  };
}

export interface GetSurveyResponsesByStudentIdResult {
  getSurveyResponsesByStudentId: {
    items: SurveyResponse[];
    nextToken?: string | null;
  };
}

export interface GetSurveyResponseStatisticsResult {
  getSurveyResponseStatistics: {
    courseSurveyId: string;
    totalResponses: number;
    completionRate: number;
    questionStatistics: Array<{
      questionId: string;
      responseCounts: Record<string, number>; // 응답 옵션별 집계
      averageRating?: number; // 평점 질문인 경우
      textResponses?: string[]; // 자유 응답인 경우
    }>;
  };
}

// 뮤테이션 결과 타입
export interface CreateSurveyResponseResult {
  createSurveyResponse: SurveyResponse;
}

export interface UpdateSurveyResponseResult {
  updateSurveyResponse: SurveyResponse;
}

export interface DeleteSurveyResponseResult {
  deleteSurveyResponse: {
    responseId: string;
  };
}

// 필터 타입
export interface ModelSurveyResponseFilterInput {
  responseId?: ModelIDInput;
  courseSurveyId?: ModelIDInput;
  studentId?: ModelIDInput;
  submittedAt?: ModelStringInput;
  and?: ModelSurveyResponseFilterInput[];
  or?: ModelSurveyResponseFilterInput[];
  not?: ModelSurveyResponseFilterInput;
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