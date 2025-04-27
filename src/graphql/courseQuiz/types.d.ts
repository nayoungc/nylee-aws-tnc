// src/graphql/courseQuiz/types.d.ts
import { CourseQuiz } from '@/models/courseQuiz';

// 쿼리 결과 타입
export interface ListCourseQuizzesResult {
  listCourseQuizzes: {
    items: CourseQuiz[];
    nextToken?: string | null;
  };
}

export interface GetCourseQuizResult {
  getCourseQuiz: CourseQuiz | null;
}

export interface GetCourseQuizzesByCourseIdResult {
  getCourseQuizzesByCourseId: {
    items: CourseQuiz[];
    nextToken?: string | null;
  };
}

export interface GetCourseQuizzesByTypeResult {
  getCourseQuizzesByType: {
    items: CourseQuiz[];
    nextToken?: string | null;
  };
}

export interface GetActiveCourseQuizzesResult {
  getActiveCourseQuizzes: {
    items: CourseQuiz[];
    nextToken?: string | null;
  };
}

// 뮤테이션 결과 타입
export interface CreateCourseQuizResult {
  createCourseQuiz: CourseQuiz;
}

export interface UpdateCourseQuizResult {
  updateCourseQuiz: CourseQuiz;
}

export interface DeleteCourseQuizResult {
  deleteCourseQuiz: {
    courseQuizId: string;
  };
}

export interface ActivateCourseQuizResult {
  activateCourseQuiz: {
    courseQuizId: string;
    isActive: boolean;
  };
}

// 필터 타입
export interface ModelCourseQuizFilterInput {
  courseQuizId?: ModelIDInput;
  courseId?: ModelIDInput;
  quizCatalogId?: ModelIDInput;
  quizType?: ModelStringInput;
  isActive?: ModelBooleanInput;
  startDate?: ModelStringInput;
  endDate?: ModelStringInput;
  and?: ModelCourseQuizFilterInput[];
  or?: ModelCourseQuizFilterInput[];
  not?: ModelCourseQuizFilterInput;
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