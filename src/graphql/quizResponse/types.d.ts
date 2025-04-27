// src/graphql/quizResponse/types.d.ts
import { QuizResponse } from '@/models/quizResponse';

// 쿼리 결과 타입
export interface ListQuizResponsesResult {
  listQuizResponses: {
    items: QuizResponse[];
    nextToken?: string | null;
  };
}

export interface GetQuizResponseResult {
  getQuizResponse: QuizResponse | null;
}

export interface GetQuizResponsesByCourseQuizIdResult {
  getQuizResponsesByCourseQuizId: {
    items: QuizResponse[];
    nextToken?: string | null;
  };
}

export interface GetQuizResponsesByStudentIdResult {
  getQuizResponsesByStudentId: {
    items: QuizResponse[];
    nextToken?: string | null;
  };
}

export interface GetQuizResponseStatisticsResult {
  getQuizResponseStatistics: {
    courseQuizId: string;
    totalResponses: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    completionRate: number;
    questionStatistics: Array<{
      questionId: string;
      correctRate: number;
      avgScore?: number;
    }>;
  };
}

// 뮤테이션 결과 타입
export interface CreateQuizResponseResult {
  createQuizResponse: QuizResponse;
}

export interface UpdateQuizResponseResult {
  updateQuizResponse: QuizResponse;
}

export interface DeleteQuizResponseResult {
  deleteQuizResponse: {
    responseId: string;
  };
}

export interface GradeQuizResponseResult {
  gradeQuizResponse: QuizResponse;
}

// 필터 타입
export interface ModelQuizResponseFilterInput {
  responseId?: ModelIDInput;
  courseQuizId?: ModelIDInput;
  studentId?: ModelIDInput;
  status?: ModelStringInput;
  submittedAt?: ModelStringInput;
  and?: ModelQuizResponseFilterInput[];
  or?: ModelQuizResponseFilterInput[];
  not?: ModelQuizResponseFilterInput;
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

interface ModelNumberInput {
  ne?: number;
  eq?: number;
  le?: number;
  lt?: number;
  ge?: number;
  gt?: number;
  between?: [number, number];
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